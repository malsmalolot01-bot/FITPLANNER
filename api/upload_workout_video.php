<?php

declare(strict_types=1);

require_once __DIR__ . '/uploader_helpers.php';

const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB
const ALLOWED_VIDEO_TYPES = [
    'video/mp4' => 'mp4',
    'video/webm' => 'webm',
    'video/quicktime' => 'mov',
];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'message' => 'Method not allowed.'], 405);
}

try {
    $pdo = database();
    $uploader = authenticated_uploader($pdo);

    // Kung molapas ang file sa post_max_size sa php.ini, mawala ang $_POST ug $_FILES
    if (empty($_FILES) && empty($_POST) && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
        respond(['success' => false, 'message' => 'Video is too large. Raise post_max_size and upload_max_filesize in php.ini.'], 413);
    }

    $workoutName = trim((string) ($_POST['workoutName'] ?? ''));
    if ($workoutName === '' || mb_strlen($workoutName) > 191) {
        respond(['success' => false, 'message' => 'Workout name is missing.'], 422);
    }

    $file = $_FILES['video'] ?? null;
    if (!$file || !is_array($file)) {
        respond(['success' => false, 'message' => 'Choose a video file.'], 422);
    }
    if ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE) {
        respond(['success' => false, 'message' => 'Video is too large. Raise upload_max_filesize in php.ini.'], 413);
    }
    if ($file['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) {
        respond(['success' => false, 'message' => 'Upload failed. Try again.'], 400);
    }
    if ($file['size'] > MAX_VIDEO_BYTES) {
        respond(['success' => false, 'message' => 'Video must be 100 MB or smaller.'], 413);
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = (string) $finfo->file($file['tmp_name']);
    if (!isset(ALLOWED_VIDEO_TYPES[$mime])) {
        respond(['success' => false, 'message' => 'Only MP4, WebM or MOV videos are allowed.'], 415);
    }
    $extension = ALLOWED_VIDEO_TYPES[$mime];

    $directory = __DIR__ . '/uploads/videos';
    if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) {
        respond(['success' => false, 'message' => 'Unable to create the uploads folder.'], 500);
    }

    $slug = trim((string) preg_replace('/[^a-z0-9]+/', '-', strtolower($workoutName)), '-');
    if ($slug === '') {
        $slug = 'workout';
    }
    $fileName = $slug . '-' . bin2hex(random_bytes(6)) . '.' . $extension;
    $destination = $directory . '/' . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        respond(['success' => false, 'message' => 'Unable to save the video.'], 500);
    }

    $newPath = 'uploads/videos/' . $fileName;

    try {
        $existing = $pdo->prepare('SELECT video_path FROM workout_videos WHERE workout_name = ? LIMIT 1');
        $existing->execute([$workoutName]);
        $oldPath = $existing->fetchColumn();

        $save = $pdo->prepare(
            'INSERT INTO workout_videos (workout_name, video_path, uploaded_by)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE video_path = VALUES(video_path), uploaded_by = VALUES(uploaded_by)'
        );
        $save->execute([$workoutName, $newPath, $uploader['id']]);
    } catch (PDOException $error) {
        @unlink($destination); // ayaw pasagdi ang file kung napakyas ang DB
        throw $error;
    }

    // Kung replace, tangtanga ang daan nga file
    if (is_string($oldPath) && $oldPath !== '' && $oldPath !== $newPath) {
        $oldFile = $directory . '/' . basename($oldPath);
        if (is_file($oldFile)) {
            @unlink($oldFile);
        }
    }

    respond([
        'success' => true,
        'message' => 'Video uploaded.',
        'video' => [
            'workoutName' => $workoutName,
            'videoPath' => $newPath,
            'uploadedAt' => date(DATE_ATOM),
        ],
    ], 201);
} catch (PDOException $error) {
    error_log($error->getMessage());
    respond(['success' => false, 'message' => 'Database error. Check that MySQL is running and the tables exist.'], 500);
}