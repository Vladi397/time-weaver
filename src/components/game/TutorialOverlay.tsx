import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  emoji: string;
  highlight?: 'activities' | 'timeline' | 'peak' | 'meters' | 'suggestions';
  tip?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: "Welcome to The Daily Grid!",
    description: "You're about to plan your day's energy usage. Your goal: schedule activities to minimize costs and grid stress while staying comfortable.",
    emoji: "⚡",
    tip: "Think of this as a puzzle - finding the perfect schedule!"
  },
  {
    id: 2,
    title: "Your Activities",
    description: "On the left, you'll find energy-hungry activities like EV charging, laundry, and heating. Each takes time and power.",
    emoji: "🎮",
    highlight: 'activities',
    tip: "Look at the duration and power icons on each card."
  },
  {
    id: 3,
    title: "Drag & Drop",
    description: "Drag any activity card and drop it onto the timeline to schedule it. You can move scheduled activities by dragging them to a new time slot.",
    emoji: "👆",
    highlight: 'timeline',
    tip: "Click the ✕ on a scheduled activity to remove it."
  },
  {
    id: 4,
    title: "⚠️ Peak Hours Are Dangerous!",
    description: "The orange zone (5 PM - 8 PM) is when everyone uses power. Scheduling activities here costs MORE and stresses the grid!",
    emoji: "🔥",
    highlight: 'peak',
    tip: "Avoid peak hours to save money and help your neighborhood."
  },
  {
    id: 5,
    title: "Watch Your Meters",
    description: "The right panel shows real-time feedback: your costs, grid stress level, and comfort score. Every change you make updates these instantly!",
    emoji: "📊",
    highlight: 'meters',
    tip: "Green is good, red is bad - keep things in the green!"
  },
  {
    id: 6,
    title: "Smart Suggestions",
    description: "If you schedule during peak hours, the game will suggest better times. Click a suggestion to automatically move that activity!",
    emoji: "💡",
    highlight: 'suggestions',
    tip: "Suggestions are reversible - experiment freely!"
  },
  {
    id: 7,
    title: "Ready to Play!",
    description: "Plan your perfect day. When you're done, click 'End Day' to see your final score and neighborhood impact. Good luck!",
    emoji: "🎯",
    tip: "The best players keep grid stress low while staying comfortable."
  }
];

interface TutorialOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onSkip();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  // Highlight positioning
  const getHighlightStyle = (): React.CSSProperties => {
    switch (step.highlight) {
      case 'activities':
        return { left: '85px', top: '100px', width: '22%', height: '85%' };
      case 'timeline':
        return { left: '27%', top: '72%', width: '46%', height: '23%' };
      case 'peak':
        return { left: '59%', top: '66%', width: '12%', height: '8%' };
      case 'meters':
        return { right: '90px', top: '100px', width: '21%', height: '46%' };
      case 'suggestions':
        return { right: '90px', top: '59%', width: '21%', height: '23%' };
      default:
        return {};
    }
  };

 return (
    <div className="fixed inset-0 z-50">
      {/* 1. Global Dark Background (For steps with NO highlight) */}
      {!step.highlight && (
        <div className="fixed inset-0 z-40 bg-black/60" />
      )}
      
      {/* 2. The Spotlight "Hole" (Separated into two layers) */}
      {step.highlight && (
        // LAYER A: The Static Shadow Mask (Does NOT animate)
        // This positions the "hole" and casts the giant static shadow to darken the screen.
        <div 
          className="absolute rounded-xl pointer-events-none z-40 transition-all duration-500 ease-in-out"
          style={{
            ...getHighlightStyle(),
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)' // Static dark background
          }}
        >
          {/* LAYER B: The Pulsing Border (Does animate)
              This sits inside the hole and handles the glow/pulse effect independently.
           */}
          <div 
            className="absolute inset-0 border-4 border-accent rounded-xl animate-pulse"
            style={{
              boxShadow: '0 0 40px hsl(var(--accent) / 0.5), inset 0 0 20px hsl(var(--accent) / 0.1)'
            }}
          />
        </div>
      )}

      {/* 3. Tutorial Card () */}
      <div className="absolute inset-0 z-50 flex items-start justify-center pointer-events-none pt-20">
        <div 
          className={`
            game-card max-w-md p-6 pointer-events-auto
            transition-all duration-300 transform
            ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
          `}
          style={{
            background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.95) 100%)',
            boxShadow: '0 25px 50px -12px hsl(var(--primary) / 0.3), 0 0 0 1px hsl(var(--border))'
          }}
        >
          {/* ... (rest of the card content remains exactly the same) ... */}
          {/* Skip button */}
          <button
            onClick={onSkip}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Skip tutorial"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Step indicator */}
          <div className="flex gap-1.5 mb-4">
            {TUTORIAL_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`
                  h-1.5 rounded-full transition-all duration-300
                  ${idx === currentStep 
                    ? 'w-8 bg-accent' 
                    : idx < currentStep 
                      ? 'w-4 bg-accent/50' 
                      : 'w-4 bg-muted'
                  }
                `}
              />
            ))}
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">{step.emoji}</div>
            <h2 className="font-display font-bold text-xl mb-3">{step.title}</h2>
            <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            
            {step.tip && (
              <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20">
                <div className="flex items-center gap-2 text-sm text-accent">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium">Pro tip:</span>
                </div>
                <p className="text-sm text-accent/80 mt-1">{step.tip}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={isFirstStep}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            <span className="text-sm text-muted-foreground">
              {currentStep + 1} / {TUTORIAL_STEPS.length}
            </span>

            <Button
              onClick={handleNext}
              className="gap-1 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isLastStep ? (
                <>
                  Start Playing
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* Keyboard hint */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            Use ← → arrow keys or Enter to navigate
          </p>
        </div>
      </div>
    </div>
  );
};