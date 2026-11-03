<?php

declare(strict_types=1);

require_once __DIR__ . '/uploader_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'message' => 'Method not allowed.'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$input = is_array($input) ? $input : [];
$action = (string) ($input['action'] ?? '');

try {
    $pdo = database();

    if ($action === 'logout') {
        revoke_uploader_token($pdo);
        respond(['success' => true, 'message' => 'Logged out.']);
    }

    if ($action === 'login') {
        $username = trim((string) ($input['username'] ?? ''));
        $password = (string) ($input['password'] ?? '');

        if ($username === '' || $password === '') {
            respond(['success' => false, 'message' => 'Enter your username and password.'], 422);
        }

        $query = $pdo->prepare('SELECT id, username, password_hash FROM uploader_accounts WHERE username = ? LIMIT 1');
        $query->execute([$username]);
        $account = $query->fetch();

        if (!$account || !password_verify($password, $account['password_hash'])) {
            sleep(1); // hinay-hinay ang brute force
            respond(['success' => false, 'message' => 'Wrong username or password.'], 401);
        }

        $token = create_uploader_token($pdo, (int) $account['id']);
        respond([
            'success' => true,
            'message' => 'Login successful.',
            'uploader' => ['username' => $account['username'], 'token' => $token],
        ]);
    }

    respond(['success' => false, 'message' => 'Unknown action.'], 400);
} catch (PDOException $error) {
    error_log($error->getMessage());
    respond(['success' => false, 'message' => 'Database connection failed. Start MySQL in XAMPP.'], 500);
}