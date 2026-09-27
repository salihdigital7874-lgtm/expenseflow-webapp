import { supabase } from '../lib/supabase';
import { Income } from '../types/database';
import {
  getLocalIncome,
  createLocalIncome,
  updateLocalIncome,
  deleteLocalIncome,
} from './localStorageFallback';

export const getIncome = async (userId: string): Promise<Income[]> => {
  if (userId.startsWith('demo')) {
    return getLocalIncome(userId);
  }

  try {
    const { data, error } = await supabase
      .from('income')
      .select('*, client:clients(id, name)')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as Income[];
  } catch (err) {
    console.warn('Supabase getIncome failed, using local storage:', err);
    return getLocalIncome(userId);
  }
};

export const createIncome = async (
  userId: string,
  incomeData: Omit<Income, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Income> => {
  if (userId.startsWith('demo')) {
    return createLocalIncome(userId, incomeData);
  }

  try {
    const { data, error } = await supabase
      .from('income')
      .insert([
        {
          ...incomeData,
          user_id: userId,
        },
      ])
      .select('*, client:clients(id, name)')
      .single();

    if (error) throw error;

    // If tied to a client and payment_status is paid, update client's paid_amount
    if (incomeData.client_id && incomeData.payment_status === 'paid') {
      const { data: client } = await supabase
        .from('clients')
        .select('paid_amount, total_amount')
        .eq('id', incomeData.client_id)
        .single();

      if (client) {
        const newPaid = Number(client.paid_amount || 0) + Number(incomeData.amount);
        const newBalance = Number(client.total_amount || 0) - newPaid;
        await supabase
          .from('clients')
          .update({ paid_amount: newPaid, balance_amount: newBalance })
          .eq('id', incomeData.client_id);
      }
    }

    return data as Income;
  } catch (err) {
    console.warn('Supabase createIncome failed, creating in local storage:', err);
    return createLocalIncome(userId, incomeData);
  }
};

export const updateIncome = async (incomeId: string, updates: Partial<Income>): Promise<Income> => {
  try {
    const { data, error } = await supabase
      .from('income')
      .update(updates)
      .eq('id', incomeId)
      .select('*, client:clients(id, name)')
      .single();

    if (error) throw error;
    return data as Income;
  } catch (err) {
    console.warn('Supabase updateIncome failed, updating local storage:', err);
    return updateLocalIncome(incomeId, updates);
  }
};

export const deleteIncome = async (incomeId: string): Promise<void> => {
  try {
    const { error } = await supabase.from('income').delete().eq('id', incomeId);
    if (error) throw error;
  } catch (err) {
    console.warn('Supabase deleteIncome failed, deleting from local storage:', err);
    deleteLocalIncome(incomeId);
  }
};

