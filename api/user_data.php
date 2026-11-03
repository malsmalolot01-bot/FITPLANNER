<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8100',
    'http://localhost:8101',
    'http://127.0.0.1:8101',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'message' => 'Method not allowed.'], 405);
}

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$input = str_contains($contentType, 'multipart/form-data')
    ? $_POST
    : (json_decode(file_get_contents('php://input'), true) ?: []);
$action = (string) ($input['action'] ?? '');

try {
    $pdo = database();
    $authenticatedUser = authenticated_user($pdo);
    $userId = $authenticatedUser['id'];
    $userCheck = $pdo->prepare(
        'SELECT id, role,
                (COALESCE(subscription_end > CURRENT_TIMESTAMP, 0) = 0
                 AND COALESCE(trial_end > CURRENT_TIMESTAMP, 0) = 0) AS is_locked
         FROM users
         WHERE id = ? AND status = \'active\'
         LIMIT 1'
    );
    $userCheck->execute([$userId]);
    $user = $userCheck->fetch();
    if (!$user) {
        respond(['success' => false, 'message' => 'User account not found.'], 404);
    }

    if ($user['role'] !== 'admin' && (int) $user['is_locked'] === 1) {
        respond(['success' => false, 'locked' => true, 'message' => 'Your trial or subscription has expired.'], 403);
    }

    if ($action === 'get_profile') {
        $query = $pdo->prepare('SELECT height_cm, weight_kg, bmi, bmi_category, goal FROM user_profiles WHERE user_id = ?');
        $query->execute([$userId]);
        respond(['success' => true, 'profile' => $query->fetch() ?: null]);
    }

    if ($action === 'save_profile') {
        $height = (float) ($input['heightCm'] ?? 0);
        $weight = (float) ($input['weightKg'] ?? 0);
        $goal = trim((string) ($input['goal'] ?? 'Fitness'));
        if ($height <= 0 || $weight <= 0 || $goal === '') {
            respond(['success' => false, 'message' => 'Height, weight, and goal are required.'], 422);
        }
        $bmi = round($weight / (($height / 100) ** 2), 1);
        $category = $bmi < 18.5 ? 'Underweight' : ($bmi < 25 ? 'Normal' : ($bmi < 30 ? 'Overweight' : 'Obese'));
        $query = $pdo->prepare('INSERT INTO user_profiles (user_id, height_cm, weight_kg, bmi, bmi_category, goal) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE height_cm = VALUES(height_cm), weight_kg = VALUES(weight_kg), bmi = VALUES(bmi), bmi_category = VALUES(bmi_category), goal = VALUES(goal)');
        $query->execute([$userId, $height, $weight, $bmi, $category, $goal]);
        respond(['success' => true, 'profile' => ['height_cm' => $height, 'weight_kg' => $weight, 'bmi' => $bmi, 'bmi_category' => $category, 'goal' => $goal]]);
    }

    if ($action === 'get_customer_profile') {
        $query = $pdo->prepare('SELECT u.first_name, u.last_name, u.email, cp.phone, cp.profile_photo FROM users u LEFT JOIN customer_profiles cp ON cp.user_id = u.id WHERE u.id = ? LIMIT 1');
        $query->execute([$userId]);
        respond(['success' => true, 'profile' => $query->fetch() ?: null]);
    }

    if ($action === 'save_customer_profile') {
        $phone = trim((string) ($input['phone'] ?? ''));
        $email = strtolower(trim((string) ($input['email'] ?? '')));
        $currentPassword = (string) ($input['currentPassword'] ?? '');
        $newPassword = (string) ($input['newPassword'] ?? '');
        if (strlen($phone) > 30) {
            respond(['success' => false, 'message' => 'Phone number must be 30 characters or fewer.'], 422);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            respond(['success' => false, 'message' => 'Enter a valid email address.'], 422);
        }

        $query = $pdo->prepare('SELECT email, password_hash FROM users WHERE id = ? LIMIT 1');
        $query->execute([$userId]);
        $account = $query->fetch();
        $emailChanged = strtolower($account['email']) !== $email;
        $passwordChanged = $newPassword !== '';
        if ($emailChanged || $passwordChanged) {
            if ($currentPassword === '' || !password_verify($currentPassword, $account['password_hash'])) {
                respond(['success' => false, 'message' => 'Enter your current password to change account details.'], 422);
            }
            if ($passwordChanged && strlen($newPassword) < 8) {
                respond(['success' => false, 'message' => 'New password must be at least 8 characters.'], 422);
            }
        }

        if ($emailChanged) {
            $query = $pdo->prepare('SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1');
            $query->execute([$email, $userId]);
            if ($query->fetch()) {
                respond(['success' => false, 'message' => 'An account with this email already exists.'], 409);
            }
        }

        $photoPath = null;
        if (isset($_FILES['profilePhoto']) && $_FILES['profilePhoto']['error'] !== UPLOAD_ERR_NO_FILE) {
            $photo = $_FILES['profilePhoto'];
            if ($photo['error'] !== UPLOAD_ERR_OK || $photo['size'] > 5 * 1024 * 1024) {
                respond(['success' => false, 'message' => 'Choose an image smaller than 5 MB.'], 422);
            }

            $mimeType = (new finfo(FILEINFO_MIME_TYPE))->file($photo['tmp_name']);
            $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
            if (!isset($extensions[$mimeType]) || getimagesize($photo['tmp_name']) === false) {
                respond(['success' => false, 'message' => 'Upload a valid JPG, PNG, or WebP image.'], 422);
            }

            $uploadDirectory = __DIR__ . '/uploads/profile-photos';
            if (!is_dir($uploadDirectory) && !mkdir($uploadDirectory, 0755, true) && !is_dir($uploadDirectory)) {
                throw new RuntimeException('Could not create profile photo directory.');
            }

            $fileName = bin2hex(random_bytes(16)) . '.' . $extensions[$mimeType];
            if (!move_uploaded_file($photo['tmp_name'], $uploadDirectory . '/' . $fileName)) {
                throw new RuntimeException('Could not store profile photo.');
            }
            $photoPath = 'uploads/profile-photos/' . $fileName;
        }

        $pdo->beginTransaction();
        try {
            if ($emailChanged || $passwordChanged) {
                if ($passwordChanged) {
                    $query = $pdo->prepare('UPDATE users SET email = ?, password_hash = ? WHERE id = ?');
                    $query->execute([$email, password_hash($newPassword, PASSWORD_DEFAULT), $userId]);
                } else {
                    $query = $pdo->prepare('UPDATE users SET email = ? WHERE id = ?');
                    $query->execute([$email, $userId]);
                }
            }

            $query = $pdo->prepare('INSERT INTO customer_profiles (user_id, phone, profile_photo) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE phone = VALUES(phone), profile_photo = COALESCE(VALUES(profile_photo), profile_photo)');
            $query->execute([$userId, $phone, $photoPath]);
            $pdo->commit();
        } catch (Throwable $error) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            throw $error;
        }

        $query = $pdo->prepare('SELECT u.first_name, u.last_name, u.email, cp.phone, cp.profile_photo FROM users u LEFT JOIN customer_profiles cp ON cp.user_id = u.id WHERE u.id = ? LIMIT 1');
        $query->execute([$userId]);
        respond(['success' => true, 'profile' => $query->fetch() ?: null]);
    }

    if ($action === 'get_medical') {
        $query = $pdo->prepare('SELECT has_conditions, conditions FROM medical_histories WHERE user_id = ?');
        $query->execute([$userId]);
        $row = $query->fetch();
        respond(['success' => true, 'medicalHistory' => $row ? ['hasConditions' => (bool) $row['has_conditions'], 'conditions' => json_decode($row['conditions'], true) ?: []] : null]);
    }

    if ($action === 'save_medical') {
        $hasConditions = !empty($input['hasConditions']) ? 1 : 0;
        $conditions = $hasConditions ? (array) ($input['conditions'] ?? []) : [];
        $query = $pdo->prepare('INSERT INTO medical_histories (user_id, has_conditions, conditions) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE has_conditions = VALUES(has_conditions), conditions = VALUES(conditions)');
        $query->execute([$userId, $hasConditions, json_encode(array_values($conditions), JSON_THROW_ON_ERROR)]);
        respond(['success' => true]);
    }

    if ($action === 'log_activity') {
        $query = $pdo->prepare('INSERT INTO admin_activity_logs (user_id, action, details) VALUES (?, ?, ?)');
        $query->execute([$userId, (string) ($input['activity'] ?? 'user_activity'), json_encode(['email' => $input['email'] ?? null], JSON_THROW_ON_ERROR)]);
        respond(['success' => true]);
    }

    respond(['success' => false, 'message' => 'Unknown data action.'], 400);
} catch (Throwable $error) {
    error_log($error->getMessage());
    respond(['success' => false, 'message' => 'Database request failed.'], 500);
}