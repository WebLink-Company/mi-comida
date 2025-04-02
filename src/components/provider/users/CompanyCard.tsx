
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
      className="bg-white hover:shadow-lg transition-all duration-200 cursor-pointer border border-transparent"
      onClick={onClick}
    >
      <CardContent className="p-6 flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="font-medium text-lg text-gray-900">
            {company.name || `Company ${company.id.substring(0, 6)}`}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Click to view users
          </p>
        </div>
        
        <div className="flex items-center justify-center min-w-[2.5rem] h-10 w-10 rounded-full bg-blue-50 text-blue-600 font-medium">
          {company.userCount}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyCard;
