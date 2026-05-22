import { useEffect, useRef } from 'react';
import { useLanguage } from './i18n';
import { Zap } from 'lucide-react';

interface EnergySystemProps {
  currentEnergy: number;
  onEnergyChange: (newEnergy: number) => void;
  totalConsumption: number;
  baseProduction: number;
  maxEnergy: number;
}

const EnergySystem: React.FC<EnergySystemProps> = ({ currentEnergy, onEnergyChange, totalConsumption, baseProduction, maxEnergy }) => {
  const { t } = useLanguage();
  const lastTickTimeRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedTime = (now - lastTickTimeRef.current) / 1000;
      lastTickTimeRef.current = now;
      const netEnergyChangeRate = baseProduction - totalConsumption;
      const netEnergyChange = netEnergyChangeRate * elapsedTime;
      let newEnergy = currentEnergy + netEnergyChange;
      newEnergy = Math.max(0, Math.min(newEnergy, maxEnergy));
      onEnergyChange(newEnergy);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentEnergy, onEnergyChange, totalConsumption, baseProduction, maxEnergy]);

  const netRate = baseProduction - totalConsumption;
  const pct = Math.min(100, Math.round((currentEnergy / maxEnergy) * 100));
  const isLow = currentEnergy < maxEnergy * 0.1;

  return (
    <div className="glass-panel rounded-xl p-3.5 flex items-center gap-3 border-l-2 border-l-yellow-500">
      <div className={`p-1.5 rounded-lg ${isLow ? 'bg-red-500/10' : 'bg-yellow-500/10'}`}>
        <Zap className={`w-5 h-5 ${isLow ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10px] text-[#b9cacb] uppercase tracking-wider">{t('energy.title')}</span>
          <span className={`font-mono text-[10px] font-bold ${netRate >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {netRate >= 0 ? '+' : ''}{netRate.toFixed(1)}/s
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`font-mono text-sm font-bold ${isLow ? 'text-red-400' : 'text-white'}`}>
            {Math.round(currentEnergy)}
          </span>
          <span className="font-mono text-[10px] text-[#849495]">/ {Math.round(maxEnergy)}</span>
        </div>
        <div className="progress-bar-container mt-1">
          <div className={`progress-bar-fill ${isLow ? 'bg-red-500' : 'bg-gradient-to-r from-yellow-500 to-orange-400'}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
};

export default EnergySystem;
