import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from './i18n';
import { Timer, AlertTriangle } from 'lucide-react';
import { syncWithServer } from './syncService';

interface ProductionChain {
  id: string; name: string;
  inputResources: { resource: string; amount: number }[];
  outputResource: { resource: string; amount: number };
  processingTime: number; factoryType: string; baseEnergyDraw: number;
}

interface Factory {
  id: string; type: string; level: number;
  currentProductionChain: ProductionChain | null;
  timeStarted: number | null; isProcessing: boolean;
}

interface FactorySystemProps {
  currentWater: number; currentEnergy: number; currentCredits: number;
  onWaterChange: (newWater: number) => void;
  onEnergyChange: (newEnergy: number) => void;
  onCreditsChange: (newCredits: number) => void;
  currentInventory: Record<string, number>;
  onInventoryChange: (newInventory: Record<string, number>) => void;
  onFactoryEnergyConsumptionReport: (energyDraw: number) => void;
  isEnergyCritical: boolean;
  userId: string;
}

const FactorySystem: React.FC<FactorySystemProps> = ({ currentCredits, onCreditsChange, currentInventory, onInventoryChange, onFactoryEnergyConsumptionReport, currentWater, onWaterChange, isEnergyCritical, userId }) => {
  const { t } = useLanguage();
  const [factories, setFactories] = useState<Factory[]>([]);
  const [productionChains] = useState<ProductionChain[]>([
    { id: 'chain-wheat-flour', name: 'Wheat to Flour', inputResources: [{ resource: 'Raw Flour Base', amount: 10 }], outputResource: { resource: 'Flour Pack', amount: 5 }, processingTime: 15, factoryType: 'Nano Press', baseEnergyDraw: 3 },
    { id: 'chain-potato-starch', name: 'Potato to Starch', inputResources: [{ resource: 'Raw Starch', amount: 15 }], outputResource: { resource: 'Potato Starch', amount: 7 }, processingTime: 20, factoryType: 'Bio Reactor', baseEnergyDraw: 4 },
    { id: 'chain-flour-dough', name: 'Flour & Water to Dough', inputResources: [{ resource: 'Flour Pack', amount: 8 }, { resource: 'Water', amount: 10 }], outputResource: { resource: 'Nutrient Dough', amount: 10 }, processingTime: 25, factoryType: 'Quantum Kitchen', baseEnergyDraw: 5 },
    { id: 'chain-dough-pizza', name: 'Dough to Cyber Pizza', inputResources: [{ resource: 'Nutrient Dough', amount: 10 }], outputResource: { resource: 'Cyber Pizza', amount: 8 }, processingTime: 35, factoryType: 'Quantum Kitchen', baseEnergyDraw: 6 },
    { id: 'chain-paste-gel', name: 'Raw Paste Processing', inputResources: [{ resource: 'Raw Paste', amount: 5 }], outputResource: { resource: 'Refined Gel', amount: 3 }, processingTime: 40, factoryType: 'Chemical Processor', baseEnergyDraw: 8 },
    { id: 'chain-gel-core', name: 'Gel to Quantum Core', inputResources: [{ resource: 'Refined Gel', amount: 10 }, { resource: 'Water', amount: 20 }], outputResource: { resource: 'Quantum Core', amount: 1 }, processingTime: 80, factoryType: 'Fusion Refinery', baseEnergyDraw: 15 },
    { id: 'chain-berry-nutrient', name: 'Glow Berry Refinement', inputResources: [{ resource: 'Glow Berry Batch', amount: 5 }], outputResource: { resource: 'Crystalized Nutrient', amount: 2 }, processingTime: 60, factoryType: 'Chemical Processor', baseEnergyDraw: 10 },
  ]);

  const tname = (key: string) => t(`productionChains.${key}`) || key;
  const tfact = (key: string) => t(`factoryTypes.${key}`) || key;
  const tcrop = (key: string) => t(`crops.${key}`) || key;

  const totalFactoryEnergyDraw = useMemo(() => factories.reduce((t, f) => t + (f.isProcessing && f.currentProductionChain ? f.currentProductionChain.baseEnergyDraw : 0), 0), [factories]);

  useEffect(() => { onFactoryEnergyConsumptionReport(isEnergyCritical ? 0 : totalFactoryEnergyDraw); }, [totalFactoryEnergyDraw, isEnergyCritical]);

  useEffect(() => {
    setFactories([
      { id: 'factory-nanopress-1', type: 'Nano Press', level: 1, currentProductionChain: null, timeStarted: null, isProcessing: false },
      { id: 'factory-bioreactor-1', type: 'Bio Reactor', level: 1, currentProductionChain: null, timeStarted: null, isProcessing: false },
      { id: 'factory-quantumkitchen-1', type: 'Quantum Kitchen', level: 1, currentProductionChain: null, timeStarted: null, isProcessing: false },
      { id: 'factory-chemicalprocessor-1', type: 'Chemical Processor', level: 1, currentProductionChain: null, timeStarted: null, isProcessing: false },
      { id: 'factory-fusionrefinery-1', type: 'Fusion Refinery', level: 1, currentProductionChain: null, timeStarted: null, isProcessing: false },
    ]);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactories(prev => prev.map(f => {
        if (isEnergyCritical) return f.isProcessing ? { ...f, isProcessing: false, timeStarted: null } : f;
        if (f.isProcessing && f.currentProductionChain && f.timeStarted) {
          const elapsed = (Date.now() - f.timeStarted) / 1000;
          if (elapsed >= f.currentProductionChain.processingTime) {
            const output = f.currentProductionChain.outputResource;
            const newInv = { ...currentInventory };
            newInv[output.resource] = (newInv[output.resource] || 0) + output.amount;
            onInventoryChange(newInv);
            return { ...f, isProcessing: false, currentProductionChain: null, timeStarted: null };
          }
        }
        return f;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [isEnergyCritical, currentInventory]);

  const canAffordResource = (resource: string, amount: number) => resource === 'Credits' ? currentCredits >= amount : (currentInventory[resource] || 0) >= amount;
  const deductResource = (resource: string, amount: number) => {
    if (resource === 'Credits') onCreditsChange(currentCredits - amount);
    else if (resource === 'Water') onWaterChange(currentWater - amount);
    else onInventoryChange({ ...currentInventory, [resource]: (currentInventory[resource] || 0) - amount });
  };
  const startProduction = (factoryId: string, chainId: string) => {
    if (isEnergyCritical) return;
    const chain = productionChains.find(pc => pc.id === chainId);
    if (!chain) return;
    const inputs: Record<string, number> = {};
    chain.inputResources.forEach(r => { inputs[r.resource] = r.amount; });
    syncWithServer('start-factory', {
      userId,
      recipeName: chain.name,
      inputs,
      waterCost: 0,
      energyCost: chain.baseEnergyDraw * 2,
    });
    setFactories(prev => prev.map(f => {
      if (f.id === factoryId && !f.isProcessing) {
        if (chain.inputResources.every(r => canAffordResource(r.resource, r.amount))) {
          chain.inputResources.forEach(r => deductResource(r.resource, r.amount));
          return { ...f, currentProductionChain: chain, timeStarted: Date.now(), isProcessing: true };
        }
      }
      return f;
    }));
  };
  const processingPercent = (f: Factory) => !f.timeStarted || !f.currentProductionChain ? 0 : Math.min(100, Math.round(((Date.now() - f.timeStarted) / 1000 / f.currentProductionChain.processingTime) * 100));

  return (
    <div className="flex flex-col gap-4">
      {isEnergyCritical && (
        <div className="glass-panel rounded-xl p-3 flex items-center gap-3 border-l-2 border-l-red-500">
          <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
          <span className="font-mono text-[10px] text-red-400 font-bold uppercase">{t('factory.energyCritical')}</span>
        </div>
      )}

      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-[10px] text-[#849495] uppercase tracking-widest px-1">{t('factory.availableChains')}</h3>
        {productionChains.map(chain => (
          <div key={chain.id} className="glass-panel rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold text-white">{tname(chain.name)}</h4>
                <span className="text-[9px] font-mono text-[#00f3ff] bg-[#00f3ff]/10 px-1.5 py-0.5 rounded">{tfact(chain.factoryType)}</span>
              </div>
              <div className="text-right text-[9px] font-mono text-[#b9cacb]">
                <div>{chain.processingTime}s</div>
                <div className="text-yellow-400">{chain.baseEnergyDraw}/s</div>
              </div>
            </div>
            <div className="text-[9px] font-mono text-[#849495]">
              {t('factory.inputs')}: {chain.inputResources.map(r => `${r.amount}x ${tcrop(r.resource)}`).join(', ')}
              {' → '}{chain.outputResource.amount}x {tcrop(chain.outputResource.resource)}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {factories.filter(f => f.type === chain.factoryType && !f.isProcessing).map(f => (
                <button key={f.id} onClick={() => startProduction(f.id, chain.id)} disabled={isEnergyCritical} className="py-1.5 bg-[#00f3ff]/10 border border-[#00f3ff]/30 text-[#00f3ff] rounded font-mono text-[9px] font-bold uppercase cursor-pointer hover:bg-[#00f3ff]/20 transition-all active:scale-95">
                  {tfact(f.type)} — BAŞLAT
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="font-mono text-[10px] text-[#849495] uppercase tracking-widest px-1">{t('factory.activeFactories')}</h3>
        {factories.map(f => (
          <div key={f.id} className={`glass-panel rounded-xl p-3 flex items-center gap-3 ${f.isProcessing ? 'border-l-2 border-l-yellow-400' : ''}`}>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white">{tfact(f.type)} <span className="text-[9px] text-[#849495]">Lvl {f.level}</span></span>
                {f.isProcessing ? (
                  <span className="text-[9px] font-mono text-yellow-400 font-bold flex items-center gap-1">
                    <Timer className="w-3 h-3 animate-spin" /> {t('factory.processing')}
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-[#3a494b]">{t('factory.idle')}</span>
                )}
              </div>
              {f.isProcessing && f.currentProductionChain && (
                <div className="mt-2">
                  <div className="flex justify-between text-[9px] font-mono text-[#b9cacb] mb-1">
                    <span>{tname(f.currentProductionChain.name)}</span>
                    <span>{Math.max(0, f.currentProductionChain.processingTime - Math.floor((Date.now() - (f.timeStarted || Date.now())) / 1000))}s</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill bg-gradient-to-r from-pink-500 to-orange-400" style={{ width: `${processingPercent(f)}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      <div className="glass-panel rounded-xl p-4">
        <h3 className="font-mono text-[10px] text-[#849495] uppercase tracking-widest mb-2">{t('factory.inventoryOverview')}</h3>
        {Object.keys(currentInventory).length === 0 ? (
          <p className="text-xs text-[#b9cacb]/60">{t('app.empty')}</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(currentInventory).filter(([, a]) => a > 0).map(([r, a]) => (
              <div key={r} className="font-mono text-[10px] text-[#b9cacb] bg-[#0e0e0f]/50 px-2 py-1 rounded border border-white/5">
                {tcrop(r)}: <strong className="text-white">{a}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FactorySystem;
