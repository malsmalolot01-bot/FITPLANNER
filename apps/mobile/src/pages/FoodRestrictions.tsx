import { IonContent, IonPage } from '@ionic/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveFoodRestrictions } from '../lib/api';
import { FOOD_OPTIONS, saveLocalFoodRestrictions } from '../lib/foodRestrictions';
import './Onboarding.css';

const FoodRestrictionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [other, setOther] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleFood = (food: string) => {
    setSelected((prev) =>
      prev.includes(food) ? prev.filter((f) => f !== food) : [...prev, food]
    );
  };

  const addOther = () => {
    const value = text.trim();
    if (!value) return;
    if (!other.some((o) => o.toLowerCase() === value.toLowerCase())) {
      setOther((prev) => [...prev, value]);
    }
    setText('');
  };

  const removeOther = (item: string) => {
    setOther((prev) => prev.filter((o) => o !== item));
  };

  const handleContinue = async () => {
    // Apila ang gi-type nga wala pa na-click ang Add
    const pending = text.trim();
    const finalOther =
      pending && !other.some((o) => o.toLowerCase() === pending.toLowerCase())
        ? [...other, pending]
        : other;
    const restrictions = { foods: selected, other: finalOther };

    setSaving(true);
    saveLocalFoodRestrictions(restrictions);
    try {
      await saveFoodRestrictions(restrictions);
    } catch (error) {
      console.error('saveFoodRestrictions failed:', error);
    }
    setSaving(false);
    navigate('/dashboard');
  };

  const hasAny = selected.length > 0 || other.length > 0 || text.trim() !== '';

  return (
    <IonPage>
      <IonContent fullscreen className="ob-shell">
        <div className="ob-container">
          <header className="ob-header">
            <h1>Food Restrictions</h1>
            <p>Tell us what you can't eat so we keep it out of your meal plan.</p>
          </header>

          <div className="ob-card">
            <div className="ai-input-group">
              <label className="ai-label">Foods you can't eat (allergy or other)</label>
              <div className="mh-checklist mh-checklist-grid">
                {FOOD_OPTIONS.map(({ label }) => (
                  <label
                    key={label}
                    className={`mh-check-item ${selected.includes(label) ? 'checked' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(label)}
                      onChange={() => toggleFood(label)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="ai-input-group">
              <label className="ai-label">Other foods to avoid</label>
              <div className="fr-add-row">
                <input
                  type="text"
                  className="ai-input"
                  placeholder="e.g. pork, shrimp, mushroom"
                  value={text}
                  maxLength={40}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addOther();
                    }
                  }}
                />
                <button type="button" className="fr-add-btn" onClick={addOther}>
                  Add
                </button>
              </div>

              {other.length > 0 && (
                <div className="fr-chips">
                  {other.map((item) => (
                    <span key={item} className="fr-chip">
                      {item}
                      <button
                        type="button"
                        aria-label={`Remove ${item}`}
                        onClick={() => removeOther(item)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button className="ai-btn" onClick={handleContinue} disabled={saving}>
              {hasAny ? 'Save & Continue' : 'No Restrictions — Continue'}
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default FoodRestrictionsPage;