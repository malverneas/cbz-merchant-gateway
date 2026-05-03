import React from 'react';
import { 
  Bell, 
  Check, 
  Info, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Mail,
  Clock
} from 'lucide-react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuHeader,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-success" size={16} />;
      case 'rejected':
        return <XCircle className="text-destructive" size={16} />;
      case 'additional_documents_requested':
        return <AlertCircle className="text-warning" size={16} />;
      case 'submitted':
        return <Clock className="text-info" size={16} />;
      case 'under_review':
      case 'compliance_review':
        return <Clock className="text-warning" size={16} />;
      default:
        return <Info className="text-muted-foreground" size={16} />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] border-2 border-background"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-auto p-0 hover:bg-transparent text-primary"
              onClick={() => markAllAsRead.mutate()}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[350px]">
          {notifications && notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={cn(
                    "flex flex-col gap-1 p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer relative",
                    !notification.is_read && "bg-primary/5"
                  )}
                  onClick={() => !notification.is_read && markAsRead.mutate(notification.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(notification.status)}
                      <span className="font-medium text-sm">{notification.title}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 pl-6">
                    {notification.message}
                  </p>
                  {!notification.is_read && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-center p-6">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Bell className="text-muted-foreground" size={20} />
              </div>
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs text-muted-foreground">
                We'll notify you when your application status changes.
              </p>
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t text-center">
          <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
            <a href="/notifications">View all notifications</a>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
