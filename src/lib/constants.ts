
// Define environmental variables with fallbacks for development
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://uuhutcrifpxckmkhiohc.supabase.co";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1aHV0Y3JpZnB4Y2tta2hpb2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0ODUyMzEsImV4cCI6MjA1ODA2MTIzMX0.lqGJm-7-48fDImgEflF8xFXIwRA3BkC9MR2dNk6a2go";

// Extract Supabase project ID for convenience
export const SUPABASE_PROJECT_ID = SUPABASE_URL ? SUPABASE_URL.split('.')[0].split('//')[1] : "";

// Log environment variables for debugging
console.log(`Environment: ${import.meta.env.MODE}`);
console.log(`Base URL: ${window.location.origin}`);
console.log(`Hostname: ${window.location.hostname}`);
console.log(`Supabase URL configured: ${SUPABASE_URL ? "Yes" : "No"}`);
console.log(`Supabase Key configured: ${SUPABASE_ANON_KEY ? "Yes (length: " + SUPABASE_ANON_KEY.length + ")" : "No"}`);
console.log(`Detected Supabase Project ID: ${SUPABASE_PROJECT_ID}`);

// Test function to verify Supabase connection is working
export const testSupabaseConnection = async () => {
  try {
    // Import dynamically to prevent circular dependencies
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Simple test query to check connection
    const { data, error } = await supabase.from('companies').select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error("Supabase connection test failed:", error);
      return { success: false, error };
    }
    
    console.log("Supabase connection test successful");
    return { success: true };
  } catch (error) {
    console.error("Unexpected error testing Supabase connection:", error);
    return { success: false, error };
  }
};

// Detailed CORS instructions for Supabase
console.log("==== CORS CONFIGURATION GUIDE ====");
console.log(`Your current domain is: ${window.location.origin}`);
console.log("To properly configure CORS in Supabase:");
console.log(`1. Go to https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/settings/api`);
console.log("2. Scroll down to 'CORS (Cross-Origin Resource Sharing)'");
console.log(`3. Add your domain: ${window.location.origin} to the list`);
console.log("4. Add both your preview domain and production domains (e.g., https://micomida.online)");
console.log("5. Save changes");
console.log("==============================");

// For deployed environments, suggest checking Netlify environment variables
if (import.meta.env.MODE === 'production') {
  console.log(`IMPORTANT: If you're seeing connection issues on a deployed site, verify that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your Netlify environment variables.`);
  console.log(`Also verify that CORS is properly configured in Supabase to allow requests from your domain: ${window.location.origin}`);
}

// Validate current origin is in the approved origins list
export const validateOrigin = () => {
  const currentOrigin = window.location.origin;
  const approvedOrigins = ['https://micomida.online']; // Production domain
  
  // In development, add localhost origins
  if (import.meta.env.MODE === 'development') {
    approvedOrigins.push('http://localhost:5173', 'http://localhost:3000');
  }
  
  // Check if current origin is in approved list
  const isApproved = approvedOrigins.includes(currentOrigin);
  
  if (!isApproved) {
    console.warn(`Current origin ${currentOrigin} is not in the approved origins list. You may need to add it to Supabase CORS settings.`);
  }
  
  return isApproved;
};

// Call validation on load
validateOrigin();
