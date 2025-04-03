
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Order, Company } from '@/lib/types';

interface OrderMetadataCardProps {
  order: Order;
  company: Company | null;
}

const OrderMetadataCard: React.FC<OrderMetadataCardProps> = ({ order, company }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      whileHover={{ y: -5 }}
      className="transform transition-all duration-300"
    >
      <Card className="mb-6 backdrop-blur-md bg-white/10 border border-white/20 shadow-lg">
        <CardContent className="p-5 space-y-4">
          <h3 className="font-medium text-white">Detalles del pedido</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">ID del pedido:</span>
              <span className="font-mono text-white">{order.id.slice(0, 8)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Fecha:</span>
              <span className="text-white">{new Date(order.date).toLocaleDateString()}</span>
            </div>
            
            {company && (
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Empresa:</span>
                <span className="text-white">{company.name}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OrderMetadataCard;
