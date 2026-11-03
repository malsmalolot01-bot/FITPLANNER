import { IonContent, IonPage } from '@ionic/react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { logout } from '../lib/auth';
import { useIsMobile } from '../lib/useIsMobile';
import { getFoodRestrictions, getMedicalHistory, getProfile } from '../lib/api';
import dashboardBg from '../assets/dashboard-bg.webp';
import ProgressMenu from '../components/ProgressMenu';
import './AISuggestion.css';

const AISuggestion: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [showResult, setShowResult] = useState(false);

  const [goal, setGoal] = useState('');
  const [pace, setPace] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [foods, setFoods] = useState<string[]>([]);
  const [autoCalc, setAutoCalc] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadSavedDetails = async () => {
      try {
        const [profileResult, medicalResult, foodResult] = await Promise.all([
          getProfile(),
          getMedicalHistory(),
          getFoodRestrictions(),
        ]);
        if (cancelled) return;

        const profile = profileResult.profile;
        if (profile) {
          setHeight(String(profile.height_cm));
          setWeight(String(profile.weight_kg));
          setGoal(profile.goal);
          setAutoCalc(true);
        }

        setConditions(medicalResult.medicalHistory?.conditions ?? []);

        const food = foodResult.foodRestrictions;
        setFoods([...(food?.foods ?? []), ...(food?.other ?? [])]);

        try {
          const stored = localStorage.getItem('userProfile');
          if (stored) setPace(JSON.parse(stored).intensity ?? '');
        } catch {
          // ignore invalid saved profile
        }
      } catch (error) {
        console.error('Unable to load saved details:', error);
      }
    };

    void loadSavedDetails();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (autoCalc) {
      handleCalculate();
      setAutoCalc(false);
    }
  }, [autoCalc]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCalculate = () => {
    if (!height || !weight) return;

    const h = parseFloat(height) / 100; 
    const w = parseFloat(weight);
    const calculatedBmi = w / (h * h);

    setBmi(calculatedBmi);
    setShowResult(true);

    if (calculatedBmi < 18.5) {
      setCategory('Underweight');
      setSuggestion('Focus on hypertrophy and caloric surplus. Start with basic home push-ups and gym compound lifts. Eat more protein.');
    } else if (calculatedBmi < 24.9) {
      setCategory('Normal');
      setSuggestion('Great baseline! Maintain with balanced fitness. Mix of strength training and moderate cardio. Keep up the good work.');
    } else if (calculatedBmi < 29.9) {
      setCategory('Overweight');
      setSuggestion('Focus on fat loss. High-intensity interval training (HIIT) and caloric deficit. Metabolic Forge program recommended.');
    } else {
      setCategory('Obese');
      setSuggestion('Start slow with low-impact cardio and basic bodyweight exercises. Consistency is key. Consult a coach for a structured plan.');
    }
  };

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="ai-shell"
        style={{ '--db-bg-image': `url(${dashboardBg})` } as React.CSSProperties}
      >
        
        {/* Top Header - Consistent across all pages */}
        <header className="db-top-header">
          <div className="db-top-brand">FIT<span>PLANNER</span></div>
          {!isMobile && (
            <nav className="db-top-nav">
              <Link to="/dashboard" className="db-top-nav-item">Dashboard</Link>
              <Link to="/workout" className="db-top-nav-item">AI Workout Suggestion</Link>
              <Link to="/meal-plan" className="db-top-nav-item">Meal Plan</Link>
              <Link to="/ai-suggestion" className="db-top-nav-item active">BMI</Link>
              <ProgressMenu />
              <Link to="/profile" className="db-top-nav-item">Profile</Link>
            </nav>
          )}
          <button className="db-logout-btn" onClick={handleLogout} aria-label="Log out">
            <LogOut size={24} />
          </button>
        </header>

        <div className="db-bg-wrapper">
        <div className="ai-container">
          <header className="ai-header">
            <h1>BMI Calculator</h1>
            <p>Calculate your BMI and get a custom plan.</p>
          </header>

          {/* Two Column Layout */}
          <div className="ai-layout">
            
            {/* Left Side: Form */}
            <div className="ai-card">
              <div className="ai-input-group">
                <label className="ai-label">Height (cm)</label>
                <input 
                  type="number" 
                  className="ai-input" 
                  placeholder="e.g. 175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
              
              <div className="ai-input-group">
                <label className="ai-label">Weight (kg)</label>
                <input 
                  type="number" 
                  className="ai-input" 
                  placeholder="e.g. 70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>

              <button className="ai-btn" onClick={handleCalculate}>
                Calculate & Suggest
              </button>
            </div>

            {/* Right Side: BMI Reference Guide */}
            <div className="ai-card ai-info-panel">
              <h3 className="ai-info-title">BMI Categories</h3>
              <ul className="ai-info-list">
                <li>
                  <span className="ai-cat-name">Underweight</span>
                  <span className="ai-cat-range">Below 18.5</span>
                </li>
                <li>
                  <span className="ai-cat-name">Normal</span>
                  <span className="ai-cat-range">18.5 – 24.9</span>
                </li>
                <li>
                  <span className="ai-cat-name">Overweight</span>
                  <span className="ai-cat-range">25.0 – 29.9</span>
                </li>
                <li>
                  <span className="ai-cat-name">Obese</span>
                  <span className="ai-cat-range">30.0 and above</span>
                </li>
              </ul>
            </div>

          </div>

          {(goal || pace || conditions.length > 0 || foods.length > 0) && (
            <div className="ai-card ai-result show">
              <div className="ai-suggestion">
                <strong>Your Saved Details</strong><br />
                {goal && <>Goal: {goal}<br /></>}
                {pace && <>Pace: {pace}<br /></>}
                Health: {conditions.length ? conditions.join(', ') : 'No conditions'}<br />
                Food restrictions: {foods.length ? foods.join(', ') : 'None'}
              </div>
            </div>
          )}

          {/* Result Box (Full width below) */}
          {showResult && bmi !== null && (
            <div className="ai-card ai-result show">
              <div className="ai-result-top">
                <div>
                  <div className="ai-bmi-score">{bmi.toFixed(1)}</div>
                  <div className="ai-category">{category}</div>
                </div>
                <div className="ai-suggestion">
                  <strong>AI Recommendation:</strong><br />
                  {suggestion}
                </div>
              </div>
            </div>
          )}

        </div>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default AISuggestion;