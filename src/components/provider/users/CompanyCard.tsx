
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface CompanyCardProps {
  company: {
    id: string;
    name: string;
    userCount: number;
  };
  onClick: () => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, onClick }) => {
  return (
    <Card 
      className="neo-blur text-white rounded-lg shadow-lg transition-all duration-200 cursor-pointer hover:shadow-xl"
      onClick={onClick}
    >
      <CardContent className="p-6 flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="font-medium text-lg text-white">
            {company.name || `Compañía ${company.id.substring(0, 6)}`}
          </h3>
          <p className="text-sm text-white/70 mt-1">
            Clic para ver usuarios
          </p>
        </div>
        
        <div className="flex items-center justify-center min-w-[2.5rem] h-10 w-10 rounded-full bg-white/20 text-white font-medium border border-white/30">
          {company.userCount}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyCard;
