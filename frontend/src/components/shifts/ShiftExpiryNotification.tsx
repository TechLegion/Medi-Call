"use client";

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Bell } from 'lucide-react';

interface ShiftExpiryNotificationProps {
  shiftDate: string;
  startTime: string;
  shiftTitle: string;
  warningThreshold?: number; // hours before warning
  onDismiss?: () => void;
}

const ShiftExpiryNotification: React.FC<ShiftExpiryNotificationProps> = ({
  shiftDate,
  startTime,
  shiftTitle,
  warningThreshold = 24,
  onDismiss
}) => {
  const [showNotification, setShowNotification] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const checkExpiry = () => {
      const now = new Date();
      const shiftDateTime = new Date(`${shiftDate}T${startTime}`);
      const timeDiff = shiftDateTime.getTime() - now.getTime();

      if (timeDiff <= 0) {
        setShowNotification(false);
        return;
      }

      // Show notification if within warning threshold
      if (timeDiff < warningThreshold * 60 * 60 * 1000) {
        setShowNotification(true);
        setIsUrgent(timeDiff < 6 * 60 * 60 * 1000); // Very urgent if less than 6 hours

        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

        let timeString = '';
        if (hours > 0) {
          timeString = `${hours}h ${minutes}m`;
        } else {
          timeString = `${minutes}m`;
        }

        setTimeLeft(timeString);
      } else {
        setShowNotification(false);
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [shiftDate, startTime, warningThreshold]);

  const handleDismiss = () => {
    setShowNotification(false);
    onDismiss?.();
  };

  if (!showNotification) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`rounded-lg shadow-lg border-l-4 p-4 ${
        isUrgent 
          ? 'bg-red-50 border-red-500 dark:bg-red-900/20 dark:border-red-400'
          : 'bg-orange-50 border-orange-500 dark:bg-orange-900/20 dark:border-orange-400'
      }`}>
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${isUrgent ? 'text-red-500' : 'text-orange-500'}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${
              isUrgent ? 'text-red-800 dark:text-red-200' : 'text-orange-800 dark:text-orange-200'
            }`}>
              {isUrgent ? 'Urgent: Shift Expiring Soon!' : 'Shift Expiring Soon'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {shiftTitle} expires in {timeLeft}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {new Date(shiftDate).toLocaleDateString()} at {startTime}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftExpiryNotification; 