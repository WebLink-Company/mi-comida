
export type UserRole = 'admin' | 'provider' | 'supervisor' | 'employee' | 'company';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  name?: string; // Added for compatibility
  email: string;
  role: UserRole;
  company_id?: string;
  companyId?: string; // Added for compatibility 
  provider_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Company {
  id: string;
  name: string;
  subsidy_percentage: number;
  subsidyPercentage?: number; // Added for compatibility
  fixed_subsidy_amount?: number; // Fixed subsidy amount
  fixedSubsidyAmount?: number; // Added for compatibility
  logo?: string;
  provider_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface LunchOption {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  tags: string[];
  provider_id: string;
  menu_type?: string; // Added for predefined/component options
  is_extra?: boolean; // Added for extra items
  category_id?: string; // Added for category association
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  user_id: string;
  userId?: string; // Added for compatibility
  lunch_option_id: string;
  lunchOptionId?: string; // Added for compatibility
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'delivered';
  approved_by?: string;
  approvedBy?: string; // Added for compatibility
  company_id?: string;
  companyId?: string; // Added for compatibility
  created_at?: string;
  createdAt?: string; // Added for compatibility
  updated_at?: string;
}

export interface DashboardStats {
  dailyOrders: number;
  weeklyOrders: number;
  monthlyOrders: number;
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
}

export interface Session {
  user: User | null;
  expires_at?: number;
}

export interface Provider {
  id: string;
  business_name: string;
  address?: string;
  contact_email: string;
  contact_phone?: string;
  logo?: string;
  is_active?: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CompanyWithProvider extends Company {
  provider_name?: string;
  providers?: Provider | null;
}
