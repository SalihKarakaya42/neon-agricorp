import { useEffect } from 'react';
import { useLanguage } from './i18n';
import { Sprout, Waves, Zap, Droplets, BatteryCharging, Flame, Binary, Cpu, Award, CheckCircle2 } from 'lucide-react';

interface ResearchTechData { id: string; level: number; isResearched: boolean; }
interface ResearchTechDefinition { id: string; name: string; category: 'Agriculture' | 'Water' | 'Energy' | 'District'; baseCost: number; unlocks: { stat: string; value: number }; }

interface ResearchSystemProps {
  currentCredits: number;
  onCreditsChange: (newCredits: number) => void;
  onStatBoost: (statName: string, boostValue: number) => void;
  researchState: { techs: ResearchTechData[]; timers: { [key: string]: number } };
  onResearchStateUpdate: (newState: { techs: ResearchTechData[]; timers: { [key: string]: number } }) => void;
}

const initialResearchDefinitions: ResearchTechDefinition[] = [
  { id: 'agri-1', name: 'Hydroponic Efficiency I', category: 'Agriculture', baseCost: 500, unlocks: { stat: 'farmCropGrowthSpeed', value: 0.1 } },
  { id: 'water-1', name: 'Deep Well Pumping I', category: 'Water', baseCost: 800, unlocks: { stat: 'pumpPower', value: 2 } },
  { id: 'energy-1', name: 'Basic Reactor Core I', category: 'Energy', baseCost: 1000, unlocks: { stat: 'baseEnergyProduction', value: 5 } },
  { id: 'water-2', name: 'Hydroponic Water Mgmt I', category: 'Water', baseCost: 1500, unlocks: { stat: 'waterEfficiency', value: 0.1 } },
  { id: 'energy-2', name: 'Capacitor Bank V1', category: 'Energy', baseCost: 2000, unlocks: { stat: 'maxEnergyCapacity', value: 500 } },
  { id: 'district-1', name: 'Geothermal Tapping', category: 'Energy', baseCost: 3500, unlocks: { stat: 'baseEnergyProduction', value: 10 } },
  { id: 'agri-2', name: 'Laboratory Systems', category: 'Agriculture', baseCost: 4000, unlocks: { stat: 'tier3CropUnlock', value: 1 } },
  { id: 'agri-3', name: 'Genişletilmiş Sektörler I', category: 'Agriculture', baseCost: 6000, unlocks: { stat: 'podCapacity', value: 4 } },
  { id: 'district-2', name: 'Excavation Protocol I', category: 'District', baseCost: 5000, unlocks: { stat: 'unlockedT3Factories', value: 1 } },
  { id: 'prestige-1', name: 'Civilization Blueprint', category: 'District', baseCost: 15000, unlocks: { stat: 'unlockedPrestige', value: 1 } },
];

const renderTechIcon = (techId: string, className: string) => {
  switch(techId) {
    case 'agri-1': case 'agri-2': case 'agri-3': return <Sprout className={className} />;
    case 'water-1': return <Waves className={className} />;
    case 'energy-1': return <Zap className={className} />;
    case 'water-2': return <Droplets className={className} />;
    case 'energy-2': return <BatteryCharging className={className} />;
    case 'district-1': return <Flame className={className} />;
    case 'district-2': return <Binary className={className} />;
    case 'prestige-1': return <Award className={className} />;
    default: return <Cpu className={className} />;
  }
};

const ResearchSystem: React.FC<ResearchSystemProps> = ({ currentCredits, onCreditsChange, onStatBoost, researchState, onResearchStateUpdate }) => {
  const { t } = useLanguage();
  const { techs, timers } = researchState;
  const tnames = (key: string) => t(`researchNames.${key}`) || key;
  const tcat = (key: string) => t(`categories.${key}`) || key;

  const calculateCost = (techId: string, level: number) => { const d = initialResearchDefinitions.find(x => x.id === techId); return d ? Math.round(d.baseCost * Math.pow(level, 1.45)) : Infinity; };
  const calculateBaseTimeSeconds = (techId: string) => { const d = initialResearchDefinitions.find(x => x.id === techId); return d ? Math.round(d.baseCost / 250) : 999; };

  useEffect(() => {
    const researchInterval = setInterval(() => {
      let updated = false;
      const newTimers = { ...timers };
      const newTechs = [...techs];
      const boosts: { statName: string; boostValue: number }[] = [];
      techs.forEach(tech => {
        if (tech.isResearched) return;
        const remaining = newTimers[tech.id] || 0;
        if (remaining > 0) {
          const nr = Math.max(0, remaining - 1);
          newTimers[tech.id] = nr;
          updated = true;
          if (nr === 0) {
            const def = initialResearchDefinitions.find(d => d.id === tech.id);
            if (def) boosts.push({ statName: def.unlocks.stat, boostValue: def.unlocks.value });
            const idx = newTechs.findIndex(t => t.id === tech.id);
            if (idx !== -1) newTechs[idx] = { ...tech, isResearched: true, level: tech.level + 1 };
          }
        }
      });
      if (updated) {
        boosts.forEach(b => onStatBoost(b.statName, b.boostValue));
        onResearchStateUpdate({ techs: newTechs, timers: newTimers });
      }
    }, 1000);
    return () => clearInterval(researchInterval);
  }, [techs, timers]);

  const startResearch = (techDef: ResearchTechDefinition) => {
    const current = techs.find(t => t.id === techDef.id) || { id: techDef.id, level: 1, isResearched: false };
    if (current.isResearched) return;
    const cost = calculateCost(techDef.id, current.level);
    if (currentCredits < cost) return;
    onCreditsChange(currentCredits - cost);
    onResearchStateUpdate({ techs: techs.map(t => t.id === techDef.id ? t : t), timers: { ...timers, [techDef.id]: calculateBaseTimeSeconds(techDef.id) } });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-xl font-bold text-[#00f3ff] uppercase tracking-wider">{t('research.title')}</h2>
        <p className="text-xs text-[#b9cacb]/85">{t('research.totalResearched')}: {techs.filter(t => t.isResearched).length}</p>
      </div>

      <div className="flex flex-col gap-3">
        {initialResearchDefinitions.map(techDef => {
          const techData = techs.find(t => t.id === techDef.id) || { id: techDef.id, level: 1, isResearched: false };
          const cost = calculateCost(techDef.id, techData.level);
          const time = timers[techDef.id] || 0;
          const isResearched = techData.isResearched;
          const isAffordable = currentCredits >= cost;

          return (
            <div key={techDef.id} className={`rounded-xl p-4 flex flex-col gap-3.5 relative ${isResearched ? 'glass-panel-active border-green-500/40' : 'glass-panel'}`}>
              <div className="flex justify-between items-start z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-lg bg-[#0e0e0f] flex items-center justify-center border ${isResearched ? 'border-green-500/30' : 'border-white/10'}`}>
                    {renderTechIcon(techDef.id, isResearched ? 'w-5 h-5 text-green-400' : 'w-5 h-5 text-[#b9cacb]')}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{tnames(techDef.name)}</h3>
                    <span className={`font-mono text-[10px] ${isResearched ? 'text-green-400 font-semibold' : 'text-[#b9cacb]/80'}`}>
                      [{tcat(techDef.category)}] +{techDef.unlocks.value} {techDef.unlocks.stat}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-[#1c1b1c] px-2 py-0.5 rounded border border-white/5">
                  <span className="font-mono text-xs text-[#00f3ff] font-bold">{cost}</span>
                </div>
              </div>

              <div className="w-full z-10">
                {isResearched ? (
                  <div className="w-full py-2 bg-green-950/30 border border-green-500/30 rounded text-[10px] font-mono font-bold text-green-400 flex items-center justify-center gap-1.5 select-none">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {t('research.completed')}
                  </div>
                ) : time > 0 ? (
                  <div>
                    <div className="flex justify-between text-[9px] font-mono text-[#b9cacb] mb-1">
                      <span className="text-yellow-400">{t('research.researching')}</span>
                      <span>{time}{t('research.remaining')}</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill bg-gradient-to-r from-yellow-500 to-orange-400" style={{ width: `${Math.round((1 - time / calculateBaseTimeSeconds(techDef.id)) * 100)}%` }} />
                    </div>
                  </div>
                ) : (
                  <button onClick={() => startResearch(techDef)} disabled={!isAffordable}
                    className={`w-full py-2 rounded font-mono text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      isAffordable ? 'bg-[#00f3ff] text-neutral-950 hover:shadow-[0_0_12px_rgba(0,243,255,0.3)] active:scale-95'
                        : 'border border-white/20 text-[#3a494b] cursor-not-allowed'
                    }`}>
                    {isAffordable ? `${t('research.research')} (${cost})` : t('research.cost')}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResearchSystem;
