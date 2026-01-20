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

// --- Enhanced Icons ---
const SunIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    <defs>
      <filter id="sun-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <circle cx="12" cy="12" r="4" className="fill-yellow-400 stroke-yellow-500" />
    <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" className="stroke-yellow-500" />
  </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" className="fill-slate-300/30 stroke-slate-300" />
  </svg>
);

interface TimelineProps {
  scheduledActivities: ScheduledActivity[];
  onDropActivity: (activityId: string, hour: number) => void;
  onRemoveActivity: (activityId: string) => void;
  onMoveActivity: (activityId: string, newHour: number) => void;
}

const ROW_HEIGHT = 44; 
const MIN_HEIGHT = 80;

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

  // 1) Process activities with Wrapping Logic
  const rawActivityBlocks = useMemo(() => {
    const blocks: any[] = [];

    scheduledActivities.forEach(({ activityId, startHour }) => {
      const activity = ACTIVITIES.find((a) => a.id === activityId);
      if (!activity) return;

      const duration = Math.max(2, activity.duration);
      let cost = 0;
      let hasPeakHours = false;
      
      // Calculate total cost using modulo to handle wrapping hours
      for (let h = 0; h < duration; h++) {
          const currentHour = (startHour + h) % 24;
          const block = TIME_BLOCKS[currentHour];
          if (block) {
              if (block.isPeak) hasPeakHours = true;
              cost += activity.energyUsage * BASE_RATE * block.multiplier;
          }
      }

      const totalCostStr = cost.toFixed(2);
      const uniqueIdBase = `${activityId}-${startHour}`;

      // Logic to split the block if it wraps around midnight (24h)
      if (startHour + duration > 24) {
        const firstSegmentDuration = 24 - startHour;
        const secondSegmentDuration = duration - firstSegmentDuration;

        // Part 1: End of timeline
        blocks.push({
          ...activity,
          duration: firstSegmentDuration,
          totalDuration: duration, // Keep track of real total duration
          startHour: startHour,
          hasPeakHours,
          cost: totalCostStr,
          uniqueId: `${uniqueIdBase}-head`,
          id: activityId,
          isSplit: true
        });

        // Part 2: Start of timeline (Wrapped)
        blocks.push({
          ...activity,
          duration: secondSegmentDuration,
          totalDuration: duration,
          startHour: 0,
          hasPeakHours,
          cost: totalCostStr,
          uniqueId: `${uniqueIdBase}-tail`,
          id: activityId,
          isSplit: true
        });
      } else {
        // Normal case: Fits within timeline
        blocks.push({
          ...activity,
          duration: duration,
          totalDuration: duration,
          startHour: startHour,
          hasPeakHours,
          cost: totalCostStr,
          uniqueId: uniqueIdBase,
          id: activityId,
          isSplit: false
        });
      }
    });

    return blocks;
  }, [scheduledActivities]);

  // 2) Layout calculation
  const { blocksWithLanes, totalHeight } = useMemo(() => {
    const blocks = getLayoutWithLanes(rawActivityBlocks);
    const maxLaneIndex = Math.max(...blocks.map((b) => b.lane), 0);
    const calculatedHeight = (maxLaneIndex + 1) * ROW_HEIGHT + 24;

    return {
      blocksWithLanes: blocks,
      totalHeight: Math.max(MIN_HEIGHT, calculatedHeight),
    };
  }, [rawActivityBlocks]);

  // 3) Ghost Block (Updated for Splitting)
  const ghostBlocks = useMemo(() => {
    if (dragOverHour === null || !draggingInternalId) return [];
    
    // Extract real activity ID from the unique internal ID (which might contain -head/-tail)
    const actId = draggingInternalId.split('-')[0]; 
    const activity = ACTIVITIES.find(a => a.id === actId);
    if (!activity) return [];
    
    const duration = Math.max(2, activity.duration);
    const result = [];

    // Check if ghost wraps around
    if (dragOverHour + duration > 24) {
      const firstDur = 24 - dragOverHour;
      const secondDur = duration - firstDur;
      result.push({ left: `${(dragOverHour / 24) * 100}%`, width: `${(firstDur / 24) * 100}%` });
      result.push({ left: `0%`, width: `${(secondDur / 24) * 100}%` });
    } else {
      result.push({ left: `${(dragOverHour / 24) * 100}%`, width: `${(duration / 24) * 100}%` });
    }

    return result;
  }, [dragOverHour, draggingInternalId]);

  return (
    <TooltipProvider>
      <div className="game-card p-5 relative overflow-hidden group">
        
        {/* Background Ambient Glow */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
           <h3 className="font-display font-bold text-xl tracking-tight text-foreground/90">
             Daily Schedule
           </h3>
           <div className="flex items-center gap-3 text-[10px] md:text-xs font-medium bg-background/40 p-1.5 rounded-lg border border-border/50 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md">
               <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               <span className="text-muted-foreground">Off-peak</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md">
               <div className="w-2 h-2 rounded-full bg-[hsl(var(--peak))] shadow-[0_0_8px_rgba(249,115,22,0.5)] animate-pulse" />
               <span className="text-[hsl(var(--peak))]">Peak Hours</span>
            </div>
          </div>
        </div>

        {/* --- ENHANCED SKY VISUALIZATION --- */}
        <div className="relative h-16 mb-2 w-full select-none overflow-hidden rounded-t-xl bg-gradient-to-b from-[#0f172a] to-[#1e293b] border border-border/30 shadow-inner">
            
            {/* Stars / Noise texture could go here */}
            
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                    <linearGradient id="skyPathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#64748b" stopOpacity="0.3" /> {/* Night */}
                        <stop offset="15%" stopColor="#3b82f6" stopOpacity="0.8" /> {/* Dawn */}
                        <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />   {/* Noon */}
                        <stop offset="85%" stopColor="#3b82f6" stopOpacity="0.8" /> {/* Dusk */}
                        <stop offset="100%" stopColor="#64748b" stopOpacity="0.3" /> {/* Night */}
                    </linearGradient>
                    
                    <filter id="glowPath" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
                
                {/* The Path Glow */}
                <path 
                    d="M-5,85 C 20,85 30,25 50,25 C 70,25 80,85 105,85" 
                    fill="none" 
                    stroke="url(#skyPathGradient)" 
                    strokeWidth="4"
                    strokeLinecap="round"
                    filter="url(#glowPath)"
                    opacity="0.5"
                />

                {/* The Crisp Path Line */}
                <path 
                    d="M-5,85 C 20,85 30,25 50,25 C 70,25 80,85 105,85" 
                    fill="none" 
                    stroke="url(#skyPathGradient)" 
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="drop-shadow-md"
                />
            </svg>

            {/* Celestial Bodies */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Moon - Early Morning */}
                <div className="absolute left-[8%] top-[55%] w-6 h-6 opacity-80 animate-float">
                    <MoonIcon className="w-full h-full text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.4)]" />
                </div>
                
                {/* Sun - Noon (Animated) */}
                <div className="absolute left-[50%] top-[12%] -translate-x-1/2 w-10 h-10 z-10">
                      <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse"></div>
                    <SunIcon className="w-full h-full text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-[spin_16s_linear_infinite]" />
                </div>

                {/* Moon - Late Night */}
                <div className="absolute right-[8%] top-[55%] w-6 h-6 opacity-80 animate-float" style={{ animationDelay: '1.5s' }}>
                    <MoonIcon className="w-full h-full text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.4)]" />
                </div>
            </div>

            {/* Bottom Horizon Line */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent opacity-50"></div>
        </div>

        {/* Time Labels */}
        <div className="relative flex w-full mb-1 px-px">
          {TIME_BLOCKS.map((block, i) => {
            const showLabel = i % 2 === 0; 
            return (
                <div 
                    key={block.hour} 
                    className="flex-1 text-center relative h-6"
                >
                    {showLabel && (
                        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 group/time">
                            <div className="w-px h-1.5 bg-border/60 group-hover/time:bg-primary/60 transition-colors"></div>
                            <span className="text-[10px] text-muted-foreground font-mono font-medium group-hover/time:text-foreground transition-colors">
                                {block.label}
                            </span>
                        </div>
                    )}
                </div>
            );
          })}
        </div>

        {/* Timeline Grid */}
        <div
            className="relative rounded-xl overflow-hidden border border-border/40 bg-background/30 shadow-inner transition-all duration-300"
            style={{ height: `${totalHeight}px` }}
        >
            {/* Background Columns */}
            <div className="absolute inset-0 flex h-full">
              {TIME_BLOCKS.map((block) => (
                <div
                  key={block.hour}
                  onDrop={(e) => handleDrop(e, block.hour)}
                  onDragOver={(e) => handleDragOver(e, block.hour)}
                  className={cn(
                    "relative flex-1 h-full border-r border-border/10 transition-colors duration-200",
                    block.isPeak && "timeline-slot peak", // Uses the striped pattern from CSS
                    dragOverHour === block.hour && "bg-accent/10"
                  )}
                >
                   {/* Vertical Grid Lines */}
                   <div className={cn(
                       "absolute top-0 left-0 w-px h-full",
                       block.hour % 2 === 0 ? "bg-border/20" : "bg-transparent"
                   )} />
                </div>
              ))}
            </div>

            {/* Ghost Preview (Supports multiple parts for wrapping) */}
            {ghostBlocks.map((ghost, idx) => (
                <div 
                    key={`ghost-${idx}`}
                    className="absolute pointer-events-none z-0 rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 animate-pulse"
                    style={{
                        left: ghost.left,
                        width: ghost.width,
                        top: 6,
                        bottom: 6
                    }}
                />
            ))}

            {/* Activity Blocks */}
            <div className="absolute inset-0 pointer-events-none">
              {blocksWithLanes.map((block) => {
                const widthPercent = (block.duration / 24) * 100;
                const leftPercent = (block.startHour / 24) * 100;
                const isDragging = draggingInternalId === block.uniqueId;
                
                const borderColor = block.hasPeakHours 
                    ? 'hsl(var(--destructive))' 
                    : block.color;

                const borderStyle = block.hasPeakHours ? '2px solid' : '2px solid';

                const shadow = block.hasPeakHours
                    ? `0 0 15px hsl(var(--destructive) / 0.5), inset 0 0 10px hsl(var(--destructive) / 0.2)`
                    : `0 4px 12px rgba(0,0,0,0.5), 0 0 8px ${block.color}44`; 

                return (
                  <Tooltip key={block.uniqueId} delayDuration={0}>
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
                                "flex items-center justify-center",
                                isDragging ? "opacity-40 scale-95 grayscale" : "hover:scale-[1.03] hover:z-50 hover:brightness-110",
                                block.hasPeakHours ? 'animate-pulse-glow z-20' : 'z-10'
                            )}
                            style={{
                                left: `${leftPercent}%`,
                                width: `${widthPercent}%`,
                                top: `${block.lane * ROW_HEIGHT + 6}px`,
                                height: `${ROW_HEIGHT - 6}px`,
                                
                                background: `linear-gradient(135deg, ${block.color}dd 0%, ${block.color}99 100%)`,
                                border: borderStyle,
                                borderColor: borderColor,
                                boxShadow: shadow,
                                
                                zIndex: 10 + block.lane,
                            }}
                            onClick={() => onRemoveActivity(block.id)}
                        >
                            {/* Icon Wrapper */}
                            <span className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-[1px]">
                                <block.icon className="w-5 h-5 text-white filter drop-shadow-md group-hover:scale-110 transition-transform" />
                            </span>

                            {/* Warning Indicator */}
                            {block.hasPeakHours && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-4 w-4 bg-destructive items-center justify-center text-[10px] text-destructive-foreground font-bold shadow-sm">!</span>
                                </span>
                            )}
                        </div>
                    </TooltipTrigger>
                    
                    {/* Tooltip */}
                    <TooltipContent 
                        side="top" 
                        className="glass border-border/50 text-foreground p-3 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                    >
                        <div className="space-y-1.5 min-w-[140px]">
                            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                                <span className="font-display font-semibold flex items-center gap-2 text-sm">
                                  
                                    <block.icon className="w-4 h-4" /> {block.name}
                                </span>
                            </div>
                            
                            <div className="space-y-1 pt-1">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Time</span>
                                    {/* Use totalDuration here to show correct info even on split blocks */}
                                    <span className="font-mono text-foreground">
                                        {(block.totalDuration ?? block.duration)}h
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Cost</span>
                                    <span className={cn(
                                        "font-mono font-bold", 
                                        block.hasPeakHours ? "text-destructive" : "text-emerald-400"
                                    )}>
                                        ${block.cost}
                                    </span>
                                </div>
                            </div>

                            {block.hasPeakHours && (
                                <div className="text-[10px] text-destructive-foreground bg-destructive/90 px-2 py-1 rounded mt-1 text-center font-medium animate-pulse">
                                    High Cost Warning ⚡
                                </div>
                            )}
                            <div className="text-[9px] text-muted-foreground/50 text-center pt-1 italic">
                                Click to remove
                            </div>
                        </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
      </div>
    </TooltipProvider>
  );
};

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