<?php

declare(strict_types=1);

// Pang-CLI ra ni. Dili mo-work sa browser.
// Usage:  php create_uploader.php <username> <password>
// Human ma-create ang account, DELETE-a kini nga file.

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('CLI only.');
}

$_SERVER['REQUEST_METHOD'] = 'CLI'; // para dili mo-warning ang config.php
require_once __DIR__ . '/config.php';

$username = trim($argv[1] ?? '');
$password = $argv[2] ?? '';

if ($username === '' || strlen($password) < 8) {
    fwrite(STDERR, "Usage: php create_uploader.php <username> <password (min 8 chars)>\n");
    exit(1);
}

try {
    $pdo = database();
    $check = $pdo->prepare('SELECT id FROM uploader_accounts WHERE username = ? LIMIT 1');
    $check->execute([$username]);
    if ($check->fetch()) {
        fwrite(STDERR, "Username already exists.\n");
        exit(1);
    }

    $insert = $pdo->prepare('INSERT INTO uploader_accounts (username, password_hash) VALUES (?, ?)');
    $insert->execute([$username, password_hash($password, PASSWORD_DEFAULT)]);
    echo "Uploader account '{$username}' created. Delete this file now.\n";
} catch (PDOException $error) {
    fwrite(STDERR, 'Database error: ' . $error->getMessage() . "\n");
    exit(1);
}