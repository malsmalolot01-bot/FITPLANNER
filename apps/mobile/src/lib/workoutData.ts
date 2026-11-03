export interface WorkoutItem {
  name: string;
  target: string;
  meta: string;
  type: string;
  risks: string[];
}

export const gymWorkouts: WorkoutItem[] = [
  { name: 'Bench Press', target: 'Chest, Triceps', meta: '4 sets x 8 reps', type: 'Muscle Gain', risks: ['Shoulder / Arm Injury', 'Recent Surgery / Recovering from Injury'] },
  { name: 'Squats', target: 'Quads, Glutes', meta: '4 sets x 10 reps', type: 'Muscle Gain', risks: ['ACL / Knee Injury', 'Back Pain / Spine Issue', 'Recent Surgery / Recovering from Injury'] },
  { name: 'Deadlifts', target: 'Back, Hamstrings', meta: '3 sets x 5 reps', type: 'Muscle Gain', risks: ['Back Pain / Spine Issue', 'ACL / Knee Injury', 'Recent Surgery / Recovering from Injury'] },
  { name: 'HIIT Treadmill', target: 'Full Body Cardio', meta: '15 mins max effort', type: 'Fat Loss', risks: ['Heart Condition / High Blood Pressure', 'Asthma / Breathing Issue', 'ACL / Knee Injury'] },
  { name: 'Rowing Machine', target: 'Back, Core, Cardio', meta: '20 mins steady', type: 'Fat Loss', risks: ['Back Pain / Spine Issue', 'Shoulder / Arm Injury'] },
  { name: 'Treadmill Walk', target: 'Full Body Cardio', meta: '30 mins / 8,000 steps', type: 'Fat Loss', risks: [] },
  { name: 'Treadmill Jog', target: 'Full Body Cardio', meta: '20 mins', type: 'Fat Loss', risks: ['ACL / Knee Injury', 'Heart Condition / High Blood Pressure'] },
  { name: 'Stationary Bike', target: 'Legs, Cardio', meta: '20 mins steady pace', type: 'Fat Loss', risks: [] },
  { name: 'StairMaster', target: 'Legs, Glutes, Cardio', meta: '15 mins', type: 'Fat Loss', risks: ['ACL / Knee Injury', 'Heart Condition / High Blood Pressure'] },
  { name: 'Cable Crunches', target: 'Core', meta: '3 sets x 15 reps', type: 'Fitness', risks: ['Back Pain / Spine Issue'] },
];

export const homeWorkouts: WorkoutItem[] = [
  { name: 'Push-ups', target: 'Chest, Triceps', meta: '4 sets x 20 reps', type: 'Muscle Gain', risks: ['Shoulder / Arm Injury', 'Recent Surgery / Recovering from Injury'] },
  { name: 'Pike Push-ups', target: 'Shoulders', meta: '3 sets x 12 reps', type: 'Muscle Gain', risks: ['Shoulder / Arm Injury'] },
  { name: 'Jumping Jacks', target: 'Full Body Cardio', meta: '3 sets x 50 reps', type: 'Fat Loss', risks: ['ACL / Knee Injury', 'Asthma / Breathing Issue', 'Heart Condition / High Blood Pressure'] },
  { name: 'Burpees', target: 'Full Body Cardio', meta: '3 sets x 15 reps', type: 'Fat Loss', risks: ['ACL / Knee Injury', 'Back Pain / Spine Issue', 'Heart Condition / High Blood Pressure', 'Asthma / Breathing Issue', 'Recent Surgery / Recovering from Injury'] },
  { name: 'Walking', target: 'Full Body Cardio', meta: '30 mins / 8,000 steps', type: 'Fat Loss', risks: [] },
  { name: 'Brisk Walking', target: 'Full Body Cardio', meta: '45 mins / 10,000 steps', type: 'Fat Loss', risks: [] },
  { name: 'Jogging in Place', target: 'Full Body Cardio', meta: '20 mins', type: 'Fat Loss', risks: ['ACL / Knee Injury', 'Heart Condition / High Blood Pressure'] },
  { name: 'High Knees', target: 'Full Body Cardio', meta: '3 sets x 40 reps', type: 'Fat Loss', risks: ['ACL / Knee Injury', 'Heart Condition / High Blood Pressure', 'Asthma / Breathing Issue'] },
  { name: 'Mountain Climbers', target: 'Full Body Cardio, Core', meta: '3 sets x 20 reps', type: 'Fat Loss', risks: ['Back Pain / Spine Issue', 'Shoulder / Arm Injury', 'ACL / Knee Injury'] },
  { name: 'Plank', target: 'Core', meta: '3 sets x 60 secs', type: 'Fitness', risks: [] },
  { name: 'Bodyweight Squats', target: 'Legs', meta: '3 sets x 20 reps', type: 'Fitness', risks: ['ACL / Knee Injury'] },
];