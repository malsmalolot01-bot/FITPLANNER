<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'message' => 'Method not allowed.'], 405);
}

try {
    $pdo = database();
    $user = authenticated_user($pdo);
    $pdo->prepare('UPDATE users SET needs_onboarding = 0 WHERE id = ?')->execute([$user['id']]);
    respond(['success' => true]);
} catch (PDOException $error) {
    error_log($error->getMessage());
    respond(['success' => false, 'message' => 'Unable to update onboarding status.'], 500);
}