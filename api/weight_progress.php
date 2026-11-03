<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'message' => 'Method not allowed.'], 405);
}

try {
    $pdo = database();
    $authenticatedUser = authenticated_user($pdo);
    $userId = (string) $authenticatedUser['id'];

    $input = json_decode(file_get_contents('php://input'), true) ?: [];

    // Save the weight only if it is different from the last saved one
    if (($input['action'] ?? '') === 'sync') {
        $weight = (float) ($input['weight'] ?? 0);
        if ($weight >= 20 && $weight <= 400) {
            $last = $pdo->prepare(
                'SELECT weight FROM weight_history WHERE user_id = ? ORDER BY recorded_at DESC, id DESC LIMIT 1'
            );
            $last->execute([$userId]);
            $lastRow = $last->fetch();
            if (!$lastRow || abs((float) $lastRow['weight'] - $weight) >= 0.01) {
                $insert = $pdo->prepare('INSERT INTO weight_history (user_id, weight) VALUES (?, ?)');
                $insert->execute([$userId, $weight]);
            }
        }
    }

    $select = $pdo->prepare(
        'SELECT weight, DATE(recorded_at) AS recorded_date
         FROM weight_history WHERE user_id = ? ORDER BY recorded_at ASC, id ASC'
    );
    $select->execute([$userId]);
    $logs = array_map(static function (array $row): array {
        return ['weight' => (float) $row['weight'], 'date' => $row['recorded_date']];
    }, $select->fetchAll());

    respond(['success' => true, 'logs' => $logs]);
} catch (PDOException $error) {
    error_log($error->getMessage());
    respond(['success' => false, 'message' => 'Unable to load weight progress.'], 500);
}