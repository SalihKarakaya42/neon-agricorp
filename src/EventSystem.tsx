import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from './i18n';

interface EventSystemProps {
  onEnergyDrawReport: (draw: number) => void;
  onWaterDrawReport: (draw: number) => void;
  onCreditsChange: (change: number) => void;
  isEnergyCritical: boolean;
}

const EVENT_TRIGGER_INTERVAL_SECONDS = 60;

const EventSystem: React.FC<EventSystemProps> = ({ onEnergyDrawReport, onWaterDrawReport, onCreditsChange, isEnergyCritical: _isEnergyCritical }) => {
  const { t } = useLanguage();
  const [lastEventTime, setLastEventTime] = useState(Date.now());
  const [currentEvent, setCurrentEvent] = useState<{ name: string; duration: number; effect: () => void } | null>(null);
  const tname = (key: string) => t(`events.${key}`) || key;

  const possibleEvents: { name: string; minDuration: number; maxDuration: number; effect: () => { drawEnergy?: number; drawWater?: number; creditChange?: number } }[] = [
    { name: 'Radiation Leak', minDuration: 10, maxDuration: 20, effect: () => ({ drawEnergy: 5, drawWater: 10 }) },
    { name: 'Pipe Condensation Surge', minDuration: 5, maxDuration: 15, effect: () => ({ drawWater: -5 }) },
    { name: 'Hacker Attack', minDuration: 15, maxDuration: 30, effect: () => ({ creditChange: -100 }) },
    { name: 'Black Market Opportunity', minDuration: 5, maxDuration: 10, effect: () => ({ creditChange: 500 }) },
  ];

  const triggerEvent = useCallback(() => {
    const idx = Math.floor(Math.random() * possibleEvents.length);
    const def = possibleEvents[idx];
    const duration = Math.floor(Math.random() * (def.maxDuration - def.minDuration + 1)) + def.minDuration;
    const data = def.effect();
    setCurrentEvent({
      name: def.name, duration,
      effect: () => { if (data.drawEnergy) onEnergyDrawReport(data.drawEnergy); if (data.drawWater) onWaterDrawReport(data.drawWater); if (data.creditChange) onCreditsChange(data.creditChange); }
    });
    setLastEventTime(Date.now());
  }, [possibleEvents]);

  useEffect(() => {
    const si = setInterval(() => { if ((Date.now() - lastEventTime) / 1000 > EVENT_TRIGGER_INTERVAL_SECONDS && !currentEvent) triggerEvent(); }, 1000);
    let ai: ReturnType<typeof setInterval> | null = null;
    if (currentEvent) {
      currentEvent.effect();
      ai = setInterval(() => {
        setCurrentEvent(prev => { if (prev && prev.duration > 1) return { ...prev, duration: prev.duration - 1 }; onEnergyDrawReport(0); onWaterDrawReport(0); return null; });
      }, 1000);
    }
    return () => { clearInterval(si); if (ai) clearInterval(ai); };
  }, [currentEvent, lastEventTime, triggerEvent]);

  return (
    <div className="glass-panel rounded-xl p-4">
      <h3 className="font-mono text-[10px] text-[#849495] uppercase tracking-widest mb-2">{t('event.title')}</h3>
      {currentEvent ? (
        <div className="border border-pink-500/30 bg-pink-950/20 rounded-lg p-3">
          <p className="text-xs font-bold text-pink-400">{tname(currentEvent.name)}</p>
          <p className="text-[10px] font-mono text-[#b9cacb]/70 mt-1">{currentEvent.duration}{t('event.left')}</p>
        </div>
      ) : (
        <p className="text-xs text-[#b9cacb]/60 text-center">{t('event.idle')}</p>
      )}
    </div>
  );
};

export default EventSystem;
