import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, AlertTriangle, Archive } from 'lucide-react';

const InactivityStatusBadge = ({ 
  status, 
  daysInactive = 0, 
  daysUntilArchive = null,
  isArchived = false,
  showTooltip = true,
  size = 'default'
}) => {
  const getStatusConfig = () => {
    if (isArchived || status === 'archived') {
      return {
        variant: 'destructive',
        label: 'Archived',
        icon: Archive,
        description: 'This veteran record has been archived due to inactivity.'
      };
    }
    
    if (status === 'warning') {
      return {
        variant: 'outline',
        label: 'Inactive',
        icon: AlertTriangle,
        description: `Inactive for ${daysInactive} days. ${daysUntilArchive ? `Will be archived in ${daysUntilArchive} days.` : ''}`
      };
    }
    
    return null;
  };

  const config = getStatusConfig();
  
  if (!config) {
    return null;
  }

  const IconComponent = config.icon;
  const sizeClasses = size === 'small' ? 'text-xs px-1.5 py-0.5' : '';

  const badgeContent = (
    <Badge 
      variant={config.variant} 
      className={`flex items-center gap-1 ${sizeClasses}`}
    >
      <IconComponent className={size === 'small' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {config.label}
    </Badge>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InactivityStatusBadge;
