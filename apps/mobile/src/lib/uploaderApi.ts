import { API_BASE_URL } from './apiConfig';

const SESSION_KEY = 'fitplanner:uploader';

export interface UploaderSession {
  username: string;
  token: string;
}

export interface WorkoutVideo {
  workoutName: string;
  videoPath: string;
  uploadedAt: string;
}

export class UploaderUnauthorizedError extends Error {
  constructor(message = 'Your session has expired. Please log in again.') {
    super(message);
    this.name = 'UploaderUnauthorizedError';
  }
}

// ---------- Session ----------

export function getUploaderSession(): UploaderSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UploaderSession;
    return parsed?.token && parsed?.username ? parsed : null;
  } catch {
    return null;
  }
}

export function clearUploaderSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

function saveUploaderSession(session: UploaderSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

// ---------- Auth ----------

export async function uploaderLogin(username: string, password: string): Promise<UploaderSession> {
  const response = await fetch(`${API_BASE_URL}/uploader_auth.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', username, password }),
  });
  const result = await response.json();
  if (!response.ok || result.success === false) {
    throw new Error(result.message || 'Unable to log in.');
  }
  const session: UploaderSession = {
    username: result.uploader.username,
    token: result.uploader.token,
  };
  saveUploaderSession(session);
  return session;
}

export async function uploaderLogout(): Promise<void> {
  const session = getUploaderSession();
  clearUploaderSession();
  if (!session) return;
  try {
    await fetch(`${API_BASE_URL}/uploader_auth.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Token': session.token },
      body: JSON.stringify({ action: 'logout' }),
    });
  } catch {
    /* naka-clear na sa local, ok ra */
  }
}

// ---------- Videos ----------

export async function fetchWorkoutVideos(): Promise<WorkoutVideo[]> {
  const response = await fetch(`${API_BASE_URL}/workout_videos.php`);
  const result = await response.json();
  if (!response.ok || result.success === false) {
    throw new Error(result.message || 'Unable to load videos.');
  }
  return result.videos as WorkoutVideo[];
}

export function getWorkoutVideoUrl(videoPath: string, version?: string): string {
  const url = new URL(videoPath, `${API_BASE_URL}/`).toString();
  return version ? `${url}?v=${encodeURIComponent(version)}` : url;
}

// XMLHttpRequest ang gigamit (dili fetch) para naay upload progress
export function uploadWorkoutVideo(
  workoutName: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<WorkoutVideo> {
  const session = getUploaderSession();
  if (!session) return Promise.reject(new UploaderUnauthorizedError());

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('workoutName', workoutName);
    formData.append('video', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}/upload_workout_video.php`);
    xhr.setRequestHeader('X-Auth-Token', session.token);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      let result: { success?: boolean; message?: string; video?: WorkoutVideo } = {};
      try {
        result = JSON.parse(xhr.responseText);
      } catch {
        /* dili JSON ang sagot */
      }
      if (xhr.status === 401) {
        clearUploaderSession();
        reject(new UploaderUnauthorizedError(result.message));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300 && result.success && result.video) {
        resolve(result.video);
        return;
      }
      reject(new Error(result.message || 'Upload failed.'));
    };

    xhr.onerror = () => reject(new Error('Network error. Check your connection and that XAMPP is running.'));
    xhr.send(formData);
  });
}