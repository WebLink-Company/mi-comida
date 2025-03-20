
export type UserRole = 'employee' | 'supervisor' | 'provider';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
}

export interface Company {
  id: string;
  name: string;
  subsidyPercentage: number;
  logo?: string;
}

export interface LunchOption {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  tags: string[];
}

export interface Order {
  id: string;
  userId: string;
  lunchOptionId: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'delivered';
  createdAt: string;
  approvedBy?: string;
}

export interface DashboardStats {
  dailyOrders: number;
  weeklyOrders: number;
  monthlyOrders: number;
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
}
