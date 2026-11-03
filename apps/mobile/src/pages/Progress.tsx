import { useEffect, useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { getCurrentUser, logout } from '../lib/auth';
import { API_BASE_URL } from '../lib/apiConfig';
import { getProfile } from '../lib/api';
import { useIsMobile } from '../lib/useIsMobile';
import ProgressMenu from '../components/ProgressMenu';
import dashboardBg from '../assets/dashboard-bg.webp';
import './Dashboard.css';
import './Progress.css';

type Goal = 'lose' | 'gain' | 'maintain';
type Entry = { weight: number; date: string };

function getCategory(bmi: number) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

function toGoal(value: string): Goal {
  if (value === 'Fat Loss') return 'lose';
  if (value === 'Muscle Gain') return 'gain';
  return 'maintain';
}

function categoryTip(category: string) {
  if (category === 'Obese') return 'Start with low-impact cardio like walking or cycling, 30 minutes, 5 times a week.';
  if (category === 'Overweight') return 'Do more cardio, 4 to 5 times a week, and cut back on sugary drinks.';
  if (category === 'Underweight') return 'Eat more calories and protein, and do strength training 3 to 4 times a week.';
  return 'Keep a balanced mix of strength training and cardio.';
}

function entrySuggestion(weight: number, prev: number | null, goal: Goal, heightCm: number | null) {
  const category = heightCm ? getCategory(weight / Math.pow(heightCm / 100, 2)) : 'Normal';
  const tip = categoryTip(category);

  if (prev === null) {
    return { text: `This is your starting weight (${category}). ${tip}`, good: true };
  }

  const change = +(weight - prev).toFixed(1);
  const abs = Math.abs(change);
  if (abs < 0.1) {
    return { text: `No change from your previous weight. ${tip}`, good: goal === 'maintain' };
  }
  if (change < 0) {
    const good = goal === 'lose';
    return {
      text: `You lost ${abs} kg. ${good ? 'You improved, keep going!' : goal === 'gain' ? 'This is the opposite of your muscle gain goal. Eat more calories and protein.' : 'Try to stay stable.'} ${tip}`,
      good,
    };
  }
  const good = goal === 'gain';
  return {
    text: `You gained ${abs} kg. ${good ? 'You improved, keep going!' : goal === 'lose' ? 'This is the opposite of your fat loss goal. Add more cardio and watch your diet.' : 'Try to stay stable.'} ${tip}`,
    good,
  };
}

const Progress: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const user = getCurrentUser();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/workout', label: 'AI Workout Suggestion' },
    { path: '/meal-plan', label: 'Meal Plan' },
    { path: '/ai-suggestion', label: 'BMI' },
    { path: '/progress', label: 'Progress' },
    { path: '/profile', label: 'Profile' },
  ];

  const [heightCm, setHeightCm] = useState<number | null>(null);
  const [goal, setGoal] = useState<Goal>('maintain');
  const [history, setHistory] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const result = await getProfile();
        if (cancelled || !result.profile || !user?.token) return;
        setHeightCm(Number(result.profile.height_cm));
        setGoal(toGoal(result.profile.goal));

        const res = await fetch(`${API_BASE_URL}/weight_progress.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Auth-Token': user.token },
          body: JSON.stringify({ action: 'sync', weight: Number(result.profile.weight_kg) }),
        });
        if (res.status === 401) {
          logout();
          navigate('/login', { replace: true });
          return;
        }
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Unable to load weight history.');
        if (!cancelled) setHistory(data.logs);
      } catch (e) {
        console.error('Unable to load progress:', e);
        if (!cancelled) {
          setError(
            e instanceof Error && e.message !== 'Failed to fetch'
              ? e.message
              : 'Cannot reach weight_progress.php. Check that Apache is running and the file is in the api folder.',
          );
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };
    void load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // newest first, but each entry is compared with the one before it
  const cards = history
    .map((entry, i) => {
      const prev = i > 0 ? history[i - 1].weight : null;
      const label = i === 0 ? 'Starting weight' : i === history.length - 1 ? 'Current weight' : 'Weight';
      return { ...entry, label, ...entrySuggestion(entry.weight, prev, goal, heightCm) };
    })
    .reverse();

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="db-shell"
        style={{ '--db-bg-image': `url(${dashboardBg})` } as React.CSSProperties}
      >
        <header className="db-top-header">
          <div className="db-top-brand">Fit<span>Planner</span></div>
          {!isMobile && (
            <nav className="db-top-nav">
              {navItems.map(({ path, label }) => path === '/progress' ? (
                <ProgressMenu key={path} />
              ) : (
                <Link key={path} to={path} className="db-top-nav-item">{label}</Link>
              ))}
            </nav>
          )}
          <button className="db-logout-btn" onClick={handleLogout} aria-label="Log out">
            <LogOut size={24} />
          </button>
        </header>

        <div className="db-bg-wrapper">
          <div className="progress-wrap">
            <h2>Weight Progress</h2>

            {!loaded ? (
              <p className="progress-muted">Loading...</p>
            ) : error ? (
              <p className="progress-error">{error}</p>
            ) : cards.length === 0 ? (
              <div className="progress-card">
                <p>Please complete your onboarding to see your progress.</p>
              </div>
            ) : (
              cards.map((c, i) => (
                <div key={i} className="progress-card">
                  <span className="progress-stat-label">{c.label}</span>
                  <div className="progress-entry-weight">{c.weight} kg</div>
                  <p className={c.good ? 'progress-good' : 'progress-bad'}>{c.text}</p>
                  <p className="progress-muted">{c.date}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Progress;