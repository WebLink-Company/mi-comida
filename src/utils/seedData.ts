
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/lib/types';

/**
 * Seed script to populate test data in the Supabase database
 * This creates one test user for each role with @lunchwise.app email domain
 * It also creates a provider and associates users with it where appropriate
 */

// Helper function to generate UUID
const generateUUID = () => crypto.randomUUID();

// Create a provider first so we can associate users with it
const createProvider = async () => {
  try {
    const providerId = generateUUID();
    
    const { data, error } = await supabase
      .from('providers')
      .insert({
        id: providerId,
        business_name: 'LunchWise Test Provider',
        description: 'A test provider for development purposes',
        contact_email: 'provider@lunchwise.app',
        contact_phone: '+1234567890',
        address: '123 Test Street, Test City',
        logo: 'https://ui-avatars.com/api/?name=LunchWise+Provider&background=0D8ABC&color=fff',
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating provider:', error);
      throw error;
    }

    console.log('Provider created:', data);
    return providerId;
  } catch (error) {
    console.error('Error in createProvider:', error);
    throw error;
  }
};

// Create a company associated with a provider
const createCompany = async (providerId: string) => {
  try {
    const companyId = generateUUID();
    
    const { data, error } = await supabase
      .from('companies')
      .insert({
        id: companyId,
        name: 'LunchWise Test Company',
        subsidy_percentage: 50,
        fixed_subsidy_amount: 10,
        logo: 'https://ui-avatars.com/api/?name=LunchWise+Company&background=0D8ABC&color=fff',
        provider_id: providerId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating company:', error);
      throw error;
    }

    console.log('Company created:', data);
    return companyId;
  } catch (error) {
    console.error('Error in createCompany:', error);
    throw error;
  }
};

// Create a user with Supabase Auth and add to profiles
const createUser = async (
  firstName: string, 
  lastName: string, 
  email: string, 
  password: string, 
  role: UserRole, 
  providerId?: string,
  companyId?: string
) => {
  try {
    // Check if the user already exists
    const { data: existingUsers } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .limit(1);
    
    if (existingUsers && existingUsers.length > 0) {
      console.log(`User ${email} already exists, skipping...`);
      return existingUsers[0].id;
    }
    
    // Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { 
          first_name: firstName, 
          last_name: lastName,
          role
        },
        emailRedirectTo: window.location.origin,
      }
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('No user returned from auth.signUp');
    }

    console.log(`User created with email: ${email}`);

    // The profile should be created automatically via trigger,
    // but we'll update it with provider_id and company_id
    const userId = authData.user.id;
    
    // Update profile with provider_id and company_id if they are provided
    if (providerId || companyId) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          provider_id: providerId || null,
          company_id: companyId || null
        })
        .eq('id', userId);

      if (profileError) {
        throw profileError;
      }
    }

    return userId;
  } catch (error) {
    console.error(`Error creating user ${email}:`, error);
    // If the error is because the user already exists, we can continue
    if (error instanceof Error && 
        (error.message.includes('already exists') || 
         error.message.includes('already registered'))) {
      console.log(`User ${email} already exists, skipping...`);
      // Try to fetch the user ID
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .limit(1);
      
      if (data && data.length > 0) {
        return data[0].id;
      }
    }
    throw error;
  }
};

// Main function to seed all test data
export const seedTestData = async () => {
  console.log('Starting data seeding process...');
  
  try {
    // Step 1: Create provider
    console.log('Creating provider...');
    const providerId = await createProvider();
    
    // Step 2: Create company
    console.log('Creating company...');
    const companyId = await createCompany(providerId);
    
    // Step 3: Create users for each role
    console.log('Creating test users...');
    
    // Admin user
    await createUser(
      'Admin',
      'User',
      'admin@lunchwise.app',
      'Password123!',
      'admin'
    );
    
    // Provider user (associated with the provider we created)
    await createUser(
      'Provider',
      'User',
      'provider@lunchwise.app',
      'Password123!',
      'provider',
      providerId
    );
    
    // Supervisor user (associated with a company)
    await createUser(
      'Supervisor',
      'User',
      'supervisor@lunchwise.app',
      'Password123!',
      'supervisor',
      null,
      companyId
    );
    
    // Employee user (associated with a company)
    await createUser(
      'Employee',
      'User',
      'employee@lunchwise.app',
      'Password123!',
      'employee',
      null,
      companyId
    );
    
    // Company user (associated with a company)
    await createUser(
      'Company',
      'User',
      'company@lunchwise.app',
      'Password123!',
      'company',
      null,
      companyId
    );
    
    console.log('Data seeding completed successfully!');
    
    // Return credentials for testing
    return {
      adminUser: { email: 'admin@lunchwise.app', password: 'Password123!' },
      providerUser: { email: 'provider@lunchwise.app', password: 'Password123!' },
      supervisorUser: { email: 'supervisor@lunchwise.app', password: 'Password123!' },
      employeeUser: { email: 'employee@lunchwise.app', password: 'Password123!' },
      companyUser: { email: 'company@lunchwise.app', password: 'Password123!' },
    };
  } catch (error) {
    console.error('Error seeding test data:', error);
    throw error;
  }
};

// For CLI usage if needed
if (typeof window === 'undefined') {
  seedTestData()
    .then(result => console.log('Seeding completed:', result))
    .catch(error => console.error('Seeding failed:', error));
}
