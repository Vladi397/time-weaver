import React from 'react';
import { Activity } from '@/types/game';

interface ActivityCardProps {
  activity: Activity;
  isScheduled: boolean;
  onDragStart: (activity: Activity) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  isScheduled,
  onDragStart,
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('activityId', activity.id);
        onDragStart(activity);
      }}
      className={`activity-tile p-3 ${isScheduled ? 'opacity-50' : ''}`}
      style={{
        borderLeft: `4px solid ${activity.color}`,
      }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
          style={{
            background: `linear-gradient(135deg, ${activity.color}33 0%, ${activity.color}11 100%)`,
          }}
        >
          <div className="text-3xl mb-2" style={{ color: activity.color }}>
            <activity.icon className="w-8 h-8" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{activity.name}</div>
          <div className="text-xs text-muted-foreground">
            {activity.duration} {activity.duration === 1 ? 'hour' : 'hours'} • {activity.energyUsage} kW
          </div>
        </div>
      </div>

      {!isScheduled && (
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Drag to timeline →
        </div>
      )}
    </div>
  );
};
