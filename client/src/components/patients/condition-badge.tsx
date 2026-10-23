import { cn } from 'cn';

import { Badge } from '@/components/ui/badge';
import { getConditionColor } from '@/lib/condition-colors';

interface ConditionBadgeProps {
  condition: string;
  className?: string;
}

export function ConditionBadge({ condition, className }: ConditionBadgeProps) {
  return (
    <Badge variant="outline" className={cn(getConditionColor(condition), className)}>
      {condition}
    </Badge>
  );
}
