import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://vrkkidechcegqiklfzpv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZya2tpZGVjaGNlZ3Fpa2xmenB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNDkwNDYsImV4cCI6MjA5NzcyNTA0Nn0.cfqh9L2wSadFcqzWnopmUizLq4aIlG34QfrvJEOWqZ8";

export const supabase = createClient(supabaseUrl, supabaseKey);