<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'message' => 'Method not allowed.'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$paymentId = filter_var($input['paymentId'] ?? null, FILTER_VALIDATE_INT);
$decision = trim((string) ($input['decision'] ?? ''));

if (!$paymentId || !in_array($decision, ['approve', 'reject'], true)) {
    respond(['success' => false, 'message' => 'Payment and a valid decision are required.'], 422);
}

try {
    $pdo = database();
    $admin = authenticated_user($pdo);
    if ($admin['role'] !== 'admin') {
        respond(['success' => false, 'message' => 'Administrator access is required.'], 403);
    }

    $pdo->beginTransaction();
    $paymentQuery = $pdo->prepare(
        'SELECT id, user_id, days, status
         FROM payments
         WHERE id = ?
         FOR UPDATE'
    );
    $paymentQuery->execute([$paymentId]);
    $payment = $paymentQuery->fetch();
    if (!$payment) {
        $pdo->rollBack();
        respond(['success' => false, 'message' => 'Payment not found.'], 404);
    }
    if ($payment['status'] !== 'pending') {
        $pdo->rollBack();
        respond(['success' => false, 'message' => 'This payment has already been reviewed.'], 409);
    }

    if ($decision === 'reject') {
        $updatePayment = $pdo->prepare(
            "UPDATE payments SET status = 'rejected', reviewed_at = NOW() WHERE id = ? AND status = 'pending'"
        );
        $updatePayment->execute([$paymentId]);
        $pdo->commit();
        respond(['success' => true, 'status' => 'rejected']);
    }

    $clientQuery = $pdo->prepare(
        'SELECT trial_end, subscription_end
         FROM users
         WHERE id = ? AND role = \'user\' AND status = \'active\'
         FOR UPDATE'
    );
    $clientQuery->execute([$payment['user_id']]);
    $client = $clientQuery->fetch();
    if (!$client) {
        $pdo->rollBack();
        respond(['success' => false, 'message' => 'Client account not found or inactive.'], 404);
    }

    $days = (int) $payment['days'];
    if (!in_array($days, [30, 60, 365], true)) {
        $pdo->rollBack();
        respond(['success' => false, 'message' => 'Payment has an invalid subscription duration.'], 422);
    }

    // Advance payment: kung naa pay remaining days, dili pa mo-onboarding karon.
    // Ang onboarding_due_at kay ang petsa kung kanus-a mag-start ang bayad nga plan.
    // Ang duha ka bag-ong linya naa sa ibabaw sa subscription_start ug subscription_end
    // kay kinahanglan mabasa ang old nga petsa una.
    $updateClient = $pdo->prepare(
        "UPDATE users
         SET needs_onboarding = CASE
                 WHEN GREATEST(
                     CURRENT_TIMESTAMP,
                     COALESCE(subscription_end, '1000-01-01 00:00:00'),
                     COALESCE(trial_end, '1000-01-01 00:00:00')
                 ) > CURRENT_TIMESTAMP THEN needs_onboarding
                 ELSE 1
             END,
             onboarding_due_at = CASE
                 WHEN GREATEST(
                     CURRENT_TIMESTAMP,
                     COALESCE(subscription_end, '1000-01-01 00:00:00'),
                     COALESCE(trial_end, '1000-01-01 00:00:00')
                 ) > CURRENT_TIMESTAMP THEN COALESCE(onboarding_due_at, GREATEST(
                     CURRENT_TIMESTAMP,
                     COALESCE(subscription_end, '1000-01-01 00:00:00'),
                     COALESCE(trial_end, '1000-01-01 00:00:00')
                 ))
                 ELSE NULL
             END,
             subscription_status = 'active',
             subscription_start = GREATEST(
                 CURRENT_TIMESTAMP,
                 COALESCE(subscription_end, '1000-01-01 00:00:00'),
                 COALESCE(trial_end, '1000-01-01 00:00:00')
             ),
             subscription_end = DATE_ADD(
                 GREATEST(
                     CURRENT_TIMESTAMP,
                     COALESCE(subscription_end, '1000-01-01 00:00:00'),
                     COALESCE(trial_end, '1000-01-01 00:00:00')
                 ),
                 INTERVAL {$days} DAY
         )
         WHERE id = ?"
    );
    $updateClient->execute([$payment['user_id']]);
    $datesQuery = $pdo->prepare('SELECT subscription_start, subscription_end FROM users WHERE id = ?');
    $datesQuery->execute([$payment['user_id']]);
    $subscriptionDates = $datesQuery->fetch();
    if (!$subscriptionDates || !$subscriptionDates['subscription_end']) {
        throw new RuntimeException('Could not load the updated subscription end date.');
    }

    $updatePayment = $pdo->prepare(
        "UPDATE payments
         SET status = 'approved', reviewed_at = NOW(), subscription_start = ?, subscription_end = ?
         WHERE id = ? AND status = 'pending'"
    );
    $updatePayment->execute([
        $subscriptionDates['subscription_start'],
        $subscriptionDates['subscription_end'],
        $paymentId,
    ]);
    if ($updatePayment->rowCount() !== 1) {
        throw new RuntimeException('Payment review state changed unexpectedly.');
    }

    $pdo->commit();
    respond([
        'success' => true,
        'status' => 'approved',
        'subscription_start' => $subscriptionDates['subscription_start'],
        'subscription_end' => $subscriptionDates['subscription_end'],
    ]);
} catch (PDOException $error) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log($error->getMessage());
    respond(['success' => false, 'message' => 'Unable to review payment.'], 500);
} catch (RuntimeException $error) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log($error->getMessage());
    respond(['success' => false, 'message' => 'Unable to review payment.'], 500);
}