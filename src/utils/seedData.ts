
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
};

// Create a company associated with a provider
const createCompany = async (providerId: string) => {
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
    // Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for testing
      user_metadata: { 
        first_name: firstName, 
        last_name: lastName,
        role
      }
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('No user returned from auth.admin.createUser');
    }

    console.log(`User created with email: ${email}`);

    // Create profile in profiles table (this should happen automatically via trigger,
    // but we'll do it manually to ensure provider_id and company_id are set correctly)
    const userId = authData.user.id;
    
    // We need to explicitly cast the role to the database type here
    // to ensure TypeScript compatibility
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        email,
        role: role as any, // Type casting to resolve the compatibility issue
        provider_id: providerId || null,
        company_id: companyId || null
      });

    if (profileError) {
      throw profileError;
    }

    return userId;
  } catch (error) {
    console.error(`Error creating user ${email}:`, error);
    // If the error is because the user already exists, we can continue
    if (error instanceof Error && error.message.includes('already exists')) {
      console.log(`User ${email} already exists, skipping...`);
      return null;
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
