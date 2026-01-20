import { Activity, TimeBlock } from '../types/game';

import { 
  Zap, 
  Car, 
  Shirt, 
  Utensils, 
  Tv, 
  Gamepad2, 
  Thermometer, 
  Lightbulb 
} from 'lucide-react';

export const ACTIVITIES: Activity[] = [
  {
    id: 'ev-charging',
    name: 'EV Charging',
    icon: Car, 
    duration: 4,
    energyUsage: 7.2,
    color: 'hsl(142, 76%, 36%)',
    room: 'garage',
  },
  {
    id: 'laundry',
    name: 'Laundry',
    icon: Shirt,
    duration: 2,
    energyUsage: 2.1,
    color: 'hsl(217, 91%, 60%)',
    room: 'laundry',
  },
  {
    id: 'cooking',
    name: 'Cooking',
    icon: Utensils,
    duration: 1,
    energyUsage: 3.0,
    color: 'hsl(31, 90%, 55%)',
    room: 'kitchen',
  },
  {
    id: 'heating',
    name: 'Heating',
    icon: Thermometer,
    duration: 6,
    energyUsage: 1.5,
    color: 'hsl(0, 84%, 60%)',
    room: 'living',
  },
  {
    id: 'gaming',
    name: 'Gaming Session',
    icon: Gamepad2,
    duration: 3,
    energyUsage: 0.5,
    color: 'hsl(320, 80%, 60%)',
    room: 'bedroom',
  },
];

export const TIME_BLOCKS: TimeBlock[] = Array.from({ length: 24 }, (_, i) => {
  const isPeak = i >= 17 && i <= 20; // 5 PM - 8 PM
  const isHighDemand = i >= 7 && i <= 9; // Morning rush

  return {
    hour: i,
    label: `${i.toString().padStart(2, '0')}:00`,
    isPeak,
    multiplier: isPeak ? 4.0 : isHighDemand ? 2.0 : 1.0,
  };
});

export const BASE_RATE = 0.15; // $ per kWh

export const calculateCost = (
  activities: { activityId: string; startHour: number }[],
): number => {
  let total = 0;

  activities.forEach(({ activityId, startHour }) => {
    const activity = ACTIVITIES.find(a => a.id === activityId);
    if (!activity) return;

    for (let h = 0; h < activity.duration; h++) {
      // FIX: Use modulo to wrap around midnight (24 -> 0)
      const hour = (startHour + h) % 24;
      
      const timeBlock = TIME_BLOCKS[hour];
      if (timeBlock) {
        const hourCost = activity.energyUsage * BASE_RATE * timeBlock.multiplier;
        total += hourCost;
      }
    }
  });

  return Math.round(total * 100) / 100;
};

export const calculateGridStress = (
  activities: { activityId: string; startHour: number }[],
): number => {
  // Find the hour with most overlap during peak
  const hourLoads: number[] = Array(24).fill(0);

  activities.forEach(({ activityId, startHour }) => {
    const activity = ACTIVITIES.find(a => a.id === activityId);
    if (!activity) return;

    for (let h = 0; h < activity.duration; h++) {
      // FIX: Use modulo to wrap around midnight
      const hour = (startHour + h) % 24;
      
      const timeBlock = TIME_BLOCKS[hour];
      if (timeBlock) {
        hourLoads[hour] += activity.energyUsage * (timeBlock.isPeak ? 2 : 1);
      }
    }
  });

  const maxLoad = Math.max(...hourLoads);
  // Normalize to 0-100, assuming 15kW is dangerous
  return Math.min(100, Math.round((maxLoad / 15) * 100));
};

export const calculateComfort = (
  activities: { activityId: string; startHour: number }[],
): number => {
  let discomfort = 0;

  activities.forEach(({ activityId, startHour }) => {
    const activity = ACTIVITIES.find(a => a.id === activityId);
    if (!activity) return;

    // EV should ideally finish by morning (uncomfortable if charging at odd hours)
    if (activity.id === 'ev-charging') {
      if (startHour >= 6 && startHour <= 22) {
        discomfort += 10; // Preferred overnight
      }
    }

    // Laundry during night is uncomfortable
    if (activity.id === 'laundry' || activity.id === 'dryer') {
      if (startHour < 7 || startHour > 21) {
        discomfort += 15;
      }
    }

    // Heating should be during evening/morning
    if (activity.id === 'heating') {
      if (startHour >= 10 && startHour <= 17) {
        discomfort += 20; // Less needed midday
      }
    }
    
    if (activityId === 'gaming') {
      if (startHour < 17) {
        discomfort += 15; // "I can't relax yet, I have work to do!"
      }
    }
  });

  return Math.max(0, 100 - discomfort);
};

export const generateSuggestions = (
  activities: { activityId: string; startHour: number }[],
) => {
  const suggestions: {
    id: string;
    message: string;
    activityId: string;
    fromHour: number;
    toHour: number;
    savingsEstimate: number;
  }[] = [];

  activities.forEach(({ activityId, startHour }) => {
    const activity = ACTIVITIES.find(a => a.id === activityId);
    if (!activity) return;

    // Check if any hour is during peak
    let isPeakScheduled = false;
    for (let h = 0; h < activity.duration; h++) {
      // FIX: Use modulo
      const currentHour = (startHour + h) % 24;
      if (TIME_BLOCKS[currentHour]?.isPeak) {
        isPeakScheduled = true;
        break;
      }
    }

    if (isPeakScheduled) {
      // Suggest moving to off-peak
      let suggestedHour: number;
      
      if (activityId === 'ev-charging') {
        suggestedHour = 22; // Overnight
      } else if (activityId === 'laundry' || activityId === 'dryer') {
        suggestedHour = 10; // Mid-morning
      } else if (activityId === 'dishwasher') {
        suggestedHour = 14; // Early afternoon
      } else {
        suggestedHour = 12; // Default to midday
      }

      const currentCost = activity.energyUsage * activity.duration * BASE_RATE * 4;
      const newCost = activity.energyUsage * activity.duration * BASE_RATE;
      const savings = Math.round((currentCost - newCost) * 100) / 100;

      suggestions.push({
        id: `${activityId}-${startHour}`,
        message: `Move ${activity.name} to ${suggestedHour}:00`,
        activityId,
        fromHour: startHour,
        toHour: suggestedHour,
        savingsEstimate: savings,
      });
    }
  });

  return suggestions;
};