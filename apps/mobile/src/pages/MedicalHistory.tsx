import { IonContent, IonPage } from '@ionic/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveMedicalHistory } from '../lib/api';
import './Onboarding.css';

const CONDITIONS = [
  'ACL / Knee Injury',
  'Back Pain / Spine Issue',
  'Heart Condition / High Blood Pressure',
  'Asthma / Breathing Issue',
  'Diabetes',
  'Recent Surgery / Recovering from Injury',
  'Shoulder / Arm Injury',
];

const MedicalHistory: React.FC = () => {
  const navigate = useNavigate();
  const [hasConditions, setHasConditions] = useState<'yes' | 'no' | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const toggleCondition = (condition: string) => {
    setSelected((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };

  const handleContinue = async () => {
    const medicalHistory = {
      hasConditions: hasConditions === 'yes',
      conditions: hasConditions === 'yes' ? selected : [],
    };

   try {
      await saveMedicalHistory(medicalHistory);
    } catch (error) {
      console.error('saveMedicalHistory failed:', error);
      alert('Failed to save medical history: ' + (error instanceof Error ? error.message : 'Unknown error'));
      return;
    }
    localStorage.setItem('medicalHistory', JSON.stringify(medicalHistory));
    navigate('/food-restrictions');  };

  const canContinue =
    hasConditions === 'no' || (hasConditions === 'yes' && selected.length > 0);

  return (
    <IonPage>
      <IonContent fullscreen className="ob-shell">
        <div className="ob-container">
          <header className="ob-header">
            <h1>Health Check</h1>
            <p>This helps us keep your training safe and suited to you.</p>
          </header>

          <div className="ob-card">
            <div className="ai-input-group">
              <label className="ai-label">
                Do you have any of the following illnesses or injuries?
              </label>

              <div className="mh-yesno-row">
                <button
                  type="button"
                  className={`mh-yesno-btn ${hasConditions === 'yes' ? 'active' : ''}`}
                  onClick={() => setHasConditions('yes')}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`mh-yesno-btn ${hasConditions === 'no' ? 'active' : ''}`}
                  onClick={() => {
                    setHasConditions('no');
                    setSelected([]);
                  }}
                >
                  No
                </button>
              </div>
            </div>

            {hasConditions === 'yes' && (
              <div className="ai-input-group">
                <label className="ai-label">Select all that apply</label>
                <div className="mh-checklist">
                  {CONDITIONS.map((condition) => (
                    <label key={condition} className="mh-check-item">
                      <input
                        type="checkbox"
                        checked={selected.includes(condition)}
                        onChange={() => toggleCondition(condition)}
                      />
                      <span>{condition}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              className="ai-btn"
              onClick={handleContinue}
              disabled={!canContinue}
            >
              Save &amp; Continue
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MedicalHistory;