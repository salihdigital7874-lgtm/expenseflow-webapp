import { Profile, Client, Expense, Income, Budget } from '../types/database';

const KEYS = {
  PROFILE: 'expenseflow_local_profile',
  CLIENTS: 'expenseflow_local_clients',
  EXPENSES: 'expenseflow_local_expenses',
  INCOME: 'expenseflow_local_income',
  BUDGETS: 'expenseflow_local_budgets',
};

export const INITIAL_DEMO_DATA = {
  profile: {
    id: 'demo-user-123',
    full_name: 'Muhammed Salih',
    email: 'adshopmarketing1@gmail.com',
    company_name: 'Salih Digital',
    phone: '+91 98765 43210',
    currency: 'INR',
    app_name: 'Salih Expense',
    app_subtitle: 'Business Portal',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as Profile,

  clients: [
    {
      id: 'client-1',
      user_id: 'demo-user-123',
      name: 'Alpha Corp Ltd',
      email: 'contact@alphacorp.com',
      phone: '+91 98980 11223',
      total_amount: 120000,
      paid_amount: 85000,
      balance_amount: 35000,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'client-2',
      user_id: 'demo-user-123',
      name: 'Beta Technologies',
      email: 'accounts@betatech.io',
      phone: '+91 97766 55443',
      total_amount: 90000,
      paid_amount: 45000,
      balance_amount: 45000,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'client-3',
      user_id: 'demo-user-123',
      name: 'Gamma Solutions',
      email: 'billing@gammasolutions.in',
      phone: '+91 91234 56789',
      total_amount: 50000,
      paid_amount: 20000,
      balance_amount: 30000,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ] as Client[],

  expenses: [
    {
      id: 'exp-1',
      user_id: 'demo-user-123',
      amount: 12500,
      category: 'Office & Hardware',
      description: 'Ergonomic Desk Chair & Accessories',
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      payment_method: 'UPI' as const,
      notes: 'Purchased for new office workstation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'exp-2',
      user_id: 'demo-user-123',
      amount: 8400,
      category: 'Cloud & Servers',
      description: 'AWS & Vercel Cloud Hosting Renewal',
      date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
      payment_method: 'Credit Card' as const,
      notes: 'Monthly server production infrastructure',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'exp-3',
      user_id: 'demo-user-123',
      amount: 15000,
      category: 'Digital Marketing',
      description: 'Google & Meta Ad Campaign spend',
      date: new Date(Date.now() - 86400000 * 8).toISOString().split('T')[0],
      payment_method: 'Bank Transfer' as const,
      notes: 'Q3 lead generation campaign',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'exp-4',
      user_id: 'demo-user-123',
      amount: 3200,
      category: 'Team Meals',
      description: 'Client Meeting Lunch & Beverages',
      date: new Date(Date.now() - 86400000 * 12).toISOString().split('T')[0],
      payment_method: 'Cash' as const,
      notes: 'Dinner meeting with Alpha Corp reps',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ] as Expense[],

  income: [
    {
      id: 'inc-1',
      user_id: 'demo-user-123',
      client_id: 'client-1',
      amount: 85000,
      description: 'Web Application Development Phase 1 Milestone',
      date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
      payment_status: 'paid' as const,
      notes: 'Direct bank payout received',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'inc-2',
      user_id: 'demo-user-123',
      client_id: 'client-2',
      amount: 45000,
      description: 'UI/UX Design Retainer Payment',
      date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
      payment_status: 'paid' as const,
      notes: 'Monthly design retainer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'inc-3',
      user_id: 'demo-user-123',
      client_id: 'client-3',
      amount: 30000,
      description: 'Mobile App Architecture Consultation',
      date: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
      payment_status: 'pending' as const,
      notes: 'Invoice sent, due in 5 days',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ] as Income[],

  budgets: [
    {
      id: 'bud-1',
      user_id: 'demo-user-123',
      category: 'Digital Marketing',
      budget_amount: 25000,
      start_date: new Date(Date.now() - 86400000 * 30).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'bud-2',
      user_id: 'demo-user-123',
      category: 'Cloud & Servers',
      budget_amount: 15000,
      start_date: new Date(Date.now() - 86400000 * 30).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'bud-3',
      user_id: 'demo-user-123',
      category: 'Office & Hardware',
      budget_amount: 20000,
      start_date: new Date(Date.now() - 86400000 * 30).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ] as Budget[],
};

// Local storage helper functions
export const getLocalProfile = (userId: string): Profile => {
  const data = localStorage.getItem(KEYS.PROFILE);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {}
  }
  const defaultProf = { ...INITIAL_DEMO_DATA.profile, id: userId };
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(defaultProf));
  return defaultProf;
};

export const saveLocalProfile = (userId: string, updates: Partial<Profile>): Profile => {
  const current = getLocalProfile(userId);
  const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(updated));
  return updated;
};

export const getLocalExpenses = (userId: string): Expense[] => {
  const data = localStorage.getItem(KEYS.EXPENSES);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {}
  }
  localStorage.setItem(KEYS.EXPENSES, JSON.stringify(INITIAL_DEMO_DATA.expenses));
  return INITIAL_DEMO_DATA.expenses;
};

export const createLocalExpense = (userId: string, expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Expense => {
  const expenses = getLocalExpenses(userId);
  const newExp: Expense = {
    ...expense,
    id: 'exp-' + Date.now(),
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const updated = [newExp, ...expenses];
  localStorage.setItem(KEYS.EXPENSES, JSON.stringify(updated));
  return newExp;
};

export const updateLocalExpense = (id: string, updates: Partial<Expense>): Expense => {
  const expenses = getLocalExpenses('demo');
  const index = expenses.findIndex((e) => e.id === id);
  if (index === -1) throw new Error('Expense not found');
  const updatedItem = { ...expenses[index], ...updates, updated_at: new Date().toISOString() };
  expenses[index] = updatedItem;
  localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  return updatedItem;
};

export const deleteLocalExpense = (id: string): void => {
  const expenses = getLocalExpenses('demo').filter((e) => e.id !== id);
  localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
};

export const getLocalClients = (userId: string): Client[] => {
  const data = localStorage.getItem(KEYS.CLIENTS);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {}
  }
  localStorage.setItem(KEYS.CLIENTS, JSON.stringify(INITIAL_DEMO_DATA.clients));
  return INITIAL_DEMO_DATA.clients;
};

export const createLocalClient = (userId: string, clientData: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'balance_amount'>): Client => {
  const clients = getLocalClients(userId);
  const total = Number(clientData.total_amount || 0);
  const paid = Number(clientData.paid_amount || 0);
  const newClient: Client = {
    ...clientData,
    id: 'client-' + Date.now(),
    user_id: userId,
    total_amount: total,
    paid_amount: paid,
    balance_amount: total - paid,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const updated = [newClient, ...clients];
  localStorage.setItem(KEYS.CLIENTS, JSON.stringify(updated));
  return newClient;
};

export const updateLocalClient = (id: string, updates: Partial<Client>): Client => {
  const clients = getLocalClients('demo');
  const index = clients.findIndex((c) => c.id === id);
  if (index === -1) throw new Error('Client not found');

  const existing = clients[index];
  const total = updates.total_amount !== undefined ? updates.total_amount : existing.total_amount;
  const paid = updates.paid_amount !== undefined ? updates.paid_amount : existing.paid_amount;
  const updatedItem = { ...existing, ...updates, balance_amount: total - paid, updated_at: new Date().toISOString() };
  clients[index] = updatedItem;
  localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
  return updatedItem;
};

export const deleteLocalClient = (id: string): void => {
  const clients = getLocalClients('demo').filter((c) => c.id !== id);
  localStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
};

export const getLocalIncome = (userId: string): Income[] => {
  const data = localStorage.getItem(KEYS.INCOME);
  if (data) {
    try {
      const items: Income[] = JSON.parse(data);
      const clients = getLocalClients(userId);
      return items.map((inc) => ({
        ...inc,
        client: clients.find((c) => c.id === inc.client_id) || null,
      }));
    } catch (e) {}
  }
  const clients = INITIAL_DEMO_DATA.clients;
  const items = INITIAL_DEMO_DATA.income.map((inc) => ({
    ...inc,
    client: clients.find((c) => c.id === inc.client_id) || null,
  }));
  localStorage.setItem(KEYS.INCOME, JSON.stringify(INITIAL_DEMO_DATA.income));
  return items;
};

export const createLocalIncome = (userId: string, incomeData: Omit<Income, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Income => {
  const items = getLocalIncome(userId);
  const clients = getLocalClients(userId);
  const clientObj = clients.find((c) => c.id === incomeData.client_id) || null;

  const newInc: Income = {
    ...incomeData,
    id: 'inc-' + Date.now(),
    user_id: userId,
    client: clientObj,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const rawList = [newInc, ...items].map(({ client, ...rest }) => rest);
  localStorage.setItem(KEYS.INCOME, JSON.stringify(rawList));

  if (incomeData.client_id && incomeData.payment_status === 'paid') {
    const clientIndex = clients.findIndex((c) => c.id === incomeData.client_id);
    if (clientIndex !== -1) {
      const cl = clients[clientIndex];
      const newPaid = cl.paid_amount + Number(incomeData.amount);
      updateLocalClient(cl.id, { paid_amount: newPaid });
    }
  }

  return newInc;
};

export const updateLocalIncome = (id: string, updates: Partial<Income>): Income => {
  const items = getLocalIncome('demo');
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) throw new Error('Income record not found');

  const updatedItem = { ...items[index], ...updates, updated_at: new Date().toISOString() };
  items[index] = updatedItem;

  const rawList = items.map(({ client, ...rest }) => rest);
  localStorage.setItem(KEYS.INCOME, JSON.stringify(rawList));
  return updatedItem;
};

export const deleteLocalIncome = (id: string): void => {
  const items = getLocalIncome('demo').filter((i) => i.id !== id);
  const rawList = items.map(({ client, ...rest }) => rest);
  localStorage.setItem(KEYS.INCOME, JSON.stringify(rawList));
};

export const getLocalBudgets = (userId: string): Budget[] => {
  const data = localStorage.getItem(KEYS.BUDGETS);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {}
  }
  localStorage.setItem(KEYS.BUDGETS, JSON.stringify(INITIAL_DEMO_DATA.budgets));
  return INITIAL_DEMO_DATA.budgets;
};

export const createLocalBudget = (userId: string, budgetData: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Budget => {
  const budgets = getLocalBudgets(userId);
  const newBud: Budget = {
    ...budgetData,
    id: 'bud-' + Date.now(),
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const updated = [newBud, ...budgets];
  localStorage.setItem(KEYS.BUDGETS, JSON.stringify(updated));
  return newBud;
};

export const updateLocalBudget = (id: string, updates: Partial<Budget>): Budget => {
  const budgets = getLocalBudgets('demo');
  const index = budgets.findIndex((b) => b.id === id);
  if (index === -1) throw new Error('Budget not found');

  const updatedItem = { ...budgets[index], ...updates, updated_at: new Date().toISOString() };
  budgets[index] = updatedItem;
  localStorage.setItem(KEYS.BUDGETS, JSON.stringify(budgets));
  return updatedItem;
};

export const deleteLocalBudget = (id: string): void => {
  const budgets = getLocalBudgets('demo').filter((b) => b.id !== id);
  localStorage.setItem(KEYS.BUDGETS, JSON.stringify(budgets));
};
