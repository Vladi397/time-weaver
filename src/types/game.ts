import { LucideIcon } from 'lucide-react';

export interface Activity {
  id: string;
  name: string;
  icon: string;
  duration: number; // in hours
  energyUsage: number; // kW
  color: string;
  room: RoomType;
}

export type RoomType = 'garage' | 'laundry' | 'kitchen' | 'living' | 'bedroom';

export interface ScheduledActivity {
  activityId: string;
  startHour: number;
}

export interface TimeBlock {
  hour: number;
  label: string;
  isPeak: boolean;
  multiplier: number;
}

export interface GameState {
  currentCost: number;
  gridStress: number; // 0-100
  comfort: number; // 0-100
  scheduledActivities: ScheduledActivity[];
  dayComplete: boolean;
}

export interface Suggestion {
  id: string;
  message: string;
  activityId: string;
  fromHour: number;
  toHour: number;
  savingsEstimate: number;
}

export interface DaySummary {
  totalCost: number;
  peakHoursUsed: number;
  gridStressMax: number;
  comfortScore: number;
  neighborhoodImpact: string;
}
