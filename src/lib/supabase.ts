import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ivdujxsmiaeyryrlufcd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2ZHVqeHNtaWFleXJ5cmx1ZmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MDc3MDcsImV4cCI6MjA4MTk4MzcwN30.hOx04bP2YVRXOD5k3zngyBuU_9JeTyotC1eHtdwL0Sw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
