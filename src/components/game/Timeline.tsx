import React, { useMemo } from 'react';
import { TIME_BLOCKS, ACTIVITIES } from '@/data/gameData';
import { ScheduledActivity } from '@/types/game';

interface TimelineProps {
  scheduledActivities: ScheduledActivity[];
  onDropActivity: (activityId: string, hour: number) => void;
  onRemoveActivity: (activityId: string) => void;
  onMoveActivity: (activityId: string, newHour: number) => void;
}

const ROW_HEIGHT = 42; // Height of each activity row in pixels
const MIN_HEIGHT = 96; // Minimum height (h-24 equivalent)

export const Timeline: React.FC<TimelineProps> = ({
  scheduledActivities,
  onDropActivity,
  onRemoveActivity,
  onMoveActivity,
}) => {
  const [dragOverHour, setDragOverHour] = React.useState<number | null>(null);

  const handleDrop = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    const activityId = e.dataTransfer.getData('activityId');
    const isMove = e.dataTransfer.getData('isMove') === 'true';
    
    if (isMove) {
      onMoveActivity(activityId, hour);
    } else {
      onDropActivity(activityId, hour);
    }
    setDragOverHour(null);
  };

  const handleDragOver = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    setDragOverHour(hour);
  };

  // 1. Get basic activity data
  const rawActivityBlocks = useMemo(() => {
    return scheduledActivities.map(({ activityId, startHour }) => {
      const activity = ACTIVITIES.find(a => a.id === activityId);
      if (!activity) return null;

      // Check if any hours are peak
      let hasPeakHours = false;
      for (let h = 0; h < activity.duration; h++) {
        if (TIME_BLOCKS[startHour + h]?.isPeak) {
          hasPeakHours = true;
          break;
        }
      }

      return {
        ...activity,
        startHour,
        hasPeakHours,
        // We need this ID to be unique for the key if we have multiples of same type, 
        // but for now relying on the data provided
        uniqueId: `${activityId}-${startHour}`, 
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);
  }, [scheduledActivities]);

  // 2. Calculate layout lanes to prevent overlapping
  const { blocksWithLanes, totalHeight } = useMemo(() => {
    const blocks = getLayoutWithLanes(rawActivityBlocks);
    
    // Calculate max lane index to determine total container height
    const maxLane = Math.max(...blocks.map(b => b.lane), 0);
    // Height is (rows * row_height) + padding
    const calculatedHeight = (maxLane + 1) * ROW_HEIGHT + 16; 
    
    return {
      blocksWithLanes: blocks,
      totalHeight: Math.max(MIN_HEIGHT, calculatedHeight)
    };
  }, [rawActivityBlocks]);

  return (
    <div className="game-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg">Daily Schedule</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-muted" />
            <span className="text-muted-foreground">Off-peak</span>
          </div>
          <div className="flex items-center gap-1">
            <div 
              className="w-3 h-3 rounded"
              style={{ background: 'hsl(24, 100%, 50%)' }}
            />
            <span className="text-muted-foreground">Peak Hours</span>
          </div>
        </div>
      </div>

      {/* Time labels */}
      <div className="flex mb-1">
        {TIME_BLOCKS.filter((_, i) => i % 3 === 0).map((block) => (
          <div 
            key={block.hour}
            className="flex-1 text-xs text-muted-foreground text-center"
            style={{ minWidth: 0 }}
          >
            {block.label}
          </div>
        ))}
      </div>

      {/* Timeline slots container */}
      <div 
        className="relative rounded-lg overflow-hidden border border-border/50 transition-all duration-300 ease-in-out"
        style={{ height: `${totalHeight}px` }}
      >
        {/* Background Grid */}
        <div className="absolute inset-0 flex h-full">
          {TIME_BLOCKS.map((block) => (
            <div
              key={block.hour}
              onDrop={(e) => handleDrop(e, block.hour)}
              onDragOver={(e) => handleDragOver(e, block.hour)}
              onDragLeave={() => setDragOverHour(null)}
              className={`
                timeline-slot relative flex-1 h-full
                ${block.isPeak ? 'peak' : ''}
                ${dragOverHour === block.hour ? 'bg-accent/30' : ''}
              `}
            >
              {/* Hour marker at midnight, 6, 12, 18 */}
              {block.hour % 6 === 0 && (
                <div className="absolute top-0 left-0 w-px h-full bg-border/50" />
              )}
            </div>
          ))}
        </div>

        {/* Scheduled activities */}
        <div className="absolute inset-0 pointer-events-none">
          {blocksWithLanes.map((block) => {
            const widthPercent = (block.duration / 24) * 100;
            const leftPercent = (block.startHour / 24) * 100;

            return (
              <div
                key={block.uniqueId}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('activityId', block.id);
                  e.dataTransfer.setData('isMove', 'true');
                }}
                className={`
                  absolute rounded-lg cursor-grab active:cursor-grabbing
                  pointer-events-auto flex items-center gap-2 px-3 text-sm font-medium
                  transition-all duration-200 hover:scale-[1.02] hover:z-50
                  ${block.hasPeakHours ? 'animate-pulse-glow' : ''}
                `}
                style={{
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                  // Dynamic positioning based on lane
                  top: `${block.lane * ROW_HEIGHT + 8}px`,
                  height: `${ROW_HEIGHT - 6}px`, // Slight gap between rows
                  background: `linear-gradient(135deg, ${block.color}dd 0%, ${block.color}99 100%)`,
                  border: block.hasPeakHours 
                    ? '2px solid hsl(0, 72%, 51%)' 
                    : `1px solid ${block.color}`,
                  boxShadow: `0 4px 15px ${block.color}44`,
                  zIndex: 10 + block.lane,
                }}
                onClick={() => onRemoveActivity(block.id)}
              >
                <span className="text-lg">{block.icon}</span>
                <span className="truncate text-white font-semibold text-xs">
                  {block.name}
                </span>
                {block.hasPeakHours && (
                  <span className="absolute -top-2 -right-2 bg-destructive rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md">
                    ⚠
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Period labels */}
      <div className="flex mt-2">
        <div className="flex-1 text-center">
          <span className="text-xs text-muted-foreground">Night</span>
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs text-muted-foreground">Morning</span>
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs text-muted-foreground">Afternoon</span>
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs text-warning font-medium">Peak ⚡</span>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate stacking lanes
function getLayoutWithLanes(activities: any[]) {
  // Sort by start time to process in order
  const sorted = [...activities].sort((a, b) => a.startHour - b.startHour);
  const lanes: number[] = []; 

  return sorted.map(activity => {
    // Find the first lane where this activity fits (starts after previous item in lane ends)
    let laneIndex = lanes.findIndex(laneEndTime => laneEndTime <= activity.startHour);

    if (laneIndex === -1) {
      // If no lane is free, create a new one
      laneIndex = lanes.length;
      lanes.push(0);
    }

    // Update this lane's end time
    lanes[laneIndex] = activity.startHour + activity.duration;

    return { ...activity, lane: laneIndex };
  });
}