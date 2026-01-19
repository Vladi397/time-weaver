import React, { useState, useCallback, useMemo } from 'react';
import { GameHeader } from '@/components/game/GameHeader';
import { CostDisplay } from '@/components/game/CostDisplay';
import { GridStatusGauge } from '@/components/game/GridStatusGauge';
import { ComfortMeter } from '@/components/game/ComfortMeter';
import { ActivityCard } from '@/components/game/ActivityCard';
import { Timeline } from '@/components/game/Timeline';
import { HouseVisualization } from '@/components/game/HouseVisualization';
import { Suggestions } from '@/components/game/Suggestions';
import { DaySummaryModal } from '@/components/game/DaySummaryModal';
import { 
  ACTIVITIES, 
  TIME_BLOCKS,
  calculateCost, 
  calculateGridStress, 
  calculateComfort 
} from '@/data/gameData';
import { ScheduledActivity, Activity, DaySummary } from '@/types/game';

const Index: React.FC = () => {
  const [scheduledActivities, setScheduledActivities] = useState<ScheduledActivity[]>([]);
  const [draggingActivity, setDraggingActivity] = useState<Activity | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [daySummary, setDaySummary] = useState<DaySummary | null>(null);

  // Calculate derived state
  const currentCost = useMemo(() => calculateCost(scheduledActivities), [scheduledActivities]);
  const gridStress = useMemo(() => calculateGridStress(scheduledActivities), [scheduledActivities]);
  const comfort = useMemo(() => calculateComfort(scheduledActivities), [scheduledActivities]);

  // Check if surge pricing is active (any activity during peak)
  const isSurgePricing = useMemo(() => {
    return scheduledActivities.some(({ activityId, startHour }) => {
      const activity = ACTIVITIES.find(a => a.id === activityId);
      if (!activity) return false;
      
      for (let h = 0; h < activity.duration; h++) {
        if (TIME_BLOCKS[startHour + h]?.isPeak) return true;
      }
      return false;
    });
  }, [scheduledActivities]);

  const handleDropActivity = useCallback((activityId: string, hour: number) => {
    // Check if already scheduled
    if (scheduledActivities.some(sa => sa.activityId === activityId)) {
      return;
    }

    // Check if fits within 24 hours
    const activity = ACTIVITIES.find(a => a.id === activityId);
    if (!activity || hour + activity.duration > 24) {
      return;
    }

    setScheduledActivities(prev => [...prev, { activityId, startHour: hour }]);
  }, [scheduledActivities]);

  const handleRemoveActivity = useCallback((activityId: string) => {
    setScheduledActivities(prev => prev.filter(sa => sa.activityId !== activityId));
  }, []);

  const handleMoveActivity = useCallback((activityId: string, newHour: number) => {
    const activity = ACTIVITIES.find(a => a.id === activityId);
    if (!activity || newHour + activity.duration > 24) return;

    setScheduledActivities(prev =>
      prev.map(sa =>
        sa.activityId === activityId ? { ...sa, startHour: newHour } : sa
      )
    );
  }, []);

  const handleApplySuggestion = useCallback((activityId: string, newHour: number) => {
    handleMoveActivity(activityId, newHour);
  }, [handleMoveActivity]);

  const handleEndDay = useCallback(() => {
    // Calculate peak hours used
    const peakHoursUsed = scheduledActivities.reduce((count, { activityId, startHour }) => {
      const activity = ACTIVITIES.find(a => a.id === activityId);
      if (!activity) return count;
      
      let peakCount = 0;
      for (let h = 0; h < activity.duration; h++) {
        if (TIME_BLOCKS[startHour + h]?.isPeak) peakCount++;
      }
      return count + peakCount;
    }, 0);

    // Generate neighborhood impact message
    let neighborhoodImpact: string;
    if (gridStress < 40) {
      neighborhoodImpact = "If everyone planned like you, peak demand would drop by 30%! 🌟";
    } else if (gridStress < 70) {
      neighborhoodImpact = "Your choices help, but the grid still felt some strain.";
    } else {
      neighborhoodImpact = "High peak usage contributed to neighborhood grid stress.";
    }

    setDaySummary({
      totalCost: currentCost,
      peakHoursUsed,
      gridStressMax: gridStress,
      comfortScore: comfort,
      neighborhoodImpact,
    });
    setShowSummary(true);
  }, [scheduledActivities, currentCost, gridStress, comfort]);

  const handleRestart = useCallback(() => {
    setScheduledActivities([]);
    setDaySummary(null);
    setShowSummary(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <GameHeader 
        onEndDay={handleEndDay}
        hasScheduledActivities={scheduledActivities.length > 0}
      />

      <main className="container py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left sidebar - Activities */}
          <div className="col-span-3 space-y-4">
            <div className="game-card p-4">
              <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="text-xl">🎮</span>
                Activities
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Drag activities to the timeline below
              </p>
              <div className="space-y-3">
                {ACTIVITIES.map(activity => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    isScheduled={scheduledActivities.some(sa => sa.activityId === activity.id)}
                    onDragStart={setDraggingActivity}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Center - House and Timeline */}
          <div className="col-span-6 space-y-4">
            <HouseVisualization 
              scheduledActivities={scheduledActivities}
              gridStress={gridStress}
            />
            
            <Timeline
              scheduledActivities={scheduledActivities}
              onDropActivity={handleDropActivity}
              onRemoveActivity={handleRemoveActivity}
              onMoveActivity={handleMoveActivity}
            />

            {/* Instructions */}
            {scheduledActivities.length === 0 && (
              <div className="text-center py-6 animate-slide-up">
                <div className="text-4xl mb-3">👆</div>
                <h3 className="font-display font-semibold text-lg">Plan Your Day</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                  Drag activities from the left panel onto the timeline. 
                  Avoid the orange peak hours (5-8 PM) to save money!
                </p>
              </div>
            )}
          </div>

          {/* Right sidebar - Status */}
          <div className="col-span-3 space-y-4">
            <CostDisplay 
              cost={currentCost} 
              isSurgePricing={isSurgePricing}
            />
            
            <GridStatusGauge stress={gridStress} />
            
            <ComfortMeter comfort={comfort} />
            
            <Suggestions
              scheduledActivities={scheduledActivities}
              onApplySuggestion={handleApplySuggestion}
            />
          </div>
        </div>
      </main>

      <DaySummaryModal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        onRestart={handleRestart}
        summary={daySummary}
      />
    </div>
  );
};

export default Index;
