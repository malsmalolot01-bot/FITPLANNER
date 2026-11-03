import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { gymWorkouts, homeWorkouts } from '../lib/workoutLibrary';
import {
  UploaderUnauthorizedError,
  fetchWorkoutVideos,
  getUploaderSession,
  getWorkoutVideoUrl,
  uploadWorkoutVideo,
  uploaderLogout,
  type WorkoutVideo,
} from '../lib/uploaderApi';
import './VideoUpload.css';

const MAX_VIDEO_MB = 100;

type Group = 'Gym' | 'Home';
type Filter = 'All' | Group | 'Missing';

interface WorkoutRow {
  name: string;
  group: Group;
  type: string;
  target: string;
}

// Tanang workouts nga mahimong i-suggest sa AI (gikan sa workoutLibrary.ts), walay doble nga name
const buildRows = (): WorkoutRow[] => {
  const seen = new Set<string>();
  const rows: WorkoutRow[] = [];
  const add = (list: typeof gymWorkouts, group: Group) => {
    list.forEach((w) => {
      if (seen.has(w.name)) return;
      seen.add(w.name);
      rows.push({ name: w.name, group, type: w.type, target: w.target });
    });
  };
  add(gymWorkouts, 'Gym');
  add(homeWorkouts, 'Home');
  return rows;
};

const ROWS = buildRows();

const VideoUpload: React.FC = () => {
  const navigate = useNavigate();
  const session = getUploaderSession();

  const [videos, setVideos] = useState<Record<string, WorkoutVideo>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [uploading, setUploading] = useState<{ name: string; percent: number } | null>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleUnauthorized = useCallback(() => {
    navigate('/uploader-login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    fetchWorkoutVideos()
      .then((list) => {
        if (cancelled) return;
        setVideos(Object.fromEntries(list.map((v) => [v.workoutName, v])));
      })
      .catch((err) => {
        if (!cancelled) setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Unable to load videos.' });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadedCount = useMemo(() => ROWS.filter((r) => videos[r.name]).length, [videos]);

  const visibleRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return ROWS.filter((r) => {
      if (term && !r.name.toLowerCase().includes(term)) return false;
      if (filter === 'Gym' || filter === 'Home') return r.group === filter;
      if (filter === 'Missing') return !videos[r.name];
      return true;
    });
  }, [search, filter, videos]);

  if (!session) return <Navigate to="/uploader-login" replace />;

  const handleFile = async (row: WorkoutRow, file: File | undefined) => {
    const input = fileInputs.current[row.name];
    if (!file) return;
    setMessage(null);

    if (!file.type.startsWith('video/')) {
      setMessage({ kind: 'error', text: 'Choose a video file (MP4, WebM or MOV).' });
      if (input) input.value = '';
      return;
    }
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setMessage({ kind: 'error', text: `Video must be ${MAX_VIDEO_MB} MB or smaller.` });
      if (input) input.value = '';
      return;
    }

    setUploading({ name: row.name, percent: 0 });
    try {
      const saved = await uploadWorkoutVideo(row.name, file, (percent) =>
        setUploading({ name: row.name, percent })
      );
      setVideos((prev) => ({ ...prev, [row.name]: saved }));
      setMessage({ kind: 'ok', text: `Uploaded video for ${row.name}.` });
    } catch (err) {
      if (err instanceof UploaderUnauthorizedError) {
        handleUnauthorized();
        return;
      }
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Upload failed.' });
    } finally {
      setUploading(null);
      if (input) input.value = '';
    }
  };

  const handleLogout = async () => {
    await uploaderLogout();
    handleUnauthorized();
  };

  const filters: Filter[] = ['All', 'Gym', 'Home', 'Missing'];
  const filterLabel: Record<Filter, string> = {
    All: 'All',
    Gym: 'Gym',
    Home: 'Home',
    Missing: 'No video yet',
  };

  return (
    <IonPage>
      <IonContent>
        <div className="vu-page">
          <header className="vu-header">
            <div>
              <h1 className="vu-title">Workout videos</h1>
              <p className="vu-sub">
                {loading ? 'Loading...' : `${uploadedCount} of ${ROWS.length} workouts have a video`}
              </p>
            </div>
            <button className="vu-btn" type="button" onClick={handleLogout}>
              Log out
            </button>
          </header>

          <div className="vu-progress-total" aria-hidden="true">
            <div
              className="vu-progress-total-bar"
              style={{ width: `${ROWS.length ? (uploadedCount / ROWS.length) * 100 : 0}%` }}
            />
          </div>

          <div className="vu-toolbar">
            <input
              className="vu-input"
              type="search"
              placeholder="Search workout"
              aria-label="Search workout"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="vu-filters" role="group" aria-label="Filter workouts">
              {filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`vu-chip${filter === f ? ' vu-chip-active' : ''}`}
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                >
                  {filterLabel[f]}
                </button>
              ))}
            </div>
          </div>

          {message && (
            <p className={message.kind === 'ok' ? 'vu-ok' : 'vu-error'} role="status">
              {message.text}
            </p>
          )}

          {visibleRows.length === 0 && !loading && (
            <p className="vu-empty">No workouts match. Clear the search or pick another filter.</p>
          )}

          <ul className="vu-list">
            {visibleRows.map((row) => {
              const video = videos[row.name];
              const isUploading = uploading?.name === row.name;
              return (
                <li key={row.name} className="vu-item">
                  <div className="vu-item-top">
                    <div>
                      <h2 className="vu-item-name">{row.name}</h2>
                      <p className="vu-item-meta">
                        {row.group} workout, {row.type}, {row.target}
                      </p>
                    </div>
                    <span className={`vu-badge${video ? ' vu-badge-done' : ''}`}>
                      {video ? 'Has video' : 'No video'}
                    </span>
                  </div>

                  {video && (
                    <video
                      className="vu-video"
                      controls
                      preload="metadata"
                      src={getWorkoutVideoUrl(video.videoPath, video.uploadedAt)}
                    />
                  )}

                  {isUploading && (
                    <div className="vu-upload-progress" role="progressbar" aria-valuenow={uploading.percent} aria-valuemin={0} aria-valuemax={100}>
                      <div className="vu-upload-progress-bar" style={{ width: `${uploading.percent}%` }} />
                      <span className="vu-upload-progress-text">
                        {uploading.percent < 100 ? `Uploading ${uploading.percent}%` : 'Saving...'}
                      </span>
                    </div>
                  )}

                  <input
                    ref={(el) => {
                      fileInputs.current[row.name] = el;
                    }}
                    className="vu-file"
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={(e) => void handleFile(row, e.target.files?.[0])}
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    className={`vu-btn${video ? '' : ' vu-btn-primary'}`}
                    disabled={uploading !== null}
                    onClick={() => fileInputs.current[row.name]?.click()}
                  >
                    {video ? 'Replace video' : 'Upload video'}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default VideoUpload;