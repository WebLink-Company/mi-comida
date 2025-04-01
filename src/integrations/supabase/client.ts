// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://uuhutcrifpxckmkhiohc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1aHV0Y3JpZnB4Y2tta2hpb2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0ODUyMzEsImV4cCI6MjA1ODA2MTIzMX0.lqGJm-7-48fDImgEflF8xFXIwRA3BkC9MR2dNk6a2go";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'lunchwise-auth-token',
    debug: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'lunchwise-app',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 1,
    },
  },
});

// Clean up any stale auth data in local storage that might cause issues
try {
  if (typeof localStorage !== 'undefined') {
    // Only keep the main storage key as it's handled by the auth mechanism
    const currentSession = localStorage.getItem('lunchwise-auth-token');
    if (!currentSession) {
      localStorage.removeItem('supabase.auth.token');
    }
  }
} catch (error) {
  console.error('Error cleaning up auth storage:', error);
}

// Add an error handler to catch and prevent recursive logging
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    // Clear any local storage items that might be causing issues
    try {
      localStorage.removeItem('supabase.auth.token');
      // We keep the main storage key as it's handled by the auth mechanism
    } catch (error) {
      console.error('Error cleaning up auth storage on signout:', error);
    }
  }
});
