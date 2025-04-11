
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';

type ActivityType = 'login' | 'order' | 'signup' | 'update' | 'delete';

interface Activity {
  id: string;
  type: ActivityType;
  user: string;
  action: string;
  timestamp: Date;
}

const ActivityTypeIcon = ({ type }: { type: ActivityType }) => {
  const iconClasses = "h-7 w-7 rounded-full flex items-center justify-center text-xs";
  
  switch (type) {
    case 'login':
      return <div className={cn(iconClasses, "bg-blue-100 text-blue-600")}>👤</div>;
    case 'order':
      return <div className={cn(iconClasses, "bg-green-100 text-green-600")}>🛒</div>;
    case 'signup':
      return <div className={cn(iconClasses, "bg-purple-100 text-purple-600")}>✨</div>;
    case 'update':
      return <div className={cn(iconClasses, "bg-yellow-100 text-yellow-600")}>📝</div>;
    case 'delete':
      return <div className={cn(iconClasses, "bg-red-100 text-red-600")}>🗑️</div>;
    default:
      return <div className={cn(iconClasses, "bg-gray-100 text-gray-600")}>❓</div>;
  }
};

// Sample activities for initial display
const SAMPLE_ACTIVITIES: Activity[] = [
  {
    id: "1",
    type: "signup",
    user: "María González",
    action: "se unió como nuevo usuario de empresa",
    timestamp: new Date(Date.now() - 12 * 60000)
  },
  {
    id: "2",
    type: "update",
    user: "Admin",
    action: "actualizó los detalles del proveedor 'Restaurante El Jardín'",
    timestamp: new Date(Date.now() - 45 * 60000)
  },
  {
    id: "3",
    type: "login",
    user: "Carlos López",
    action: "inició sesión",
    timestamp: new Date(Date.now() - 120 * 60000)
  },
  {
    id: "4",
    type: "order",
    user: "Elena Martínez",
    action: "realizó un nuevo pedido de almuerzo",
    timestamp: new Date(Date.now() - 180 * 60000)
  },
  {
    id: "5",
    type: "delete",
    user: "Admin",
    action: "eliminó una cuenta desactivada",
    timestamp: new Date(Date.now() - 300 * 60000)
  }
];

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `hace ${diffInSeconds} segundos`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
};

const ActivityLog = () => {
  const [activities] = useState<Activity[]>(SAMPLE_ACTIVITIES);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 overflow-auto max-h-[350px]">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4 animate-fade-in">
            <ActivityTypeIcon type={activity.type} />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">
                {activity.user}
                <span className="text-muted-foreground font-normal"> {activity.action}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {formatTimeAgo(activity.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ActivityLog;
