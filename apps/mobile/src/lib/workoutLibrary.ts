export interface WorkoutItem {
  name: string;
  target: string;
  meta: string;
  type: string;
  risks: string[];
  calories: number; // estimated kcal burned for this exercise block
}

// Exercises nga dili maayo para sa OBESE category — high-impact/joint-stress,
// bisan wala pay stated medical condition.
const OBESE_AVOID = [
  'HIIT Treadmill', 'Treadmill Jog', 'StairMaster', 'Jump Rope', 'Burpees',
  'Jumping Jacks', 'High Knees', 'Mountain Climbers', 'Jogging in Place',
  'Skater Jumps', 'Box Jumps', 'Deadlifts', 'Barbell Lunges',
];

// Mas gamay nga caution para sa OVERWEIGHT — moderate lang
const OVERWEIGHT_AVOID = [
  'Burpees', 'High Knees', 'Mountain Climbers', 'Box Jumps',
];

export const CATEGORY_AVOID: Record<string, string[]> = {
  Obese: OBESE_AVOID,
  Overweight: OVERWEIGHT_AVOID,
};

export const gymWorkouts: WorkoutItem[] = [
  // Muscle Gain
  { name: 'Bench Press', target: 'Chest, Triceps', meta: '4 sets x 8 reps', type: 'Muscle Gain', risks: ['Shoulder / Arm Injury', 'Recent Surgery / Recovering from Injury'], calories: 40 },
  { name: 'Squats', target: 'Quads, Glutes', meta: '4 sets x 10 reps', type: 'Muscle Gain', risks: ['ACL / Knee Injury', 'Back Pain / Spine Issue', 'Recent Surgery / Recovering from Injury'], calories: 55 },
  { name: 'Deadlifts', target: 'Back, Hamstrings', meta: '3 sets x 5 reps', type: 'Muscle Gain', risks: ['Back Pain / Spine Issue', 'ACL / Knee Injury', 'Recent Surgery / Recovering from Injury'], calories: 60 },
  { name: 'Overhead Press', target: 'Shoulders, Triceps', meta: '4 sets x 8 reps', type: 'Muscle Gain', risks: ['Shoulder / Arm Injury', 'Recent Surgery / Recovering from Injury'], calories: 35 },
  { name: 'Bent-over Rows', target: 'Back, Biceps', meta: '4 sets x 10 reps', type: 'Muscle Gain', risks: ['Back Pain / Spine Issue', 'Shoulder / Arm Injury'], calories: 45 },
  { name: 'Leg Press', target: 'Quads, Glutes', meta: '4 sets x 12 reps', type: 'Muscle Gain', risks: ['ACL / Knee Injury', 'Recent Surgery / Recovering from Injury'], calories: 50 },
  { name: 'Lat Pulldown', target: 'Back, Biceps', meta: '4 sets x 10 reps', type: 'Muscle Gain', risks: ['Shoulder / Arm Injury'], calories: 40 },
  { name: 'Incline Dumbbell Press', target: 'Upper Chest, Shoulders', meta: '3 sets x 10 reps', type: 'Muscle Gain', risks: ['Shoulder / Arm Injury'], calories: 35 },

  // Fat Loss
  { name: 'HIIT Treadmill', target: 'Full Body Cardio', meta: '15 mins max effort', type: 'Fat Loss', risks: ['Heart Condition / High Blood Pressure', 'Asthma / Breathing Issue', 'ACL / Knee Injury'], calories: 180 },
  { name: 'Rowing Machine', target: 'Back, Core, Cardio', meta: '20 mins steady', type: 'Fat Loss', risks: ['Back Pain / Spine Issue', 'Shoulder / Arm Injury'], calories: 200 },
  { name: 'Treadmill Walk', target: 'Full Body Cardio', meta: '30 mins', type: 'Fat Loss', risks: [], calories: 150 },
  { name: 'Treadmill Jog', target: 'Full Body Cardio', meta: '20 mins', type: 'Fat Loss', risks: ['ACL / Knee Injury', 'Heart Condition / High Blood Pressure'], calories: 220 },
  { name: 'Stationary Bike', target: 'Legs, Cardio', meta: '20 mins steady pace', type: 'Fat Loss', risks: [], calories: 180 },
  { name: 'StairMaster', target: 'Legs, Glutes, Cardio', meta: '15 mins', type: 'Fat Loss', risks: ['ACL / Knee Injury', 'Heart Condition / High Blood Pressure'], calories: 170 },
  { name: 'Elliptical', target: 'Full Body Cardio', meta: '25 mins steady', type: 'Fat Loss', risks: [], calories: 230 },
  { name: 'Kettlebell Swings', target: 'Hips, Core, Cardio', meta: '4 sets x 15 reps', type: 'Fat Loss', risks: ['Back Pain / Spine Issue', 'Shoulder / Arm Injury'], calories: 90 },

  // Fitness / Maintenance
  { name: 'Cable Crunches', target: 'Core', meta: '3 sets x 15 reps', type: 'Fitness', risks: ['Back Pain / Spine Issue'], calories: 30 },
  { name: 'Hip Thrusts', target: 'Glutes, Core', meta: '3 sets x 15 reps', type: 'Fitness', risks: ['Back Pain / Spine Issue'], calories: 40 },
  { name: "Farmer's Carry", target: 'Grip, Core, Full Body', meta: '3 sets x 40m walk', type: 'Fitness', risks: ['Back Pain / Spine Issue', 'Shoulder / Arm Injury'], calories: 50 },
  { name: 'Box Step-ups', target: 'Legs, Glutes', meta: '3 sets x 12 reps', type: 'Fitness', risks: ['ACL / Knee Injury'], calories: 45 },
  { name: 'Cable Woodchoppers', target: 'Core, Obliques', meta: '3 sets x 15 reps', type: 'Fitness', risks: ['Back Pain / Spine Issue', 'Shoulder / Arm Injury'], calories: 35 },
  { name: 'Leg Curl Machine', target: 'Hamstrings', meta: '3 sets x 12 reps', type: 'Fitness', risks: ['ACL / Knee Injury'], calories: 30 },
];

export const homeWorkouts: WorkoutItem[] = [
  // Muscle Gain
  { name: 'Push-ups', target: 'Chest, Triceps', meta: '4 sets x 20 reps', type: 'Muscle Gain', risks: ['Shoulder / Arm Injury', 'Recent Surgery / Recovering from Injury'], calories: 50 },
  { name: 'Pike Push-ups', target: 'Shoulders', meta: '3 sets x 12 reps', type: 'Muscle Gain', risks: ['Shoulder / Arm Injury'], calories: 30 },
  { name: 'Diamond Push-ups', target: 'Triceps, Chest', meta: '3 sets x 15 reps', type: 'Muscle Gain', risks: ['Shoulder / Arm Injury', 'Recent Surgery / Recovering from Injury'], calories: 35 },
  { name: 'Chair Dips', target: 'Triceps, Shoulders', meta: '3 sets x 15 reps', type: 'Muscle Gain', risks: ['Shoulder / Arm Injury'], calories: 35 },
  { name: 'Resistance Band Rows', target: 'Back, Biceps', meta: '3 sets x 15 reps', type: 'Muscle Gain', risks: ['Shoulder / Arm Injury'], calories: 35 },
  { name: 'Bulgarian Split Squats', target: 'Quads, Glutes', meta: '3 sets x 10 reps/leg', type: 'Muscle Gain', risks: ['ACL / Knee Injury', 'Recent Surgery / Recovering from Injury'], calories: 45 },
  { name: 'Superman Hold', target: 'Lower Back, Glutes', meta: '3 sets x 30 secs', type: 'Muscle Gain', risks: ['Back Pain / Spine Issue'], calories: 20 },

  // Fat Loss
  { name: 'Jumping Jacks', target: 'Full Body Cardio', meta: '3 sets x 50 reps', type: 'Fat Loss', risks: ['ACL / Knee Injury', 'Asthma / Breathing Issue', 'Heart Condition / High Blood Pressure'], calories: 80 },
  { name: 'Burpees', target: 'Full Body Cardio', meta: '3 sets x 15 reps', type: 'Fat Loss', risks: ['ACL / Knee Injury', 'Back Pain / Spine Issue', 'Heart Condition / High Blood Pressure', 'Asthma / Breathing Issue', 'Recent Surgery / Recovering from Injury'], calories: 110 },
  { name: 'Walking', target: 'Full Body Cardio', meta: '30 mins', type: 'Fat Loss', risks: [], calories: 150 },
  { name: 'Brisk Walking', target: 'Full Body Cardio', meta: '45 mins', type: 'Fat Loss', risks: [], calories: 250 },
  { name: 'Jogging in Place', target: 'Full Body Cardio', meta: '20 mins', type: 'Fat Loss', risks: ['ACL / Knee Injury', 'Heart Condition / High Blood Pressure'], calories: 180 },
  { name: 'High Knees', target: 'Full Body Cardio', meta: '3 sets x 40 reps', type: 'Fat Loss', risks: ['ACL / Knee Injury', 'Heart Condition / High Blood Pressure', 'Asthma / Breathing Issue'], calories: 70 },
  { name: 'Mountain Climbers', target: 'Full Body Cardio, Core', meta: '3 sets x 20 reps', type: 'Fat Loss', risks: ['Back Pain / Spine Issue', 'Shoulder / Arm Injury', 'ACL / Knee Injury'], calories: 60 },
  { name: 'Skater Jumps', target: 'Legs, Cardio', meta: '3 sets x 20 reps', type: 'Fat Loss', risks: ['ACL / Knee Injury', 'Heart Condition / High Blood Pressure'], calories: 70 },
  { name: 'Shadow Boxing', target: 'Full Body Cardio', meta: '15 mins rounds', type: 'Fat Loss', risks: ['Shoulder / Arm Injury'], calories: 150 },

  // Fitness / Maintenance
  { name: 'Plank', target: 'Core', meta: '3 sets x 60 secs', type: 'Fitness', risks: [], calories: 15 },
  { name: 'Bodyweight Squats', target: 'Legs', meta: '3 sets x 20 reps', type: 'Fitness', risks: ['ACL / Knee Injury'], calories: 40 },
  { name: 'Glute Bridges', target: 'Glutes, Core', meta: '3 sets x 15 reps', type: 'Fitness', risks: ['Back Pain / Spine Issue'], calories: 25 },
  { name: 'Bird Dog', target: 'Core, Lower Back', meta: '3 sets x 12 reps/side', type: 'Fitness', risks: [], calories: 15 },
  { name: 'Wall Sit', target: 'Quads', meta: '3 sets x 45 secs', type: 'Fitness', risks: ['ACL / Knee Injury'], calories: 20 },
  { name: 'Side Plank', target: 'Obliques, Core', meta: '3 sets x 30 secs/side', type: 'Fitness', risks: ['Shoulder / Arm Injury'], calories: 15 },
  { name: 'Dead Bug', target: 'Core', meta: '3 sets x 12 reps/side', type: 'Fitness', risks: [], calories: 15 },
];

// ---------- Rush / Chill classification ----------
// Rush  = high-intensity, heavy compound, o explosive/high-impact
// Chill = low-impact, steady-pace, o light/core/mobility
// Both  = moderate; pwede sa duha
const RUSH_ONLY = [
  'Squats', 'Deadlifts', 'Bench Press',
  'HIIT Treadmill', 'Treadmill Jog', 'StairMaster', 'Kettlebell Swings',
  'Push-ups', 'Diamond Push-ups', 'Bulgarian Split Squats',
  'Jumping Jacks', 'Burpees', 'High Knees', 'Mountain Climbers', 'Skater Jumps',
];

const CHILL_ONLY = [
  'Lat Pulldown', 'Leg Press', 'Treadmill Walk', 'Cable Crunches', 'Leg Curl Machine',
  'Superman Hold', 'Walking', 'Brisk Walking', 'Plank', 'Glute Bridges',
  'Bird Dog', 'Wall Sit', 'Side Plank', 'Dead Bug',
];

export type Intensity = 'Rush' | 'Chill' | 'Both';

export const getWorkoutIntensity = (name: string): Intensity => {
  if (RUSH_ONLY.includes(name)) return 'Rush';
  if (CHILL_ONLY.includes(name)) return 'Chill';
  return 'Both';
};

export const fitsIntensity = (item: WorkoutItem, intensity?: string): boolean => {
  if (intensity !== 'Rush' && intensity !== 'Chill') return true;
  const level = getWorkoutIntensity(item.name);
  return level === 'Both' || level === intensity;
};

export const isRisky = (
  item: WorkoutItem,
  userConditions: string[],
  userCategory: string
): boolean => {
  const medicalRisk = item.risks.some((r) => userConditions.includes(r));
  const categoryAvoidList = CATEGORY_AVOID[userCategory] || [];
  const categoryRisk = categoryAvoidList.includes(item.name);
  return medicalRisk || categoryRisk;
};

export const getSafeList = (
  source: WorkoutItem[],
  userGoal: string,
  userConditions: string[],
  userCategory: string,
  intensity?: string
): WorkoutItem[] => {
  let safeList = source.filter((w) => w.type === userGoal && !isRisky(w, userConditions, userCategory));

  if (safeList.length < 4) {
    safeList = source.filter((w) => !isRisky(w, userConditions, userCategory));
  }

  // I-filter base sa Rush/Chill, pero kung kulang na ang mabilin (<4), dili na i-filter para safe gihapon ang list
  const byIntensity = safeList.filter((w) => fitsIntensity(w, intensity));
  if (byIntensity.length >= 4) {
    safeList = byIntensity;
  }

  const seen = new Set<string>();
  return safeList.filter((w) => {
    if (seen.has(w.name)) return false;
    seen.add(w.name);
    return true;
  });
};

export const getDayOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
};

// dayOffset: 0 = today, 1 = tomorrow, etc.
export const getPicksForDay = (
  source: WorkoutItem[],
  dayOffset: number,
  userGoal: string,
  userConditions: string[],
  userCategory: string,
  pickCount: number = 5,
  restDays: number[] = [0],
  intensity?: string
): { picks: WorkoutItem[]; isRest: boolean } => {
  const safeList = getSafeList(source, userGoal, userConditions, userCategory, intensity);
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + dayOffset);
  const dayIndex = targetDate.getDay();

  if (restDays.includes(dayIndex) || safeList.length === 0) {
    return { picks: [], isRest: true };
  }

  const seed = getDayOfYear(targetDate);
  const actualCount = Math.min(pickCount, safeList.length);
  const start = (seed * 5) % safeList.length;
  const picks: WorkoutItem[] = [];
  for (let i = 0; i < actualCount; i++) {
    picks.push(safeList[(start + i) % safeList.length]);
  }
  return { picks, isRest: false };
};

// Rush = faster/intense progress (6-a-day, only Sunday rest)
// Chill = normal, steady pace (4-a-day, rest sa Tuesday, Thursday, ug Sunday)
export interface IntensitySettings {
  pickCount: number;
  restDays: number[];
}

export const getIntensitySettings = (intensity?: string): IntensitySettings => {
  if (intensity === 'Rush') return { pickCount: 6, restDays: [0] };
  if (intensity === 'Chill') return { pickCount: 4, restDays: [0, 2, 4] }; // Sun, Tue, Thu
  return { pickCount: 5, restDays: [0] }; // default/legacy
};

// Total estimated calories for a set of exercises (e.g. today's AI picks)
export const getTotalCalories = (items: WorkoutItem[]): number =>
  items.reduce((sum, item) => sum + item.calories, 0);