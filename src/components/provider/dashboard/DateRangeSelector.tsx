
import React from 'react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { DateRange } from '@/hooks/useProviderDashboardStats';
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  CalendarDays, 
  CalendarClock, 
  CalendarRange
} from 'lucide-react';

interface DateRangeSelectorProps {
  onSelectRange: (range: DateRange) => void;
  selectedRange: DateRange;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ 
  onSelectRange,
  selectedRange 
}) => {
  const today = new Date();
  
  // Formatear una fecha para mostrar
  const formatDate = (date: Date) => {
    return format(date, 'dd MMM yyyy', { locale: es });
  };

  // Handler para seleccionar hoy
  const handleSelectToday = () => {
    const todayStr = format(today, 'yyyy-MM-dd');
    onSelectRange({
      startDate: todayStr,
      endDate: todayStr,
      label: 'hoy'
    });
  };

  // Handler para seleccionar esta semana
  const handleSelectWeek = () => {
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Lunes como inicio de semana
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Domingo como fin de semana
    
    onSelectRange({
      startDate: format(weekStart, 'yyyy-MM-dd'),
      endDate: format(weekEnd, 'yyyy-MM-dd'),
      label: 'semana'
    });
  };

  // Handler para seleccionar este mes
  const handleSelectMonth = () => {
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    
    onSelectRange({
      startDate: format(monthStart, 'yyyy-MM-dd'),
      endDate: format(monthEnd, 'yyyy-MM-dd'),
      label: 'mes'
    });
  };

  // Handler para seleccionar fecha personalizada
  const handleCustomStartDate = (date: Date | undefined) => {
    if (date) {
      const endDate = new Date(selectedRange.endDate);
      // Si la fecha de inicio es posterior a la fecha de fin, ajustar la fecha de fin
      if (date > endDate) {
        onSelectRange({
          startDate: format(date, 'yyyy-MM-dd'),
          endDate: format(date, 'yyyy-MM-dd'),
          label: 'personalizado'
        });
      } else {
        onSelectRange({
          ...selectedRange,
          startDate: format(date, 'yyyy-MM-dd'),
          label: 'personalizado'
        });
      }
    }
  };

  const handleCustomEndDate = (date: Date | undefined) => {
    if (date) {
      onSelectRange({
        ...selectedRange,
        endDate: format(date, 'yyyy-MM-dd'),
        label: 'personalizado'
      });
    }
  };
  
  // Obtener las fechas actuales para mostrar en los selectores
  const currentStartDate = new Date(selectedRange.startDate);
  const currentEndDate = new Date(selectedRange.endDate);

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white/5 p-4 rounded-lg">
        <h3 className="text-white font-medium">Rango de fechas:</h3>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm"
            variant={selectedRange.label === 'hoy' ? 'default' : 'outline'} 
            className={selectedRange.label === 'hoy' ? 'bg-blue-600' : 'glass'}
            onClick={handleSelectToday}
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            Hoy
          </Button>
          
          <Button 
            size="sm"
            variant={selectedRange.label === 'semana' ? 'default' : 'outline'} 
            className={selectedRange.label === 'semana' ? 'bg-blue-600' : 'glass'}
            onClick={handleSelectWeek}
          >
            <CalendarClock className="h-4 w-4 mr-2" />
            Esta semana
          </Button>
          
          <Button 
            size="sm"
            variant={selectedRange.label === 'mes' ? 'default' : 'outline'} 
            className={selectedRange.label === 'mes' ? 'bg-blue-600' : 'glass'}
            onClick={handleSelectMonth}
          >
            <CalendarRange className="h-4 w-4 mr-2" />
            Este mes
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-white">Desde:</span>
          <DatePicker
            date={currentStartDate}
            onSelect={handleCustomStartDate}
            className="w-full sm:w-auto glass text-white"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-white">Hasta:</span>
          <DatePicker
            date={currentEndDate}
            onSelect={handleCustomEndDate}
            fromDate={currentStartDate} // No permitir fechas anteriores a la fecha de inicio
            className="w-full sm:w-auto glass text-white"
          />
        </div>
      </div>

      {selectedRange.startDate === selectedRange.endDate ? (
        <p className="text-white/70 text-sm">
          Mostrando datos para el {formatDate(currentStartDate)}
        </p>
      ) : (
        <p className="text-white/70 text-sm">
          Mostrando datos desde el {formatDate(currentStartDate)} hasta el {formatDate(currentEndDate)}
        </p>
      )}
    </div>
  );
};

export default DateRangeSelector;
