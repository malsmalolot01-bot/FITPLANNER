import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, Utensils, Activity, MessageCircle, UserRound, TrendingUp } from 'lucide-react';
import ProgressMenu from './ProgressMenu';
import ChatBot from './ChatBot';
import { useIsMobile } from '../lib/useIsMobile';
import { getCurrentUser } from '../lib/auth';
import { API_BASE_URL } from '../lib/apiConfig';

const NAV_PATHS = ['/dashboard', '/workout', '/meal-plan', '/ai-suggestion', '/progress', '/profile', '/subscription', '/payment-history'];

const AppNav: React.FC = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [chatOpen, setChatOpen] = useState(false);
  const [locked, setLocked] = useState(false);

  const showBottomNav = isMobile && NAV_PATHS.includes(location.pathname);
  const showDesktopFab = !isMobile && location.pathname === '/dashboard';

  useEffect(() => {
    const user = getCurrentUser();
    if (!user?.id || user.role === 'admin') {
      setLocked(false);
      return;
    }

    let cancelled = false;
    fetch(`${API_BASE_URL}/get_subscription.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': user.token,
      },
      body: JSON.stringify({ userId: user.id }),
    })
      .then(async (response) => {
       if (response.status === 401) return;
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Unable to load subscription status.');
        if (!cancelled) {
          setLocked(result.is_locked === true);
        }
      })
      .catch((error: unknown) => {
        console.error('Subscription navigation status request failed:', error);
      });

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  return (
    <>
      {(showBottomNav || showDesktopFab) && (
        <ChatBot isOpen={chatOpen} onOpenChange={setChatOpen} hideFab={!showDesktopFab} />
      )}

      {showBottomNav && (
        <nav className="db-bottom-nav">
          {[
            { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/workout', label: 'Workout', icon: Dumbbell },
            { path: '/meal-plan', label: 'Meal Plan', icon: Utensils },
            { path: '/ai-suggestion', label: 'BMI', icon: Activity },
            { path: '/progress', label: 'Progress', icon: TrendingUp },
            { path: '/profile', label: 'Profile', icon: UserRound },
          ].map(({ path, label, icon: Icon }) => (
            path === '/progress' ? (
              <ProgressMenu
                key={path}
                variant="bottom"
                locked={locked}
                suppressActive={chatOpen}
                onOpen={() => setChatOpen(false)}
                onNavigate={() => setChatOpen(false)}
              />
            ) : locked ? (
              <span key={path} aria-label={`${label} disabled until subscription is active`} aria-disabled="true" className="db-bottom-nav-item" style={{ opacity: 0.4 }}>
                <Icon size={22} />
              </span>
            ) : (
              <Link
                key={path}
                to={path}
                aria-label={label}
                onClick={() => setChatOpen(false)}
                className={`db-bottom-nav-item ${!chatOpen && location.pathname === path ? 'active' : ''}`}
              >
                <Icon size={22} />
              </Link>
            )
          ))}
          <button
            type="button"
            aria-label="Chat"
            className={`db-bottom-nav-item db-bottom-nav-btn ${chatOpen ? 'active' : ''}`}
            disabled={locked}
            onClick={() => setChatOpen(!chatOpen)}
          >
            <MessageCircle size={22} />
          </button>
        </nav>
      )}
    </>
  );
};

export default AppNav;