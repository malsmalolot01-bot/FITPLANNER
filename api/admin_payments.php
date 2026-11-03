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

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$filter = trim((string) ($input['status'] ?? 'all'));
if (!in_array($filter, ['all', 'pending', 'approved', 'rejected'], true)) {
    respond(['success' => false, 'message' => 'Invalid payment status filter.'], 422);
}

try {
    $pdo = database();
    $admin = authenticated_user($pdo);
    if ($admin['role'] !== 'admin') {
        respond(['success' => false, 'message' => 'Administrator access is required.'], 403);
    }

    $where = $filter === 'all' ? '' : 'WHERE p.status = ?';
    $paymentsQuery = $pdo->prepare(
        "SELECT p.id, p.user_id, CONCAT(u.first_name, ' ', u.last_name) AS client_name,
                p.plan, p.days, p.amount, p.reference_no, p.proof_image, p.created_at,
                p.status, p.reviewed_at, p.subscription_start, p.subscription_end,
                CASE
                    WHEN u.subscription_end > NOW() THEN 'active'
                    WHEN u.trial_end > NOW() THEN 'trial'
                    WHEN u.subscription_end IS NULL THEN 'expired_trial'
                    ELSE 'expired'
                END AS client_status
         FROM payments p
         INNER JOIN users u ON u.id = p.user_id
         {$where}
         ORDER BY (p.status = 'pending') DESC, p.created_at DESC"
    );
    $paymentsQuery->execute($filter === 'all' ? [] : [$filter]);

    $pendingQuery = $pdo->query(
        "SELECT p.id, p.user_id, CONCAT(u.first_name, ' ', u.last_name) AS client_name,
                p.plan, p.days, p.amount, p.reference_no, p.proof_image, p.created_at,
                p.status, p.reviewed_at, p.subscription_start, p.subscription_end,
                CASE
                    WHEN u.subscription_end > NOW() THEN 'active'
                    WHEN u.trial_end > NOW() THEN 'trial'
                    WHEN u.subscription_end IS NULL THEN 'expired_trial'
                    ELSE 'expired'
                END AS client_status
         FROM payments p
         INNER JOIN users u ON u.id = p.user_id
         WHERE p.status = 'pending'
         ORDER BY p.created_at ASC"
    );

    $totalReceived = (float) $pdo->query(
        "SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'approved'"
    )->fetchColumn();
    $pendingCount = (int) $pdo->query(
        "SELECT COUNT(*) FROM payments WHERE status = 'pending'"
    )->fetchColumn();

    $formatPayments = static function (array $rows): array {
        return array_map(static function (array $payment): array {
        $payment['amount'] = (float) $payment['amount'];
        $payment['days'] = (int) $payment['days'];
        $payment['created_at'] = date(DATE_ATOM, strtotime($payment['created_at']));
        if ($payment['reviewed_at'] !== null) {
            $payment['reviewed_at'] = date(DATE_ATOM, strtotime($payment['reviewed_at']));
        }
        if ($payment['subscription_start'] !== null) {
            $payment['subscription_start'] = date(DATE_ATOM, strtotime($payment['subscription_start']));
        }
        if ($payment['subscription_end'] !== null) {
            $payment['subscription_end'] = date(DATE_ATOM, strtotime($payment['subscription_end']));
        }
        return $payment;
        }, $rows);
    };
    $payments = $formatPayments($paymentsQuery->fetchAll());
    $pendingPayments = $formatPayments($pendingQuery->fetchAll());

    respond([
        'success' => true,
        'total_received' => $totalReceived,
        'pending_count' => $pendingCount,
        'pending_payments' => $pendingPayments,
        'payments' => $payments,
    ]);
} catch (PDOException $error) {
    error_log($error->getMessage());
    respond(['success' => false, 'message' => 'Unable to load payment records.'], 500);
}
