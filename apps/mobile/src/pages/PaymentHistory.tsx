import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ExternalLink, LogOut } from 'lucide-react';
import { getCurrentUser, logout } from '../lib/auth';
import { API_BASE_URL } from '../lib/apiConfig';
import { useIsMobile } from '../lib/useIsMobile';
import dashboardBg from '../assets/dashboard-bg.webp';
import ProgressMenu from '../components/ProgressMenu';
import './Dashboard.css';
import './PaymentHistory.css';

type PaymentStatus = 'pending' | 'approved' | 'rejected';

type Payment = {
  id: number;
  plan: string;
  days: number;
  amount: number;
  reference_no?: string | null;
  proof_image: string | null;
  status: PaymentStatus;
  created_at: string;
  subscription_start: string | null;
  subscription_end: string | null;
};

const PLAN_NAMES: Record<string, string> = {
  '1_month': '1 Month',
  '2_months': '2 Months',
  '1_year': '1 Year',
};

const STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pending',
  approved: 'Paid',
  rejected: 'Rejected',
};

const NAV_BEFORE_PROGRESS = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/workout', label: 'AI Workout Suggestion' },
  { path: '/meal-plan', label: 'Meal Plan' },
  { path: '/ai-suggestion', label: 'BMI' },
];
const NAV_AFTER_PROGRESS = [{ path: '/profile', label: 'Profile' }];

const formatPlan = (plan: string) => PLAN_NAMES[plan] ?? plan;

const formatAmount = (amount: number) =>
  `PHP ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const formatDateTime = (value: string | null) => {
  if (!value) return '—';
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const PaymentHistory: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const user = getCurrentUser();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPayments = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setError('Please log in to view your payment history.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/get_subscription.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': user.token,
        },
        body: JSON.stringify({ userId: user.id }),
      });
      if (response.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to load your payment history.');
      setPayments(Array.isArray(result.payments) ? result.payments : []);
      setLocked(result.is_locked === true);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load your payment history.');
    } finally {
      setLoading(false);
    }
  }, [navigate, user?.id, user?.token]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderNavItem = ({ path, label }: { path: string; label: string }) =>
    locked ? (
      <span key={path} className="db-top-nav-item" aria-disabled="true" style={{ opacity: 0.4, pointerEvents: 'none' }}>
        {label}
      </span>
    ) : (
      <Link key={path} to={path} className="db-top-nav-item">{label}</Link>
    );

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="db-shell"
        style={{ '--db-bg-image': `url(${dashboardBg})` } as React.CSSProperties}
      >
        <header className="db-top-header">
          <div className="db-top-brand">FIT<span>PLANNER</span></div>
          {!isMobile && (
            <nav className="db-top-nav">
              {NAV_BEFORE_PROGRESS.map(renderNavItem)}
              <ProgressMenu locked={locked} />
              {NAV_AFTER_PROGRESS.map(renderNavItem)}
            </nav>
          )}
          <button className="db-logout-btn" onClick={handleLogout} aria-label="Log out">
            <LogOut size={24} />
          </button>
        </header>

        <div className="db-bg-wrapper">
          <main className="ph-container">
            <header className="ph-header">
              <div>
                <h1>Payment History</h1>
                <p>Every payment you have submitted, and its status.</p>
              </div>
              <Link to="/subscription" className="ph-link-btn">Subscription</Link>
            </header>

            {loading ? (
              <div className="ph-state" role="status">
                <IonSpinner aria-label="Loading payments" />
                <span>Loading your payments...</span>
              </div>
            ) : error ? (
              <div className="ph-state" role="alert">
                <p className="ph-error">{error}</p>
                <button type="button" className="ph-link-btn" onClick={() => void loadPayments()}>Retry</button>
              </div>
            ) : payments.length === 0 ? (
              <div className="ph-state">
                <h2>No payments yet</h2>
                <p>When you submit a payment, it will show up here.</p>
                <Link to="/subscription" className="ph-link-btn ph-link-btn-solid">Go to subscription</Link>
              </div>
            ) : (
              <ul className="ph-list">
                {payments.map((payment) => (
                  <li key={payment.id} className="ph-card">
                    <div className="ph-card-top">
                      <div>
                        <h2 className="ph-plan">{formatPlan(payment.plan)}</h2>
                        <span className="ph-amount">{formatAmount(payment.amount)}</span>
                      </div>
                      <span className={`ph-badge ph-badge-${payment.status}`}>
                        {STATUS_LABELS[payment.status] ?? payment.status}
                      </span>
                    </div>

                    <dl className="ph-details">
                      <div>
                        <dt>Submitted</dt>
                        <dd>{formatDateTime(payment.created_at)}</dd>
                      </div>
                      <div>
                        <dt>Duration</dt>
                        <dd>{payment.days} days</dd>
                      </div>
                      {payment.status === 'approved' && (
                        <>
                          <div>
                            <dt>Subscription start</dt>
                            <dd>{formatDateTime(payment.subscription_start)}</dd>
                          </div>
                          <div>
                            <dt>Expires</dt>
                            <dd>{formatDateTime(payment.subscription_end)}</dd>
                          </div>
                        </>
                      )}
                    </dl>

                    {payment.status === 'pending' && (
                      <p className="ph-note">Waiting for the admin to review your payment.</p>
                    )}
                    {payment.status === 'rejected' && (
                      <p className="ph-note">This payment was not activated. Submit a new payment to continue.</p>
                    )}

                    <div className="ph-proof">
                      {payment.proof_image ? (
                        <a
                          href={`${API_BASE_URL}/uploads/payments/${payment.proof_image}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View proof screenshot <ExternalLink size={14} aria-hidden="true" />
                        </a>
                      ) : (
                        <span>No proof uploaded</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PaymentHistory;