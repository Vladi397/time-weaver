import React, { useMemo } from 'react';
import { ACTIVITIES } from '@/data/gameData';
import { ScheduledActivity, RoomType } from '@/types/game';
import { 
  Moon, 
  Sun, 
  Sunrise, 
  Sunset, 
  Bed, 
  Armchair, 
  Utensils, 
  Car, 
  Shirt 
} from 'lucide-react';

interface HouseVisualizationProps {
  scheduledActivities: ScheduledActivity[];
  gridStress: number;
  currentHour?: number;
}

interface RoomState {
  room: RoomType;
  isActive: boolean;
  isStressed: boolean;
  // This expects a React Component (like <Car />), not a string
  activeIcon?: React.ElementType; 
}

// --- Visual Helpers ---

const getTimeOfDay = (hour: number) => {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
};

const getTimeIcon = (timeOfDay: string) => {
  switch (timeOfDay) {
    case 'dawn': return <Sunrise className="w-5 h-5 text-amber-400" />;
    case 'day': return <Sun className="w-5 h-5 text-yellow-400" />;
    case 'dusk': return <Sunset className="w-5 h-5 text-orange-400" />;
    case 'night': return <Moon className="w-5 h-5 text-indigo-300" />;
    default: return <Sun className="w-5 h-5 text-yellow-400" />;
  }
};

const getSkyGradient = (timeOfDay: string) => {
  switch (timeOfDay) {
    case 'dawn':
      return 'linear-gradient(180deg, hsl(220, 60%, 30%) 0%, hsl(35, 80%, 60%) 50%, hsl(45, 90%, 70%) 100%)';
    case 'day':
      return 'linear-gradient(180deg, hsl(199, 89%, 48%) 0%, hsl(199, 70%, 65%) 50%, hsl(199, 50%, 80%) 100%)';
    case 'dusk':
      return 'linear-gradient(180deg, hsl(260, 50%, 25%) 0%, hsl(20, 80%, 50%) 40%, hsl(35, 90%, 60%) 100%)';
    case 'night':
      return 'linear-gradient(180deg, hsl(230, 50%, 10%) 0%, hsl(230, 40%, 20%) 50%, hsl(230, 30%, 30%) 100%)';
    default:
      return 'linear-gradient(180deg, hsl(199, 89%, 48%) 0%, hsl(199, 50%, 80%) 100%)';
  }
};

const getAmbientOverlay = (timeOfDay: string) => {
  switch (timeOfDay) {
    case 'dawn': return 'hsl(35, 60%, 50%, 0.15)';
    case 'day': return 'transparent';
    case 'dusk': return 'hsl(20, 70%, 40%, 0.2)';
    case 'night': return 'hsl(230, 60%, 10%, 0.5)';
    default: return 'transparent';
  }
};

const getWindowGlow = (timeOfDay: string, isActive: boolean) => {
  if (timeOfDay === 'night' || timeOfDay === 'dusk') {
    return isActive 
      ? '0 0 25px hsl(45, 90%, 60%, 0.8), inset 0 0 15px hsl(45, 90%, 60%, 0.4)'
      : '0 0 15px hsl(45, 80%, 50%, 0.4), inset 0 0 10px hsl(45, 80%, 50%, 0.2)';
  }
  return isActive ? '0 0 20px hsl(199, 89%, 48%, 0.4)' : 'none';
};

// --- Main Component ---

export const HouseVisualization: React.FC<HouseVisualizationProps> = ({
  scheduledActivities,
  gridStress,
  currentHour = 6,
}) => {
  const timeOfDay = useMemo(() => getTimeOfDay(currentHour), [currentHour]);
  
  // Determine room states based on scheduled activities
  // Determine room states based on scheduled activities
  const getRoomStates = (): RoomState[] => {
    const rooms: RoomType[] = ['garage', 'laundry', 'kitchen', 'living', 'bedroom'];
    
    return rooms.map(room => {
      // Find any scheduled activity for this room
      const scheduledInstance = scheduledActivities.find(sa => {
        const activity = ACTIVITIES.find(a => a.id === sa.activityId);
        return activity?.room === room;
      });

      const activity = scheduledInstance 
        ? ACTIVITIES.find(a => a.id === scheduledInstance.activityId)
        : undefined;

      // Check peak hours (for stress visualization)
      const isInPeak = scheduledInstance 
        ? (scheduledInstance.startHour >= 17 && scheduledInstance.startHour <= 20) ||
          (scheduledInstance.startHour + (activity?.duration || 0) > 17 && scheduledInstance.startHour < 21)
        : false;

      return {
        room,
        isActive: !!scheduledInstance,
        isStressed: isInPeak && gridStress > 50,
        activeIcon: activity?.icon, // This is now a component reference (e.g., Car)
      };
    });
  };

  const roomStates = getRoomStates();

  const getRoomStyle = (room: RoomType) => {
    const state = roomStates.find(r => r.room === room);
    if (!state) return {};

    const isNightTime = timeOfDay === 'night' || timeOfDay === 'dusk';
    const baseColor = isNightTime ? 'hsl(230, 30%, 15%)' : 'hsl(var(--secondary))';

    if (state.isStressed) {
      return {
        background: 'linear-gradient(135deg, hsl(0, 72%, 25%) 0%, hsl(0, 72%, 35%) 100%)',
        boxShadow: '0 0 30px hsl(0, 72%, 51%, 0.6), inset 0 0 20px hsl(0, 72%, 51%, 0.3)',
      };
    }
    if (state.isActive) {
      return {
        background: isNightTime 
          ? 'linear-gradient(135deg, hsl(45, 70%, 25%) 0%, hsl(45, 60%, 35%) 100%)'
          : 'linear-gradient(135deg, hsl(199, 89%, 30%) 0%, hsl(199, 89%, 40%) 100%)',
        boxShadow: getWindowGlow(timeOfDay, true),
      };
    }
    return {
      background: baseColor,
      boxShadow: isNightTime ? getWindowGlow(timeOfDay, false) : 'none',
    };
  };

  const getRoomClass = (room: RoomType) => {
    const state = roomStates.find(r => r.room === room);
    if (state?.isStressed) return 'house-room stressed';
    if (state?.isActive) return 'house-room active';
    return 'house-room';
  };

  return (
    <div className="game-card p-4 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
      {/* Sky background with time-based gradient */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{ background: getSkyGradient(timeOfDay) }}
      />
      
      {/* Stars for night time */}
      {timeOfDay === 'night' && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 50}%`,
                opacity: 0.3 + Math.random() * 0.7,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Ambient color overlay */}
      <div 
        className="absolute inset-0 transition-all duration-1000 pointer-events-none"
        style={{ background: getAmbientOverlay(timeOfDay) }}
      />
      
      {/* Title & Icon - Centered */}
      <div className="relative z-10 flex items-center justify-center gap-2 mb-6 text-foreground/90">
        {getTimeIcon(timeOfDay)}
        <h3 className="font-display font-semibold text-lg drop-shadow-sm">
          Your Home
        </h3>
      </div>
      
      {/* Isometric-style house container */}
      <div className="relative w-full aspect-[4/3] max-w-md mx-auto z-10">
        {/* Ground shadow */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] h-8 rounded-full transition-opacity duration-500"
          style={{
            background: 'radial-gradient(ellipse, hsl(0, 0%, 0%) 0%, transparent 70%)',
            opacity: timeOfDay === 'night' ? 0.5 : 0.3,
          }}
        />

        {/* House base structure */}
        <div className="absolute inset-0 flex items-end justify-center pb-6">
          <div 
            className="relative w-full max-w-[380px]"
            style={{
              transform: 'perspective(600px) rotateX(5deg)',
            }}
          >
            {/* Main house grid */}
            // Inside src/components/game/HouseVisualization.tsx

// ... (imports and helper functions remain the same)

// ... inside the return statement ...
            {/* Main house grid */}
            <div className="grid grid-cols-3 gap-1 bg-border/30 rounded-lg p-1">
              
              {/* --- TOP ROW --- */}
              
              {/* BEDROOM (Unchanged) */}
              <div 
                className={`${getRoomClass('bedroom')} rounded-lg p-3 aspect-square flex flex-col items-center justify-center`}
                style={getRoomStyle('bedroom')}
              >
                {(() => {
                   const state = roomStates.find(r => r.room === 'bedroom');
                   const ActiveIcon = state?.activeIcon;
                   return state?.isActive && ActiveIcon ? (
                    <>
                      <span className="mb-1 animate-bounce">
                        <ActiveIcon className="w-8 h-8 text-white drop-shadow-md" />
                      </span>
                      <span className="text-xs text-primary font-medium">Gaming!</span>
                    </>
                  ) : (
                    <>
                      <span className="mb-1">
                        <Bed className="w-8 h-8 text-white/60" />
                      </span>
                      <span className="text-xs text-muted-foreground">Bedroom</span>
                    </>
                  );
                })()}
              </div>
              
              {/* LAUNDRY (Moved Here! Was Living Room) */}
              <div 
                className={`${getRoomClass('laundry')} rounded-lg p-3 aspect-square flex flex-col items-center justify-center`}
                style={getRoomStyle('laundry')}
              >
                {(() => {
                   const state = roomStates.find(r => r.room === 'laundry');
                   const ActiveIcon = state?.activeIcon;
                   return state?.isActive && ActiveIcon ? (
                    <>
                      <span className="mb-1 animate-float">
                        <ActiveIcon className="w-8 h-8 text-white drop-shadow-md" />
                      </span>
                      <span className="text-xs text-primary font-medium">Running!</span>
                    </>
                  ) : (
                    <>
                      <span className="mb-1">
                        <Shirt className="w-8 h-8 text-white/60" />
                      </span>
                      <span className="text-xs text-muted-foreground">Laundry</span>
                    </>
                  );
                })()}
              </div>

              {/* KITCHEN (Unchanged) */}
              <div 
                className={`${getRoomClass('kitchen')} rounded-lg p-3 aspect-square flex flex-col items-center justify-center`}
                style={getRoomStyle('kitchen')}
              >
                {(() => {
                   const state = roomStates.find(r => r.room === 'kitchen');
                   const ActiveIcon = state?.activeIcon;
                   return state?.isActive && ActiveIcon ? (
                    <>
                      <span className="mb-1 animate-float">
                         <ActiveIcon className="w-8 h-8 text-white drop-shadow-md" />
                      </span>
                      <span className="text-xs text-primary font-medium">Active!</span>
                    </>
                  ) : (
                    <>
                      <span className="mb-1">
                        <Utensils className="w-8 h-8 text-white/60" />
                      </span>
                      <span className="text-xs text-muted-foreground">Kitchen</span>
                    </>
                  );
                })()}
              </div>

              {/* --- BOTTOM ROW --- */}

              {/* GARAGE (Unchanged) */}
              <div 
                className={`${getRoomClass('garage')} rounded-lg p-3 aspect-square flex flex-col items-center justify-center`}
                style={getRoomStyle('garage')}
              >
                {(() => {
                   const state = roomStates.find(r => r.room === 'garage');
                   const ActiveIcon = state?.activeIcon;
                   return state?.isActive && ActiveIcon ? (
                    <>
                      <span className="mb-1 animate-float">
                        <ActiveIcon className="w-8 h-8 text-white drop-shadow-md" />
                      </span>
                      <span className="text-xs text-primary font-medium">Charging!</span>
                    </>
                  ) : (
                    <>
                      <span className="mb-1">
                        <Car className="w-8 h-8 text-white/60" />
                      </span>
                      <span className="text-xs text-muted-foreground">Garage</span>
                    </>
                  );
                })()}
              </div>

              {/* LIVING ROOM (Moved Here! Was Laundry) */}
              {/* Added 'col-span-2' to make it the big room */}
              <div 
                className={`${getRoomClass('living')} rounded-lg p-3 aspect-square flex flex-col items-center justify-center col-span-2`}
                style={getRoomStyle('living')}
              >
                {(() => {
                   const state = roomStates.find(r => r.room === 'living');
                   const ActiveIcon = state?.activeIcon;
                   return state?.isActive && ActiveIcon ? (
                    <>
                      <span className="mb-1 animate-float">
                        <ActiveIcon className="w-8 h-8 text-white drop-shadow-md" />
                      </span>
                      <span className="text-xs text-primary font-medium">Active!</span>
                    </>
                  ) : (
                    <>
                      <span className="mb-1">
                        <Armchair className="w-8 h-8 text-white/60" />
                      </span>
                      <span className="text-xs text-muted-foreground">Living Room</span>
                    </>
                  );
                })()}
              </div>

            </div>
          </div>
        </div>

        {/* Stress warning overlay */}
        {gridStress > 70 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div 
              className="px-4 py-2 rounded-full animate-pulse"
              style={{
                background: 'hsl(0, 72%, 51%, 0.9)',
                boxShadow: '0 0 30px hsl(0, 72%, 51%, 0.8)',
              }}
            >
              <span className="text-white font-display font-bold text-sm">
                ⚠️ GRID OVERLOAD
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};