import { Badge } from '@/components/ui/badge';

interface WaitTimeBadgeProps {
  waitTime: number;
  allWaitTimes?: number[]; // Optional: for data-driven colors
}

const WaitTimeBadge = ({ waitTime, allWaitTimes }: WaitTimeBadgeProps) => {
  // Use data-driven colors if wait times array is provided
  const getColor = () => {
    if (allWaitTimes && allWaitTimes.length > 0) {
      const minWait = Math.min(...allWaitTimes);
      const maxWait = Math.max(...allWaitTimes);
      const range = maxWait - minWait;
      const position = (waitTime - minWait) / range;
      
      if (position < 0.33) return 'bg-success/10 text-success border-success/20';
      if (position < 0.66) return 'bg-warning/10 text-warning border-warning/20';
      return 'bg-destructive/10 text-destructive border-destructive/20';
    }
    
    // Fallback to threshold-based colors
    if (waitTime < 180) return 'bg-success/10 text-success border-success/20';
    if (waitTime < 300) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-destructive/10 text-destructive border-destructive/20';
  };

  const getLabel = () => {
    if (allWaitTimes && allWaitTimes.length > 0) {
      const minWait = Math.min(...allWaitTimes);
      const maxWait = Math.max(...allWaitTimes);
      const range = maxWait - minWait;
      const position = (waitTime - minWait) / range;
      
      if (position < 0.33) return 'Short wait';
      if (position < 0.66) return 'Moderate wait';
      return 'Long wait';
    }
    
    // Fallback labels
    if (waitTime < 180) return 'Good';
    if (waitTime < 300) return 'Moderate';
    return 'Busy';
  };

  return (
    <Badge variant="outline" className={getColor()}>
      {getLabel()}
    </Badge>
  );
};

export default WaitTimeBadge;
