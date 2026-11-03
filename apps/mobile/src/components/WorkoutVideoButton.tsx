import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { fetchWorkoutVideos, getWorkoutVideoUrl, type WorkoutVideo } from '../lib/uploaderApi';
import { gymWorkouts, homeWorkouts } from '../lib/workoutLibrary';
import './WorkoutVideoButton.css';

interface WorkoutInfo {
  purpose: string;
  benefits: string[];
}

// Description for each workout: what it is for and what it improves
const WORKOUT_INFO: Record<string, WorkoutInfo> = {
  // ---------- GYM: Muscle Gain ----------
  'Bench Press': { purpose: 'Builds strength and size in the chest, shoulders, and triceps.', benefits: ['Stronger upper body pushing power', 'Bigger, firmer chest', 'Stronger triceps and front shoulders'] },
  'Squats': { purpose: 'Trains the entire lower body and is one of the best leg builders.', benefits: ['Stronger quads and glutes', 'Better balance and stability', 'Boosts overall strength and metabolism'] },
  'Deadlifts': { purpose: 'A full posterior chain exercise for the back, glutes, and hamstrings.', benefits: ['Stronger lower back and hips', 'Better posture', 'Builds total body strength'] },
  'Overhead Press': { purpose: 'Builds strength in the shoulders and triceps.', benefits: ['Broader, stronger shoulders', 'Better overhead strength', 'Stronger core while standing'] },
  'Bent-over Rows': { purpose: 'Trains the upper and mid back along with the biceps.', benefits: ['Wider, stronger back', 'Better posture', 'Stronger biceps and grip'] },
  'Leg Press': { purpose: 'A machine-based leg workout that is easier on the back than squats.', benefits: ['Stronger quads and glutes', 'Less stress on the lower back', 'Great for building leg size'] },
  'Lat Pulldown': { purpose: 'Targets the lats (sides of the back) and biceps.', benefits: ['Wider, V-shaped back', 'Good preparation for pull-ups', 'Stronger biceps'] },
  'Incline Dumbbell Press': { purpose: 'Focuses on the upper chest and shoulders.', benefits: ['Fuller upper chest', 'More balanced strength on both sides', 'Stronger front shoulders'] },

  // ---------- GYM: Fat Loss ----------
  'HIIT Treadmill': { purpose: 'Short bursts of max-effort cardio for fast fat burning.', benefits: ['High calorie burn', 'Better heart and lung health', 'Keeps burning calories after the workout'] },
  'Rowing Machine': { purpose: 'Full body cardio that works the back, core, and legs.', benefits: ['Burns a lot of calories', 'Stronger back and core', 'Better endurance'] },
  'Treadmill Walk': { purpose: 'Low-impact cardio, great for beginners.', benefits: ['Burns calories safely', 'Gentle on the joints', 'Improves stamina'] },
  'Treadmill Jog': { purpose: 'Steady jogging for cardio and fat loss.', benefits: ['Stronger heart and lungs', 'Burns calories', 'Higher endurance'] },
  'Stationary Bike': { purpose: 'Low-impact cardio that works the legs.', benefits: ['Stronger legs', 'Easy on the knees', 'Good calorie burn'] },
  'StairMaster': { purpose: 'Stair climbing that trains the legs and glutes while doing cardio.', benefits: ['Stronger glutes and legs', 'High calorie burn', 'Better cardio fitness'] },
  'Elliptical': { purpose: 'Full body, low-impact cardio.', benefits: ['Burns calories without stressing the joints', 'Works both arms and legs', 'Improves stamina'] },
  'Kettlebell Swings': { purpose: 'An explosive hip movement that combines cardio and strength.', benefits: ['Stronger hips and glutes', 'Stronger core', 'High calorie burn'] },

  // ---------- GYM: Fitness ----------
  'Cable Crunches': { purpose: 'Trains the abs using cable resistance.', benefits: ['Stronger core', 'More defined abs', 'Better trunk stability'] },
  'Hip Thrusts': { purpose: 'Focuses on the glutes and core.', benefits: ['Stronger, firmer glutes', 'Better hip power', 'Supports good posture'] },
  "Farmer's Carry": { purpose: 'Walking while holding heavy weights to build grip and core strength.', benefits: ['Stronger grip', 'Stronger core and posture', 'Trains the whole body'] },
  'Box Step-ups': { purpose: 'A single-leg exercise for the legs and glutes.', benefits: ['Stronger legs and glutes', 'Better balance', 'Easier on the joints than jumping'] },
  'Cable Woodchoppers': { purpose: 'A rotational core exercise that targets the obliques.', benefits: ['Stronger obliques', 'Better core rotation', 'Stronger trunk'] },
  'Leg Curl Machine': { purpose: 'Isolates the hamstrings.', benefits: ['Stronger hamstrings', 'More balanced leg strength', 'Helps reduce the risk of knee injury'] },

  // ---------- HOME: Muscle Gain ----------
  'Push-ups': { purpose: 'A bodyweight exercise for the chest, triceps, and shoulders.', benefits: ['Stronger chest and triceps', 'No equipment needed', 'Stronger core'] },
  'Pike Push-ups': { purpose: 'A bodyweight shoulder exercise.', benefits: ['Stronger shoulders', 'Good preparation for handstands', 'Stronger triceps'] },
  'Diamond Push-ups': { purpose: 'A push-up variation that focuses on the triceps.', benefits: ['Stronger triceps', 'Fuller inner chest', 'Stronger arms'] },
  'Chair Dips': { purpose: 'A triceps exercise using a chair.', benefits: ['Stronger triceps', 'Stronger shoulders', 'No gym needed'] },
  'Resistance Band Rows': { purpose: 'Trains the back and biceps using a resistance band.', benefits: ['Stronger back', 'Better posture', 'Stronger biceps'] },
  'Bulgarian Split Squats': { purpose: 'A single-leg squat for the quads and glutes.', benefits: ['Stronger legs and glutes', 'Better balance', 'Fixes strength differences between both legs'] },
  'Superman Hold': { purpose: 'Strengthens the lower back and glutes.', benefits: ['Stronger lower back', 'Better posture', 'Stronger glutes'] },

  // ---------- HOME: Fat Loss ----------
  'Jumping Jacks': { purpose: 'Simple full body cardio.', benefits: ['Raises your heart rate', 'Burns calories', 'Better coordination'] },
  'Burpees': { purpose: 'An intense full body exercise that combines cardio and strength.', benefits: ['Very high calorie burn', 'Stronger whole body', 'Better endurance'] },
  'Walking': { purpose: 'Light cardio that suits everyone.', benefits: ['Burns calories safely', 'Gentle on the joints', 'Improves mood and stamina'] },
  'Brisk Walking': { purpose: 'A faster-paced walk for a higher calorie burn.', benefits: ['Higher calorie burn', 'Stronger heart', 'Still easy on the joints'] },
  'Jogging in Place': { purpose: 'Cardio you can do indoors.', benefits: ['Burns calories', 'Better cardio fitness', 'Needs very little space'] },
  'High Knees': { purpose: 'Fast cardio that works the legs and core.', benefits: ['Raises your heart rate', 'Stronger hip flexors', 'Burns calories'] },
  'Mountain Climbers': { purpose: 'Cardio and core training in one exercise.', benefits: ['Stronger core', 'High calorie burn', 'Stronger shoulders'] },
  'Skater Jumps': { purpose: 'Side-to-side jumps for the legs and cardio.', benefits: ['Stronger legs and glutes', 'Better balance and agility', 'Burns calories'] },
  'Shadow Boxing': { purpose: 'Boxing movements without an opponent for cardio and coordination.', benefits: ['Burns calories', 'Better coordination', 'Stronger shoulders and arms'] },

  // ---------- HOME: Fitness ----------
  'Plank': { purpose: 'An isometric hold that trains the core.', benefits: ['Stronger core', 'Better posture', 'Stronger shoulders and back'] },
  'Bodyweight Squats': { purpose: 'A basic leg exercise that needs no equipment.', benefits: ['Stronger legs and glutes', 'Better mobility', 'Great for beginners'] },
  'Glute Bridges': { purpose: 'Activates the glutes and core.', benefits: ['Stronger glutes', 'Gentle on the lower back', 'Better hip stability'] },
  'Bird Dog': { purpose: 'A core and balance exercise that is gentle on the back.', benefits: ['Stronger core and lower back', 'Better balance', 'Supports good posture'] },
  'Wall Sit': { purpose: 'An isometric hold that targets the quads.', benefits: ['Stronger quads', 'Higher muscle endurance', 'No equipment needed'] },
  'Side Plank': { purpose: 'Trains the obliques and side core.', benefits: ['Stronger obliques', 'Stronger spine', 'Better balance'] },
  'Dead Bug': { purpose: 'A controlled core exercise that is gentle on the back.', benefits: ['Stronger deep core', 'Better coordination', 'Protects the lower back'] },
};

// Normalize the name (lowercase, remove spaces/dashes/apostrophes) for easier matching
const normalize = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// Get the target muscles from workoutLibrary.ts
const getTarget = (name: string): string => {
  const key = normalize(name);
  const all = [...gymWorkouts, ...homeWorkouts];
  return (
    all.find((w) => normalize(w.name) === key)?.target ??
    all.find((w) => key.includes(normalize(w.name)) || normalize(w.name).includes(key))?.target ??
    ''
  );
};

// Find the info even if the name is spelled slightly differently
const getInfo = (name: string): WorkoutInfo => {
  const key = normalize(name);
  const keys = Object.keys(WORKOUT_INFO);
  const exact = keys.find((k) => normalize(k) === key);
  const partial = keys.find((k) => key.includes(normalize(k)) || normalize(k).includes(key));
  const found = exact ?? partial;
  if (found) return WORKOUT_INFO[found];

  // Fallback: if nothing matches, still show a general description
  return {
    purpose: `${name} is an exercise that helps improve your strength, stamina, and overall fitness.`,
    benefits: [
      'Stronger muscles',
      'Better stamina and endurance',
      'Better posture and body control',
    ],
  };
};

// Load all videos once, reuse for every button
let cache: Record<string, WorkoutVideo> | null = null;
let pending: Promise<Record<string, WorkoutVideo>> | null = null;

const loadVideos = (): Promise<Record<string, WorkoutVideo>> => {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = fetchWorkoutVideos()
      .then((list) => {
        cache = Object.fromEntries(list.map((v) => [v.workoutName, v]));
        return cache;
      })
      .catch(() => {
        pending = null;
        return {} as Record<string, WorkoutVideo>;
      });
  }
  return pending;
};

const WorkoutVideoButton: React.FC<{ workoutName: string }> = ({ workoutName }) => {
  const [open, setOpen] = useState(false);
  const [video, setVideo] = useState<WorkoutVideo | null>(null);
  const info = getInfo(workoutName);
  const target = getTarget(workoutName);

  useEffect(() => {
    let cancelled = false;
    loadVideos().then((map) => {
      if (!cancelled) setVideo(map[workoutName] ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [workoutName]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="wvb-btn"
        aria-label={`Watch demo: ${workoutName}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <svg className="wvb-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 5v14l11-7z" fill="currentColor" />
        </svg>
        Demo
      </button>

      {open &&
        createPortal(
          <div className="wvb-overlay" onClick={() => setOpen(false)}>
            <div
              className="wvb-dialog"
              role="dialog"
              aria-modal="true"
              aria-label={`${workoutName} demo`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="wvb-head">
                <h3 className="wvb-title">{workoutName}</h3>
                <button type="button" className="wvb-close" aria-label="Close" onClick={() => setOpen(false)}>
                  &times;
                </button>
              </div>

              <div className="wvb-body">
                <div className="wvb-media">
                  {video ? (
                    <video
                      className="wvb-video"
                      src={getWorkoutVideoUrl(video.videoPath, video.uploadedAt)}
                      controls
                      autoPlay
                      playsInline
                    />
                  ) : (
                    <p className="wvb-empty">No demo video yet for this workout.</p>
                  )}
                </div>

                <aside className="wvb-info">
                  {target && (
                    <div className="wvb-section">
                      <h4 className="wvb-label">Target Muscles</h4>
                      <div className="wvb-tags">
                        {target.split(',').map((t) => (
                          <span key={t.trim()} className="wvb-tag">{t.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="wvb-section">
                    <h4 className="wvb-label">What It Is For</h4>
                    <p className="wvb-text">{info.purpose}</p>
                  </div>
                  <div className="wvb-section">
                    <h4 className="wvb-label">What It Improves</h4>
                    <ul className="wvb-list">
                      {info.benefits.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                </aside>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default WorkoutVideoButton;