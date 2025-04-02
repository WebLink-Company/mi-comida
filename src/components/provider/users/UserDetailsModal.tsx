
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
      className="sm:max-w-md blue-glass-modal overflow-y-auto max-h-[90vh] shadow-2xl backdrop-blur-2xl z-[1000]"
      onClick={(e) => e.stopPropagation()}
    >
      <AlertDialogHeader className="pb-2">
        <div className="flex items-center mb-2">
          <Button 
            variant="ghost"
            size="sm"
            className="mr-2 rounded-full p-0 h-8 w-8 text-white hover:bg-white/10"
            onClick={onClose}
          >
            <ArrowLeft size={16} />
          </Button>
          <AlertDialogTitle className="text-xl font-bold text-white">
            {user.first_name} {user.last_name}
          </AlertDialogTitle>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-white/80">{user.email}</span>
          <span className="text-white/40">•</span>
          <Badge variant="outline" className="capitalize bg-white/10 text-white border-white/20">
            {user.role}
          </Badge>
        </div>
      </AlertDialogHeader>

      <div className="my-3">
        <h3 className="text-sm font-medium text-white/90 mb-3 flex items-center">
          <Package className="h-4 w-4 mr-1" /> Recent Orders
        </h3>

        {orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card 
                key={order.id} 
                className="border border-white/20 bg-white/10 backdrop-blur-sm"
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-white/70">
                          Order #{order.id.substring(0, 8)}
                        </span>
                        <Badge 
                          variant={order.status === 'delivered' ? 'success' : 
                                  order.status === 'approved' ? 'secondary' : 'default'} 
                          className="capitalize text-xs bg-white/20 text-white border-white/30"
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center mt-1 text-sm text-white/80">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(order.date), 'MMMM d, yyyy')}
                      </div>
                    </div>
                    <div className="flex items-center font-medium text-white">
                      <DollarSign className="h-3 w-3 text-green-300" />
                      {order.total.toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-white/5 rounded-lg">
            <Package className="h-8 w-8 text-white/40 mb-2" />
            <p className="text-sm text-white/70">
              No orders found for this user
            </p>
          </div>
        )}
      </div>

      <AlertDialogFooter className="border-t border-white/20 pt-4 flex justify-end">
        <Button variant="outline" size="sm" onClick={onClose} className="bg-white/10 text-white hover:bg-white/20 border-white/30">
          Close
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};

export default UserDetailsModal;
