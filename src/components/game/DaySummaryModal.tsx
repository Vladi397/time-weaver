import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DaySummary } from '@/types/game';

interface DaySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  summary: DaySummary | null;
}

export const DaySummaryModal: React.FC<DaySummaryModalProps> = ({
  isOpen,
  onClose,
  onRestart,
  summary,
}) => {
  if (!summary) return null;

  const getDutchGrade = () => {
    let gradeValue = 1.0;
    let message = '';
    let color = '';

    // Helper to calculate bonus points (0.0 to 1.0 scale)
    // proportional to how good the stats are within the tier range.
    const calculateBonus = (
      comfort: number, minComfort: number, maxComfort: number,
      stress: number, maxStress: number, minStress: number
    ) => {
      // 1. Comfort Contribution (50%)
      const comfortRange = maxComfort - minComfort;
      const comfortProgress = Math.max(0, Math.min(1, (comfort - minComfort) / comfortRange));
      
      // 2. Stress Contribution (50%) - Lower stress is better!
      const stressRange = maxStress - minStress;
      // If stress is at maxStress (bad), progress is 0. If stress is at minStress (good), progress is 1.
      const stressProgress = Math.max(0, Math.min(1, (maxStress - stress) / stressRange));

      return (comfortProgress * 0.5) + (stressProgress * 0.5);
    };

    // Tier 1: Excellent (8.5 - 10.0)
    // Requirements: Comfort 80+, Cost < $20, Stress < 50%
    if (summary.comfortScore >= 80 && summary.totalCost < 20 && summary.gridStressMax < 50) {
      // Calculate how close to perfection (10.0) you are
      // Comfort: 80 -> 100
      // Stress: 50 -> 0 (0 stress is perfect)
      const progress = calculateBonus(summary.comfortScore, 80, 100, summary.gridStressMax, 50, 0);
      
      gradeValue = 8.5 + (progress * 1.5); // Map 0-1 progress to 1.5 points (8.5 -> 10.0)
      message = 'Excellent';
      color = 'hsl(142, 76%, 46%)'; // Green
    }
    
    // Tier 2: Good (7.0 - 8.4)
    // Requirements: Comfort 60+, Cost < $35, Stress < 70%
    else if (summary.comfortScore >= 60 && summary.totalCost < 35 && summary.gridStressMax < 70) {
      // Comfort: 60 -> 80
      // Stress: 70 -> 50
      const progress = calculateBonus(summary.comfortScore, 60, 80, summary.gridStressMax, 70, 50);
      
      gradeValue = 7.0 + (progress * 1.4); // Map 0-1 progress to 1.4 points (7.0 -> 8.4)
      message = 'Good job';
      color = 'hsl(199, 89%, 48%)'; // Blue
    }
    
    // Tier 3: Sufficient (5.5 - 6.9)
    // Requirements: Comfort 40+, Stress < 85%
    else if (summary.comfortScore >= 40 && summary.gridStressMax < 85) {
      // Comfort: 40 -> 60
      // Stress: 85 -> 70
      const progress = calculateBonus(summary.comfortScore, 40, 60, summary.gridStressMax, 85, 70);
      
      gradeValue = 5.5 + (progress * 1.4); // Map 0-1 progress to 1.4 points (5.5 -> 6.9)
      message = 'Sufficient';
      color = 'hsl(38, 92%, 50%)'; // Orange
    }
    
    // Tier 4: Insufficient (1.0 - 5.4)
    else {
      // Comfort: 0 -> 40
      // Stress: 100 -> 85
      const progress = calculateBonus(summary.comfortScore, 0, 40, summary.gridStressMax, 100, 85);
      
      gradeValue = 1.0 + (progress * 4.4); // Map 0-1 progress to 4.4 points (1.0 -> 5.4)
      message = 'Insufficient';
      color = 'hsl(0, 72%, 51%)'; // Red
    }

    // Safety Clamp: Ensure grade stays within 1.0 - 10.0
    gradeValue = Math.min(10.0, Math.max(1.0, gradeValue));

    return { 
      grade: gradeValue.toFixed(1).replace('.', ','), 
      message, 
      color 
    };
  };

  const { grade, message, color } = getDutchGrade();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="game-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center">
            Day Complete! 🌙
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Grade */}
          <div className="text-center">
            <div 
              className="inline-flex items-center justify-center w-32 h-32 rounded-full text-5xl font-display font-bold transition-all duration-500 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${color}33 0%, ${color}11 100%)`,
                border: `4px solid ${color}`,
                color,
                boxShadow: `0 0 30px ${color}44`,
              }}
            >
              {grade}
            </div>
            <p className="mt-3 text-lg font-medium" style={{ color }}>
              {message}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-display font-bold text-warning">
                ${summary.totalCost.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Total Cost</div>
            </div>
            
            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-display font-bold" style={{
                color: summary.gridStressMax < 50 ? 'hsl(142, 76%, 46%)' 
                     : summary.gridStressMax < 70 ? 'hsl(38, 92%, 50%)'
                     : 'hsl(0, 72%, 51%)'
              }}>
                {summary.gridStressMax}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">Peak Grid Stress</div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-display font-bold">
                {summary.peakHoursUsed}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Peak Hours Used</div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-display font-bold" style={{
                color: summary.comfortScore >= 70 ? 'hsl(142, 76%, 46%)' 
                     : summary.comfortScore >= 40 ? 'hsl(38, 92%, 50%)'
                     : 'hsl(0, 72%, 51%)'
              }}>
                {summary.comfortScore}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">Comfort Score</div>
            </div>
          </div>

          {/* Neighborhood impact */}
          <div 
            className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-center"
          >
            <p className="text-sm text-accent font-medium">
              🏘️ Neighborhood Impact
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.neighborhoodImpact}
            </p>
          </div>

          <Button 
            onClick={onRestart}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold"
          >
            Next Day
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};