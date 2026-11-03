import { IonContent, IonPage } from '@ionic/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveProfile } from '../lib/api';
import { getCurrentUser } from '../lib/auth';
import { API_BASE_URL } from '../lib/apiConfig';
import './Onboarding.css';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('Fat Loss');
  const [intensity, setIntensity] = useState<'Rush' | 'Chill' | null>(null);

  const handleSubmit = async () => {
    if (!height || !weight || !intensity) return;

    const h = parseFloat(height) / 100; 
    const w = parseFloat(weight);
    const calculatedBmi = w / (h * h);
    
    let category = '';
    let dietSuggestion = '';
    let workoutType = '';

    // BMI category — para sa safety filtering ra ni (dili na mag-override sa goal nga gipili sa user)
    if (calculatedBmi < 18.5) {
      category = 'Underweight';
      dietSuggestion = 'Caloric Surplus (+300 calories)';
      workoutType = 'Hypertrophy';
    } else if (calculatedBmi < 24.9) {
      category = 'Normal';
      dietSuggestion = 'Maintenance Calories';
      workoutType = 'Balanced Fitness';
    } else if (calculatedBmi < 29.9) {
      category = 'Overweight';
      dietSuggestion = 'Calorie Deficit (-500 calories)';
      workoutType = 'Fat Loss';
    } else {
      category = 'Obese';
      dietSuggestion = 'Calorie Deficit (-500 calories)';
      workoutType = 'Low Impact Cardio';
    }

    try {
      await saveProfile(h * 100, w, goal);
      const currentUser = getCurrentUser();
      if (currentUser) {
        const res = await fetch(`${API_BASE_URL}/complete_onboarding.php`, {
          method: 'POST',
          headers: { 'X-Auth-Token': currentUser.token },
        });
        if (!res.ok) throw new Error('Unable to finish onboarding.');
      }
    } catch (error) {
      console.error("saveProfile failed:", error);
      alert("Failed to save profile: " + (error instanceof Error ? error.message : "Unknown error"));
      return;
    }

    const profile = { height: h * 100, weight: w, bmi: calculatedBmi.toFixed(1), category, dietSuggestion, workoutType, goal, intensity };
    localStorage.setItem('userProfile', JSON.stringify(profile));

    // Padayon sa Medical History step human mag-save sa BMI
    navigate('/medical-history');
  };

  return (
    <IonPage>
      <IonContent fullscreen className="ob-shell">
        <div className="ob-container">
          <header className="ob-header">
            <h1>Setup Your Profile</h1>
            <p>Let's calculate your baseline to forge your limits.</p>
          </header>

          <div className="ob-card">
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
                placeholder="e.g. 80"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            <div className="ai-input-group">
              <label className="ai-label">Primary Goal</label>
              <select
                className="ai-input"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              >
                <option value="Fat Loss">Fat Loss</option>
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Fitness">Fitness / Maintenance</option>
              </select>
            </div>

            <div className="ai-input-group">
              <label className="ai-label">Pace</label>
              <div className="mh-yesno-row">
                <button
                  type="button"
                  className={`mh-yesno-btn ${intensity === 'Rush' ? 'active' : ''}`}
                  onClick={() => setIntensity('Rush')}
                >
                  Rush
                </button>
                <button
                  type="button"
                  className={`mh-yesno-btn ${intensity === 'Chill' ? 'active' : ''}`}
                  onClick={() => setIntensity('Chill')}
                >
                  Chill
                </button>
              </div>
              <p className="input-hint" style={{ marginTop: 8 }}>
                {intensity === 'Rush'
                  ? 'Faster, more intense plan — more workouts per week, less rest.'
                  : intensity === 'Chill'
                  ? 'Normal, steady pace — fewer sessions, more rest days.'
                  : 'Choose how aggressively you want to pursue your goal.'}
              </p>
            </div>

            <button className="ai-btn" onClick={handleSubmit} disabled={!height || !weight || !intensity}>
              Save &amp; Continue
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Onboarding;