import { useCallback, useEffect, useRef, useState } from 'react';
import { IonButton, IonContent, IonPage, IonSpinner } from '@ionic/react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { getCurrentUser, logout } from '../lib/auth';
import { API_BASE_URL } from '../lib/apiConfig';
import { useIsMobile } from '../lib/useIsMobile';
import { getDaysLeft } from '../lib/trial';
import ProgressMenu from '../components/ProgressMenu';
import dashboardBg from '../assets/dashboard-bg.webp';
import './Dashboard.css';
import './Subscription.css';

const BASE_FEATURES = [
  'AI workout suggestions',
  'Personalized meal plan',
  'BMI and calorie tracking',
  'Progress and weight tracking',
  'Workout video guides',
];

const PLANS = [
  {
    plan: '1_month',
    name: '1 Month',
    days: 30,
    amount: 500,
    tagline: 'Best for trying things out',
    features: BASE_FEATURES,
  },
  {
    plan: '2_months',
    name: '2 Months',
    days: 60,
    amount: 1000,
    tagline: 'Build a steady routine',
    features: BASE_FEATURES,
  },
  {
    plan: '1_year',
    name: '1 Year',
    days: 365,
    amount: 5000,
    tagline: 'Commit for the long run',
    features: [...BASE_FEATURES, 'Save PHP 1,000 vs monthly plans'],
  },
] as const;

type PlanId = (typeof PLANS)[number]['plan'];
type Payment = {
  id: number;
  plan: PlanId;
  days: number;
  amount: number;
  reference_no: string | null;
  proof_image: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  subscription_start: string | null;
  subscription_end: string | null;
};
type SubscriptionInfo = {
  status: 'trial' | 'active' | 'expired';
  days_left: number | null;
  subscription_end: string | null;
  needs_onboarding?: boolean;
  expired_type?: 'trial' | 'subscription' | null;
};

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const user = getCurrentUser();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('1_month');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const pendingPaymentId = useRef<number | null>(null);
  const contentRef = useRef<HTMLIonContentElement>(null);

  const pendingPayment = payments.some((payment) => payment.status === 'pending');
  const plan = PLANS.find((item) => item.plan === selectedPlan) ?? PLANS[0];
  const latestPayment = payments[0];

  const loadPage = useCallback(async (silent = false) => {
    if (!user?.id) {
      setLoading(false);
      setError('Please log in to view subscription details.');
      return;
    }

    if (!silent) {
      setLoading(true);
      setError('');
    }
    try {
      const subscriptionResponse = await fetch(`${API_BASE_URL}/get_subscription.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': user.token,
        },
        body: JSON.stringify({ userId: user.id }),
      });
      const subscriptionResult = await subscriptionResponse.json();
      if (!subscriptionResponse.ok) {
        throw new Error(subscriptionResult.message || 'Unable to load subscription details.');
      }

      setSubscription(subscriptionResult);
      const paymentRows: Payment[] = subscriptionResult.payments ?? [];
      const currentPendingPayment = paymentRows.find((payment) => payment.status === 'pending');
      if (currentPendingPayment) {
        pendingPaymentId.current = currentPendingPayment.id;
      } else if (
        pendingPaymentId.current !== null
        && paymentRows.some((payment) => payment.id === pendingPaymentId.current && payment.status === 'approved')
      ) {
        pendingPaymentId.current = null;
        navigate(subscriptionResult.needs_onboarding ? '/onboarding' : '/dashboard', { replace: true });
      } else {
        pendingPaymentId.current = null;
      }
      setPayments(paymentRows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load subscription details.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [navigate, user?.id, user?.token]);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  useEffect(() => {
    if (!pendingPayment) return;
    const intervalId = window.setInterval(() => void loadPage(true), 5000);
    return () => window.clearInterval(intervalId);
  }, [loadPage, pendingPayment]);

  const submitPayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id || pendingPayment) return;
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      if (!proofFile) throw new Error('Please upload a screenshot of your GCash payment.');
      const formData = new FormData();
      formData.append('plan', selectedPlan);
      formData.append('proof', proofFile);
      const response = await fetch(`${API_BASE_URL}/submit_payment.php`, {
        method: 'POST',
        headers: { 'X-Auth-Token': user.token },
        body: formData,
      });
      const raw = await response.text();
      let result: { message?: string } = {};
      try {
        result = JSON.parse(raw);
      } catch {
        throw new Error('Server error: ' + raw.slice(0, 200));
      }
      if (!response.ok) throw new Error(result.message || 'Unable to submit payment.');
      setProofFile(null);
      if (proofPreview) URL.revokeObjectURL(proofPreview);
      setProofPreview('');
      setNotice('Payment received. Your subscription is active.');
      await loadPage(true);
      contentRef.current?.scrollToTop(300);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit payment.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPlan = (planId: PlanId) => PLANS.find((item) => item.plan === planId)?.name ?? planId;
  const formatDateTime = (value: string) =>
    new Date(value.includes('T') ? value : value.replace(' ', 'T')).toLocaleString();

  const handleProofChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5 MB or smaller.');
      return;
    }
    if (proofPreview) URL.revokeObjectURL(proofPreview);
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isLocked = subscription?.status === 'expired';
  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/workout', label: 'AI Workout Suggestion' },
    { path: '/meal-plan', label: 'Meal Plan' },
    { path: '/ai-suggestion', label: 'BMI' },
    { path: '/progress', label: 'Progress' },
    { path: '/profile', label: 'Profile' },
  ];

  const daysLeftNow = subscription?.subscription_end
    ? getDaysLeft(subscription.subscription_end, 0)
    : 0;

  return (
    <IonPage>
      <IonContent
        fullscreen
        ref={contentRef}
        className="db-shell"
        style={{ '--db-bg-image': `url(${dashboardBg})` } as React.CSSProperties}
      >
        <header className="db-top-header">
          <div className="db-top-brand">Fit<span>Planner</span></div>
          {!isMobile && (
            <nav className="db-top-nav">
              {navItems.map(({ path, label }) => path === '/progress' ? (
                <ProgressMenu key={path} locked={isLocked} />
              ) : isLocked ? (
                <span key={path} className="db-top-nav-item" aria-disabled="true" style={{ opacity: 0.4, pointerEvents: 'none' }}>
                  {label}
                </span>
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
          <main style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px 60px' }}>
            <h1 className="sub-title">Subscription</h1>

            {loading ? <IonSpinner aria-label="Loading subscription" /> : (
              <>
                {subscription && (
                  <section className="sub-card sub-status">
                    <div>
                      <span className={`sub-badge sub-badge-${subscription.status}`}>
                        {subscription.status === 'expired'
                          ? (subscription.expired_type === 'subscription' ? 'Subscription ended' : 'Trial ended')
                          : `Status: ${subscription.status === 'trial' ? 'Free trial' : subscription.status}`}
                      </span>
                      {subscription.subscription_end && (
                        <p className="sub-status-ends">
                          Ends: {new Date(subscription.subscription_end.replace(' ', 'T')).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="sub-days">
                      <strong>{getDaysLeft(subscription.subscription_end, subscription.days_left ?? 0)}</strong>
                      <span>days left</span>
                    </div>
                  </section>
                )}

                {latestPayment && (
                  <section className="sub-card">
                    <div className="sub-receipt-top">
                      <h2 className="sub-card-title">Payment receipt</h2>
                      <span className={`sub-badge sub-badge-${latestPayment.status}`}>
                        {latestPayment.status === 'approved' ? 'Paid' : latestPayment.status}
                      </span>
                    </div>

                    <dl className="sub-details">
                      <div>
                        <dt>Submitted</dt>
                        <dd>{formatDateTime(latestPayment.created_at)}</dd>
                      </div>
                      <div>
                        <dt>Plan</dt>
                        <dd>{formatPlan(latestPayment.plan)} ({latestPayment.days} days)</dd>
                      </div>
                      <div>
                        <dt>Amount</dt>
                        <dd>PHP {latestPayment.amount.toLocaleString()}</dd>
                      </div>
                      {latestPayment.status === 'approved' && latestPayment.subscription_start && (
                        <div>
                          <dt>Subscription starts</dt>
                          <dd>{formatDateTime(latestPayment.subscription_start)}</dd>
                        </div>
                      )}
                      {latestPayment.status === 'approved' && latestPayment.subscription_end && (
                        <div>
                          <dt>Expires</dt>
                          <dd>{formatDateTime(latestPayment.subscription_end)}</dd>
                        </div>
                      )}
                    </dl>

                    {latestPayment.status === 'pending' && (
                      <p role="status" className="sub-note">
                        Wait for approval. The admin will review your payment.
                      </p>
                    )}

                    {latestPayment.status === 'approved' && latestPayment.subscription_end && (
                      <IonButton
                        className="sub-btn"
                        onClick={() => navigate(subscription?.needs_onboarding ? '/onboarding' : '/dashboard')}
                      >
                        {subscription?.needs_onboarding ? 'Proceed to onboarding' : 'Go to dashboard'}
                      </IonButton>
                    )}

                    {latestPayment.status === 'rejected' && (
                      <p className="sub-note sub-note-muted">This payment was not activated. Submit a new payment to continue.</p>
                    )}
                  </section>
                )}

                {!pendingPayment && (
                  <>
                    <h2 className="sub-heading">Choose a plan</h2>
                    <p className="sub-subheading">Pick the plan that fits your fitness journey.</p>

                    <div className="sub-plans">
                      {PLANS.map((item) => {
                        const isSelected = selectedPlan === item.plan;
                        const perMonth = Math.round(item.amount / (item.days / 30));
                        return (
                          <button
                            key={item.plan}
                            type="button"
                            className={`sub-plan${isSelected ? ' selected' : ''}`}
                            onClick={() => setSelectedPlan(item.plan)}
                            aria-pressed={isSelected}
                          >
                            <h3 className="sub-plan-name">{item.name}</h3>
                            <p className="sub-plan-tagline">{item.tagline}</p>
                            <div className="sub-plan-price">
                              PHP {item.amount.toLocaleString()}
                              <small>/ {item.days} days</small>
                            </div>
                            <p className="sub-plan-permonth">About PHP {perMonth.toLocaleString()} per month</p>
                            <ul className="sub-plan-features">
                              {item.features.map((feature) => (
                                <li key={feature}>{feature}</li>
                              ))}
                            </ul>
                            <span className="sub-plan-btn">{isSelected ? 'Selected' : 'Select plan'}</span>
                          </button>
                        );
                      })}
                    </div>

                    <section className="sub-card">
                      <h2 className="sub-card-title">Pay with GCash only</h2>

                      <div className="sub-pay-grid">
                        <div className="sub-gcash">
                          <span className="sub-label">Account name</span>
                          <strong>Luther Malolot</strong>
                          <span className="sub-label">GCash number</span>
                          <strong className="sub-gcash-num">09350369559</strong>
                          <span className="sub-label">Amount to pay</span>
                          <strong className="sub-gcash-amt">PHP {plan.amount.toLocaleString()}</strong>
                        </div>

                        <ol className="sub-steps">
                          <li>Send the exact amount to the GCash number above.</li>
                          <li>Upload a screenshot of your GCash payment as proof.</li>
                          <li>Press Submit.</li>
                        </ol>
                      </div>

                      {subscription && subscription.status !== 'expired' && subscription.subscription_end && daysLeftNow > 0 && (
                        <p className="sub-note">
                          You still have {daysLeftNow} days left. These days will be added to your {plan.days} days. Estimated total: {daysLeftNow + plan.days} days.
                        </p>
                      )}

                      <form className="sub-form" onSubmit={submitPayment}>
                        <label className="sub-label" htmlFor="gcash-proof">Proof of payment (screenshot)</label>
                        <input
                          id="gcash-proof"
                          className="sub-file"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleProofChange}
                          disabled={submitting}
                        />
                        <p className="sub-hint">JPG, PNG, or WebP, up to 5 MB.</p>
                        {proofPreview && (
                          <img className="sub-preview" src={proofPreview} alt="Payment proof preview" />
                        )}
                        {error && <p role="alert" className="sub-error">{error}</p>}
                        <IonButton className="sub-submit" expand="block" type="submit" disabled={submitting || !proofFile}>
                          {submitting ? 'Submitting...' : 'Submit'}
                        </IonButton>
                      </form>
                    </section>
                  </>
                )}

                {notice && <p role="status" className="sub-msg">{notice}</p>}
                {latestPayment?.status === 'rejected' && (
                  <p role="alert" className="sub-msg">Your last payment was rejected. Please upload a clear screenshot of your GCash payment and submit again.</p>
                )}
              </>
            )}
            {error && <p role="alert" className="sub-msg">{error} <button type="button" onClick={() => void loadPage()}>Retry</button></p>}
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
};
export default Subscription;
