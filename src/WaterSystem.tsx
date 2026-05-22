import { useEffect, useRef } from 'react';
import { useLanguage } from './i18n';
import { Droplets } from 'lucide-react';

interface WaterSystemProps {
  currentWater: number;
  onWaterChange: (newWater: number) => void;
  totalConsumption: number;
  pumpPower: number;
  waterEfficiency: number;
  maxWater: number;
}

const WaterSystem: React.FC<WaterSystemProps> = ({ currentWater, onWaterChange, totalConsumption, pumpPower, waterEfficiency, maxWater }) => {
  const { t } = useLanguage();
  const initialEfficiency = 1.0;
  const leakage = 2;
  const lastTickTimeRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedTime = (now - lastTickTimeRef.current) / 1000;
      lastTickTimeRef.current = now;
      const effectiveEfficiency = initialEfficiency * waterEfficiency;
      const waterProductionRate = (pumpPower * effectiveEfficiency) - leakage;
      const netRate = waterProductionRate - totalConsumption;
      const netWaterChange = netRate * elapsedTime;
      let newWater = currentWater + netWaterChange;
      newWater = Math.max(0, Math.min(maxWater, newWater));
      onWaterChange(newWater);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentWater, onWaterChange, pumpPower, totalConsumption, waterEfficiency, maxWater]);

  const netRate = (pumpPower * initialEfficiency * waterEfficiency) - leakage - totalConsumption;
  const tankPct = Math.min(100, Math.round((currentWater / maxWater) * 100));
  const isLow = currentWater < 50;

  return (
    <div className="glass-panel rounded-xl p-3.5 flex items-center gap-3 border-l-2 border-l-blue-400">
      <div className={`p-1.5 rounded-lg ${isLow ? 'bg-red-500/10' : 'bg-blue-400/10'}`}>
        <Droplets className={`w-5 h-5 ${isLow ? 'text-red-400' : 'text-blue-400'}`} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10px] text-[#b9cacb] uppercase tracking-wider">{t('water.title')}</span>
          <span className={`font-mono text-[10px] font-bold ${netRate >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {netRate >= 0 ? '+' : ''}{netRate.toFixed(1)}/s
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`font-mono text-sm font-bold ${isLow ? 'text-red-400' : 'text-white'}`}>
            {Math.round(currentWater)}
          </span>
          <span className="font-mono text-[10px] text-[#849495]">/ {maxWater}</span>
        </div>
        <div className="progress-bar-container mt-1">
          <div className={`progress-bar-fill ${isLow ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-cyan-400'}`} style={{ width: `${tankPct}%` }} />
        </div>
      </div>
    </div>
  );
};

export default WaterSystem;
