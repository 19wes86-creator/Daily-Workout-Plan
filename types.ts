
export interface Exercise {
  id: string;
  name: string;
  description: string;
  targetArea: 'hips' | 'glutes' | 'core' | 'legs' | 'balance';
  image: string;
  reps: string;
  sets: number;
  tips: string[];
}

export interface WorkoutSession {
  id: string;
  date: string;
  exercises: Exercise[];
  completed: boolean;
  notes?: string;
  focus: string;
}

export interface DayPlan {
  date: string; // ISO string
  type: 'strength' | 'running' | 'rest';
  focus: string;
  session?: WorkoutSession;
  completed: boolean;
}

export interface UserProgress {
  totalWorkouts: number;
  completedExercises: number;
  streak: number;
  lastWorkoutDate?: string;
}
