import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fcyfoyapezlqijxdxgob.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjeWZveWFwZXpscWlqeGR4Z29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNTY2OTYsImV4cCI6MjA4OTYzMjY5Nn0.ha2TIDMDMXnu_4XFQYJw4F5xWfo_NXAN7KfMhtUCi8c';
const supabase = createClient(supabaseUrl, supabaseKey);

async function signUp() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test@teste.com',
    password: 'password123',
    options: {
      data: {
        name: 'Test User'
      }
    }
  });
  console.log('Error:', error);
  console.log('Data:', data);
}
signUp();
