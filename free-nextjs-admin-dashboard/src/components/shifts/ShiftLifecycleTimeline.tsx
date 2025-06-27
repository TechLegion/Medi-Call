"use client";

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, XCircle, Users, Calendar } from 'lucide-react';

interface ShiftLifecycleTimelineProps {
  shiftDate: string;
  startTime: string;
  endTime: string;
  status: string;
  urgency: string;
  applicantCount: number;
  createdAt: string;
}

const ShiftLifecycleTimeline: React.FC<ShiftLifecycleTimelineProps> = ({
  shiftDate,
  startTime,
  endTime,
  status,
  urgency,
  applicantCount,
  createdAt
}) => {
  const [currentStage, setCurrentStage] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateStage = () => {
      const now = new Date();
      const shiftEndDateTime = new Date(`${shiftDate}T${endTime}`);
      const createdDateTime = new Date(createdAt);
      const timeDiff = shiftEndDateTime.getTime() - now.getTime();

      // Calculate time left
      if (timeDiff <= 0) {
        setTimeLeft('Expired');
        setCurrentStage('expired');
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

      // Determine current stage
      if (status === 'filled') {
        setCurrentStage('filled');
      } else if (status === 'cancelled') {
        setCurrentStage('cancelled');
      } else if (timeDiff < 24 * 60 * 60 * 1000) {
        setCurrentStage('urgent');
      } else if (applicantCount > 0) {
        setCurrentStage('applications');
      } else {
        setCurrentStage('active');
      }
    };

    calculateStage();
    const interval = setInterval(calculateStage, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [shiftDate, endTime, status, applicantCount, createdAt]);

  const stages = [
    {
      id: 'created',
      label: 'Posted',
      icon: Calendar,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      completed: true
    },
    {
      id: 'active',
      label: 'Active',
      icon: Clock,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      completed: currentStage !== 'created'
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      completed: applicantCount > 0
    },
    {
      id: 'urgent',
      label: 'Urgent',
      icon: AlertTriangle,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      completed: currentStage === 'urgent' || currentStage === 'filled' || currentStage === 'expired'
    },
    {
      id: 'filled',
      label: 'Filled',
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      completed: status === 'filled'
    }
  ];

  const getCurrentStageIndex = () => {
    return stages.findIndex(stage => stage.id === currentStage);
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          Shift Lifecycle
        </h4>
        <div className="text-right">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            currentStage === 'expired' 
              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              : currentStage === 'urgent'
              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
          }`}>
            <Clock className="h-3 w-3 mr-1" />
            {timeLeft}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = stage.id === currentStage;
            const isCompleted = stage.completed;
            
            return (
              <div key={stage.id} className="flex flex-col items-center relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isActive 
                    ? `${stage.bgColor} ${stage.color}`
                    : isCompleted
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`text-xs mt-1 text-center ${
                  isActive 
                    ? 'text-gray-900 dark:text-white font-medium'
                    : isCompleted
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {stage.label}
                </span>
                
                {/* Connector line */}
                {index < stages.length - 1 && (
                  <div className={`absolute top-4 left-8 w-full h-0.5 ${
                    isCompleted ? 'bg-green-300 dark:bg-green-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status indicators */}
      <div className="mt-3 flex flex-wrap gap-2">
        {applicantCount > 0 && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
            <Users className="h-3 w-3 mr-1" />
            {applicantCount} applicant{applicantCount !== 1 ? 's' : ''}
          </span>
        )}
        
        {urgency === 'high' && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <AlertTriangle className="h-3 w-3 mr-1" />
            High Priority
          </span>
        )}
        
        {status === 'filled' && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle className="h-3 w-3 mr-1" />
            Filled
          </span>
        )}
        
        {status === 'cancelled' && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </span>
        )}
      </div>
    </div>
  );
};

export default ShiftLifecycleTimeline; 