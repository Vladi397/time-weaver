import React from 'react';
import { generateSuggestions, ACTIVITIES } from '@/data/gameData';
import { ScheduledActivity } from '@/types/game';

interface SuggestionsProps {
  scheduledActivities: ScheduledActivity[];
  onApplySuggestion: (activityId: string, newHour: number) => void;
}

export const Suggestions: React.FC<SuggestionsProps> = ({
  scheduledActivities,
  onApplySuggestion,
}) => {
  const suggestions = generateSuggestions(scheduledActivities);

  if (suggestions.length === 0) {
    return (
      <div className="game-card p-4">
        <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
          <span className="text-xl">💡</span>
          Smart Suggestions
        </h3>
        <div className="text-sm text-muted-foreground text-center py-4">
          <span className="text-2xl block mb-2">✨</span>
          Great job! Your schedule avoids peak hours.
        </div>
      </div>
    );
  }

  return (
    <div className="game-card p-4">
      <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
        <span className="text-xl">💡</span>
        Smart Suggestions
      </h3>
      
      <div className="space-y-2">
        {suggestions.map((suggestion) => {
          const activity = ACTIVITIES.find(a => a.id === suggestion.activityId);
          
          return (
            <button
              key={suggestion.id}
              onClick={() => onApplySuggestion(suggestion.activityId, suggestion.toHour)}
              className="suggestion-card w-full text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{activity?.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{suggestion.message}</div>
                  <div className="text-xs text-primary">
                    Save ${suggestion.savingsEstimate.toFixed(2)}
                  </div>
                </div>
                <span className="text-accent text-lg">→</span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        Click a suggestion to apply it instantly
      </p>
    </div>
  );
};
