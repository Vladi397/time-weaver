import React from 'react';
import { Button } from '@/components/ui/button';
// 1. Import Moon icon
import { HelpCircle, RefreshCw, Moon } from 'lucide-react';

interface GameHeaderProps {
  onEndDay: () => void;
  hasScheduledActivities: boolean;
  onShowTutorial: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ 
  onEndDay, 
  hasScheduledActivities,
  onShowTutorial
}) => {
  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between py-4">
        
        {/* LOGO SECTION */}
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="The Daily Grid Logo" 
            className="h-11 w-11 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
          />
          
          <div className="flex flex-col justify-center">
            <h1 className="font-display font-bold text-xl leading-none tracking-tight text-foreground">
              The Daily Grid
            </h1>
            <span className="text-[10px] text-muted-foreground font-medium mt-0.5 tracking-wide">
              Schedule your energy • Beat the peak
            </span>
          </div>
        </div>

        {/* ACTIONS SECTION */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onShowTutorial}
            className="text-muted-foreground hover:text-foreground"
            title="Show Tutorial"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>

          <Button 
            onClick={() => window.location.reload()}
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            title="Restart Game"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>

          <Button 
            onClick={onEndDay}
            disabled={!hasScheduledActivities}
            // 2. Added flex centering classes
            className={`
              font-display font-semibold transition-all duration-300
              flex items-center justify-center gap-2
              ${hasScheduledActivities 
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]' 
                : 'opacity-50 cursor-not-allowed'}
            `}
          >
            <span className="leading-none pb-0.5">End Day</span>
          
            <Moon className="w-4 h-4 fill-current" />
          </Button>
        </div>
      </div>
    </header>
  );
};