
import React from 'react';
import { AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, DollarSign, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
}

interface UserDetailsModalProps {
  user: User;
  orders: Order[];
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, orders, onClose }) => {
  return (
    <AlertDialogContent 
      className="sm:max-w-md modal-glassmorphism overflow-y-auto max-h-[90vh] bg-gradient-to-br from-slate-50/90 to-white/90 dark:from-slate-900/90 dark:to-slate-800/90 border border-white/10 shadow-xl backdrop-blur-md z-[1000]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 rounded-lg bg-blue-500/5 z-[-1]"></div>
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500/10 to-indigo-500/10 z-[-1]"></div>
      
      <AlertDialogHeader className="pb-2">
        <div className="flex items-center mb-2">
          <Button 
            variant="ghost"
            size="sm"
            className="mr-2 rounded-full p-0 h-8 w-8"
            onClick={onClose}
          >
            <ArrowLeft size={16} />
          </Button>
          <AlertDialogTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {user.first_name} {user.last_name}
          </AlertDialogTitle>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">{user.email}</span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <Badge variant="outline" className="capitalize">
            {user.role}
          </Badge>
        </div>
      </AlertDialogHeader>

      <div className="my-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
          <Package className="h-4 w-4 mr-1" /> Recent Orders
        </h3>

        {orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card 
                key={order.id} 
                className="border border-gray-200 dark:border-gray-800 shadow-sm"
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Order #{order.id.substring(0, 8)}
                        </span>
                        <Badge 
                          variant={order.status === 'delivered' ? 'success' : 
                                  order.status === 'approved' ? 'secondary' : 'default'} 
                          className="capitalize text-xs"
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center mt-1 text-sm text-gray-700 dark:text-gray-300">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(order.date), 'MMMM d, yyyy')}
                      </div>
                    </div>
                    <div className="flex items-center font-medium">
                      <DollarSign className="h-3 w-3 text-green-600" />
                      {order.total.toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 dark:bg-gray-800/30 rounded-lg">
            <Package className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No orders found for this user
            </p>
          </div>
        )}
      </div>

      <AlertDialogFooter className="border-t border-gray-200 dark:border-gray-700/50 pt-4 flex justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};

export default UserDetailsModal;
