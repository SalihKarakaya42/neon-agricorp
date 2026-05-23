import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './i18n';
import { Timer, AlertTriangle, Factory } from 'lucide-react';

interface ProductionChain {
  id: string; name: string; description: string;
  inputResources: { resource: string; amount: number }[];
  outputResource: { resource: string; amount: number };
  processingTime: number; baseEnergyDraw: number;
  image: string;
}

interface ProductionJob {
  id: string;
  chainId: string;
  timeStarted: number;
  processingTime: number;
  outputResource: string;
  outputAmount: number;
  isReady: boolean;
  batchCount: number;
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

const LS_KEY = 'neon_factory_jobs';

const PRODUCTION_CHAINS: ProductionChain[] = [
  { id: 'chain-wheat-flour', name: 'Wheat to Flour', description: '2 Buğday → 1 Un', inputResources: [{ resource: 'Raw Flour Base', amount: 2 }], outputResource: { resource: 'Flour Pack', amount: 1 }, processingTime: 15, baseEnergyDraw: 3, image: '/images/factory/flour-pack.svg' },
  { id: 'chain-potato-starch', name: 'Potato to Starch', description: '2 Patates → 1 Nişasta', inputResources: [{ resource: 'Raw Starch', amount: 2 }], outputResource: { resource: 'Potato Starch', amount: 1 }, processingTime: 20, baseEnergyDraw: 4, image: '/images/factory/potato-starch.svg' },
  { id: 'chain-flour-dough', name: 'Flour & Water to Dough', description: '1 Un + 1 Su → 1 Hamur', inputResources: [{ resource: 'Flour Pack', amount: 1 }, { resource: 'Water', amount: 1 }], outputResource: { resource: 'Nutrient Dough', amount: 1 }, processingTime: 25, baseEnergyDraw: 5, image: '/images/factory/nutrient-dough.svg' },
  { id: 'chain-dough-pizza', name: 'Dough to Cyber Pizza', description: '1 Hamur → 1 Pizza', inputResources: [{ resource: 'Nutrient Dough', amount: 1 }], outputResource: { resource: 'Cyber Pizza', amount: 1 }, processingTime: 35, baseEnergyDraw: 6, image: '/images/factory/cyber-pizza.svg' },
  { id: 'chain-paste-gel', name: 'Raw Paste Processing', description: '2 Domates → 1 Jel', inputResources: [{ resource: 'Raw Paste', amount: 2 }], outputResource: { resource: 'Refined Gel', amount: 1 }, processingTime: 40, baseEnergyDraw: 8, image: '/images/factory/refined-gel.svg' },
  { id: 'chain-gel-core', name: 'Gel to Quantum Core', description: '10 Jel + 20 Su → 1 Çekirdek', inputResources: [{ resource: 'Refined Gel', amount: 10 }, { resource: 'Water', amount: 20 }], outputResource: { resource: 'Quantum Core', amount: 1 }, processingTime: 80, baseEnergyDraw: 15, image: '/images/factory/quantum-core.svg' },
  { id: 'chain-berry-nutrient', name: 'Glow Berry Refinement', description: '2 Meyve → 1 Besin', inputResources: [{ resource: 'Glow Berry Batch', amount: 2 }], outputResource: { resource: 'Crystalized Nutrient', amount: 1 }, processingTime: 60, baseEnergyDraw: 10, image: '/images/factory/crystalized-nutrient.svg' },
  { id: 'chain-lumina-serum', name: 'Lumina to Serum', description: '2 Lumina + 5 Su → 1 Serum', inputResources: [{ resource: 'Lumina Extract', amount: 2 }, { resource: 'Water', amount: 5 }], outputResource: { resource: 'Quantum Serum', amount: 1 }, processingTime: 90, baseEnergyDraw: 12, image: '/images/factory/quantum-serum.svg' },
  { id: 'chain-nano-coating', name: 'Nano Coating Production', description: '2 Spor → 1 Kaplama', inputResources: [{ resource: 'Nano Spores', amount: 2 }], outputResource: { resource: 'Nano Coating', amount: 1 }, processingTime: 100, baseEnergyDraw: 14, image: '/images/factory/nano-coating.svg' },
  { id: 'chain-void-crystal', name: 'Void Crystal Synthesis', description: '3 Öz + 1 Çekirdek → 1 Kristal', inputResources: [{ resource: 'Void Essence', amount: 3 }, { resource: 'Quantum Core', amount: 1 }], outputResource: { resource: 'Void Crystal', amount: 1 }, processingTime: 150, baseEnergyDraw: 18, image: '/images/factory/void-crystal.svg' },
];

const FACTORY_IMAGES: Record<string, string> = {
  'Flour Pack': '/images/factory/flour-pack.svg',
  'Potato Starch': '/images/factory/potato-starch.svg',
  'Nutrient Dough': '/images/factory/nutrient-dough.svg',
  'Cyber Pizza': '/images/factory/cyber-pizza.svg',
  'Refined Gel': '/images/factory/refined-gel.svg',
  'Quantum Core': '/images/factory/quantum-core.svg',
  'Crystalized Nutrient': '/images/factory/crystalized-nutrient.svg',
  'Quantum Serum': '/images/factory/quantum-serum.svg',
  'Nano Coating': '/images/factory/nano-coating.svg',
  'Void Crystal': '/images/factory/void-crystal.svg',
};

const CROP_IMAGES: Record<string, string> = {
  'Raw Flour Base': '/images/synthetic-wheat.png',
  'Raw Starch': '/images/rad-potato.png',
  'Raw Paste': '/images/neon-tomato.png',
  'Glow Berry Batch': '/images/glow-berry.png',
  'Lumina Extract': '/images/bio-lumina-fruit.svg',
  'Nano Spores': '/images/nano-orchid.svg',
  'Void Essence': '/images/void-melon.svg',
  'Flour Pack': '/images/factory/flour-pack.svg',
  'Refined Gel': '/images/factory/refined-gel.svg',
  'Nutrient Dough': '/images/factory/nutrient-dough.svg',
  'Quantum Core': '/images/factory/quantum-core.svg',
  'Water': '',
};

const resourceImage = (r: string) => CROP_IMAGES[r] || FACTORY_IMAGES[r] || '';

const FactorySystem: React.FC<FactorySystemProps> = ({ currentWater, currentEnergy: _currentEnergy, onWaterChange, onEnergyChange: _onEnergyChange, currentCredits, currentInventory, onInventoryChange, onCreditsChange, onFactoryEnergyConsumptionReport, isEnergyCritical }) => {
  const { t } = useLanguage();
  const tname = (key: string) => t(`productionChains.${key}`) || key;
  const tcrop = (key: string) => t(`crops.${key}`) || key;

  const [jobs, setJobs] = useState<ProductionJob[]>(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ProductionJob[];
        return parsed.map(j => ({
          ...j,
          isReady: j.isReady || (Date.now() - j.timeStarted) / 1000 >= j.processingTime,
        }));
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(jobs));
  }, [jobs]);

  const [selectedChain, setSelectedChain] = useState<ProductionChain | null>(null);
  const [startQty, setStartQty] = useState(1);

  const totalEnergyDraw = useMemo(() => {
    if (isEnergyCritical) return 0;
    return jobs.filter(j => !j.isReady).reduce((t, j) => {
      const chain = PRODUCTION_CHAINS.find(c => c.id === j.chainId);
      return t + (chain ? chain.baseEnergyDraw : 0);
    }, 0);
  }, [jobs, isEnergyCritical]);

  useEffect(() => { onFactoryEnergyConsumptionReport(totalEnergyDraw); }, [totalEnergyDraw, onFactoryEnergyConsumptionReport]);

  useEffect(() => {
    const interval = setInterval(() => {
      setJobs(prev => prev.map(j => {
        if (j.isReady) return j;
        if (isEnergyCritical) return j;
        const elapsed = (Date.now() - j.timeStarted) / 1000;
        if (elapsed >= j.processingTime) return { ...j, isReady: true };
        return j;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [isEnergyCritical]);

  const canAffordResource = (resource: string, amount: number) => {
    if (resource === 'Water') return currentWater >= amount;
    if (resource === 'Credits') return currentCredits >= amount;
    return (currentInventory[resource] || 0) >= amount;
  };

  const deductResources = (chain: ProductionChain, qty: number) => {
    const newInv = { ...currentInventory };
    let newWater = currentWater;
    let newCredits = currentCredits;
    chain.inputResources.forEach(r => {
      const totalAmount = r.amount * qty;
      if (r.resource === 'Water') newWater -= totalAmount;
      else if (r.resource === 'Credits') newCredits -= totalAmount;
      else newInv[r.resource] = (newInv[r.resource] || 0) - totalAmount;
    });
    if (newWater !== currentWater) onWaterChange(newWater);
    if (newCredits !== currentCredits) onCreditsChange(newCredits);
    onInventoryChange(newInv);
  };

  const startProduction = (chain: ProductionChain, qty: number) => {
    if (isEnergyCritical) return;
    const canAffordAll = chain.inputResources.every(r => canAffordResource(r.resource, r.amount * qty));
    if (!canAffordAll) return;

    deductResources(chain, qty);

    const newJobs: ProductionJob[] = Array.from({ length: qty }, (_, i) => ({
      id: `${chain.id}-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      chainId: chain.id,
      timeStarted: Date.now(),
      processingTime: chain.processingTime,
      outputResource: chain.outputResource.resource,
      outputAmount: 1,
      isReady: false,
      batchCount: 1,
    }));
    setJobs(prev => [...prev, ...newJobs]);
    setSelectedChain(null);
    setStartQty(1);
  };

  const collectJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job || !job.isReady) return;
    const chain = PRODUCTION_CHAINS.find(c => c.id === job.chainId);
    if (!chain) return;
    const output = chain.outputResource;
    onInventoryChange({ ...currentInventory, [output.resource]: (currentInventory[output.resource] || 0) + output.amount });
    setJobs(prev => prev.filter(j => j.id !== jobId));
  };

  const collectAll = () => {
    const ready = jobs.filter(j => j.isReady);
    if (ready.length === 0) return;
    const newInv = { ...currentInventory };
    ready.forEach(j => {
      const chain = PRODUCTION_CHAINS.find(c => c.id === j.chainId);
      if (chain) {
        const out = chain.outputResource;
        newInv[out.resource] = (newInv[out.resource] || 0) + out.amount;
      }
    });
    onInventoryChange(newInv);
    setJobs(prev => prev.filter(j => !j.isReady));
  };

  const readyCount = jobs.filter(j => j.isReady).length;
  const activeCount = jobs.length;

  const getProgress = (job: ProductionJob) => {
    const elapsed = (Date.now() - job.timeStarted) / 1000;
    return Math.min(100, Math.round((elapsed / job.processingTime) * 100));
  };

  const getTimeLeft = (job: ProductionJob) => {
    if (job.isReady) return 0;
    const elapsed = (Date.now() - job.timeStarted) / 1000;
    return Math.max(0, Math.ceil(job.processingTime - elapsed));
  };

  return (
    <div className="flex flex-col gap-2">
      {isEnergyCritical && (
        <div className="glass-panel rounded-xl p-2 flex items-center gap-3 border-l-2 border-l-red-500">
          <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
          <span className="font-mono text-[9px] text-red-400 font-bold uppercase">{t('factory.energyCritical')}</span>
        </div>
      )}

      {/* Active Production Grid */}
      {activeCount > 0 && (
        <section className="bg-[#0e0e0f]/50 backdrop-blur-sm rounded-xl border border-white/5">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#0a0a0b]/80 rounded-t-xl border-b border-white/5">
            <h3 className="font-mono text-[10px] text-[#00f3ff] uppercase tracking-widest font-bold">
              <Factory className="w-3 h-3 inline mr-1" /> Aktif Üretim ({activeCount})
            </h3>
            {readyCount > 0 && (
              <button onClick={collectAll}
                className="px-2 py-1 bg-emerald-600/80 text-white font-mono text-[8px] font-bold uppercase rounded cursor-pointer active:scale-95 transition-all">
                TOPLA ({readyCount})
              </button>
            )}
          </div>
          <div className="grid grid-cols-6 gap-1.5 p-2">
            {jobs.map(job => {
              const chain = PRODUCTION_CHAINS.find(c => c.id === job.chainId);
              if (!chain) return null;
              const pct = getProgress(job);
              const timeLeft = getTimeLeft(job);
              return (
                <button key={job.id} onClick={() => collectJob(job.id)} disabled={!job.isReady}
                  className={`aspect-square rounded-lg overflow-hidden relative flex flex-col items-center justify-center border transition-all cursor-pointer bg-black ${
                    job.isReady
                      ? 'border-emerald-500/60 active:scale-95'
                      : 'border-white/10'
                  }`}>
                  {/* Background image */}
                  {chain.image && (
                    <img src={chain.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                  )}
                  {/* Reveal overlay */}
                  {!job.isReady && pct > 0 && (
                    <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}>
                      <img src={chain.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50 saturate-150" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0f] via-transparent to-transparent" />
                  {/* Timer top-right */}
                  {!job.isReady && (
                    <div className="absolute top-1 right-1.5 z-10 flex items-center gap-0.5">
                      <span className="font-mono text-[10px] text-white font-bold drop-shadow-[0_0_6px_rgba(0,0,0,0.9)]">{timeLeft}</span>
                      <span className="font-mono text-[5px] text-[#849495] uppercase">sn</span>
                    </div>
                  )}
                  {/* Center content */}
                  {job.isReady ? (
                    <span className="text-[24px] z-10">✅</span>
                  ) : null}
                  {/* Label */}
                  <span className="absolute bottom-1 left-1 right-1 font-mono text-[6px] text-white/70 truncate text-center z-10">
                    {tcrop(chain.outputResource.resource)}
                  </span>
                  {/* Progress dots */}
                  {!job.isReady && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00f3ff]/30 z-10">
                      <div className="h-full bg-[#00f3ff]" style={{ width: `${pct}%`, transition: 'width 1s linear' }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Production Chains */}
      <section className="bg-[#0e0e0f]/50 backdrop-blur-sm rounded-xl border border-white/5">
        <div className="flex items-center px-3 py-1.5 bg-[#0a0a0b]/80 rounded-t-xl border-b border-white/5">
          <h3 className="font-mono text-[10px] text-[#00f3ff] uppercase tracking-widest font-bold">{t('factory.availableChains')}</h3>
        </div>
        <div className="p-2 grid grid-cols-2 gap-2">
        {PRODUCTION_CHAINS.map(chain => {
          const canAffordOne = chain.inputResources.every(r => canAffordResource(r.resource, r.amount));
          return (
            <button key={chain.id} onClick={() => { setSelectedChain(chain); setStartQty(1); }}
              className={`glass-panel rounded-xl p-2.5 flex flex-col text-left w-full transition-all cursor-pointer active:scale-98 hover:border-[#00f3ff]/30 relative ${
                !canAffordOne ? 'opacity-60' : ''
              }`}>
              {/* Timer top-right */}
              <div className="absolute top-1.5 right-2 flex items-center gap-0.5 z-10">
                <Timer className="w-2.5 h-2.5 text-[#00f3ff]" />
                <span className="font-mono text-[8px] text-[#00f3ff] font-bold">{chain.processingTime}s</span>
              </div>
              <h4 className="font-mono text-[11px] text-white font-bold truncate w-full mb-2 pr-10">{tname(chain.name)}</h4>
              <div className="flex items-start gap-2.5">
              {/* Product image */}
              <div className={`${canAffordOne ? 'neon-glow-wrapper' : ''} w-14 h-14 rounded-lg flex-shrink-0 relative mt-0.5`}>
                {canAffordOne && <div className="neon-glow-glow" />
                }<div className={`absolute inset-0 bg-gradient-to-br from-[#00f3ff]/5 via-transparent to-[#00f3ff]/10 ${canAffordOne ? 'animate-pulse' : ''} z-10 rounded-lg`} />
                {chain.image ? (
                  <img src={chain.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[18px] text-[#3a494b]">⚙️</div>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <p className="font-mono text-[9px] text-[#b9cacb] leading-tight">{chain.description}</p>
                {/* Formula - single line */}
                <div className="flex items-center gap-1 flex-nowrap overflow-hidden">
                  {chain.inputResources.map((r, idx) => {
                    return (
                      <div key={r.resource} className="flex items-center gap-0.5 bg-[#0e0e0f]/60 px-1 py-0.5 rounded shrink-0">
                        {idx > 0 && <span className="text-[7px] text-[#849495] font-mono mr-0.5">+</span>}
                        <span className="font-mono text-[8px] text-white font-bold">{r.amount}</span>
                        {resourceImage(r.resource) ? (
                          <img src={resourceImage(r.resource)} alt="" className="w-3 h-3 rounded object-cover" />
                        ) : (
                          <span className="text-[8px]">💧</span>
                        )}
                      </div>
                    );
                  })}
                  <span className="text-[10px] text-[#00f3ff] font-mono shrink-0">→</span>
                  <div className="flex items-center gap-0.5 bg-[#0e0e0f]/60 px-1 py-0.5 rounded shrink-0">
                    <span className="font-mono text-[8px] text-emerald-400 font-bold">{chain.outputResource.amount}</span>
                    <div className="w-3 h-3 rounded overflow-hidden bg-[#0e0e0f] border border-white/10 flex-shrink-0">
                      {chain.image ? (
                        <img src={chain.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[5px] text-[#3a494b]">⚙️</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </button>
          );
        })}
        </div>
      </section>

      {/* Start Production Modal */}
      <AnimatePresence>
        {selectedChain && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm bg-[#131314] rounded-2xl border border-[#00f3ff]/30 p-4 shadow-[0_0_35px_rgba(0,243,255,0.2)]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#0e0e0f] border border-white/10">
                  {selectedChain.image && <img src={selectedChain.image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-mono text-sm text-white font-bold">{tname(selectedChain.name)}</h3>
                  <p className="font-mono text-[9px] text-[#849495]">{selectedChain.description}</p>
                </div>
                <button onClick={() => setSelectedChain(null)} className="p-1 text-white/60 hover:text-white cursor-pointer">✕</button>
              </div>

              <div className="bg-[#0e0e0f]/60 rounded-lg p-3 mb-3">
                <span className="font-mono text-[9px] text-[#849495] uppercase tracking-wider">Girdiler (birim)</span>
                <div className="flex flex-col gap-2 mt-2">
                  {selectedChain.inputResources.map(r => {
                    const owned = r.resource === 'Water' ? currentWater : r.resource === 'Credits' ? currentCredits : (currentInventory[r.resource] || 0);
                    const enough = owned >= r.amount * startQty;
                    return (
                      <div key={r.resource} className="flex items-center gap-3">
                        {resourceImage(r.resource) ? (
                          <img src={resourceImage(r.resource)} alt="" className="w-7 h-7 rounded object-cover" />
                        ) : (
                          <span className="text-[14px]">💧</span>
                        )}
                        <span className="font-mono text-[11px] text-white/70 flex-1">{tcrop(r.resource)}</span>
                        <span className={`font-mono text-[11px] font-bold ${enough ? 'text-emerald-400' : 'text-red-400'}`}>
                          {Math.floor(owned)}/{r.amount * startQty}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quantity slider */}
              {(() => {
                const maxQty = Math.min(
                  ...selectedChain.inputResources.map(r => {
                    const owned = r.resource === 'Water' ? currentWater : r.resource === 'Credits' ? currentCredits : (currentInventory[r.resource] || 0);
                    return Math.floor(owned / r.amount);
                  }),
                  50
                );
                const safeMax = Math.max(1, maxQty);
                const pct = safeMax <= 1 ? 100 : ((startQty - 1) / (safeMax - 1)) * 100;
                return (
                  <div className="bg-[#0e0e0f]/60 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] text-[#b9cacb] uppercase">Üretim Miktarı</span>
                      <span className="font-mono text-[14px] text-[#00f3ff] font-bold">{startQty}</span>
                    </div>
                    <input type="range" min={1} max={safeMax} value={Math.min(startQty, safeMax)}
                      onChange={e => setStartQty(Math.max(1, Math.min(safeMax, Number(e.target.value))))}
                      className="w-full h-2 appearance-none bg-neutral-800 rounded-full outline-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00f3ff] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,243,255,0.5)] [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#00f3ff] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(0,243,255,0.5)] [&::-moz-range-thumb]:cursor-pointer"
                      style={{ background: `linear-gradient(to right, #00f3ff ${pct}%, #2a2a2c ${pct}%)` }} />
                    <div className="flex justify-between mt-1">
                      <span className="font-mono text-[8px] text-[#3a494b]">1</span>
                      <span className="font-mono text-[8px] text-[#3a494b]">{safeMax}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-2">
                <button onClick={() => setSelectedChain(null)}
                  className="flex-1 py-2 border border-white/10 text-[#849495] font-mono text-[9px] uppercase rounded cursor-pointer active:scale-95">
                  İPTAL
                </button>
                <button onClick={() => startProduction(selectedChain, startQty)}
                  disabled={isEnergyCritical || !selectedChain.inputResources.every(r => canAffordResource(r.resource, r.amount * startQty))}
                  className="flex-1 py-2 bg-[#00f3ff] text-neutral-950 font-mono text-[9px] font-bold uppercase rounded cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                  {startQty} ADET ÜRET
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FactorySystem;