import React from 'react';

interface ComfortMeterProps {
  comfort: number;
}

export const ComfortMeter: React.FC<ComfortMeterProps> = ({ comfort }) => {
  const getMeterClass = () => {
    if (comfort >= 70) return 'meter-fill-success';
    if (comfort >= 40) return 'meter-fill-warning';
    return 'meter-fill-danger';
  };

  const getEmoji = () => {
    if (comfort >= 80) return '😊';
    if (comfort >= 60) return '😐';
    if (comfort >= 40) return '😕';
    return '😣';
  };

  return (
    <div className="game-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Comfort Level
        </span>
        <span className="text-2xl">{getEmoji()}</span>
      </div>
      
      <div className="meter-bar">
        <div 
          className={`h-full transition-all duration-500 ${getMeterClass()}`}
          style={{ width: `${comfort}%` }}
        />
      </div>
      
      <div className="mt-2 text-right">
        <span className="text-sm font-display font-semibold">{comfort}%</span>
      </div>
    </div>
  );
};
