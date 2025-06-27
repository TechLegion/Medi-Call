"use client";

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string;
  targetTime: string;
  className?: string;
  showIcon?: boolean;
  showWarning?: boolean;
  warningThreshold?: number; // hours before warning
  useEndTime?: boolean; // whether to use end time (default) or start time
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  targetTime,
  className = '',
  showIcon = true,
  showWarning = true,
  warningThreshold = 24,
  useEndTime = true
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const targetDateTime = new Date(`${targetDate}T${targetTime}`);
      const timeDiff = targetDateTime.getTime() - now.getTime();

      if (timeDiff <= 0) {
        setIsExpired(true);
        setTimeLeft('Expired');
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      let timeString = '';
      if (days > 0) {
        timeString = `${days}d ${hours}h`;
      } else if (hours > 0) {
        timeString = `${hours}h ${minutes}m`;
      } else {
        timeString = `${minutes}m`;
      }

      setTimeLeft(timeString);

      // Check warning threshold
      if (showWarning) {
        setIsWarning(timeDiff < warningThreshold * 60 * 60 * 1000);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [targetDate, targetTime, showWarning, warningThreshold]);

  const getTimerColor = () => {
    if (isExpired) return 'text-red-600 dark:text-red-400';
    if (isWarning) return 'text-orange-600 dark:text-orange-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  const getTimerBgColor = () => {
    if (isExpired) return 'bg-red-100 dark:bg-red-900/20';
    if (isWarning) return 'bg-orange-100 dark:bg-orange-900/20';
    return 'bg-blue-100 dark:bg-blue-900/20';
  };

  const getIcon = () => {
    if (isExpired) return <AlertTriangle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTimerBgColor()} ${getTimerColor()} ${className}`}>
      {showIcon && getIcon()}
      <span className={showIcon ? 'ml-1' : ''}>
        {timeLeft}
      </span>
    </div>
  );
};

export default CountdownTimer; 