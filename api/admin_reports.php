<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'message' => 'Method not allowed.'], 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];

try {
    $pdo = database();
    $admin = authenticated_user($pdo);
    if ($admin['role'] !== 'admin') {
        respond(['success' => false, 'message' => 'Administrator access is required.'], 403);
    }

    // Petsa karon gikan sa MySQL (para parehas sa NOW() nga gamit sa ubang API)
    $monthStart = (string) $pdo->query("SELECT DATE_FORMAT(NOW(), '%Y-%m-01')")->fetchColumn();
    $currentYear = (int) substr($monthStart, 0, 4);

    $year = filter_var($input['year'] ?? $currentYear, FILTER_VALIDATE_INT);
    if (!$year || $year < 2000 || $year > 2100) {
        $year = $currentYear;
    }

    // 12 ka buwan, sugod sa zero
    $months = [];
    for ($m = 1; $m <= 12; $m++) {
        $months[$m] = [
            'month' => $m,
            'income' => 0.0,
            'payments' => 0,
            'one_month' => 0,
            'two_months' => 0,
            'one_year' => 0,
            'new_accounts' => 0,
        ];
    }

    // Kita matag buwan: approved lang, base sa petsa sa approval (reviewed_at)
    $incomeQuery = $pdo->prepare(
        "SELECT MONTH(reviewed_at) AS month,
                COALESCE(SUM(amount), 0) AS income,
                COUNT(*) AS payments,
                SUM(plan = '1_month') AS one_month,
                SUM(plan = '2_months') AS two_months,
                SUM(plan = '1_year') AS one_year
         FROM payments
         WHERE status = 'approved' AND reviewed_at IS NOT NULL AND YEAR(reviewed_at) = ?
         GROUP BY MONTH(reviewed_at)"
    );
    $incomeQuery->execute([$year]);
    foreach ($incomeQuery->fetchAll() as $row) {
        $m = (int) $row['month'];
        $months[$m]['income'] = (float) $row['income'];
        $months[$m]['payments'] = (int) $row['payments'];
        $months[$m]['one_month'] = (int) $row['one_month'];
        $months[$m]['two_months'] = (int) $row['two_months'];
        $months[$m]['one_year'] = (int) $row['one_year'];
    }

    // Bag-ong accounts matag buwan
    $accountsQuery = $pdo->prepare(
        "SELECT MONTH(created_at) AS month, COUNT(*) AS total
         FROM users
         WHERE role = 'user' AND YEAR(created_at) = ?
         GROUP BY MONTH(created_at)"
    );
    $accountsQuery->execute([$year]);
    foreach ($accountsQuery->fetchAll() as $row) {
        $months[(int) $row['month']]['new_accounts'] = (int) $row['total'];
    }

    // Listahan sa tuig para sa dropdown
    $yearRows = $pdo->query(
        "SELECT DISTINCT YEAR(reviewed_at)
         FROM payments
         WHERE status = 'approved' AND reviewed_at IS NOT NULL"
    )->fetchAll(PDO::FETCH_COLUMN);
    $years = array_map('intval', $yearRows);
    $years[] = $currentYear;
    $years[] = (int) $year;
    $years = array_values(array_unique($years));
    rsort($years);

    // Projected: ihap sa accounts nga mo-expire karon nga buwan ug sa sunod nga 2 ka buwan
    $start = new DateTimeImmutable($monthStart);
    $rangeEnd = $start->modify('+6 months')->format('Y-m-d 00:00:00');
    $expiringQuery = $pdo->prepare(
        "SELECT DATE_FORMAT(COALESCE(subscription_end, trial_end), '%Y-%m') AS ym, COUNT(*) AS total
         FROM users
         WHERE role = 'user' AND status = 'active'
           AND COALESCE(subscription_end, trial_end) >= NOW()
           AND COALESCE(subscription_end, trial_end) < ?
         GROUP BY ym"
    );
    $expiringQuery->execute([$rangeEnd]);
    $expiringCounts = [];
    foreach ($expiringQuery->fetchAll() as $row) {
        $expiringCounts[$row['ym']] = (int) $row['total'];
    }

    $expiring = [];
    for ($i = 0; $i < 6; $i++) {
        $key = $start->modify("+{$i} months")->format('Y-m');
        $expiring[] = ['month' => $key, 'users' => $expiringCounts[$key] ?? 0];
    }

    $yearTotal = 0.0;
    $yearPayments = 0;
    foreach ($months as $row) {
        $yearTotal += $row['income'];
        $yearPayments += $row['payments'];
    }

    respond([
        'success' => true,
        'year' => (int) $year,
        'years' => $years,
        'months' => array_values($months),
        'year_total' => $yearTotal,
        'year_payments' => $yearPayments,
        'expiring' => $expiring,
    ]);
} catch (PDOException $error) {
    error_log($error->getMessage());
    respond(['success' => false, 'message' => 'Unable to load reports.'], 500);
}