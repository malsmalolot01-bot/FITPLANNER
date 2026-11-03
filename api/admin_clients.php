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
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'message' => 'Method not allowed.'], 405);
}

try {
    $pdo = database();
    $admin = authenticated_user($pdo);
    if ($admin['role'] !== 'admin') {
        respond(['success' => false, 'message' => 'Administrator access is required.'], 403);
    }

    $query = $pdo->query(
        "SELECT id, CONCAT(first_name, ' ', last_name) AS name, email, created_at,
                CASE
                    WHEN subscription_end > NOW() THEN 'active'
                    WHEN trial_end > NOW() THEN 'trial'
                    WHEN subscription_end IS NULL THEN 'expired_trial'
                    ELSE 'expired'
                END AS subscription_status,
                GREATEST(
                    0,
                    CEIL(TIMESTAMPDIFF(
                        SECOND,
                        NOW(),
                        CASE
                            WHEN subscription_end > NOW() THEN subscription_end
                            WHEN trial_end > NOW() THEN trial_end
                            ELSE NOW()
                        END
                    ) / 86400)
                ) AS days_left
         FROM users
         WHERE role = 'user'
         ORDER BY created_at DESC"
    );
    $clients = array_map(static function (array $client): array {
        $client['days_left'] = (int) $client['days_left'];
        $client['joined'] = date('Y-m-d', strtotime($client['created_at']));
        unset($client['created_at']);
        return $client;
    }, $query->fetchAll());

    respond(['success' => true, 'clients' => $clients]);
} catch (PDOException $error) {
    error_log($error->getMessage());
    respond(['success' => false, 'message' => 'Unable to load client records.'], 500);
}
