
export type UserRole = 'admin' | 'provider' | 'supervisor' | 'employee';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  company_id?: string; 
  created_at?: string;
  updated_at?: string;
}

export interface Company {
  id: string;
  name: string;
  subsidy_percentage: number;
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
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  user_id: string;
  lunch_option_id: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'delivered';
  approved_by?: string;
  company_id: string;
  created_at?: string;
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
