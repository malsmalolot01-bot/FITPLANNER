<?php

declare(strict_types=1);

// --- CORS: tugotan ang mobile dev server mag-access sa API ---
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
$extraOrigins = getenv('FITPLANNER_ALLOWED_ORIGINS');
if ($extraOrigins) {
    $allowedOrigins = array_merge($allowedOrigins, array_map('trim', explode(',', $extraOrigins)));
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Auth-Token');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function database(): PDO
{
    $host = getenv('FITPLANNER_DB_HOST') ?: '127.0.0.1';
    $port = getenv('FITPLANNER_DB_PORT') ?: '3306';
    $name = getenv('FITPLANNER_DB_NAME') ?: 'fit-planner';
    $user = getenv('FITPLANNER_DB_USER') ?: 'root';
    $password = getenv('FITPLANNER_DB_PASSWORD') ?: '';

    $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";

    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    $sslCa = getenv('FITPLANNER_DB_SSL_CA');
    if ($sslCa) {
        $options[PDO::MYSQL_ATTR_SSL_CA] = $sslCa;
    }

    return new PDO($dsn, $user, $password, $options);
}

function create_auth_token(PDO $pdo, string $userId): string
{
    $token = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $token);
    $query = $pdo->prepare(
        'INSERT INTO auth_tokens (user_id, token_hash, expires_at)
         VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY))'
    );
    $query->execute([$userId, $tokenHash]);
    return $token;
}

function authenticated_user(PDO $pdo): array
{
    $authorization = isset($_SERVER['HTTP_X_AUTH_TOKEN'])
        ? 'Bearer ' . $_SERVER['HTTP_X_AUTH_TOKEN']
        : ($_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
    if (!preg_match('/^Bearer ([a-f0-9]{64})$/i', $authorization, $matches)) {
        respond(['success' => false, 'message' => 'Authentication is required.'], 401);
    }

    $tokenHash = hash('sha256', strtolower($matches[1]));
    $query = $pdo->prepare(
        'SELECT u.id, u.role, u.trial_end, u.subscription_end
         FROM auth_tokens t
         INNER JOIN users u ON u.id = t.user_id
         WHERE t.token_hash = ? AND t.expires_at > CURRENT_TIMESTAMP AND u.status = \'active\'
         LIMIT 1'
    );
    $query->execute([$tokenHash]);
    $user = $query->fetch();
    if (!$user) {
        respond(['success' => false, 'message' => 'Your session has expired. Please log in again.'], 401);
    }

    return $user;
}

function revoke_auth_token(PDO $pdo): void
{
    $authorization = isset($_SERVER['HTTP_X_AUTH_TOKEN'])
        ? 'Bearer ' . $_SERVER['HTTP_X_AUTH_TOKEN']
        : ($_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
    if (preg_match('/^Bearer ([a-f0-9]{64})$/i', $authorization, $matches)) {
        $query = $pdo->prepare('DELETE FROM auth_tokens WHERE token_hash = ?');
        $query->execute([hash('sha256', strtolower($matches[1]))]);
    }
}

function respond(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload);
    exit;
}
