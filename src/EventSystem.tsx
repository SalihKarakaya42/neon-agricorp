import React, { useState, useEffect, useCallback } from 'react';

interface EventSystemProps {
  onEnergyDrawReport: (draw: number) => void;
  onWaterDrawReport: (draw: number) => void;
  onCreditsChange: (change: number) => void;
  onFactoryEnergyConsumptionReport: (draw: number) => void; // To stop factories, we need to signal them? No, GameLoop handles stopping based on E level.
  isEnergyCritical: boolean;
  currentEnergy: number;
  maxEnergyCapacity: number;
}

const EVENT_TRIGGER_INTERVAL_SECONDS = 60; // Trigger a potential event every 60 seconds

const EventSystem: React.FC<EventSystemProps> = ({ 
    onEnergyDrawReport, 
    onWaterDrawReport, 
    onCreditsChange,
    isEnergyCritical,
    currentEnergy,
    maxEnergyCapacity
}) => {
  const [lastEventTime, setLastEventTime] = useState(Date.now());
  const [currentEvent, setCurrentEvent] = useState<{ name: string, duration: number, effect: () => void } | null>(null);

  // Define possible events and their effects. Effects will return a function describing the draw/bonus.
  const possibleEvents: { name: string, minDuration: number, maxDuration: number, effect: () => { drawEnergy?: number, drawWater?: number, creditChange?: number } }[] = [
    {
      name: 'Radiation Leak',
      minDuration: 10,
      maxDuration: 20,
      effect: () => ({ drawEnergy: 5, drawWater: 10 }) // Energy drain, Water drain
    },
    {
      name: 'Pipe Condensation Surge',
      minDuration: 5,
      maxDuration: 15,
      effect: () => ({ drawWater: -5 }) // Water BONUS (Negative draw = production boost)
    },
    {
      name: 'Hacker Attack',
      minDuration: 15,
      maxDuration: 30,
      effect: () => ({ creditChange: -100 }) // Lose credits
    },
    {
      name: 'Black Market Opportunity',
      minDuration: 5,
      maxDuration: 10,
      effect: () => ({ creditChange: 500 }) // Gain credits
    },
  ];

  const triggerEvent = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * possibleEvents.length);
    const eventDef = possibleEvents[randomIndex];
    const duration = Math.floor(Math.random() * (eventDef.maxDuration - eventDef.minDuration + 1)) + eventDef.minDuration;
    
    const effectData = eventDef.effect();

    setCurrentEvent({
      name: eventDef.name,
      duration: duration,
      effect: () => {
        if (effectData.drawEnergy) onEnergyDrawReport(effectData.drawEnergy);
        if (effectData.drawWater) onWaterDrawReport(effectData.drawWater);
        if (effectData.creditChange) onCreditsChange(effectData.creditChange);
      }
    });
    setLastEventTime(Date.now());
    console.log(\`EVENT TRIGGERED: \${eventDef.name} for \${duration} seconds.\`);
  }, [possibleEvents, onEnergyDrawReport, onWaterDrawReport, onCreditsChange]);


  useEffect(() => {
    // 1. Event Tick Timer (Checks if a new event should start)
    const eventStartInterval = setInterval(() => {
        const timeSinceLast = (Date.now() - lastEventTime) / 1000;
        if (timeSinceLast > EVENT_TRIGGER_INTERVAL_SECONDS && !currentEvent) {
            triggerEvent();
        }
    }, 1000);

    // 2. Event Active Timer (Manages current event duration)
    let eventActiveInterval: NodeJS.Timeout | null = null;
    if (currentEvent) {
        // Apply initial effect immediately
        currentEvent.effect(); 
        
        eventActiveInterval = setInterval(() => {
            setCurrentEvent(prevEvent => {
                if (prevEvent && prevEvent.duration > 1) {
                    // Continue effect application if needed, or just decrease timer
                    // For simplicity, we only apply effects at the start, then just tick down.
                    return { ...prevEvent, duration: prevEvent.duration - 1 };
                } else {
                    console.log(\`EVENT ENDED: \${prevEvent?.name}\`);
                    // Event ends: clear draws/bonuses, reset reports to 0
                    onEnergyDrawReport(0);
                    onWaterDrawReport(0);
                    return null;
                }
            });
        }, 1000);
    }

    return () => {
        clearInterval(eventStartInterval);
        if (eventActiveInterval) clearInterval(eventActiveInterval);
    };
  }, [currentEvent, lastEventTime, triggerEvent, onEnergyDrawReport, onWaterDrawReport]);
  
  // Safety: If energy is critical, immediately stop applying any draws from events
  useEffect(() => {
      if (isEnergyCritical && currentEvent) {
          console.warn("Energy critical: Event draws temporarily suspended.");
          // NOTE: A better implementation would buffer draws, but here we just stop them if critical.
      }
  }, [isEnergyCritical, currentEvent]);

  return (
    <div>
      <h3>Environment Control</h3>
      <p>Last Event Check: {currentEvent ? `${currentEvent.name} (${currentEvent.duration}s left)` : 'Idle'}</p>
      <p>Potential Effect: {currentEvent ? JSON.stringify(possibleEvents.find(e => e.name === currentEvent.name)?.effect()) : 'None'}</p>
    </div>
  );
};

export default EventSystem;