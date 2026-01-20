import React from 'react';
import { generateSuggestions, ACTIVITIES } from '@/data/gameData';
import { ScheduledActivity } from '@/types/game';
import { Lightbulb, Sparkles, ArrowRight } from 'lucide-react'; // Import icons

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
          {/* CHANGED: Emoji to Icon */}
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Smart Suggestions
        </h3>
        <div className="text-sm text-muted-foreground text-center py-4">
          {/* CHANGED: Emoji to Icon */}
          <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          Great job! Your schedule avoids peak hours.
        </div>
      </div>
    );
  }

  return (
    <div className="game-card p-4">
      <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
        {/* CHANGED: Emoji to Icon */}
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        Smart Suggestions
      </h3>
      
      <div className="space-y-2">
        {suggestions.map((suggestion) => {
          const activity = ACTIVITIES.find(a => a.id === suggestion.activityId);
          // Helper to get the component for rendering
          const ActivityIcon = activity?.icon;
          
          return (
            <button
              key={suggestion.id}
              onClick={() => onApplySuggestion(suggestion.activityId, suggestion.toHour)}
              className="suggestion-card w-full text-left group"
            >
              <div className="flex items-center gap-3">
                {/* CHANGED: Render as Component */}
                <span className="text-xl">
                  {ActivityIcon && <ActivityIcon className="w-5 h-5" />}
                </span>
                
                <div className="flex-1">
                  <div className="text-sm font-medium">{suggestion.message}</div>
                  <div className="text-xs text-primary font-bold">
                    Save ${suggestion.savingsEstimate.toFixed(2)}
                  </div>
                </div>
                
                {/* CHANGED: Emoji arrow to Icon */}
                <ArrowRight className="w-4 h-4 text-accent group-hover:translate-x-1 transition-transform" />
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