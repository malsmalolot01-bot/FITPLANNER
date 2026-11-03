<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8100',
    'http://localhost:8101',
    'http://127.0.0.1:8100',
    'http://127.0.0.1:8101',
    'capacitor://localhost',
    'ionic://localhost',
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

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';
$input = is_array($input) ? $input : [];
if ($action === 'logout') {
    try {
        $pdo = database();
        revoke_auth_token($pdo);
        respond(['success' => true, 'message' => 'Logged out.']);
    } catch (PDOException $error) {
        error_log($error->getMessage());
        respond(['success' => false, 'message' => 'Unable to log out.'], 500);
    }
}

$email = strtolower(trim((string) ($input['email'] ?? '')));
$password = (string) ($input['password'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
    respond(['success' => false, 'message' => 'Please provide a valid email and password.'], 422);
}

try {
    $pdo = database();

    if ($action === 'register') {
        $firstName = trim((string) ($input['firstName'] ?? ''));
        $lastName = trim((string) ($input['lastName'] ?? ''));

        if ($firstName === '' || $lastName === '' || strlen($password) < 8) {
            respond(['success' => false, 'message' => 'Please complete all fields and use at least 8 characters.'], 422);
        }

        $check = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
        $check->execute([$email]);
        if ($check->fetch()) {
            respond(['success' => false, 'message' => 'An account with this email already exists.'], 409);
        }

        $id = sprintf('%s-%s-%s-%s-%s', bin2hex(random_bytes(4)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(6)));
        $insert = $pdo->prepare(
            "INSERT INTO users (id, first_name, last_name, email, password_hash, trial_start, trial_end, subscription_status)
             VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY), 'trial')"
        );
        $insert->execute([$id, $firstName, $lastName, $email, password_hash($password, PASSWORD_DEFAULT)]);
        $token = create_auth_token($pdo, $id);

        respond([
            'success' => true,
            'message' => 'Account created successfully.',
            'user' => ['id' => $id, 'firstName' => $firstName, 'lastName' => $lastName, 'email' => $email, 'role' => 'user', 'token' => $token, 'createdAt' => date(DATE_ATOM)],
        ], 201);
    }

    if ($action === 'login') {
        $query = $pdo->prepare('SELECT id, first_name, last_name, email, password_hash, role, created_at FROM users WHERE email = ? AND status = \'active\' LIMIT 1');
        $query->execute([$email]);
        $user = $query->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            respond(['success' => false, 'message' => 'Wrong password.'], 401);
        }

        $token = create_auth_token($pdo, $user['id']);
        respond([
            'success' => true,
            'message' => 'Login successful.',
            'user' => [
                'id' => $user['id'],
                'firstName' => $user['first_name'],
                'lastName' => $user['last_name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'token' => $token,
                'createdAt' => date(DATE_ATOM, strtotime($user['created_at'])),
            ],
        ]);
    }

    respond(['success' => false, 'message' => 'Unknown authentication action.'], 400);
} catch (PDOException $error) {
    error_log($error->getMessage());
    respond(['success' => false, 'message' => 'Database connection failed. Start MySQL in XAMPP.'], 500);
}