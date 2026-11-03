import { IonContent, IonPage } from '@ionic/react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { logout } from '../lib/auth';
import { useIsMobile } from '../lib/useIsMobile';
import dashboardBg from '../assets/dashboard-bg.webp';
import ProgressMenu from '../components/ProgressMenu';
import './MealPlan.css';
import { loadFoodRestrictions, applyRestrictions } from '../lib/foodRestrictions';

const MealPlan: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Kuhaa ang na-save nga profile gikan sa Onboarding
  const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const userGoal = profile.goal || 'Fitness';

  // Meal Suggestions base sa GOAL
  let meals = [];
  let dietFocus = 'Maintenance Calories';

  if (userGoal === 'Muscle Gain') {
    dietFocus = 'Caloric Surplus (+300 calories)';
    meals = [
      { name: 'Breakfast', desc: 'Oatmeal with whole milk, peanut butter, and 4 boiled eggs', cal: '~750 kcal' },
      { name: 'Lunch', desc: 'Grilled chicken breast (250g), large portion of brown rice, avocado', cal: '~900 kcal' },
      { name: 'Dinner', desc: 'Salmon steak with sweet potatoes and olive oil dressing', cal: '~750 kcal' },
      { name: 'Snack', desc: 'Mass gainer shake, mixed nuts, and 2 bananas', cal: '~600 kcal' }
    ];
  } else if (userGoal === 'Fat Loss') {
    dietFocus = 'Calorie Deficit (-500 calories / Eat Less)';
    meals = [
      { name: 'Breakfast', desc: 'Black coffee, 2 boiled eggs, and a small apple (No heavy carbs)', cal: '~200 kcal' },
      { name: 'Lunch', desc: 'Grilled chicken salad with mixed greens, tomatoes, cucumber (No dressing/rice)', cal: '~300 kcal' },
      { name: 'Dinner', desc: 'Lean beef steak (150g) with steamed broccoli and cauliflower', cal: '~350 kcal' },
      { name: 'Snack', desc: 'Celery sticks or green tea (Strictly no sugar)', cal: '~50 kcal' }
    ];
  } else { // Fitness / Sexy / Maintenance
    dietFocus = 'Maintenance Calories (Eat Clean)';
    meals = [
      { name: 'Breakfast', desc: 'Scrambled eggs (3), whole wheat toast, black coffee', cal: '~400 kcal' },
      { name: 'Lunch', desc: 'Grilled turkey wrap with spinach, tomatoes, and light hummus', cal: '~450 kcal' },
      { name: 'Dinner', desc: 'Baked salmon, quinoa, and steamed broccoli', cal: '~500 kcal' },
      { name: 'Snack', desc: 'Greek yogurt with a handful of almonds', cal: '~200 kcal' }
    ];
  }

  // Ilisan ang mga meal nga naay bawal nga pagkaon
  const restrictions = loadFoodRestrictions();
  const avoidList = [...restrictions.foods, ...restrictions.other];
  const safeMeals = applyRestrictions(meals, userGoal, restrictions);

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="mp-shell"
        style={{ '--db-bg-image': `url(${dashboardBg})` } as React.CSSProperties}
      >
        
        {/* Top Header */}
        <header className="db-top-header">
          <div className="db-top-brand">FIT<span>PLANNER</span></div>
          {!isMobile && (
            <nav className="db-top-nav">
              <Link to="/dashboard" className="db-top-nav-item">Dashboard</Link>
              <Link to="/workout" className="db-top-nav-item">AI Workout Suggestion</Link>
              <Link to="/meal-plan" className="db-top-nav-item active">Meal Plan</Link>
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
        <div className="mp-container">
          <header className="mp-header">
            <h1>Meal Plan Strategy</h1>
            <p>Fuel your body based on your primary goal.</p>
          </header>

          {/* AI Diet Box base sa Profile */}
          {profile.bmi ? (
            <div className="mp-ai-box">
              <div className="mp-ai-left">
                <span className="mp-ai-label">Your BMI</span>
                <span className="mp-ai-bmi">{profile.bmi}</span>
                <span className="mp-ai-cat">{profile.category} ({userGoal})</span>
              </div>
              <div className="mp-ai-right">
                <strong>AI Diet Protocol:</strong>
                <p>{dietFocus}</p>
                {avoidList.length > 0 && (
                  <p className="mp-avoid-inline">
                    <span className="mp-avoid-inline-label">Avoiding:</span> {avoidList.join(', ')}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mp-ai-box">
              <p>Please complete your profile to get a meal plan.</p>
            </div>
          )}

          {/* Meal List */}
          <div className="mp-meal-list">
            {safeMeals.map((meal, index) => (
              <div key={index} className="mp-meal-card">
                <div className="mp-meal-info">
                  <span className="mp-meal-badge">{meal.name}</span>
                  <p>{meal.desc}</p>
                </div>
                <span className="mp-cal-tag">{meal.cal}</span>
              </div>
            ))}
          </div>

        </div>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default MealPlan;