import { supabase } from '../lib/supabase';
import { Budget } from '../types/database';
import {
  getLocalBudgets,
  createLocalBudget,
  updateLocalBudget,
  deleteLocalBudget,
} from './localStorageFallback';

export const getBudgets = async (userId: string): Promise<Budget[]> => {
  if (userId.startsWith('demo')) {
    return getLocalBudgets(userId);
  }

  try {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Budget[];
  } catch (err) {
    console.warn('Supabase getBudgets failed, using local storage:', err);
    return getLocalBudgets(userId);
  }
};

export const createBudget = async (
  userId: string,
  budgetData: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Budget> => {
  if (userId.startsWith('demo')) {
    return createLocalBudget(userId, budgetData);
  }

  try {
    const { data, error } = await supabase
      .from('budgets')
      .insert([
        {
          ...budgetData,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Budget;
  } catch (err) {
    console.warn('Supabase createBudget failed, creating in local storage:', err);
    return createLocalBudget(userId, budgetData);
  }
};

export const updateBudget = async (budgetId: string, updates: Partial<Budget>): Promise<Budget> => {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', budgetId)
      .select()
      .single();

    if (error) throw error;
    return data as Budget;
  } catch (err) {
    console.warn('Supabase updateBudget failed, updating local storage:', err);
    return updateLocalBudget(budgetId, updates);
  }
};

export const deleteBudget = async (budgetId: string): Promise<void> => {
  try {
    const { error } = await supabase.from('budgets').delete().eq('id', budgetId);
    if (error) throw error;
  } catch (err) {
    console.warn('Supabase deleteBudget failed, deleting from local storage:', err);
    deleteLocalBudget(budgetId);
  }
};

