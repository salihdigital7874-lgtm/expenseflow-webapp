import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://kzcbkfrbddnhbjcsneno.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6Y2JrZnJiZGRuaGJqY3NuZW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNTgyNjYsImV4cCI6MjEwNDYzNDI2Nn0.zPufowwzkk5SWfFVKr64jNUbKQYhb-aV1yol5rOqfM0';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_KEY;

export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    supabaseUrl !== 'https://placeholder-project.supabase.co' &&
    supabaseAnonKey !== 'placeholder-key'
  );
};



export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
