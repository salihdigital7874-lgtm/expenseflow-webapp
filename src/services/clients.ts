import { supabase } from '../lib/supabase';
import { Client } from '../types/database';
import {
  getLocalClients,
  createLocalClient,
  updateLocalClient,
  deleteLocalClient,
} from './localStorageFallback';

export const getClients = async (userId: string): Promise<Client[]> => {
  if (userId.startsWith('demo')) {
    return getLocalClients(userId);
  }

  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Client[];
  } catch (err) {
    console.warn('Supabase getClients failed, using local storage:', err);
    return getLocalClients(userId);
  }
};

export const createClient = async (
  userId: string,
  clientData: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'balance_amount'>
): Promise<Client> => {
  if (userId.startsWith('demo')) {
    return createLocalClient(userId, clientData);
  }

  const balance_amount = (clientData.total_amount || 0) - (clientData.paid_amount || 0);

  try {
    const { data, error } = await supabase
      .from('clients')
      .insert([
        {
          ...clientData,
          user_id: userId,
          balance_amount,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Client;
  } catch (err) {
    console.warn('Supabase createClient failed, creating in local storage:', err);
    return createLocalClient(userId, clientData);
  }
};

export const updateClient = async (clientId: string, updates: Partial<Client>): Promise<Client> => {
  try {
    if (updates.total_amount !== undefined || updates.paid_amount !== undefined) {
      const { data: existing } = await supabase.from('clients').select('total_amount, paid_amount').eq('id', clientId).single();
      if (existing) {
        const total = updates.total_amount !== undefined ? updates.total_amount : existing.total_amount;
        const paid = updates.paid_amount !== undefined ? updates.paid_amount : existing.paid_amount;
        updates.balance_amount = total - paid;
      }
    }

    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', clientId)
      .select()
      .single();

    if (error) throw error;
    return data as Client;
  } catch (err) {
    console.warn('Supabase updateClient failed, updating local storage:', err);
    return updateLocalClient(clientId, updates);
  }
};

export const deleteClient = async (clientId: string): Promise<void> => {
  try {
    const { error } = await supabase.from('clients').delete().eq('id', clientId);
    if (error) throw error;
  } catch (err) {
    console.warn('Supabase deleteClient failed, deleting from local storage:', err);
    deleteLocalClient(clientId);
  }
};

