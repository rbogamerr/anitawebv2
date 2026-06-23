import { createClient } from '@supabase/supabase-js';

// Credenciales directas proporcionadas
const supabaseUrl = "https://vrkkidechcegqiklfzpv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZya2tpZGVjaGNlZ3Fpa2xmenB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNDkwNDYsImV4cCI6MjA5NzcyNTA0Nn0.cfqh9L2wSadFcqzWnopmUizLq4aIlG34QfrvJEOWqZ8";

// Se priorizan las variables de entorno de Vercel si existen, si no, usa tus claves fijas
const finalUrl = import.meta.env.VITE_SUPABASE_URL || supabaseUrl;
const finalKey = import.meta.env.VITE_SUPABASE_ANON_KEY || supabaseKey;

export const supabase = createClient(finalUrl, finalKey);