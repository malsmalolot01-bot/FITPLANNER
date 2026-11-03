<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respond(['success' => false, 'message' => 'Method not allowed.'], 405);
}

try {
    $pdo = database();
    $rows = $pdo->query(
        'SELECT workout_name, video_path, uploaded_at FROM workout_videos ORDER BY workout_name'
    )->fetchAll();

    respond([
        'success' => true,
        'videos' => array_map(static fn (array $row): array => [
            'workoutName' => $row['workout_name'],
            'videoPath' => $row['video_path'],
            'uploadedAt' => date(DATE_ATOM, strtotime($row['uploaded_at'])),
        ], $rows),
    ]);
} catch (PDOException $error) {
    error_log($error->getMessage());
    respond(['success' => false, 'message' => 'Unable to load videos.'], 500);
}