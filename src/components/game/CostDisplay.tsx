import React from 'react';

interface CostDisplayProps {
  cost: number;
  isSurgePricing: boolean;
}

export const CostDisplay: React.FC<CostDisplayProps> = ({ cost, isSurgePricing }) => {
  return (
    <div className="game-card game-card-glow p-4">
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{
            background: 'linear-gradient(135deg, hsl(142, 76%, 46%) 0%, hsl(142, 76%, 36%) 100%)',
            boxShadow: '0 4px 15px hsl(142, 76%, 46%, 0.3)',
          }}
        >
          $
        </div>
        <div>
          <span className="cost-display text-warning">{cost.toFixed(2)}</span>
          <div className="text-xs text-muted-foreground">Today's Cost</div>
        </div>
      </div>

      {isSurgePricing && (
        <div 
          className="mt-3 px-3 py-2 rounded-lg flex items-center gap-2 text-sm animate-pulse"
          style={{
            background: 'linear-gradient(90deg, hsl(38, 92%, 50%, 0.2) 0%, hsl(0, 72%, 51%, 0.2) 100%)',
            border: '1px solid hsl(38, 92%, 50%, 0.5)',
          }}
        >
          <span className="text-base">⚠️</span>
          <div>
            <div className="font-semibold text-warning">SURGE PRICING ACTIVE</div>
            <div className="text-xs text-muted-foreground">4× normal rates</div>
          </div>
        </div>
      )}
    </div>
  );
};
