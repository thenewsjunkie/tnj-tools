import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://gpmandlkcdompmdvethh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbWFuZGxrY2RvbXBtZHZldGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0NjM2NjcsImV4cCI6MjA0ODAzOTY2N30.KxzySIkXxhNgBWUdSpaASLZWjq8AAMeXgPmaBdnYfHI";

export const supabase = createClient(supabaseUrl, supabaseKey);