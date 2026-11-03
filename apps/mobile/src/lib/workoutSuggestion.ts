// ==============================================
// Shared BMI + Goal → Workout Suggestion Logic
// Used by: Progress page (AI card) & Workout page (filtered list)
// ==============================================

export type Goal = "gain" | "cut" | "maintain";

export type BmiCategory = "Underweight" | "Normal" | "Overweight" | "Obese";

export interface WorkoutSuggestion {
  focus: string;              // short title, e.g. "Low-impact conditioning"
  description: string;        // paragraph shown in the AI card
  tags: string[];             // used to filter/match exercises & templates
}

// ---------- BMI helpers ----------

/**
 * Computes BMI from height (cm) and weight (kg).
 * Formula: weight(kg) / (height(m))^2
 */
export function computeBmi(heightCm: number, weightKg: number): number {
  if (!heightCm || !weightKg) return 0;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10; // 1 decimal place
}

export function getBmiCategory(bmi: number): BmiCategory {
  if (bmi <= 0) return "Normal";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

// ---------- Suggestion matrix ----------

const SUGGESTION_MATRIX: Record<BmiCategory, Record<Goal, WorkoutSuggestion>> = {
  Underweight: {
    gain: {
      focus: "Strength & Mass Building",
      description:
        "Prioritize compound lifts (squat, deadlift, bench press) with a calorie surplus. Aim for progressive overload 4x/week.",
      tags: ["strength", "compound", "hypertrophy", "beginner-friendly"],
    },
    cut: {
      focus: "Maintain Muscle, Light Activity",
      description:
        "Cutting isn't recommended at this BMI. Focus instead on light strength training and balanced nutrition to reach a healthy weight first.",
      tags: ["strength", "light-cardio", "beginner-friendly"],
    },
    maintain: {
      focus: "Full-Body Strength Foundation",
      description:
        "Build a consistent full-body routine 3x/week to establish strength and healthy habits.",
      tags: ["full-body", "strength", "beginner-friendly"],
    },
  },
  Normal: {
    gain: {
      focus: "Hypertrophy Focus",
      description:
        "Push/Pull/Legs split with progressive overload, 4-5x/week, moderate reps (8-12) for muscle growth.",
      tags: ["hypertrophy", "push-pull-legs", "strength"],
    },
    cut: {
      focus: "Lean & Define",
      description:
        "Combine strength training with moderate cardio to preserve muscle while reducing body fat.",
      tags: ["strength", "cardio", "circuit"],
    },
    maintain: {
      focus: "Balanced Fitness",
      description:
        "A mix of strength and cardio, 3-4x/week, to maintain your current fitness level.",
      tags: ["full-body", "cardio", "strength"],
    },
  },
  Overweight: {
    gain: {
      focus: "Strength-Priority Training",
      description:
        "Focus on strength training to build muscle while keeping cardio minimal and controlled.",
      tags: ["strength", "compound", "low-impact"],
    },
    cut: {
      focus: "Cardio + Fat Burn",
      description:
        "HIIT and circuit training combined with full-body strength 3x/week to maximize calorie burn.",
      tags: ["hiit", "cardio", "circuit"],
    },
    maintain: {
      focus: "Low-Impact Conditioning",
      description:
        "Start with low-impact cardio (walking, cycling) plus full-body strength 3x/week, and build intensity over time.",
      tags: ["low-impact", "cardio", "full-body"],
    },
  },
  Obese: {
    gain: {
      focus: "Supervised Strength Building",
      description:
        "Focus on foundational strength movements with proper form, minimal cardio impact on joints.",
      tags: ["strength", "low-impact", "beginner-friendly"],
    },
    cut: {
      focus: "Low-Impact Fat Loss",
      description:
        "Walking, cycling, or swimming combined with light strength training to protect joints while losing weight.",
      tags: ["low-impact", "cardio", "beginner-friendly"],
    },
    maintain: {
      focus: "Low-impact conditioning",
      description:
        "Start with low-impact cardio (walking, cycling) plus full-body strength 3x/week, and build intensity over time.",
      tags: ["low-impact", "cardio", "full-body"],
    },
  },
};

/**
 * Main function used by both Progress page and Workout page.
 */
export function getWorkoutSuggestion(bmi: number, goal: Goal): WorkoutSuggestion {
  const category = getBmiCategory(bmi);
  return SUGGESTION_MATRIX[category][goal];
  
}

