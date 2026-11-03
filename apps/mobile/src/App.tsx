import React, { useEffect, useState } from 'react';
import { Navigate, Route, useLocation, useNavigate } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { getCurrentUser, logout } from './lib/auth';
import { API_BASE_URL } from './lib/apiConfig';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/Admindashboard';
import Onboarding from './pages/Onboarding';
import MedicalHistory from './pages/MedicalHistory';
import FoodRestrictions from './pages/FoodRestrictions';
import Workout from './pages/workout';
import MealPlan from './pages/MealPlan';
import AISuggestion from './pages/Aisuggestion';
import CustomerProfile from './pages/CustomerProfile';
import Subscription from './pages/Subscription';
import PaymentHistory from './pages/PaymentHistory';
import Progress from './pages/Progress';
import CaloriesBurned from './pages/CaloriesBurned';
import AdminPayments from './pages/AdminPayments';
import AdminPaymentHistory from './pages/AdminPaymentHistory';
import AdminReports from './pages/AdminReports';
import AppNav from './components/AppNav';
import UploaderLogin from './pages/UploaderLogin';
import VideoUpload from './pages/VideoUpload';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

type SubscriptionState = 'checking' | 'open' | 'locked' | 'error';

const SubscriptionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isSubscriptionPage = ['/subscription', '/payment-history'].includes(location.pathname);
  const isExempt = !user || user.role === 'admin' || isSubscriptionPage;
  const [state, setState] = useState<SubscriptionState>('checking');
  const [retry] = useState(0);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [, setErrorMessage] = useState('');

  useEffect(() => {
    if (isExempt) {
      setState('open');
      return;
    }

    let cancelled = false;
    setState('checking');
    setErrorMessage('');

    const checkSubscription = async () => {
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
          if (!cancelled) navigate('/login', { replace: true });
          return;
        }
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Unable to check subscription status.');
        }
        if (!cancelled) {
          setNeedsOnboarding(result.needs_onboarding === true);
          setState(result.is_locked === true ? 'locked' : 'open');
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to check subscription status.');
          setState('error');
        }
      }
    };

    void checkSubscription();
    return () => {
      cancelled = true;
    };
  }, [isExempt, retry, user?.id, user?.token, location.pathname]);

  useEffect(() => {
    const redirectToSubscription = () => navigate('/subscription', { replace: true });
    window.addEventListener('fitplanner:subscription-locked', redirectToSubscription);
    return () => window.removeEventListener('fitplanner:subscription-locked', redirectToSubscription);
  }, [navigate]);

  const onboardingPaths = ['/onboarding', '/medical-history', '/food-restrictions'];
  if (!isExempt && state === 'locked') return <Navigate to="/subscription" replace />;
  if (!isExempt && state === 'open' && needsOnboarding && !onboardingPaths.includes(location.pathname)) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <AppNav />
      <IonRouterOutlet>
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<SubscriptionGuard><Dashboard /></SubscriptionGuard>} />

        {/* Admin routes: matag tab naay kaugalingon nga URL */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard tab="overview" /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminDashboard tab="users" /></AdminRoute>} />
        <Route path="/admin/logs" element={<AdminRoute><AdminDashboard tab="logs" /></AdminRoute>} />
        <Route path="/admin/profile" element={<AdminRoute><AdminDashboard tab="profile" /></AdminRoute>} />
        <Route path="/admin/payments" element={<AdminRoute><AdminPayments /></AdminRoute>} />
        <Route path="/admin/payment-history" element={<AdminRoute><AdminPaymentHistory /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />

        <Route path="/onboarding" element={<SubscriptionGuard><Onboarding /></SubscriptionGuard>} />
        <Route path="/medical-history" element={<SubscriptionGuard><MedicalHistory /></SubscriptionGuard>} />
        <Route path="/food-restrictions" element={<SubscriptionGuard><FoodRestrictions /></SubscriptionGuard>} />
        <Route path="/workout" element={<SubscriptionGuard><Workout /></SubscriptionGuard>} />
        <Route path="/meal-plan" element={<SubscriptionGuard><MealPlan /></SubscriptionGuard>} />
        <Route path="/ai-suggestion" element={<SubscriptionGuard><AISuggestion /></SubscriptionGuard>} />
        <Route path="/profile" element={<SubscriptionGuard><CustomerProfile /></SubscriptionGuard>} />
<Route path="/progress" element={<SubscriptionGuard><Progress /></SubscriptionGuard>} />
        <Route path="/calories" element={<SubscriptionGuard><CaloriesBurned /></SubscriptionGuard>} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/payment-history" element={<SubscriptionGuard><PaymentHistory /></SubscriptionGuard>} />
        <Route path="/uploader-login" element={<UploaderLogin />} />
<Route path="/video-upload" element={<VideoUpload />} />
<Route path="/" element={<Navigate to="/home" replace />} />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
