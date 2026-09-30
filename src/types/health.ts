export type HealthSubTab =
  | 'dashboard'
  | 'daily'
  | 'water'
  | 'sleep'
  | 'exercise'
  | 'weight'
  | 'meals'
  | 'medicines'
  | 'appointments'
  | 'reports';

export interface HealthGoals {
  weightGoalTitle: string; // e.g. "Lose 5 kg"
  initialWeight: number; // 80.0
  currentWeight: number; // 77.9 (80 - 2.1)
  targetWeight: number; // 75.0
  progressKg: number; // 2.1 kg lost
  waterGoalLiters: number; // 2.5 L/day
  stepsGoal: number; // 8000 steps/day
  sleepGoalHours: number; // 7.5 hrs/day
  calorieGoal: number; // 2100 kcal/day
}

export interface DailyHealthLog {
  id: string;
  date: string;
  mood: 'Excellent' | 'Good' | 'Neutral' | 'Tired' | 'Stressed';
  energyLevel: number; // 1 - 5
  heartRate?: number; // BPM e.g. 72
  bloodPressure?: string; // e.g. "120/80"
  bloodSugar?: number; // mg/dL e.g. 95
  spo2?: number; // % e.g. 98
  notes?: string;
  rating?: number; // 1-5 stars
}

export interface WaterLog {
  id: string;
  date: string;
  time: string;
  amountMl: number;
  container: 'Glass (250ml)' | 'Bottle (500ml)' | 'Sports Bottle (750ml)' | 'Pitcher (1000ml)' | 'Custom';
}

export interface SleepLog {
  id: string;
  date: string;
  bedtime: string; // "23:00"
  wakeTime: string; // "06:30"
  durationHours: number; // 7.5
  quality: 'Deep Restful' | 'Good' | 'Disturbed' | 'Insomnia';
  deepSleepMinutes?: number;
  lightSleepMinutes?: number;
  remSleepMinutes?: number;
  notes?: string;
}

export interface ExerciseLog {
  id: string;
  date: string;
  activityType: 'Running' | 'Gym Workout' | 'Cycling' | 'Yoga & Stretching' | 'Swimming' | 'Brisk Walk' | 'HIIT';
  durationMinutes: number;
  stepsCount: number;
  caloriesBurned: number;
  intensity: 'Low' | 'Moderate' | 'High' | 'Intense';
  notes?: string;
}

export interface WeightLog {
  id: string;
  date: string;
  weightKg: number;
  bodyFatPercent?: number;
  muscleMassKg?: number;
  notes?: string;
}

export interface MealItem {
  id: string;
  date: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  foodName: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface MedicineLog {
  id: string;
  name: string;
  dosage: string; // e.g. "500mg"
  frequency: 'Once Daily' | 'Twice Daily' | 'Three Times Daily' | 'As Needed';
  timeOfDay: ('Morning' | 'Afternoon' | 'Evening' | 'Night')[];
  instruction: 'Before Food' | 'After Food' | 'With Water';
  stockCount: number;
  takenToday: boolean;
  notes?: string;
}

export interface HealthAppointment {
  id: string;
  doctorName: string;
  specialty: string;
  clinicHospital: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  reason: string;
  doctorNotes?: string;
  contactNumber?: string;
}

export interface HealthDataStore {
  goals: HealthGoals;
  dailyLogs: DailyHealthLog[];
  waterLogs: WaterLog[];
  sleepLogs: SleepLog[];
  exerciseLogs: ExerciseLog[];
  weightLogs: WeightLog[];
  meals: MealItem[];
  medicines: MedicineLog[];
  appointments: HealthAppointment[];
}
