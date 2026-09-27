import { supabase } from '../lib/supabase';
import { Expense } from '../types/database';
import {
  getLocalExpenses,
  createLocalExpense,
  updateLocalExpense,
  deleteLocalExpense,
} from './localStorageFallback';

export const getExpenses = async (userId: string, search?: string, category?: string): Promise<Expense[]> => {
  if (userId.startsWith('demo')) {
    let list = getLocalExpenses(userId);
    if (category && category !== 'all') {
      list = list.filter((e) => e.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.description?.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.notes?.toLowerCase().includes(q)
      );
    }
    return list;
  }

  try {
    let query = supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`description.ilike.%${search}%,category.ilike.%${search}%,notes.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Expense[];
  } catch (err) {
    console.warn('Supabase getExpenses failed, using local storage:', err);
    let list = getLocalExpenses(userId);
    if (category && category !== 'all') {
      list = list.filter((e) => e.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.description?.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.notes?.toLowerCase().includes(q)
      );
    }
    return list;
  }
};

export const createExpense = async (
  userId: string,
  expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Expense> => {
  if (userId.startsWith('demo')) {
    return createLocalExpense(userId, expense);
  }

  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([{ ...expense, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data as Expense;
  } catch (err) {
    console.warn('Supabase createExpense failed, writing to local storage:', err);
    return createLocalExpense(userId, expense);
  }
};

export const updateExpense = async (expenseId: string, updates: Partial<Expense>): Promise<Expense> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', expenseId)
      .select()
      .single();

    if (error) throw error;
    return data as Expense;
  } catch (err) {
    console.warn('Supabase updateExpense failed, updating local storage:', err);
    return updateLocalExpense(expenseId, updates);
  }
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  try {
    const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
    if (error) throw error;
  } catch (err) {
    console.warn('Supabase deleteExpense failed, deleting from local storage:', err);
    deleteLocalExpense(expenseId);
  }
};

