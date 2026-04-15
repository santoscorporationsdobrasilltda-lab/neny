import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nnwdyxcdwbxopzpwnsry.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ud2R5eGNkd2J4b3B6cHduc3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NzMxNDUsImV4cCI6MjA4NjM0OTE0NX0.x4iQnU0PAanEKTskbz1Ulijb5yD16kivxOHV7Jbk9O4';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
