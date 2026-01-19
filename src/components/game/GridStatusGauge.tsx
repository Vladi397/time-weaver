import React from 'react';

interface GridStatusGaugeProps {
  stress: number;
}

export const GridStatusGauge: React.FC<GridStatusGaugeProps> = ({ stress }) => {
  const getColor = () => {
    if (stress < 40) return 'hsl(142, 76%, 46%)';
    if (stress < 70) return 'hsl(38, 92%, 50%)';
    return 'hsl(0, 72%, 51%)';
  };

  const getStatusText = () => {
    if (stress < 40) return 'Stable';
    if (stress < 70) return 'Moderate';
    return 'Critical';
  };

  // SVG gauge calculations
  const radius = 45;
  const circumference = Math.PI * radius; // Semi-circle
  const offset = circumference - (stress / 100) * circumference;

  return (
    <div className="game-card game-card-glow p-4 flex flex-col items-center">
      <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
        Grid Status
      </span>
      
      <div className="relative w-28 h-16">
        <svg
          viewBox="0 0 100 55"
          className="w-full h-full"
        >
          {/* Background arc */}
          <path
            d="M 5 50 A 45 45 0 0 1 95 50"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Colored progress arc */}
          <path
            d="M 5 50 A 45 45 0 0 1 95 50"
            fill="none"
            stroke={getColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="gauge-ring"
            style={{
              filter: `drop-shadow(0 0 8px ${getColor()})`,
            }}
          />

          {/* Danger zone markers */}
          <path
            d="M 75 15 A 45 45 0 0 1 95 50"
            fill="none"
            stroke="hsl(0, 72%, 51%)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.3"
          />
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span 
            className="text-xl font-display font-bold"
            style={{ color: getColor() }}
          >
            {stress}%
          </span>
        </div>
      </div>

      <span 
        className="text-sm font-medium mt-1"
        style={{ color: getColor() }}
      >
        {getStatusText()}
      </span>
    </div>
  );
};
