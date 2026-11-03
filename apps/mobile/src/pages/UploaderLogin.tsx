import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { IonContent, IonPage } from '@ionic/react';
import { getUploaderSession, uploaderLogin } from '../lib/uploaderApi';
import './VideoUpload.css';

const UploaderLogin: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (getUploaderSession()) return <Navigate to="/video-upload" replace />;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      await uploaderLogin(username.trim(), password);
      navigate('/video-upload', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to log in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent>
        <div className="vu-login-wrap">
          <form className="vu-login" onSubmit={handleSubmit}>
            <h1 className="vu-title">Workout videos</h1>
            <p className="vu-sub">Log in to upload videos.</p>

            <label className="vu-label" htmlFor="vu-username">Username</label>
            <input
              id="vu-username"
              className="vu-input"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label className="vu-label" htmlFor="vu-password">Password</label>
            <input
              id="vu-password"
              className="vu-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="vu-error" role="alert">{error}</p>}

            <button className="vu-btn vu-btn-primary vu-btn-block" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default UploaderLogin;