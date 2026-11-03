<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'message' => 'Method not allowed.'], 405);
}

try {
    $pdo = database();
    $authenticatedUser = authenticated_user($pdo);

    // Kung abot na ang petsa sa onboarding (human mahurot ang remaining days
    // sa advance payment), i-set ang needs_onboarding = 1 ug i-clear ang petsa.
    $onboardingTrigger = $pdo->prepare(
        'UPDATE users
         SET needs_onboarding = 1, onboarding_due_at = NULL
         WHERE id = ? AND onboarding_due_at IS NOT NULL AND onboarding_due_at <= NOW()'
    );
    $onboardingTrigger->execute([$authenticatedUser['id']]);

    $query = $pdo->prepare(
        'SELECT role, trial_end, subscription_status, subscription_end, needs_onboarding,
                NOW() AS server_time,
                CASE
                    WHEN subscription_end > NOW() THEN \'active\'
                    WHEN trial_end > NOW() THEN \'trial\'
                    ELSE \'expired\'
                END AS calculated_status,
                GREATEST(
                    0,
                    DATEDIFF(
                        CASE
                            WHEN subscription_end > NOW() THEN subscription_end
                            WHEN trial_end > NOW() THEN trial_end
                            ELSE NOW()
                        END,
                        NOW()
                    )
                ) AS calculated_days_left
         FROM users
         WHERE id = ? AND status = \'active\'
         LIMIT 1'
    );
    $query->execute([$authenticatedUser['id']]);
    $user = $query->fetch();

    if (!$user) {
        respond(['success' => false, 'message' => 'User account not found.'], 404);
    }

    $paymentsQuery = $pdo->prepare(
        'SELECT id, plan, days, amount, reference_no, proof_image, status, created_at, reviewed_at,
                subscription_start, subscription_end
         FROM payments
         WHERE user_id = ?
         ORDER BY created_at DESC'
    );
    $paymentsQuery->execute([$authenticatedUser['id']]);
    $payments = array_map(static function (array $payment): array {
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
    }, $paymentsQuery->fetchAll());

    $isAdmin = $user['role'] === 'admin';
    $status = $isAdmin ? 'active' : $user['calculated_status'];
    if (!$isAdmin && $user['subscription_status'] !== $status) {
        $statusUpdate = $pdo->prepare('UPDATE users SET subscription_status = ? WHERE id = ?');
        $statusUpdate->execute([$status, $authenticatedUser['id']]);
    }
    $subscriptionEnd = $user['subscription_end'] ?: null;
    if (!$isAdmin && $status === 'trial') {
        $subscriptionEnd = $user['trial_end'];
    }

    respond([
        'success' => true,
        'status' => $status,
        'days_left' => $isAdmin ? null : (int) $user['calculated_days_left'],
        'subscription_end' => $subscriptionEnd,
        'is_locked' => !$isAdmin && $status === 'expired',
        'needs_onboarding' => (int) $user['needs_onboarding'] === 1,
        'expired_type' => $status === 'expired'
            ? ($user['subscription_end'] === null ? 'trial' : 'subscription')
            : null,
        'payments' => $payments,
        'plans' => [
            ['plan' => '1_month', 'name' => '1 Month', 'days' => 30, 'amount' => 500],
            ['plan' => '2_months', 'name' => '2 Months', 'days' => 60, 'amount' => 1000],
            ['plan' => '1_year', 'name' => '1 Year', 'days' => 365, 'amount' => 5000],
        ],
    ]);
} catch (PDOException $error) {
    error_log($error->getMessage());
    respond(['success' => false, 'message' => 'Unable to load subscription details.'], 500);
}