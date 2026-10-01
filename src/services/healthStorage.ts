import { HealthDataStore, HealthGoals, DailyHealthLog, WaterLog, SleepLog, ExerciseLog, WeightLog, MealItem, MedicineLog, HealthAppointment } from '../types/health';

const HEALTH_STORAGE_KEY = 'expenseflow_health_data';

const DEFAULT_GOALS: HealthGoals = {
  weightGoalTitle: 'Lose 5 kg',
  initialWeight: 80.0,
  currentWeight: 77.9,
  targetWeight: 75.0,
  progressKg: 2.1,
  waterGoalLiters: 2.5,
  stepsGoal: 8000,
  sleepGoalHours: 7.5,
  calorieGoal: 2100,
};

const getTodayString = () => new Date().toISOString().split('T')[0];

const getPastDateString = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const INITIAL_HEALTH_DATA: HealthDataStore = {
  goals: DEFAULT_GOALS,

  dailyLogs: [
    {
      id: 'daily-1',
      date: getTodayString(),
      mood: 'Excellent',
      energyLevel: 5,
      heartRate: 68,
      bloodPressure: '118/76',
      bloodSugar: 92,
      spo2: 99,
      rating: 5,
      notes: 'Feeling energized and hydrated today! Finished 45 mins morning cardio.',
    },
    {
      id: 'daily-2',
      date: getPastDateString(1),
      mood: 'Good',
      energyLevel: 4,
      heartRate: 72,
      bloodPressure: '120/80',
      bloodSugar: 96,
      spo2: 98,
      rating: 4,
      notes: 'Consistent nutrition and good focus throughout work hours.',
    },
    {
      id: 'daily-3',
      date: getPastDateString(2),
      mood: 'Good',
      energyLevel: 4,
      heartRate: 70,
      bloodPressure: '119/78',
      bloodSugar: 94,
      spo2: 98,
      rating: 4,
      notes: 'Completed full weight session. Slept well.',
    },
    {
      id: 'daily-4',
      date: getPastDateString(3),
      mood: 'Tired',
      energyLevel: 3,
      heartRate: 75,
      bloodPressure: '122/82',
      bloodSugar: 100,
      spo2: 97,
      rating: 3,
      notes: 'Slight muscle fatigue from heavy leg workout.',
    },
  ],

  waterLogs: [
    { id: 'w-1', date: getTodayString(), time: '08:00', amountMl: 500, container: 'Bottle (500ml)' },
    { id: 'w-2', date: getTodayString(), time: '10:30', amountMl: 250, container: 'Glass (250ml)' },
    { id: 'w-3', date: getTodayString(), time: '13:00', amountMl: 500, container: 'Bottle (500ml)' },
    { id: 'w-4', date: getTodayString(), time: '15:30', amountMl: 500, container: 'Bottle (500ml)' },
    { id: 'w-5', date: getTodayString(), time: '18:00', amountMl: 250, container: 'Glass (250ml)' },
    // Yesterday
    { id: 'w-prev-1', date: getPastDateString(1), time: '09:00', amountMl: 1000, container: 'Pitcher (1000ml)' },
    { id: 'w-prev-2', date: getPastDateString(1), time: '14:00', amountMl: 750, container: 'Sports Bottle (750ml)' },
    { id: 'w-prev-3', date: getPastDateString(1), time: '19:00', amountMl: 750, container: 'Sports Bottle (750ml)' },
  ],

  sleepLogs: [
    {
      id: 'slp-1',
      date: getTodayString(),
      bedtime: '23:00',
      wakeTime: '06:30',
      durationHours: 7.5,
      quality: 'Deep Restful',
      deepSleepMinutes: 135,
      lightSleepMinutes: 240,
      remSleepMinutes: 75,
      notes: 'Met 7.5 hrs sleep target! Woke up feeling fresh.',
    },
    {
      id: 'slp-2',
      date: getPastDateString(1),
      bedtime: '22:45',
      wakeTime: '06:15',
      durationHours: 7.5,
      quality: 'Good',
      deepSleepMinutes: 120,
      lightSleepMinutes: 250,
      remSleepMinutes: 80,
      notes: 'Solid sleep cycle.',
    },
    {
      id: 'slp-3',
      date: getPastDateString(2),
      bedtime: '23:30',
      wakeTime: '06:45',
      durationHours: 7.25,
      quality: 'Good',
      deepSleepMinutes: 110,
      lightSleepMinutes: 245,
      remSleepMinutes: 80,
      notes: 'Slight late sleep start but comfortable rest.',
    },
    {
      id: 'slp-4',
      date: getPastDateString(3),
      bedtime: '23:15',
      wakeTime: '06:30',
      durationHours: 7.25,
      quality: 'Good',
      deepSleepMinutes: 115,
      lightSleepMinutes: 240,
      remSleepMinutes: 80,
    },
  ],

  exerciseLogs: [
    {
      id: 'ex-1',
      date: getTodayString(),
      activityType: 'Brisk Walk',
      durationMinutes: 45,
      stepsCount: 5200,
      caloriesBurned: 240,
      intensity: 'Moderate',
      notes: 'Morning park walk before work.',
    },
    {
      id: 'ex-2',
      date: getTodayString(),
      activityType: 'Gym Workout',
      durationMinutes: 40,
      stepsCount: 3100,
      caloriesBurned: 320,
      intensity: 'High',
      notes: 'Upper body resistance training.',
    },
    {
      id: 'ex-prev-1',
      date: getPastDateString(1),
      activityType: 'Running',
      durationMinutes: 35,
      stepsCount: 6500,
      caloriesBurned: 380,
      intensity: 'High',
      notes: 'Outdoor 5k jog.',
    },
    {
      id: 'ex-prev-2',
      date: getPastDateString(1),
      activityType: 'Brisk Walk',
      durationMinutes: 30,
      stepsCount: 3200,
      caloriesBurned: 150,
      intensity: 'Moderate',
    },
  ],

  weightLogs: [
    { id: 'wt-1', date: getPastDateString(28), weightKg: 80.0, bodyFatPercent: 24.5, muscleMassKg: 58.2, notes: 'Starting weight baseline' },
    { id: 'wt-2', date: getPastDateString(21), weightKg: 79.4, bodyFatPercent: 24.0, muscleMassKg: 58.3, notes: 'Week 1 check-in (-0.6 kg)' },
    { id: 'wt-3', date: getPastDateString(14), weightKg: 78.8, bodyFatPercent: 23.5, muscleMassKg: 58.5, notes: 'Week 2 check-in (-1.2 kg total)' },
    { id: 'wt-4', date: getPastDateString(7), weightKg: 78.3, bodyFatPercent: 23.1, muscleMassKg: 58.7, notes: 'Week 3 check-in (-1.7 kg total)' },
    { id: 'wt-5', date: getTodayString(), weightKg: 77.9, bodyFatPercent: 22.6, muscleMassKg: 59.0, notes: 'Current progress: 2.1 kg lost! (Target 75 kg)' },
  ],

  meals: [
    {
      id: 'meal-1',
      date: getTodayString(),
      mealType: 'Breakfast',
      foodName: 'Oatmeal with Almonds, Berries & Whey Protein',
      calories: 420,
      proteinGrams: 32,
      carbsGrams: 48,
      fatGrams: 10,
    },
    {
      id: 'meal-2',
      date: getTodayString(),
      mealType: 'Lunch',
      foodName: 'Grilled Chicken Breast with Brown Rice & Steamed Broccoli',
      calories: 550,
      proteinGrams: 46,
      carbsGrams: 52,
      fatGrams: 12,
    },
    {
      id: 'meal-3',
      date: getTodayString(),
      mealType: 'Snack',
      foodName: 'Greek Yogurt with Honey & Chia Seeds',
      calories: 210,
      proteinGrams: 18,
      carbsGrams: 22,
      fatGrams: 5,
    },
    {
      id: 'meal-4',
      date: getTodayString(),
      mealType: 'Dinner',
      foodName: 'Baked Salmon with Quinoa & Roasted Vegetables',
      calories: 580,
      proteinGrams: 42,
      carbsGrams: 40,
      fatGrams: 20,
    },
  ],

  medicines: [
    {
      id: 'med-1',
      name: 'Multivitamin Complex',
      dosage: '1 Tablet',
      frequency: 'Once Daily',
      timeOfDay: ['Morning'],
      instruction: 'After Food',
      stockCount: 45,
      takenToday: true,
      notes: 'Daily immunity & energy support',
    },
    {
      id: 'med-2',
      name: 'Omega-3 Fish Oil',
      dosage: '1000mg Capsule',
      frequency: 'Twice Daily',
      timeOfDay: ['Morning', 'Night'],
      instruction: 'After Food',
      stockCount: 60,
      takenToday: true,
      notes: 'Heart & joint health',
    },
    {
      id: 'med-3',
      name: 'Vitamin D3 2000 IU',
      dosage: '1 Softgel',
      frequency: 'Once Daily',
      timeOfDay: ['Morning'],
      instruction: 'With Water',
      stockCount: 28,
      takenToday: true,
      notes: 'Bone strength & sunlight vitamin supplement',
    },
  ],

  appointments: [
    {
      id: 'apt-1',
      doctorName: 'Dr. Rajesh Sharma',
      specialty: 'General Physician & Wellness Expert',
      clinicHospital: 'Apollo Health Center',
      appointmentDate: getPastDateString(-5), // 5 days in future
      appointmentTime: '10:30 AM',
      status: 'Upcoming',
      reason: 'Routine quarterly body checkup & lipid profile review',
      contactNumber: '+91 98765 12345',
      doctorNotes: 'Fast for 10 hours prior to blood test.',
    },
    {
      id: 'apt-2',
      doctorName: 'Dr. Ananya Roy',
      specialty: 'Clinical Nutritionist & Dietitian',
      clinicHospital: 'Care Wellness Clinic',
      appointmentDate: getPastDateString(12),
      appointmentTime: '04:00 PM',
      status: 'Completed',
      reason: 'Weight Loss Plan Consultation (-5kg Target strategy)',
      contactNumber: '+91 98111 22334',
      doctorNotes: 'Keep calorie intake around 2100 kcal, maintain 2.5L water intake and 8000 daily steps.',
    },
  ],

  notificationSettings: {
    enabled: true,
    browserNotifications: true,
    soundEnabled: true,
    sleepEnabled: true,
    bedtime: '22:30',
    wakeTime: '06:30',
    drinkEnabled: true,
    drinkIntervalMinutes: 60,
    drinkStartHour: '08:00',
    drinkEndHour: '22:00',
    medicineEnabled: true,
    medicineTimes: {
      morning: '08:00',
      afternoon: '13:00',
      evening: '18:00',
      night: '21:30',
    },
    foodEnabled: true,
    mealTimes: {
      breakfast: '08:30',
      lunch: '13:30',
      snack: '17:00',
      dinner: '20:30',
    },
  },

  notificationLogs: [
    {
      id: 'notif-demo-1',
      type: 'drink',
      title: '🚰 Drink Water Reminder',
      message: 'Time to drink a fresh glass of water! Track 250ml to stay on goal.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      actionType: 'water',
    },
    {
      id: 'notif-demo-2',
      type: 'medicine',
      title: '💊 Medicine Time (Morning)',
      message: 'Remember to take Multivitamin Complex (1 Tablet) after breakfast.',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: true,
      actionType: 'medicine',
    },
  ],
};

export const loadHealthData = (): HealthDataStore => {
  try {
    const raw = localStorage.getItem(HEALTH_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(HEALTH_STORAGE_KEY, JSON.stringify(INITIAL_HEALTH_DATA));
      return INITIAL_HEALTH_DATA;
    }
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_HEALTH_DATA,
      ...parsed,
      goals: {
        ...INITIAL_HEALTH_DATA.goals,
        ...(parsed.goals || {}),
      },
      notificationSettings: {
        ...INITIAL_HEALTH_DATA.notificationSettings,
        ...(parsed.notificationSettings || {}),
        medicineTimes: {
          ...INITIAL_HEALTH_DATA.notificationSettings!.medicineTimes,
          ...(parsed.notificationSettings?.medicineTimes || {}),
        },
        mealTimes: {
          ...INITIAL_HEALTH_DATA.notificationSettings!.mealTimes,
          ...(parsed.notificationSettings?.mealTimes || {}),
        },
      },
      notificationLogs: parsed.notificationLogs || INITIAL_HEALTH_DATA.notificationLogs,
    };
  } catch (err) {
    console.error('Error loading health data from localStorage', err);
    return INITIAL_HEALTH_DATA;
  }
};

export const saveHealthData = (data: HealthDataStore) => {
  try {
    localStorage.setItem(HEALTH_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving health data to localStorage', err);
  }
};
