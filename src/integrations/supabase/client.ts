// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xfzmhyhuyykjlspohgib.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhmem1oeWh1eXlramxzcG9oZ2liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NDU5MzYsImV4cCI6MjA2NzEyMTkzNn0.vSyFI8R0ZomHapRDGT5GrdAUov9nGc68XWrinNNUp9E";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});