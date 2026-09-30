import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import { Expense, Income, Client, Budget, Profile } from './types/database';
import { Layout, TabType } from './components/Layout';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';

import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { HealthPage } from './pages/Health';
import { Expenses } from './pages/Expenses';
import { IncomePage } from './pages/Income';
import { ClientBalances } from './pages/ClientBalances';
import { Budgets } from './pages/Budgets';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

import { getProfile } from './services/profiles';
import { getExpenses, createExpense, updateExpense, deleteExpense } from './services/expenses';
import { getIncome, createIncome, updateIncome, deleteIncome } from './services/income';
import { getClients, createClient, updateClient, deleteClient } from './services/clients';
import { getBudgets, createBudget, updateBudget, deleteBudget } from './services/budgets';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [profile, setProfile] = useState<Profile | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showToast = (message: string, type: ToastType) => {
    const newToast: ToastMessage = {
      id: Date.now().toString() + Math.random().toString(),
      type,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth state listener & Demo mode check
  useEffect(() => {
    const isDemo = localStorage.getItem('expenseflow_demo_mode') === 'true';
    if (isDemo) {
      setUser({
        id: 'demo-user-123',
        email: 'adshopmarketing1@gmail.com',
        app_metadata: {},
        user_metadata: { full_name: 'Muhammed Salih' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as any);
      setAuthLoading(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
        }
        setAuthLoading(false);
      })
      .catch(() => {
        setAuthLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else if (localStorage.getItem('expenseflow_demo_mode') !== 'true') {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch application data when authenticated
  const loadData = async (userId: string) => {
    setDataLoading(true);
    try {
      const [profData, expData, incData, cliData, budData] = await Promise.all([
        getProfile(userId).catch(() => null),
        getExpenses(userId).catch(() => []),
        getIncome(userId).catch(() => []),
        getClients(userId).catch(() => []),
        getBudgets(userId).catch(() => []),
      ]);

      setProfile(profData);
      setExpenses(expData);
      setIncome(incData);
      setClients(cliData);
      setBudgets(budData);
    } catch (err: any) {
      showToast('Error loading application data: ' + err.message, 'error');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData(user.id);
    } else {
      setExpenses([]);
      setIncome([]);
      setClients([]);
      setBudgets([]);
      setProfile(null);
    }
  }, [user]);

  const handleLogout = async () => {
    localStorage.removeItem('expenseflow_demo_mode');
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setUser(null);
    showToast('Signed out of session', 'info');
  };


  // CRUD Handlers - Expenses
  const handleAddExpense = async (data: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    try {
      const created = await createExpense(user.id, data);
      setExpenses((prev) => [created, ...prev]);
      showToast('Expense added successfully to Supabase!', 'success');
    } catch (err: any) {
      showToast('Failed to add expense: ' + err.message, 'error');
      throw err;
    }
  };

  const handleUpdateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      const updated = await updateExpense(id, updates);
      setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
      showToast('Expense updated successfully!', 'success');
    } catch (err: any) {
      showToast('Failed to update expense: ' + err.message, 'error');
      throw err;
    }
  };

  const handleDeleteExpense = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Expense',
      message: 'Are you sure you want to delete this expense record? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteExpense(id);
          setExpenses((prev) => prev.filter((e) => e.id !== id));
          showToast('Expense deleted from Supabase', 'success');
        } catch (err: any) {
          showToast('Failed to delete expense: ' + err.message, 'error');
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // CRUD Handlers - Income
  const handleAddIncome = async (data: Omit<Income, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    try {
      const created = await createIncome(user.id, data);
      setIncome((prev) => [created, ...prev]);
      if (user) loadData(user.id); // reload to get updated client balances
      showToast('Income record saved to Supabase!', 'success');
    } catch (err: any) {
      showToast('Failed to save income: ' + err.message, 'error');
      throw err;
    }
  };

  const handleUpdateIncome = async (id: string, updates: Partial<Income>) => {
    try {
      const updated = await updateIncome(id, updates);
      setIncome((prev) => prev.map((i) => (i.id === id ? updated : i)));
      showToast('Income record updated!', 'success');
    } catch (err: any) {
      showToast('Failed to update income: ' + err.message, 'error');
      throw err;
    }
  };

  const handleDeleteIncome = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Income Record',
      message: 'Are you sure you want to delete this income record?',
      onConfirm: async () => {
        try {
          await deleteIncome(id);
          setIncome((prev) => prev.filter((i) => i.id !== id));
          showToast('Income record deleted', 'success');
        } catch (err: any) {
          showToast('Failed to delete income: ' + err.message, 'error');
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // CRUD Handlers - Clients
  const handleAddClient = async (
    data: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'balance_amount'>
  ) => {
    if (!user) return;
    try {
      const created = await createClient(user.id, data);
      setClients((prev) => [created, ...prev]);
      showToast('Client added to Supabase!', 'success');
    } catch (err: any) {
      showToast('Failed to add client: ' + err.message, 'error');
      throw err;
    }
  };

  const handleUpdateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const updated = await updateClient(id, updates);
      setClients((prev) => prev.map((c) => (c.id === id ? updated : c)));
      showToast('Client ledger updated!', 'success');
    } catch (err: any) {
      showToast('Failed to update client: ' + err.message, 'error');
      throw err;
    }
  };

  const handleDeleteClient = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Client',
      message: 'Are you sure you want to delete this client record?',
      onConfirm: async () => {
        try {
          await deleteClient(id);
          setClients((prev) => prev.filter((c) => c.id !== id));
          showToast('Client record deleted', 'success');
        } catch (err: any) {
          showToast('Failed to delete client: ' + err.message, 'error');
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // CRUD Handlers - Budgets
  const handleAddBudget = async (data: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    try {
      const created = await createBudget(user.id, data);
      setBudgets((prev) => [created, ...prev]);
      showToast('Budget allocated in Supabase!', 'success');
    } catch (err: any) {
      showToast('Failed to set budget: ' + err.message, 'error');
      throw err;
    }
  };

  const handleUpdateBudget = async (id: string, updates: Partial<Budget>) => {
    try {
      const updated = await updateBudget(id, updates);
      setBudgets((prev) => prev.map((b) => (b.id === id ? updated : b)));
      showToast('Budget updated!', 'success');
    } catch (err: any) {
      showToast('Failed to update budget: ' + err.message, 'error');
      throw err;
    }
  };

  const handleDeleteBudget = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Budget',
      message: 'Are you sure you want to delete this category budget limit?',
      onConfirm: async () => {
        try {
          await deleteBudget(id);
          setBudgets((prev) => prev.filter((b) => b.id !== id));
          showToast('Budget allocation deleted', 'success');
        } catch (err: any) {
          showToast('Failed to delete budget: ' + err.message, 'error');
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleResetDataWithAuth = async (
    type: 'all' | 'expenses' | 'income' | 'clients' | 'budgets',
    passwordInput: string
  ) => {
    if (!user) throw new Error('No active user session found.');

    const isDemoMode = localStorage.getItem('expenseflow_demo_mode') === 'true';

    // Verify Password Authentication
    if (!isDemoMode && user.email) {
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordInput,
      });
      if (error) {
        throw new Error('Invalid password authentication. Access denied.');
      }
    } else {
      // In demo mode check password input is non-empty
      if (!passwordInput || passwordInput.trim().length === 0) {
        throw new Error('Please enter your account password to authorize data reset.');
      }
    }

    // Execute resetting of selected records
    try {
      if (type === 'all' || type === 'expenses') {
        localStorage.removeItem('expenseflow_local_expenses');
        setExpenses([]);
        if (!isDemoMode) {
          await supabase.from('expenses').delete().eq('user_id', user.id);
        }
      }

      if (type === 'all' || type === 'income') {
        localStorage.removeItem('expenseflow_local_income');
        setIncome([]);
        if (!isDemoMode) {
          await supabase.from('income').delete().eq('user_id', user.id);
        }
      }

      if (type === 'all' || type === 'clients') {
        localStorage.removeItem('expenseflow_local_clients');
        setClients([]);
        if (!isDemoMode) {
          await supabase.from('clients').delete().eq('user_id', user.id);
        }
      }

      if (type === 'all' || type === 'budgets') {
        localStorage.removeItem('expenseflow_local_budgets');
        setBudgets([]);
        if (!isDemoMode) {
          await supabase.from('budgets').delete().eq('user_id', user.id);
        }
      }

      if (type === 'all') {
        localStorage.removeItem('expenseflow_local_profile');
      }

      const label = type === 'all' ? 'all application data' : `${type} records`;

      showToast(`Authentication verified. Successfully reset ${label}!`, 'success');
    } catch (err: any) {
      showToast('Error resetting data: ' + err.message, 'error');
      throw err;
    }
  };

  const handleResetAllData = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset All Application Data',
      message:
        'Are you sure you want to reset ALL data? This will permanently delete all recorded expenses, income, client balance ledgers, and budget allocations.',
      onConfirm: async () => {
        try {
          // Clear LocalStorage keys
          localStorage.removeItem('expenseflow_local_expenses');
          localStorage.removeItem('expenseflow_local_income');
          localStorage.removeItem('expenseflow_local_clients');
          localStorage.removeItem('expenseflow_local_budgets');
          localStorage.removeItem('expenseflow_local_profile');

          // Reset local React state
          setExpenses([]);
          setIncome([]);
          setClients([]);
          setBudgets([]);
          setProfile(null);

          // Clear Supabase tables if authenticated user
          if (user && !user.id.startsWith('demo')) {
            try {
              await supabase.from('expenses').delete().eq('user_id', user.id);
              await supabase.from('income').delete().eq('user_id', user.id);
              await supabase.from('clients').delete().eq('user_id', user.id);
              await supabase.from('budgets').delete().eq('user_id', user.id);
            } catch (e) {
              console.warn('Could not reset Supabase tables:', e);
            }
          }

          showToast('All application data has been completely reset to zero.', 'success');
        } catch (err: any) {
          showToast('Failed to reset data: ' + err.message, 'error');
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-indigo-400">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Auth onSuccess={() => {}} showToast={showToast} />
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </>
    );
  }

  const currency = profile?.currency || 'INR';

  return (
    <Layout
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      onSearch={(q) => setSearchQuery(q)}
      userEmail={user.email}
      profile={profile}
      onLogout={handleLogout}
      showToast={showToast}
    >
      {dataLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-zinc-400">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold">Synchronizing PostgreSQL records...</p>
        </div>
      ) : (
        <>
          {currentTab === 'dashboard' && (
            <Dashboard
              expenses={expenses}
              income={income}
              clients={clients}
              budgets={budgets}
              currency={currency}
              onNavigate={(tab) => setCurrentTab(tab)}
              onAddExpense={handleAddExpense}
            />
          )}

          {currentTab === 'health' && (
            <HealthPage showToast={showToast} />
          )}

          {currentTab === 'expenses' && (
            <Expenses
              expenses={expenses}
              currency={currency}
              onAdd={handleAddExpense}
              onUpdate={handleUpdateExpense}
              onDelete={handleDeleteExpense}
              initialSearch={searchQuery}
            />
          )}

          {currentTab === 'income' && (
            <IncomePage
              incomeList={income}
              clients={clients}
              currency={currency}
              onAdd={handleAddIncome}
              onUpdate={handleUpdateIncome}
              onDelete={handleDeleteIncome}
            />
          )}

          {currentTab === 'clients' && (
            <ClientBalances
              clients={clients}
              income={income}
              currency={currency}
              onAdd={handleAddClient}
              onUpdate={handleUpdateClient}
              onDelete={handleDeleteClient}
              onAddIncome={handleAddIncome}
            />
          )}

          {currentTab === 'budgets' && (
            <Budgets
              budgets={budgets}
              expenses={expenses}
              currency={currency}
              onAdd={handleAddBudget}
              onUpdate={handleUpdateBudget}
              onDelete={handleDeleteBudget}
            />
          )}

          {currentTab === 'reports' && (
            <Reports expenses={expenses} income={income} budgets={budgets} currency={currency} />
          )}

          {currentTab === 'settings' && (
            <Settings
              userId={user.id}
              userEmail={user.email}
              isDemoMode={localStorage.getItem('expenseflow_demo_mode') === 'true'}
              profile={profile}
              onProfileUpdated={setProfile}
              onResetDataWithAuth={handleResetDataWithAuth}
              onResetAllData={handleResetAllData}
              showToast={showToast}
            />
          )}
        </>
      )}


      {/* Global Modals and Notifications */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </Layout>
  );
};

export default App;
