"use client";

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface ShiftTimelineProps {
  shiftDate: string;
  startTime: string;
  endTime: string;
  status: string;
  urgency: string;
}

const ShiftTimeline: React.FC<ShiftTimelineProps> = ({
  shiftDate,
  startTime,
  endTime,
  status,
  urgency
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const shiftEndDateTime = new Date(`${shiftDate}T${endTime}`);
      const timeDiff = shiftEndDateTime.getTime() - now.getTime();

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

      // Check if shift is urgent (less than 24 hours until end)
      setIsUrgent(timeDiff < 24 * 60 * 60 * 1000);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [shiftDate, endTime]);

  if (status !== 'active') {
    return null;
  }

  const getTimelineColor = () => {
    if (isExpired) return 'text-red-600 dark:text-red-400';
    if (isUrgent) return 'text-orange-600 dark:text-orange-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  const getTimelineBgColor = () => {
    if (isExpired) return 'bg-red-100 dark:bg-red-900/20';
    if (isUrgent) return 'bg-orange-100 dark:bg-orange-900/20';
    return 'bg-blue-100 dark:bg-blue-900/20';
  };

  const getIcon = () => {
    if (isExpired) return <AlertTriangle className="h-4 w-4" />;
    if (isUrgent) return <Clock className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`p-1 rounded-full ${getTimelineBgColor()}`}>
            {getIcon()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Shift Timeline
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {new Date(shiftDate).toLocaleDateString()} • {startTime} - {endTime}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTimelineBgColor()} ${getTimelineColor()}`}>
            <Clock className="h-3 w-3 mr-1" />
            {isExpired ? 'Expired' : timeLeft}
          </div>
          {isUrgent && !isExpired && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Urgent - Apply soon!
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
          <div 
            className={`h-1 rounded-full transition-all duration-300 ${
              isExpired 
                ? 'bg-red-500 w-full' 
                : isUrgent 
                ? 'bg-orange-500 w-3/4' 
                : 'bg-blue-500 w-1/2'
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default ShiftTimeline; 