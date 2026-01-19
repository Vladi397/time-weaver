import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

interface GameHeaderProps {
  onEndDay: () => void;
  hasScheduledActivities: boolean;
  onShowTutorial?: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  onEndDay,
  hasScheduledActivities,
  onShowTutorial,
}) => {
  return (
    <header className="flex items-center justify-between py-4 px-6 border-b border-border/50">
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, hsl(142, 76%, 46%) 0%, hsl(199, 89%, 48%) 100%)',
            boxShadow: '0 4px 15px hsl(142, 76%, 46%, 0.3)',
          }}
        >
          <span className="text-xl">⚡</span>
        </div>
        <div>
          <h1 className="font-display font-bold text-xl tracking-tight">
            Power Shift Daily
          </h1>
          <p className="text-xs text-muted-foreground">
            Schedule your energy • Beat the peak
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right mr-4">
          <div className="text-xs text-muted-foreground">Current Time</div>
          <div className="font-display font-semibold text-accent">
            ☀️ Morning Start
          </div>
        </div>

        {onShowTutorial && (
          <Button
            variant="outline"
            size="icon"
            onClick={onShowTutorial}
            className="border-border/50 hover:bg-muted"
            title="Show tutorial"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        )}
        
        <Button
          onClick={onEndDay}
          disabled={!hasScheduledActivities}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-display font-semibold px-6 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          End Day 🌙
        </Button>
      </div>
    </header>
  );
};
