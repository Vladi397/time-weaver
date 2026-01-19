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

  const getGrade = () => {
    if (summary.comfortScore >= 80 && summary.totalCost < 20 && summary.gridStressMax < 50) {
      return { grade: 'A', message: 'Excellent!', color: 'hsl(142, 76%, 46%)' };
    }
    if (summary.comfortScore >= 60 && summary.totalCost < 35 && summary.gridStressMax < 70) {
      return { grade: 'B', message: 'Good job!', color: 'hsl(199, 89%, 48%)' };
    }
    if (summary.comfortScore >= 40 && summary.gridStressMax < 85) {
      return { grade: 'C', message: 'Room to improve', color: 'hsl(38, 92%, 50%)' };
    }
    return { grade: 'D', message: 'Try again!', color: 'hsl(0, 72%, 51%)' };
  };

  const { grade, message, color } = getGrade();

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
              className="inline-flex items-center justify-center w-24 h-24 rounded-full text-5xl font-display font-bold"
              style={{
                background: `linear-gradient(135deg, ${color}33 0%, ${color}11 100%)`,
                border: `3px solid ${color}`,
                color,
                boxShadow: `0 0 30px ${color}44`,
              }}
            >
              {grade}
            </div>
            <p className="mt-2 text-lg font-medium" style={{ color }}>
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
            Play Again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
