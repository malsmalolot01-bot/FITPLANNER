import { IonIcon } from '@ionic/react';
import { logOutOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { logout } from '../lib/auth';

export type AdminTab = 'overview' | 'users' | 'payments' | 'payment-history' | 'reports' | 'logs' | 'profile';

const ITEMS: { tab: AdminTab; label: string; path: string }[] = [
  { tab: 'overview', label: 'Dashboard', path: '/admin' },
  { tab: 'users', label: 'Users', path: '/admin/users' },
  { tab: 'payments', label: 'Payments', path: '/admin/payments' },
  { tab: 'payment-history', label: 'Payment History', path: '/admin/payment-history' },
  { tab: 'reports', label: 'Reports', path: '/admin/reports' },
  { tab: 'logs', label: 'System Logs', path: '/admin/logs' },
  { tab: 'profile', label: 'Profile', path: '/admin/profile' },
];

type Props = { active: AdminTab };

const AdminSidebar: React.FC<Props> = ({ active }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">Fit<span>Planner</span></div>
      <nav className="admin-nav">
        {ITEMS.map(({ tab, label, path }) => (
          <button
            key={tab}
            className={`admin-nav-item ${active === tab ? 'active' : ''}`}
            onClick={() => { if (tab !== active) navigate(path); }}
          >
            {label}
          </button>
        ))}
      </nav>
      <button className="admin-logout" onClick={handleLogout} aria-label="Log Out">
        <IonIcon icon={logOutOutline} style={{ fontSize: '20px', width: '20px', height: '20px' }} />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default AdminSidebar;