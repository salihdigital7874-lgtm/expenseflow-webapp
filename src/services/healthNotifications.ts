import { HealthDataStore, HealthNotificationItem, HealthNotificationSettings } from '../types/health';
import { playHealthNotificationSound } from '../utils/healthSound';

export const requestBrowserNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const sendBrowserNotification = (title: string, body: string, type: 'sleep' | 'drink' | 'medicine' | 'food') => {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: './app-icon.jpg',
        tag: `expenseflow-${type}-${Date.now()}`,
      });
    } catch (err) {
      console.warn('Native notification failed', err);
    }
  }
};

export const triggerInstantNotification = (
  type: 'sleep' | 'drink' | 'medicine' | 'food',
  customSettings?: HealthNotificationSettings
): HealthNotificationItem => {
  let title = '';
  let message = '';
  let actionType: 'water' | 'medicine' | 'meal' | 'sleep' = 'water';

  switch (type) {
    case 'drink':
      title = '🚰 Drink Water Reminder';
      message = `Hydration Check! Time to drink a glass of water (250ml) to meet your daily target.`;
      actionType = 'water';
      break;

    case 'medicine':
      title = '💊 Medicine Schedule Alert';
      message = `Time for your scheduled medication! Take your prescribed dose with water or after food.`;
      actionType = 'medicine';
      break;

    case 'food':
      title = '🥗 Meal Time Reminder';
      message = `Time for a healthy meal! Log your food items to keep your calories and macros balanced.`;
      actionType = 'meal';
      break;

    case 'sleep':
      title = '😴 Bedtime Rest Notice';
      message = `Wind-down time! Get ready for bed to maintain 7.5+ hours of quality deep sleep.`;
      actionType = 'sleep';
      break;
  }

  // Play audio sound if enabled
  if (!customSettings || customSettings.soundEnabled) {
    playHealthNotificationSound(type);
  }

  // Send browser native notification
  if (!customSettings || customSettings.browserNotifications) {
    sendBrowserNotification(title, message, type);
  }

  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    actionType,
  };
};

// Evaluate scheduled reminders against current time
export const evaluateScheduledHealthNotifications = (
  store: HealthDataStore,
  lastEvaluatedMinute: string
): { newLogs: HealthNotificationItem[]; currentMinuteStr: string } => {
  const settings = store.notificationSettings;
  if (!settings || !settings.enabled) {
    return { newLogs: [], currentMinuteStr: lastEvaluatedMinute };
  }

  const now = new Date();
  const currentHH = String(now.getHours()).padStart(2, '0');
  const currentMM = String(now.getMinutes()).padStart(2, '0');
  const currentMinuteStr = `${currentHH}:${currentMM}`;

  // Avoid running multiple times on the exact same minute
  if (currentMinuteStr === lastEvaluatedMinute) {
    return { newLogs: [], currentMinuteStr: lastEvaluatedMinute };
  }

  const newLogs: HealthNotificationItem[] = [];

  // 1. DRINK WATER REMINDER
  if (settings.drinkEnabled) {
    const startHour = parseInt(settings.drinkStartHour.split(':')[0] || '8', 10);
    const endHour = parseInt(settings.drinkEndHour.split(':')[0] || '22', 10);
    const currentHour = now.getHours();

    if (currentHour >= startHour && currentHour <= endHour) {
      // Trigger at start of interval (e.g., if interval is 60m, on the hour)
      const interval = settings.drinkIntervalMinutes || 60;
      const minutesPastHour = now.getMinutes();
      if (minutesPastHour % interval === 0) {
        const notif = triggerInstantNotification('drink', settings);
        newLogs.push(notif);
      }
    }
  }

  // 2. MEDICINE REMINDERS
  if (settings.medicineEnabled) {
    const { morning, afternoon, evening, night } = settings.medicineTimes;
    const pendingMeds = store.medicines.filter((m) => !m.takenToday);

    if (pendingMeds.length > 0) {
      if (currentMinuteStr === morning || currentMinuteStr === afternoon || currentMinuteStr === evening || currentMinuteStr === night) {
        const notif = triggerInstantNotification('medicine', settings);
        notif.message = `Time for ${pendingMeds[0].name} (${pendingMeds[0].dosage})! ${pendingMeds.length} pending today.`;
        newLogs.push(notif);
      }
    }
  }

  // 3. FOOD / MEAL REMINDERS
  if (settings.foodEnabled) {
    const { breakfast, lunch, snack, dinner } = settings.mealTimes;
    if (currentMinuteStr === breakfast) {
      const notif = triggerInstantNotification('food', settings);
      notif.title = '🍳 Breakfast Time!';
      notif.message = 'Start your morning with a nutritious breakfast & protein boost!';
      newLogs.push(notif);
    } else if (currentMinuteStr === lunch) {
      const notif = triggerInstantNotification('food', settings);
      notif.title = '🥗 Lunch Time!';
      notif.message = 'Time for lunch! Keep your energy steady with balanced nutrients.';
      newLogs.push(notif);
    } else if (currentMinuteStr === snack) {
      const notif = triggerInstantNotification('food', settings);
      notif.title = '🍏 Evening Snack!';
      notif.message = 'Time for a light healthy evening snack & hydration.';
      newLogs.push(notif);
    } else if (currentMinuteStr === dinner) {
      const notif = triggerInstantNotification('food', settings);
      notif.title = '🍲 Dinner Time!';
      notif.message = 'Time for dinner! Eat clean and light for optimal night digestion.';
      newLogs.push(notif);
    }
  }

  // 4. SLEEP REMINDERS
  if (settings.sleepEnabled) {
    if (currentMinuteStr === settings.bedtime) {
      const notif = triggerInstantNotification('sleep', settings);
      notif.title = '😴 Bedtime Wind-Down';
      notif.message = `Target bedtime ${settings.bedtime} reached. Dim lights & relax for deep sleep!`;
      newLogs.push(notif);
    } else if (currentMinuteStr === settings.wakeTime) {
      const notif = triggerInstantNotification('sleep', settings);
      notif.title = '🌅 Good Morning Wake-up!';
      notif.message = 'Rise and shine! Log your sleep quality & start your day fresh.';
      newLogs.push(notif);
    }
  }

  return { newLogs, currentMinuteStr };
};
