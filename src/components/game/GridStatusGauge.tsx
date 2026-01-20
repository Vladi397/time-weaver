import React from 'react';
import { AlertTriangle, Zap } from 'lucide-react';

interface GridStatusGaugeProps {
  stress: number;
}

export const GridStatusGauge: React.FC<GridStatusGaugeProps> = ({ stress }) => {
  const isCritical = stress >= 70;
  
  const getColor = () => {
    if (stress < 40) return 'hsl(142, 76%, 46%)'; // Green
    if (stress < 70) return 'hsl(38, 92%, 50%)';  // Orange
    return 'hsl(0, 72%, 51%)';                    // Red
  };

  const getStatusText = () => {
    if (stress < 40) return 'Stable';
    if (stress < 70) return 'Moderate';
    return 'OVERLOAD';
  };

  // SVG gauge calculations
  const radius = 45;
  const circumference = Math.PI * radius; // Semi-circle
  const offset = circumference - (stress / 100) * circumference;

  return (
    <div 
      className={`
        game-card p-4 flex flex-col items-center transition-all duration-500 relative overflow-hidden
        ${isCritical 
          ? 'bg-red-950/10 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
          : 'game-card-glow'
        }
      `}
    >
      {/* Background warning pulse for critical state */}
      {isCritical && (
        <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
      )}

      <div className="flex items-center gap-1.5 mb-2 relative z-10">
        <span className={`text-xs uppercase tracking-wider font-semibold ${isCritical ? 'text-red-500' : 'text-muted-foreground'}`}>
          Grid Status
        </span>
        {isCritical && (
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-bounce" />
        )}
      </div>
      
      <div className="relative w-28 h-16 z-10">
        <svg
          viewBox="0 0 100 55"
          className="w-full h-full overflow-visible"
        >
          {/* Background arc */}
          <path
            d="M 5 50 A 45 45 0 0 1 95 50"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            strokeLinecap="round"
            className="opacity-30"
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
            className="gauge-ring transition-all duration-700 ease-out"
            style={{
              filter: `drop-shadow(0 0 ${isCritical ? '12px' : '4px'} ${getColor()})`,
            }}
          />

          {/* Critical Threshold Marker (Visual hint at 70%) */}
          <line 
            x1="74" y1="14" 
            x2="70" y2="18" 
            stroke="currentColor" 
            strokeWidth="1" 
            className="text-muted-foreground/30" 
          />
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span 
            className={`text-xl font-display font-bold transition-all duration-300 ${isCritical ? 'scale-110' : ''}`}
            style={{ 
              color: getColor(),
              textShadow: isCritical ? `0 0 15px ${getColor()}` : 'none'
            }}
          >
            {stress}%
          </span>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-1 mt-1">
        {isCritical && <Zap className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />}
        <span 
          className="text-sm font-bold tracking-tight transition-all duration-300"
          style={{ 
            color: getColor(),
            textShadow: isCritical ? `0 0 8px ${getColor()}` : 'none'
          }}
        >
          {getStatusText()}
        </span>
        {isCritical && <Zap className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />}
      </div>
    </div>
  );
};