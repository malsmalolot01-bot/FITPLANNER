import { Fragment, useMemo } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { logout } from '../lib/auth';
import { useIsMobile } from '../lib/useIsMobile';
import ProgressMenu from '../components/ProgressMenu';
import { getLog, toDateKey, totalKcal, type LogEntry } from '../lib/workoutLog';
import dashboardBg from '../assets/dashboard-bg.webp';
import './Dashboard.css';
import './Progress.css';
import './CaloriesBurned.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/workout', label: 'AI Workout Suggestion' },
  { path: '/meal-plan', label: 'Meal Plan' },
  { path: '/ai-suggestion', label: 'BMI' },
  { path: '/progress', label: 'Progress' },
  { path: '/profile', label: 'Profile' },
];

const CaloriesBurned: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const log = useMemo(() => getLog(), []);
  const todayKey = toDateKey(new Date());
  const monthPrefix = todayKey.slice(0, 7);

  const todayKcal = totalKcal(log.filter((e) => e.date === todayKey));
  const monthKcal = totalKcal(log.filter((e) => e.date.startsWith(monthPrefix)));
  const allKcal = totalKcal(log);

  const days = useMemo(() => {
    const map = new Map<string, LogEntry[]>();
    log.forEach((e) => {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [log]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
            <h2>Calories Burned</h2>

            <div className="cal-stats">
              <div className="progress-card cal-stat">
                <span className="progress-stat-label">Today</span>
                <div className="progress-entry-weight">{todayKcal} kcal</div>
              </div>
              <div className="progress-card cal-stat">
                <span className="progress-stat-label">This month</span>
                <div className="progress-entry-weight">{monthKcal} kcal</div>
              </div>
              <div className="progress-card cal-stat">
                <span className="progress-stat-label">All time</span>
                <div className="progress-entry-weight">{allKcal} kcal</div>
              </div>
            </div>

            {days.length === 0 ? (
              <div className="progress-card">
                <p className="progress-muted">
                  No completed workouts yet. Check off exercises in your Dashboard to see them here.
                </p>
              </div>
            ) : (
              <div className="progress-card cal-table-wrap">
                <table className="cal-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Workout</th>
                      <th>Plan</th>
                      <th className="num">Kcal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {days.map(([date, entries]) => (
                      <Fragment key={date}>
                        {entries.map((e, i) => (
                          <tr key={`${date}-${e.name}`}>
                            <td>{i === 0 ? date : ''}</td>
                            <td>{e.name}</td>
                            <td className="cal-plan">{e.plan}</td>
                            <td className="num">{e.kcal}</td>
                          </tr>
                        ))}
                        <tr className="cal-total">
                          <td colSpan={3}>Total for {date}</td>
                          <td className="num">{totalKcal(entries)}</td>
                        </tr>
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CaloriesBurned;