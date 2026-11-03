<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'message' => 'Method not allowed. TEST-V2'], 405);
}

$plan = trim((string) ($_POST['plan'] ?? ''));
$proof = $_FILES['proof'] ?? null;

$plans = [
    '1_month' => ['days' => 30, 'amount' => 500],
    '2_months' => ['days' => 60, 'amount' => 1000],
    '1_year' => ['days' => 365, 'amount' => 5000],
];
if (!isset($plans[$plan])) {
    respond(['success' => false, 'message' => 'Please select a valid subscription plan.'], 422);
}

if (!$proof || !isset($proof['error']) || $proof['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($proof['tmp_name'])) {
    respond(['success' => false, 'message' => 'Please upload a screenshot of your GCash payment.'], 422);
}
if ($proof['size'] > 5 * 1024 * 1024) {
    respond(['success' => false, 'message' => 'Screenshot must be 5 MB or smaller.'], 422);
}
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($proof['tmp_name']);
$allowedTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
if (!isset($allowedTypes[$mimeType])) {
    respond(['success' => false, 'message' => 'Only JPG, PNG, or WebP images are allowed.'], 422);
}
$extension = $allowedTypes[$mimeType];

try {
    $pdo = database();
    $authenticatedUser = authenticated_user($pdo);
    $userId = $authenticatedUser['id'];
    $pdo->beginTransaction();

    $userQuery = $pdo->prepare(
        'SELECT role, trial_end, subscription_end
         FROM users
         WHERE id = ? AND status = \'active\'
         FOR UPDATE'
    );
    $userQuery->execute([$userId]);
    $user = $userQuery->fetch();
    if (!$user) {
        $pdo->rollBack();
        respond(['success' => false, 'message' => 'User account not found.'], 404);
    }
    if ($user['role'] === 'admin') {
        $pdo->rollBack();
        respond(['success' => false, 'message' => 'Admin accounts do not need subscriptions.'], 403);
    }



    $uploadDir = __DIR__ . '/uploads/payments';
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
        $pdo->rollBack();
        respond(['success' => false, 'message' => 'Upload folder is not available.'], 500);
    }
    $fileName = bin2hex(random_bytes(16)) . '.' . $extension;
    if (!move_uploaded_file($proof['tmp_name'], $uploadDir . '/' . $fileName)) {
        $pdo->rollBack();
        respond(['success' => false, 'message' => 'Unable to save the screenshot.'], 500);
    }

    $days = (int) $plans[$plan]['days'];
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
    $updateClient->execute([$userId]);

    $datesQuery = $pdo->prepare('SELECT subscription_start, subscription_end FROM users WHERE id = ?');
    $datesQuery->execute([$userId]);
    $dates = $datesQuery->fetch();
    if (!$dates || !$dates['subscription_end']) {
        $pdo->rollBack();
        respond(['success' => false, 'message' => 'Unable to activate the subscription.'], 500);
    }

    $insert = $pdo->prepare(
        "INSERT INTO payments (user_id, plan, days, amount, method, proof_image, status, reviewed_at, subscription_start, subscription_end)
         VALUES (?, ?, ?, ?, 'gcash', ?, 'approved', NOW(), ?, ?)"
    );
    $insert->execute([
        $userId, $plan, $days, $plans[$plan]['amount'], $fileName,
        $dates['subscription_start'], $dates['subscription_end'],
    ]);
    $paymentId = (int) $pdo->lastInsertId();
    $pdo->commit();

    respond([
        'success' => true,
        'message' => 'Payment received. Your subscription is active.',
        'payment' => [
            'id' => $paymentId,
            'plan' => $plan,
            'days' => $plans[$plan]['days'],
            'amount' => $plans[$plan]['amount'],
            'method' => 'gcash',
            'proof_image' => $fileName,
            'status' => 'approved',
            'created_at' => date(DATE_ATOM),
        ],
    ], 201);
} catch (PDOException $error) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log($error->getMessage());
    respond(['success' => false, 'message' => 'Unable to submit payment.'], 500);
}
