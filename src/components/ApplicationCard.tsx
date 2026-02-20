import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { Building2, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import type { Application } from '@/hooks/useApplications';

interface ApplicationCardProps {
  application: Application;
  showMerchantInfo?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ 
  application, 
  showMerchantInfo = true,
  actionLabel = 'View Details',
  onAction,
  compact = false
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onAction) {
      onAction();
    } else {
      navigate(`/application/${application.id}`);
    }
  };

  if (compact) {
    return (
      <div 
        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex items-center gap-3 min-w-0">
          <StatusBadge status={application.status} />
          <span className="font-medium text-sm truncate">{application.business_name}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {application.created_at ? format(new Date(application.created_at), 'MMM d') : ''}
        </span>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-card-hover transition-all duration-200 cursor-pointer group" onClick={handleClick}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <StatusBadge status={application.status} />
              <span className="text-xs text-muted-foreground">
                ID: {application.id.slice(0, 8)}...
              </span>
            </div>
            
            {showMerchantInfo && (
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={16} className="text-muted-foreground flex-shrink-0" />
                <h3 className="font-semibold text-foreground truncate">
                  {application.business_name}
                </h3>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>
                  {application.submitted_at 
                    ? `Submitted: ${format(new Date(application.submitted_at), 'MMM d, yyyy')}`
                    : `Created: ${format(new Date(application.created_at), 'MMM d, yyyy')}`
                  }
                </span>
              </div>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {actionLabel}
            <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
