<?php

declare(strict_types=1);

// Shared helpers para sa uploader nga page. Gigamit ang imong config.php (database(), respond(), CORS).
require_once __DIR__ . '/config.php';

function create_uploader_token(PDO $pdo, int $uploaderId): string
{
    $token = bin2hex(random_bytes(32));
    $query = $pdo->prepare(
        'INSERT INTO uploader_tokens (uploader_id, token_hash, expires_at)
         VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 7 DAY))'
    );
    $query->execute([$uploaderId, hash('sha256', $token)]);
    return $token;
}

function uploader_token_from_request(): ?string
{
    $header = $_SERVER['HTTP_X_AUTH_TOKEN'] ?? '';
    return preg_match('/^[a-f0-9]{64}$/i', $header) ? strtolower($header) : null;
}

function authenticated_uploader(PDO $pdo): array
{
    $token = uploader_token_from_request();
    if ($token === null) {
        respond(['success' => false, 'message' => 'Authentication is required.'], 401);
    }

    $query = $pdo->prepare(
        'SELECT a.id, a.username
         FROM uploader_tokens t
         INNER JOIN uploader_accounts a ON a.id = t.uploader_id
         WHERE t.token_hash = ? AND t.expires_at > CURRENT_TIMESTAMP
         LIMIT 1'
    );
    $query->execute([hash('sha256', $token)]);
    $uploader = $query->fetch();
    if (!$uploader) {
        respond(['success' => false, 'message' => 'Your session has expired. Please log in again.'], 401);
    }

    return $uploader;
}

function revoke_uploader_token(PDO $pdo): void
{
    $token = uploader_token_from_request();
    if ($token !== null) {
        $query = $pdo->prepare('DELETE FROM uploader_tokens WHERE token_hash = ?');
        $query->execute([hash('sha256', $token)]);
    }
}