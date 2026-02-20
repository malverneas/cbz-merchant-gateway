import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ApplicationStatus, statusLabels, statusColors } from '@/lib/types';

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const variant = statusColors[status] as any;
  
  return (
    <Badge variant={variant} className={className}>
      {statusLabels[status]}
    </Badge>
  );
};
