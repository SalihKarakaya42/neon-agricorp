import { useEffect } from 'react';
import { useLanguage } from './i18n';
import { CheckCircle2 } from 'lucide-react';

interface ResearchTechData { id: string; level: number; isResearched: boolean; }
interface InputResource { resource: string; amount: number; }
interface ResearchTechDefinition { id: string; name: string; category: 'Agriculture' | 'Water' | 'Energy' | 'District'; baseCost: number; unlocks: { stat: string; value: number }; image: string; inputResources: InputResource[]; }

interface ResearchSystemProps {
  currentCredits: number;
  onCreditsChange: (newCredits: number) => void;
  onStatBoost: (statName: string, boostValue: number) => void;
  researchState: { techs: ResearchTechData[]; timers: { [key: string]: number } };
  onResearchStateUpdate: (newState: { techs: ResearchTechData[]; timers: { [key: string]: number } }) => void;
  currentInventory: Record<string, number>;
  onInventoryChange: (newInventory: Record<string, number>) => void;
}

const initialResearchDefinitions: ResearchTechDefinition[] = [
  { id: 'agri-1', name: 'Hydroponic Efficiency I', category: 'Agriculture', baseCost: 500, unlocks: { stat: 'farmCropGrowthSpeed', value: 0.1 }, image: '/images/research/hydroponic.svg', inputResources: [{ resource: 'Raw Lettuce', amount: 3 }] },
  { id: 'water-1', name: 'Deep Well Pumping I', category: 'Water', baseCost: 800, unlocks: { stat: 'pumpPower', value: 2 }, image: '/images/research/well-pump.svg', inputResources: [{ resource: 'Raw Starch', amount: 3 }] },
  { id: 'energy-1', name: 'Basic Reactor Core I', category: 'Energy', baseCost: 1000, unlocks: { stat: 'baseEnergyProduction', value: 5 }, image: '/images/research/reactor-core.svg', inputResources: [{ resource: 'Raw Flour Base', amount: 2 }] },
  { id: 'water-2', name: 'Hydroponic Water Mgmt I', category: 'Water', baseCost: 1500, unlocks: { stat: 'waterEfficiency', value: 0.1 }, image: '/images/research/water-mgmt.svg', inputResources: [{ resource: 'Raw Paste', amount: 5 }] },
  { id: 'energy-2', name: 'Capacitor Bank V1', category: 'Energy', baseCost: 2000, unlocks: { stat: 'maxEnergyCapacity', value: 500 }, image: '/images/research/capacitor.svg', inputResources: [{ resource: 'Glow Berry Batch', amount: 3 }] },
  { id: 'district-1', name: 'Geothermal Tapping', category: 'Energy', baseCost: 3500, unlocks: { stat: 'baseEnergyProduction', value: 10 }, image: '/images/research/geothermal.svg', inputResources: [{ resource: 'Flour Pack', amount: 3 }, { resource: 'Potato Starch', amount: 2 }] },
  { id: 'agri-2', name: 'Laboratory Systems', category: 'Agriculture', baseCost: 4000, unlocks: { stat: 'tier3CropUnlock', value: 1 }, image: '/images/research/laboratory.svg', inputResources: [{ resource: 'Flour Pack', amount: 5 }, { resource: 'Nutrient Dough', amount: 3 }] },
  { id: 'agri-3', name: 'Genişletilmiş Sektörler I', category: 'Agriculture', baseCost: 6000, unlocks: { stat: 'podCapacity', value: 4 }, image: '/images/research/expansion.svg', inputResources: [{ resource: 'Cyber Pizza', amount: 2 }, { resource: 'Refined Gel', amount: 3 }] },
  { id: 'agri-4', name: 'Genetic Engineering', category: 'Agriculture', baseCost: 20000, unlocks: { stat: 'tier4CropUnlock', value: 1 }, image: '/images/research/genetic.svg', inputResources: [{ resource: 'Quantum Core', amount: 3 }, { resource: 'Crystalized Nutrient', amount: 2 }] },
  { id: 'district-2', name: 'Excavation Protocol I', category: 'District', baseCost: 5000, unlocks: { stat: 'unlockedT3Factories', value: 1 }, image: '/images/research/excavation.svg', inputResources: [{ resource: 'Cyber Pizza', amount: 5 }, { resource: 'Nutrient Dough', amount: 5 }] },
  { id: 'prestige-1', name: 'Civilization Blueprint', category: 'District', baseCost: 15000, unlocks: { stat: 'unlockedPrestige', value: 1 }, image: '/images/research/blueprint.svg', inputResources: [{ resource: 'Quantum Core', amount: 3 }, { resource: 'Refined Gel', amount: 5 }] },
];

const resourceImage = (res: string): string | undefined => {
  const map: Record<string, string> = {
    'Raw Lettuce': '/images/hydro-lettuce.png',
    'Raw Starch': '/images/rad-potato.png',
    'Raw Flour Base': '/images/synthetic-wheat.png',
    'Raw Paste': '/images/neon-tomato.png',
    'Glow Berry Batch': '/images/glow-berry.png',
    'Flour Pack': '/images/factory/flour-pack.svg',
    'Potato Starch': '/images/factory/potato-starch.svg',
    'Nutrient Dough': '/images/factory/nutrient-dough.svg',
    'Cyber Pizza': '/images/factory/cyber-pizza.svg',
    'Refined Gel': '/images/factory/refined-gel.svg',
    'Quantum Core': '/images/factory/quantum-core.svg',
    'Crystalized Nutrient': '/images/factory/crystalized-nutrient.svg',
  };
  return map[res];
};

const categoryIcon = (cat: string) => {
  switch (cat) {
    case 'Agriculture': return '#00f3ff';
    case 'Water': return '#3b82f6';
    case 'Energy': return '#facc15';
    case 'District': return '#a78bfa';
    default: return '#849495';
  }
};

const ResearchSystem: React.FC<ResearchSystemProps> = ({ currentCredits, onCreditsChange, onStatBoost, researchState, onResearchStateUpdate, currentInventory, onInventoryChange }) => {
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

  const canAffordResources = (inputs: InputResource[]) => {
    return inputs.every(r => (currentInventory[r.resource] || 0) >= r.amount);
  };

  const startResearch = (techDef: ResearchTechDefinition) => {
    const current = techs.find(t => t.id === techDef.id) || { id: techDef.id, level: 1, isResearched: false };
    if (current.isResearched) return;
    const cost = calculateCost(techDef.id, current.level);
    if (currentCredits < cost) return;
    if (!canAffordResources(techDef.inputResources)) return;
    const newInv = { ...currentInventory };
    techDef.inputResources.forEach(r => {
      newInv[r.resource] = (newInv[r.resource] || 0) - r.amount;
      if (newInv[r.resource] <= 0) delete newInv[r.resource];
    });
    onInventoryChange(newInv);
    onCreditsChange(currentCredits - cost);
    onResearchStateUpdate({ techs: techs.map(t => t.id === techDef.id ? t : t), timers: { ...timers, [techDef.id]: calculateBaseTimeSeconds(techDef.id) } });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-xl font-bold text-[#00f3ff] uppercase tracking-wider">{t('research.title')}</h2>
        <p className="text-xs text-[#b9cacb]/85">{t('research.totalResearched')}: {techs.filter(t => t.isResearched).length}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {initialResearchDefinitions.map(techDef => {
          const techData = techs.find(t => t.id === techDef.id) || { id: techDef.id, level: 1, isResearched: false };
          const cost = calculateCost(techDef.id, techData.level);
          const time = timers[techDef.id] || 0;
          const isResearched = techData.isResearched;
          const canAffordCredits = currentCredits >= cost;
          const canAffordRes = canAffordResources(techDef.inputResources);
          const canStart = canAffordCredits && canAffordRes;

          return (
            <div key={techDef.id} className={`rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden border ${isResearched ? 'border-green-500/40' : 'border-white/5'} bg-[#0e0e0f]/50 backdrop-blur-sm`}>
              <div className="flex items-start gap-2.5 z-10">
                {/* Image */}
                <div className="w-14 h-14 rounded-lg flex-shrink-0 relative overflow-hidden bg-[#0e0e0f] border border-white/10">
                  <img src={techDef.image} alt="" className="w-full h-full object-cover" />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-mono text-[11px] text-white font-bold truncate">{tnames(techDef.name)}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryIcon(techDef.category) }} />
                    <span className="font-mono text-[8px] text-[#b9cacb]">{tcat(techDef.category)}</span>
                  </div>
                  {/* Input resources */}
                  <div className="flex flex-wrap items-center gap-1 mt-1.5">
                    {techDef.inputResources.map((r, idx) => (
                      <div key={idx} className="flex items-center gap-0.5 bg-[#0e0e0f]/60 px-1 py-0.5 rounded">
                        <span className={`font-mono text-[7px] font-bold ${(currentInventory[r.resource] || 0) >= r.amount ? 'text-white' : 'text-red-400'}`}>{r.amount}</span>
                        {resourceImage(r.resource) ? (
                          <img src={resourceImage(r.resource)} alt="" className="w-2.5 h-2.5 rounded object-cover" />
                        ) : (
                          <span className="text-[7px]">📦</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Cost badge */}
                <div className="flex items-center gap-1 bg-[#1c1b1c] px-2 py-0.5 rounded border border-white/5 shrink-0">
                  <span className="font-mono text-[10px] text-[#00f3ff] font-bold">{cost}</span>
                </div>
              </div>

              <div className="w-full z-10">
                {isResearched ? (
                  <div className="w-full py-1.5 bg-green-950/30 border border-green-500/30 rounded text-[9px] font-mono font-bold text-green-400 flex items-center justify-center gap-1 select-none">
                    <CheckCircle2 className="w-3 h-3" /> {t('research.completed')}
                  </div>
                ) : time > 0 ? (
                  <div>
                    <div className="flex justify-between text-[8px] font-mono text-[#b9cacb] mb-0.5">
                      <span className="text-yellow-400">{t('research.researching')}</span>
                      <span>{time}{t('research.remaining')}</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill bg-gradient-to-r from-yellow-500 to-orange-400" style={{ width: `${Math.round((1 - time / calculateBaseTimeSeconds(techDef.id)) * 100)}%` }} />
                    </div>
                  </div>
                ) : (
                  <button onClick={() => startResearch(techDef)} disabled={!canStart}
                    className={`w-full py-1.5 rounded font-mono text-[9px] font-bold uppercase transition-all cursor-pointer ${
                      canStart ? 'bg-[#00f3ff] text-neutral-950 hover:shadow-[0_0_12px_rgba(0,243,255,0.3)] active:scale-95'
                        : 'border border-white/20 text-[#3a494b] cursor-not-allowed'
                    }`}>
                    {canStart ? `${t('research.research')} (${cost})` : t('research.cost')}
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
