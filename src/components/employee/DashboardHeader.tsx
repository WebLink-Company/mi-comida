
import React from 'react';
import { motion } from 'framer-motion';
import { Company } from '@/lib/types';

interface DashboardHeaderProps {
  userName: string | undefined;
  company: Company | null;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName, company }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getSubsidyText = () => {
    if (!company) return '';
    
    if (company.fixed_subsidy_amount && company.fixed_subsidy_amount > 0) {
      return `Tu empresa cubre $${company.fixed_subsidy_amount.toFixed(2)} de tu comida.`;
    }
    
    const percentage = company.subsidy_percentage || company.subsidyPercentage || 0;
    return `Tu empresa cubre el ${percentage}% de tu comida.`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-12 flex flex-col items-center text-center"
    >
      <h1 className="text-4xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-blue-100">
        {`Hola ${userName || 'Usuario'}.`}
      </h1>
      <p className="text-sm text-white/80 mb-1">
        {format(new Date(), 'EEEE, MMMM d')}
      </p>
      <p className="text-sm text-white/80 mb-5">
        {format(new Date(), 'h:mm a')}
      </p>
      <p className="text-white text-xl">
        {getGreeting()} 👋
      </p>
      {company && (
        <div className="mt-2 text-sm text-white/80">
          <p>{company.name}</p>
          <p className="mt-1 text-white font-medium">{getSubsidyText()}</p>
        </div>
      )}
    </motion.div>
  );
};

// Helper function to format dates
function format(date: Date, formatStr: string): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const days = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles',
    'Jueves', 'Viernes', 'Sábado'
  ];
  
  if (formatStr === 'EEEE, MMMM d') {
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  }
  
  if (formatStr === 'h:mm a') {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  }
  
  return date.toLocaleDateString();
}

export default DashboardHeader;
