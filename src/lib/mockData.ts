
import { Company, LunchOption, Order, User, DashboardStats } from './types';

export const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Acme Inc.',
    subsidyPercentage: 50,
    logo: 'https://via.placeholder.com/150'
  },
  {
    id: '2',
    name: 'TechCorp',
    subsidyPercentage: 75,
    logo: 'https://via.placeholder.com/150'
  },
  {
    id: '3',
    name: 'Global Solutions',
    subsidyPercentage: 40,
    logo: 'https://via.placeholder.com/150'
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan.perez@acme.com',
    role: 'employee',
    companyId: '1'
  },
  {
    id: '2',
    name: 'Ana Gómez',
    email: 'ana.gomez@acme.com',
    role: 'supervisor',
    companyId: '1'
  },
  {
    id: '3',
    name: 'Carlos López',
    email: 'carlos@foodco.com',
    role: 'provider',
    companyId: '3'
  },
  {
    id: '4',
    name: 'María Rodríguez',
    email: 'maria@techcorp.com',
    role: 'employee',
    companyId: '2'
  },
  {
    id: '5',
    name: 'Pedro Sánchez',
    email: 'pedro@techcorp.com',
    role: 'supervisor',
    companyId: '2'
  }
];

export const mockLunchOptions: LunchOption[] = [
  {
    id: '1',
    name: 'Ensalada César con Pollo',
    description: 'Ensalada fresca con pollo a la parrilla, croutones y aderezo César',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    available: true,
    tags: ['saludable', 'pollo', 'ensalada']
  },
  {
    id: '2',
    name: 'Pasta Carbonara',
    description: 'Pasta italiana con salsa cremosa, tocino y queso parmesano',
    price: 14.50,
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    available: true,
    tags: ['pasta', 'italiano']
  },
  {
    id: '3',
    name: 'Bowl de Quinoa y Vegetales',
    description: 'Bowl nutritivo con quinoa, aguacate, vegetales asados y aderezo de tahini',
    price: 13.75,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    available: true,
    tags: ['vegetariano', 'saludable', 'vegano']
  },
  {
    id: '4',
    name: 'Pollo al Curry con Arroz',
    description: 'Pollo en salsa cremosa de curry con arroz basmati y vegetales',
    price: 15.25,
    image: 'https://images.unsplash.com/photo-1604579905046-467c8089e774?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    available: false,
    tags: ['pollo', 'picante', 'arroz']
  },
  {
    id: '5',
    name: 'Wrap de Pollo y Aguacate',
    description: 'Wrap integral con pollo a la parrilla, aguacate, lechuga y salsa ranch',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1525434280327-e525e1dfe269?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    available: true,
    tags: ['sandwich', 'pollo', 'rápido']
  },
  {
    id: '6',
    name: 'Salmón con Puré de Papas',
    description: 'Filete de salmón a la parrilla con puré de papas y espárragos',
    price: 18.50,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    available: true,
    tags: ['pescado', 'premium', 'saludable']
  }
];

export const mockOrders: Order[] = [
  {
    id: '1',
    userId: '1',
    lunchOptionId: '1',
    date: '2023-11-20',
    status: 'approved',
    createdAt: '2023-11-19T15:30:00Z',
    approvedBy: '2'
  },
  {
    id: '2',
    userId: '4',
    lunchOptionId: '3',
    date: '2023-11-20',
    status: 'approved',
    createdAt: '2023-11-19T14:45:00Z',
    approvedBy: '5'
  },
  {
    id: '3',
    userId: '1',
    lunchOptionId: '2',
    date: '2023-11-21',
    status: 'pending',
    createdAt: '2023-11-20T08:15:00Z'
  },
  {
    id: '4',
    userId: '4',
    lunchOptionId: '5',
    date: '2023-11-21',
    status: 'pending',
    createdAt: '2023-11-20T09:30:00Z'
  }
];

export const mockDashboardStats: DashboardStats = {
  dailyOrders: 24,
  weeklyOrders: 128,
  monthlyOrders: 542,
  dailyRevenue: 325.75,
  weeklyRevenue: 1845.50,
  monthlyRevenue: 7624.25
};

export const getCurrentUser = (): User => {
  // For mock purposes, we'll return the first user
  return mockUsers[0];
};

export const getUsersByCompany = (companyId: string): User[] => {
  return mockUsers.filter(user => user.companyId === companyId);
};

export const getCompanyById = (companyId: string): Company | undefined => {
  return mockCompanies.find(company => company.id === companyId);
};

export const getOrdersByUser = (userId: string): Order[] => {
  return mockOrders.filter(order => order.userId === userId);
};

export const getOrdersByCompany = (companyId: string): Order[] => {
  const companyUserIds = mockUsers
    .filter(user => user.companyId === companyId)
    .map(user => user.id);
  
  return mockOrders.filter(order => companyUserIds.includes(order.userId));
};

export const getLunchOptionById = (id: string): LunchOption | undefined => {
  return mockLunchOptions.find(option => option.id === id);
};
