import React, { useMemo, useState } from 'react';
import { TIME_BLOCKS, ACTIVITIES, BASE_RATE } from '@/data/gameData';
import { ScheduledActivity } from '@/types/game';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TimelineProps {
  scheduledActivities: ScheduledActivity[];
  onDropActivity: (activityId: string, hour: number) => void;
  onRemoveActivity: (activityId: string) => void;
  onMoveActivity: (activityId: string, newHour: number) => void;
}

const ROW_HEIGHT = 42; // Reverted to original height for compactness
const MIN_HEIGHT = 96;

export const Timeline: React.FC<TimelineProps> = ({
  scheduledActivities,
  onDropActivity,
  onRemoveActivity,
  onMoveActivity,
}) => {
  const [dragOverHour, setDragOverHour] = useState<number | null>(null);
  const [draggingInternalId, setDraggingInternalId] = useState<string | null>(null);

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
    setDraggingInternalId(null);
  };

  const handleDragOver = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    setDragOverHour(hour);
  };

  // 1) Process activities with derived data
  const rawActivityBlocks = useMemo(() => {
    return scheduledActivities
      .map(({ activityId, startHour }) => {
        const activity = ACTIVITIES.find((a) => a.id === activityId);
        if (!activity) return null;

        const duration = Math.max(2, activity.duration);
        
        let cost = 0;
        let hasPeakHours = false;
        
        for (let h = 0; h < duration; h++) {
            const currentHour = startHour + h;
            const block = TIME_BLOCKS[currentHour];
            if (block) {
                if (block.isPeak) hasPeakHours = true;
                cost += activity.energyUsage * BASE_RATE * block.multiplier;
            }
        }

        return {
          ...activity,
          duration,
          startHour,
          hasPeakHours,
          cost: cost.toFixed(2),
          uniqueId: `${activityId}-${startHour}`,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [scheduledActivities]);

  // 2) Layout calculation (Lanes)
  const { blocksWithLanes, totalHeight } = useMemo(() => {
    const blocks = getLayoutWithLanes(rawActivityBlocks);
    const maxLaneIndex = Math.max(...blocks.map((b) => b.lane), 0);
    const calculatedHeight = (maxLaneIndex + 1) * ROW_HEIGHT + 16;

    return {
      blocksWithLanes: blocks,
      totalHeight: Math.max(MIN_HEIGHT, calculatedHeight),
    };
  }, [rawActivityBlocks]);

  // 3) Calculate Ghost Block
  const ghostBlock = useMemo(() => {
    if (dragOverHour === null || !draggingInternalId) return null;
    
    const [actId] = draggingInternalId.split('-'); 
    const activity = ACTIVITIES.find(a => a.id === actId);
    if (!activity) return null;
    
    const duration = Math.max(2, activity.duration);
    const widthPercent = (duration / 24) * 100;
    const leftPercent = (dragOverHour / 24) * 100;

    return {
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
    };
  }, [dragOverHour, draggingInternalId]);

  return (
    <TooltipProvider>
      <div className="game-card p-4">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-4">
           <h3 className="font-display font-semibold text-lg">Daily Schedule</h3>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
               <div className="w-3 h-3 rounded bg-muted" />
               <span className="text-muted-foreground">Off-peak</span>
            </div>
            <div className="flex items-center gap-1">
               <div className="w-3 h-3 rounded" style={{ background: 'hsl(24, 100%, 50%)' }} />
               <span className="text-muted-foreground">Peak Hours</span>
            </div>
          </div>
        </div>

        {/* Time Labels */}
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

        {/* Timeline Container */}
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
                  className={`
                    timeline-slot relative flex-1 h-full
                    ${block.isPeak ? 'peak' : ''}
                    ${dragOverHour === block.hour ? 'bg-accent/30' : ''}
                  `}
                >
                   {block.hour % 6 === 0 && <div className="absolute top-0 left-0 w-px h-full bg-border/50" />}
                </div>
              ))}
            </div>

            {/* Ghost Preview Block */}
            {ghostBlock && (
                <div 
                    className="absolute pointer-events-none z-0 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5"
                    style={{
                        left: ghostBlock.left,
                        width: ghostBlock.width,
                        top: 4,
                        bottom: 4
                    }}
                />
            )}

            {/* Activities */}
            <div className="absolute inset-0 pointer-events-none">
              {blocksWithLanes.map((block) => {
                const widthPercent = (block.duration / 24) * 100;
                const leftPercent = (block.startHour / 24) * 100;
                const isDragging = draggingInternalId === block.uniqueId;
                
                // RESTORED: Original logic for borders and colors
                const borderColor = block.hasPeakHours ? 'hsl(0, 72%, 51%)' : block.color;

                return (
                  <Tooltip key={block.uniqueId} delayDuration={300}>
                    <TooltipTrigger asChild>
                        <div
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData('activityId', block.id);
                                e.dataTransfer.setData('isMove', 'true');
                                setDraggingInternalId(block.uniqueId);
                            }}
                            onDragEnd={() => {
                                setDragOverHour(null);
                                setDraggingInternalId(null);
                            }}
                            className={cn(
                                "absolute rounded-lg cursor-grab active:cursor-grabbing",
                                "pointer-events-auto transition-all duration-200 group select-none",
                                isDragging ? "opacity-50 scale-95" : "hover:scale-[1.04] hover:z-50",
                                block.hasPeakHours ? 'animate-pulse-glow' : ''
                            )}
                            style={{
                                left: `${leftPercent}%`,
                                width: `${widthPercent}%`,
                                top: `${block.lane * ROW_HEIGHT + 8}px`,
                                height: `${ROW_HEIGHT - 6}px`,
                                
                                // RESTORED: Original gradient and shadow styles
                                background: `linear-gradient(135deg, ${block.color}dd 0%, ${block.color}99 100%)`,
                                border: `2px solid ${borderColor}`,
                                boxShadow: block.hasPeakHours
                                  ? `0 6px 18px rgba(0,0,0,0.35), 0 0 16px rgba(239,68,68,0.25)`
                                  : `0 6px 18px rgba(0,0,0,0.35), 0 0 14px ${block.color}22`,
                                
                                zIndex: 10 + block.lane,
                            }}
                            onClick={() => onRemoveActivity(block.id)}
                        >
                            {/* RESTORED: Icon only layout */}
                            <span className="w-full h-full grid place-items-center">
                                <span className="text-[18px] leading-none translate-y-[1px] group-hover:scale-110 transition-transform drop-shadow-sm">
                                    {block.icon}
                                </span>
                            </span>

                            {/* Warning Badge */}
                            {block.hasPeakHours && (
                                <span className="absolute -top-2 -right-2 bg-destructive rounded-full w-5 h-5 flex items-center justify-center text-[11px] shadow-md ring-2 ring-background text-white">
                                    !
                                </span>
                            )}
                        </div>
                    </TooltipTrigger>
                    
                    {/* Tooltip handles the "Text Visibility" issue by showing details on hover instead */}
                    <TooltipContent side="top" className="p-3">
                        <div className="space-y-1">
                            <p className="font-semibold flex items-center gap-2">
                                {block.icon} {block.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {block.startHour}:00 - {block.startHour + block.duration}:00
                            </p>
                            <p className={cn("text-xs font-mono", block.hasPeakHours ? "text-destructive" : "text-green-500")}>
                                Cost: ${block.cost}
                            </p>
                        </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
          
           {/* Period labels */}
          <div className="flex mt-2">
            <div className="flex-1 text-center"><span className="text-xs text-muted-foreground">Night</span></div>
            <div className="flex-1 text-center"><span className="text-xs text-muted-foreground">Morning</span></div>
            <div className="flex-1 text-center"><span className="text-xs text-muted-foreground">Afternoon</span></div>
            <div className="flex-1 text-center"><span className="text-xs text-warning font-medium">Peak ⚡</span></div>
          </div>

      </div>
    </TooltipProvider>
  );
};

// Helper function
function getLayoutWithLanes(activities: any[]) {
  const sorted = [...activities].sort((a, b) => a.startHour - b.startHour);
  const lanes: number[] = [];

  return sorted.map((activity) => {
    let laneIndex = lanes.findIndex((laneEndTime) => laneEndTime <= activity.startHour);

    if (laneIndex === -1) {
      laneIndex = lanes.length;
      lanes.push(0);
    }
    lanes[laneIndex] = activity.startHour + activity.duration;
    return { ...activity, lane: laneIndex };
  });
}