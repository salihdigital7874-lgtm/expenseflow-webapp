// LocalStorage persistence for Tasks, Goals, Calendar Events, and Notes
// Pre-populated with the exact mock data shown in LifeSync laptop mockup screens

export interface TaskItem {
  id: string;
  title: string;
  time: string;
  date: string;
  tag: 'Work' | 'Marketing' | 'Health' | 'Clients' | 'Personal';
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string;
}

export interface GoalItem {
  id: string;
  title: string;
  category: 'Personal' | 'Business' | 'Health';
  targetDate: string;
  progress: number; // 0 - 100
  color: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  date: string; // YYYY-MM-DD
  tag: 'Work' | 'Marketing' | 'Health' | 'Clients' | 'Personal';
  notes?: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: 'Work' | 'Personal' | 'Ideas';
  date: string;
  color: string;
}

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 't1',
    title: 'Client meeting with Arjun',
    time: '10:00 AM - 11:00 AM',
    date: 'Today',
    tag: 'Work',
    completed: true,
  },
  {
    id: 't2',
    title: 'Create instagram post',
    time: '11:30 AM - 12:00 PM',
    date: 'Today',
    tag: 'Marketing',
    completed: true,
  },
  {
    id: 't3',
    title: 'Work on website design',
    time: '2:00 PM - 4:00 PM',
    date: 'Today',
    tag: 'Work',
    completed: true,
  },
  {
    id: 't4',
    title: 'Gym workout',
    time: '6:00 PM - 7:00 PM',
    date: 'Today',
    tag: 'Health',
    completed: false,
  },
  {
    id: 't5',
    title: 'Follow up with leads',
    time: '11:30 AM - 12:00 PM',
    date: 'Tomorrow',
    tag: 'Clients',
    completed: false,
  },
  {
    id: 't6',
    title: 'Plan next week content',
    time: '3:00 PM - 4:00 PM',
    date: 'Tomorrow',
    tag: 'Personal',
    completed: false,
  },
];

const DEFAULT_GOALS: GoalItem[] = [
  {
    id: 'g1',
    title: 'Start Own Agency',
    category: 'Business',
    targetDate: '31 Dec 2026',
    progress: 70,
    color: '#10B981',
  },
  {
    id: 'g2',
    title: 'Learn Python',
    category: 'Personal',
    targetDate: '30 Nov 2026',
    progress: 45,
    color: '#8B5CF6',
  },
  {
    id: 'g3',
    title: 'Buy iPhone',
    category: 'Personal',
    targetDate: '31 Mar 2027',
    progress: 30,
    color: '#6366F1',
  },
  {
    id: 'g4',
    title: 'Get Fit & Healthy',
    category: 'Health',
    targetDate: '31 Dec 2026',
    progress: 60,
    color: '#10B981',
  },
];

const DEFAULT_EVENTS: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Client meeting with Arjun',
    time: '10:00 AM - 11:00 AM',
    date: '2026-11-25',
    tag: 'Work',
  },
  {
    id: 'e2',
    title: 'Create instagram post',
    time: '11:30 AM - 12:00 PM',
    date: '2026-11-25',
    tag: 'Marketing',
  },
  {
    id: 'e3',
    title: 'Work on website design',
    time: '2:00 PM - 4:00 PM',
    date: '2026-11-25',
    tag: 'Work',
  },
  {
    id: 'e4',
    title: 'Gym workout',
    time: '6:00 PM - 7:00 PM',
    date: '2026-11-25',
    tag: 'Health',
  },
];

const DEFAULT_NOTES: NoteItem[] = [
  {
    id: 'n1',
    title: 'Content Ideas',
    content: 'Instagram reel ideas, product shots, behind the scenes, client testimonials, tips series.',
    category: 'Ideas',
    date: 'Today, 2:30 PM',
    color: 'bg-amber-50 border-amber-200 text-amber-950',
  },
  {
    id: 'n2',
    title: 'Client Meeting Notes',
    content: 'Discussed new project timeline, deliverables, brand colors and typography approval.',
    category: 'Work',
    date: 'Yesterday, 5:10 PM',
    color: 'bg-rose-50 border-rose-200 text-rose-950',
  },
  {
    id: 'n3',
    title: 'Business Ideas',
    content: 'E-commerce integration, digital agency scale-up, automation tool for freelancers.',
    category: 'Ideas',
    date: '12 Oct 2026',
    color: 'bg-sky-50 border-sky-200 text-sky-950',
  },
  {
    id: 'n4',
    title: 'Personal Thoughts',
    content: 'Daily gratitude journal, morning routine improvements, reading list for Q4.',
    category: 'Personal',
    date: '10 Oct 2026',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-950',
  },
  {
    id: 'n5',
    title: 'Learning Notes',
    content: 'Python fundamentals, React Native animations, SEO optimization techniques.',
    category: 'Personal',
    date: '9 Oct 2026',
    color: 'bg-purple-50 border-purple-200 text-purple-950',
  },
  {
    id: 'n6',
    title: 'Project Planning',
    content: 'Q4 milestones, product launch date, beta user onboarding & feedback loops.',
    category: 'Work',
    date: '8 Oct 2026',
    color: 'bg-orange-50 border-orange-200 text-orange-950',
  },
];

export const getStoredTasks = (): TaskItem[] => {
  const data = localStorage.getItem('lifesync_tasks');
  if (!data) {
    localStorage.setItem('lifesync_tasks', JSON.stringify(DEFAULT_TASKS));
    return DEFAULT_TASKS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_TASKS;
  }
};

export const saveTasks = (tasks: TaskItem[]) => {
  localStorage.setItem('lifesync_tasks', JSON.stringify(tasks));
};

export const getStoredGoals = (): GoalItem[] => {
  const data = localStorage.getItem('lifesync_goals');
  if (!data) {
    localStorage.setItem('lifesync_goals', JSON.stringify(DEFAULT_GOALS));
    return DEFAULT_GOALS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_GOALS;
  }
};

export const saveGoals = (goals: GoalItem[]) => {
  localStorage.setItem('lifesync_goals', JSON.stringify(goals));
};

export const getStoredEvents = (): CalendarEvent[] => {
  const data = localStorage.getItem('lifesync_events');
  if (!data) {
    localStorage.setItem('lifesync_events', JSON.stringify(DEFAULT_EVENTS));
    return DEFAULT_EVENTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_EVENTS;
  }
};

export const saveEvents = (events: CalendarEvent[]) => {
  localStorage.setItem('lifesync_events', JSON.stringify(events));
};

export const getStoredNotes = (): NoteItem[] => {
  const data = localStorage.getItem('lifesync_notes');
  if (!data) {
    localStorage.setItem('lifesync_notes', JSON.stringify(DEFAULT_NOTES));
    return DEFAULT_NOTES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_NOTES;
  }
};

export const saveNotes = (notes: NoteItem[]) => {
  localStorage.setItem('lifesync_notes', JSON.stringify(notes));
};
