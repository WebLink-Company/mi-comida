
// Define environmental variables with fallbacks for development
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://uuhutcrifpxckmkhiohc.supabase.co";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1aHV0Y3JpZnB4Y2tta2hpb2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0ODUyMzEsImV4cCI6MjA1ODA2MTIzMX0.lqGJm-7-48fDImgEflF8xFXIwRA3BkC9MR2dNk6a2go";

// Log environment variables for debugging
console.log(`Environment: ${import.meta.env.MODE}`);
console.log(`Base URL: ${window.location.origin}`);
console.log(`Hostname: ${window.location.hostname}`);
console.log(`Supabase URL configured: ${SUPABASE_URL ? "Yes" : "No"}`);
console.log(`Supabase Key configured: ${SUPABASE_ANON_KEY ? "Yes (length: " + SUPABASE_ANON_KEY.length + ")" : "No"}`);

// Detailed CORS instructions for Supabase
console.log("==== CORS CONFIGURATION GUIDE ====");
console.log(`Your current domain is: ${window.location.origin}`);
console.log("To properly configure CORS in Supabase:");
console.log("1. Go to https://supabase.com/dashboard/project/uuhutcrifpxckmkhiohc");
console.log("2. Navigate to Project Settings > API");
console.log("3. Scroll down to 'CORS (Cross-Origin Resource Sharing)'");
console.log(`4. Add your domain: ${window.location.origin} to the list`);
console.log("5. Save changes");
console.log("==============================");

// For deployed environments, suggest checking Netlify environment variables
if (import.meta.env.MODE === 'production') {
  console.log(`IMPORTANT: If you're seeing connection issues on a deployed site, verify that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your Netlify environment variables.`);
  console.log(`Also verify that CORS is properly configured in Supabase to allow requests from your domain: ${window.location.origin}`);
}

// Other app constants can go here
