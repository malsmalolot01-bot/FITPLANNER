import { IonContent, IonPage } from '@ionic/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { logout } from '../lib/auth';
import { useIsMobile } from '../lib/useIsMobile';
import dashboardBg from '../assets/dashboard-bg.webp';
import ProgressMenu from '../components/ProgressMenu';
import WorkoutVideoButton from '../components/WorkoutVideoButton';
import { gymWorkouts, homeWorkouts, isRisky, getPicksForDay, getTotalCalories, getIntensitySettings, fitsIntensity } from '../lib/workoutLibrary';
import './Workout.css';

const Workout: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'gym' | 'home'>('gym');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Kuhaa ang na-save nga profile gikan sa Onboarding
  const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const userGoal = profile.goal || 'Fitness'; // Default to Fitness if wala pay profile

  // Kuhaa ang na-save nga Medical History
  const medicalHistory = JSON.parse(localStorage.getItem('medicalHistory') || '{}');
  const userConditions: string[] = medicalHistory.conditions || [];
  const userCategory: string = profile.category || '';
  const userIntensity: string = profile.intensity || ''; // 'Rush' o 'Chill'
  const { pickCount, restDays } = getIntensitySettings(userIntensity);

  const baseWorkouts = activeTab === 'gym' ? gymWorkouts : homeWorkouts;

  // Kani ang AKTUAL nga gi-suggest sa AI/ChatBot para karong adlawa,
  // para magkatugma gyud ang gipakita dinhi ug ang tubag sa chatbot.
  const todayPicks = getPicksForDay(baseWorkouts, 0, userGoal, userConditions, userCategory, pickCount, restDays, userIntensity);
  const todayPickNames = new Set(todayPicks.picks.map((w) => w.name));
  const estimatedCalories = getTotalCalories(todayPicks.picks);
  const weeklyCalories = estimatedCalories * 7;
  const twoWeekCalories = estimatedCalories * 14;
  const monthlyCalories = estimatedCalories * 30;

  const stretchItem = baseWorkouts.find((w) => w.type === 'Warm-up');

  const workouts = [...baseWorkouts]
    .filter((w) => w.type !== 'Warm-up')
    .sort((a, b) => {
      if (a.type === userGoal && b.type !== userGoal) return -1;
      if (a.type !== userGoal && b.type === userGoal) return 1;
      return 0;
    });

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="wo-shell"
        style={{ '--db-bg-image': `url(${dashboardBg})` } as React.CSSProperties}
      >
        
        {/* Top Header */}
        <header className="db-top-header">
          <div className="db-top-brand">FIT<span>PLANNER</span></div>
          {!isMobile && (
            <nav className="db-top-nav">
              <Link to="/dashboard" className="db-top-nav-item">Dashboard</Link>
              <Link to="/workout" className="db-top-nav-item active">AI Workout Suggestion</Link>
              <Link to="/meal-plan" className="db-top-nav-item">Meal Plan</Link>
              <Link to="/ai-suggestion" className="db-top-nav-item">BMI</Link>
              <ProgressMenu />
              <Link to="/profile" className="db-top-nav-item">Profile</Link>
            </nav>
          )}
          <button className="db-logout-btn" onClick={handleLogout} aria-label="Log out">
            <LogOut size={24} />
          </button>
        </header>

        <div className="db-bg-wrapper">
        <div className="wo-container">
          <header className="wo-header">
            <div className="wo-header-left">
              <h1>Workout Routines</h1>
              <p>Select your environment and execute.</p>
            </div>
            {estimatedCalories > 0 && (
              <div className="wo-kcal-projection">
                <span className="wo-kcal-projection-label">Estimated Calorie Burn</span>
                <span className="wo-kcal-projection-row">1 Week: <b>~{weeklyCalories.toLocaleString()} kcal</b></span>
                <span className="wo-kcal-projection-row">2 Weeks: <b>~{twoWeekCalories.toLocaleString()} kcal</b></span>
                <span className="wo-kcal-projection-row">1 Month: <b>~{monthlyCalories.toLocaleString()} kcal</b></span>
              </div>
            )}
          </header>

          {/* AI Suggestion Box base sa Profile */}
          {profile.bmi ? (
            <div className="wo-ai-box">
              <div className="wo-ai-left">
                <span className="wo-ai-label">Your BMI</span>
                <span className="wo-ai-bmi">{profile.bmi}</span>
                <span className="wo-ai-cat">{profile.category} ({userGoal}{userIntensity ? ` - ${userIntensity}` : ''})</span>
              </div>
              <div className="wo-ai-right">
                <strong>AI Workout Protocol:</strong>
                <p>
                  {userGoal === 'Fat Loss' ? 'High focus on Cardio & Calorie Deficit. Burn more than you eat.' : 
                   userGoal === 'Muscle Gain' ? 'High focus on Hypertrophy & Caloric Surplus. Lift heavy.' : 
                   'Maintain baseline. Balanced strength and cardio routine.'}
                </p>
                {userIntensity && (
                  <p className="wo-condition-inline">
                    <span className="wo-condition-inline-label">Intensity:</span> {userIntensity} ({pickCount} exercises/day, {restDays.length === 1 ? 'rest on Sunday only' : 'rest on Tuesday, Thursday & Sunday'})
                  </p>
                )}
                {userConditions.length > 0 && (
                  <p className="wo-condition-inline">
                    <span className="wo-condition-inline-label">Medical Condition{userConditions.length > 1 ? 's' : ''}:</span> {userConditions.join(', ')}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="wo-ai-box">
              <p>Please complete your profile to get AI suggestions.</p>
            </div>
          )}

          <div className="wo-tabs">
            <button 
              className={`wo-tab ${activeTab === 'gym' ? 'active' : ''}`}
              onClick={() => setActiveTab('gym')}
            >
              Gym
            </button>
            <button 
              className={`wo-tab ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              Home
            </button>
          </div>

          {stretchItem && (
            <div className="wo-card wo-stretch-card">
              <div className="wo-info">
                <h3>{stretchItem.name}</h3>
                <p>{stretchItem.target}</p>
              </div>
              <div className="wo-badge-container">
                <span className="wo-badge">Warm-up</span>
                <span className="wo-badge">{stretchItem.meta}</span>
                <WorkoutVideoButton workoutName={stretchItem.name} />
              </div>
            </div>
          )}

          <div className="wo-list">
            {workouts.map((wo, index) => {
              const risky = isRisky(wo, userConditions, userCategory);
              const fits = fitsIntensity(wo, userIntensity);

              return (
                <div key={index} className={`wo-card ${!risky && fits ? 'wo-ai-highlight' : ''} ${risky ? 'wo-risk' : ''}`}>
                  <div className="wo-info">
                    <h3>{wo.name}</h3>
                    <p>{wo.target}</p>
                  </div>
                  <div className="wo-badge-container">
                    {risky ? (
                      <span className="wo-risk-tag">⚠️ Avoid - Safety Caution</span>
                    ) : fits ? (
                      <span className="wo-ai-tag">✅ AI Suggestion</span>
                    ) : (
                      <span className="wo-badge">Not for {userIntensity}</span>
                    )}
                    <span className="wo-badge">{wo.meta}</span>
                    <span className="wo-kcal-chip">~{wo.calories} kcal</span>
                    <WorkoutVideoButton workoutName={wo.name} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default Workout;