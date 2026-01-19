import React from 'react';
import { ACTIVITIES } from '@/data/gameData';
import { ScheduledActivity, RoomType } from '@/types/game';

interface HouseVisualizationProps {
  scheduledActivities: ScheduledActivity[];
  gridStress: number;
}

interface RoomState {
  room: RoomType;
  isActive: boolean;
  isStressed: boolean;
  activeIcon?: string;
}

export const HouseVisualization: React.FC<HouseVisualizationProps> = ({
  scheduledActivities,
  gridStress,
}) => {
  // Determine room states based on scheduled activities in peak hours
  const getRoomStates = (): RoomState[] => {
    const rooms: RoomType[] = ['garage', 'laundry', 'kitchen', 'living', 'bedroom'];
    
    return rooms.map(room => {
      const activityInRoom = scheduledActivities.find(sa => {
        const activity = ACTIVITIES.find(a => a.id === sa.activityId);
        return activity?.room === room;
      });

      const activity = activityInRoom 
        ? ACTIVITIES.find(a => a.id === activityInRoom.activityId)
        : undefined;

      // Check if activity is during peak (17-20)
      const isInPeak = activityInRoom 
        ? (activityInRoom.startHour >= 17 && activityInRoom.startHour <= 20) ||
          (activityInRoom.startHour + (activity?.duration || 0) > 17 && activityInRoom.startHour < 21)
        : false;

      return {
        room,
        isActive: !!activityInRoom,
        isStressed: isInPeak && gridStress > 50,
        activeIcon: activity?.icon,
      };
    });
  };

  const roomStates = getRoomStates();

  const getRoomStyle = (room: RoomType) => {
    const state = roomStates.find(r => r.room === room);
    if (!state) return {};

    if (state.isStressed) {
      return {
        background: 'linear-gradient(135deg, hsl(0, 72%, 25%) 0%, hsl(0, 72%, 35%) 100%)',
        boxShadow: '0 0 30px hsl(0, 72%, 51%, 0.6), inset 0 0 20px hsl(0, 72%, 51%, 0.3)',
      };
    }
    if (state.isActive) {
      return {
        background: 'linear-gradient(135deg, hsl(199, 89%, 30%) 0%, hsl(199, 89%, 40%) 100%)',
        boxShadow: '0 0 20px hsl(199, 89%, 48%, 0.4)',
      };
    }
    return {
      background: 'hsl(var(--secondary))',
    };
  };

  const getRoomClass = (room: RoomType) => {
    const state = roomStates.find(r => r.room === room);
    if (state?.isStressed) return 'house-room stressed';
    if (state?.isActive) return 'house-room active';
    return 'house-room';
  };

  return (
    <div className="game-card p-6">
      <h3 className="font-display font-semibold text-lg mb-4 text-center">Your Home</h3>
      
      {/* Isometric-style house */}
      <div className="relative w-full aspect-[4/3] max-w-md mx-auto">
        {/* Ground shadow */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] h-8 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(ellipse, hsl(0, 0%, 0%) 0%, transparent 70%)',
          }}
        />

        {/* House base structure */}
        <div className="absolute inset-0 flex items-end justify-center pb-8">
          <div 
            className="relative w-full max-w-[320px]"
            style={{
              transform: 'perspective(500px) rotateX(5deg)',
            }}
          >
            {/* Roof */}
            <div 
              className="absolute -top-8 left-1/2 -translate-x-1/2 w-[110%] h-12"
              style={{
                background: 'linear-gradient(135deg, hsl(20, 40%, 25%) 0%, hsl(20, 40%, 35%) 100%)',
                clipPath: 'polygon(10% 100%, 50% 0%, 90% 100%)',
              }}
            />

            {/* Main house grid */}
            <div className="grid grid-cols-3 gap-1 bg-border/30 rounded-lg p-1">
              {/* Top row */}
              <div 
                className={`${getRoomClass('bedroom')} rounded-lg p-3 aspect-square flex flex-col items-center justify-center`}
                style={getRoomStyle('bedroom')}
              >
                <span className="text-2xl mb-1">🛏️</span>
                <span className="text-xs text-muted-foreground">Bedroom</span>
              </div>
              
              <div 
                className={`${getRoomClass('living')} rounded-lg p-3 aspect-square flex flex-col items-center justify-center`}
                style={getRoomStyle('living')}
              >
                {roomStates.find(r => r.room === 'living')?.activeIcon ? (
                  <>
                    <span className="text-2xl mb-1 animate-float">
                      {roomStates.find(r => r.room === 'living')?.activeIcon}
                    </span>
                    <span className="text-xs text-primary font-medium">Active!</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl mb-1">🛋️</span>
                    <span className="text-xs text-muted-foreground">Living</span>
                  </>
                )}
              </div>

              <div 
                className={`${getRoomClass('kitchen')} rounded-lg p-3 aspect-square flex flex-col items-center justify-center`}
                style={getRoomStyle('kitchen')}
              >
                {roomStates.find(r => r.room === 'kitchen')?.activeIcon ? (
                  <>
                    <span className="text-2xl mb-1 animate-float">
                      {roomStates.find(r => r.room === 'kitchen')?.activeIcon}
                    </span>
                    <span className="text-xs text-primary font-medium">Active!</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl mb-1">🍳</span>
                    <span className="text-xs text-muted-foreground">Kitchen</span>
                  </>
                )}
              </div>

              {/* Bottom row */}
              <div 
                className={`${getRoomClass('garage')} rounded-lg p-3 aspect-square flex flex-col items-center justify-center`}
                style={getRoomStyle('garage')}
              >
                {roomStates.find(r => r.room === 'garage')?.activeIcon ? (
                  <>
                    <span className="text-2xl mb-1 animate-float">
                      {roomStates.find(r => r.room === 'garage')?.activeIcon}
                    </span>
                    <span className="text-xs text-primary font-medium">Charging!</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl mb-1">🚗</span>
                    <span className="text-xs text-muted-foreground">Garage</span>
                  </>
                )}
              </div>

              <div 
                className={`${getRoomClass('laundry')} rounded-lg p-3 aspect-square flex flex-col items-center justify-center col-span-2`}
                style={getRoomStyle('laundry')}
              >
                {roomStates.find(r => r.room === 'laundry')?.activeIcon ? (
                  <>
                    <span className="text-2xl mb-1 animate-float">
                      {roomStates.find(r => r.room === 'laundry')?.activeIcon}
                    </span>
                    <span className="text-xs text-primary font-medium">Running!</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl mb-1">🧺</span>
                    <span className="text-xs text-muted-foreground">Laundry Room</span>
                  </>
                )}
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
