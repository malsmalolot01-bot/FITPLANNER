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

    $totalAccounts = (int) $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'user'")->fetchColumn();
    $query = $pdo->query(
        "SELECT id, CONCAT(first_name, ' ', last_name) AS name, email, created_at,
                CASE
                    WHEN subscription_end > NOW() THEN 'active'
                    WHEN trial_end > NOW() THEN 'trial'
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

    $users = array_map(static function (array $user): array {
        $user['joined'] = date('Y-m-d', strtotime($user['created_at']));
        unset($user['created_at']);
        return $user;
    }, $query->fetchAll());

    $logsQuery = $pdo->query(
        "SELECT l.action, l.details, l.created_at, CONCAT(COALESCE(admin.first_name, client.first_name), ' ', COALESCE(admin.last_name, client.last_name)) AS actor
         FROM admin_activity_logs l
         LEFT JOIN users admin ON admin.id = l.admin_id
         LEFT JOIN users client ON client.id = l.user_id
         ORDER BY l.created_at DESC
         LIMIT 25"
    );
    $logs = array_map(static function (array $log): array {
        $details = json_decode((string) $log['details'], true) ?: [];
        return [
            'text' => $log['action'] . (!empty($details['email']) ? " - {$details['email']}" : ''),
            'actor' => $log['actor'],
            'time' => date('Y-m-d H:i:s', strtotime($log['created_at'])),
        ];
    }, $logsQuery->fetchAll());

    respond([
        'success' => true,
        'totalAccounts' => $totalAccounts,
        'users' => $users,
        'logs' => $logs,
    ]);
} catch (PDOException $error) {
    error_log($error->getMessage());
    respond(['success' => false, 'message' => 'Unable to load admin statistics.'], 500);
}
