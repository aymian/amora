import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type MoodState = "calm" | "active" | "neutral";

interface MoodContextType {
  mood: MoodState;
  activityLevel: number; // 0-100
  transitionDuration: number; // milliseconds
  colorIntensity: number; // 0-1
  motionSpeed: number; // 0.5-2
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

const INACTIVITY_THRESHOLD = 5000; // 5 seconds of inactivity triggers calm
const ACTIVITY_DECAY_RATE = 2; // How fast activity decays per second
const ACTIVITY_INCREMENT = 15; // How much each interaction adds

export function MoodProvider({ children }: { children: ReactNode }) {
  const [activityLevel, setActivityLevel] = useState(50);
  const [lastInteraction, setLastInteraction] = useState(Date.now());

  // Track user interactions
  const handleInteraction = useCallback(() => {
    setLastInteraction(Date.now());
    setActivityLevel((prev) => Math.min(100, prev + ACTIVITY_INCREMENT));
  }, []);

  useEffect(() => {
    // Listen to various interaction events
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    
    events.forEach((event) => {
      window.addEventListener(event, handleInteraction, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleInteraction);
      });
    };
  }, [handleInteraction]);

  // Decay activity level over time
  useEffect(() => {
    const decayInterval = setInterval(() => {
      const timeSinceInteraction = Date.now() - lastInteraction;
      
      if (timeSinceInteraction > INACTIVITY_THRESHOLD) {
        setActivityLevel((prev) => Math.max(0, prev - ACTIVITY_DECAY_RATE));
      }
    }, 1000);

    return () => clearInterval(decayInterval);
  }, [lastInteraction]);

  // Calculate mood based on activity level
  const getMood = (): MoodState => {
    if (activityLevel < 25) return "calm";
    if (activityLevel > 70) return "active";
    return "neutral";
  };

  const mood = getMood();

  // Calculate derived values based on mood
  const getTransitionDuration = () => {
    switch (mood) {
      case "calm":
        return 2000; // Slower, more peaceful transitions
      case "active":
        return 400; // Snappy, responsive
      default:
        return 800;
    }
  };

  const getColorIntensity = () => {
    if (mood === "calm") return 0.6;
    if (mood === "active") return 1;
    return 0.8;
  };

  const getMotionSpeed = () => {
    if (mood === "calm") return 0.5;
    if (mood === "active") return 1.5;
    return 1;
  };

  const value: MoodContextType = {
    mood,
    activityLevel,
    transitionDuration: getTransitionDuration(),
    colorIntensity: getColorIntensity(),
    motionSpeed: getMotionSpeed(),
  };

  return (
    <MoodContext.Provider value={value}>
      <div 
        className="mood-wrapper"
        style={{
          "--mood-transition": `${value.transitionDuration}ms`,
          "--mood-color-intensity": value.colorIntensity,
          "--mood-motion-speed": value.motionSpeed,
        } as React.CSSProperties}
      >
        {children}
      </div>
    </MoodContext.Provider>
  );
}

export function useMood() {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error("useMood must be used within a MoodProvider");
  }
  return context;
}
