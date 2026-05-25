import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './i18n';
import { Timer, AlertTriangle, Factory, Droplet, Zap } from 'lucide-react';

interface ProductionChain {
  id: string; name: string; description: string;
  inputResources: { resource: string; amount: number }[];
  outputResource: { resource: string; amount: number };
  byProduct?: { resource: string; amount: number };
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
  onFertilizerAdd?: (amount: number) => void;
}

const LS_KEY = 'neon_factory_jobs';

const PRODUCTION_CHAINS: ProductionChain[] = [
  { id: 'chain-wheat-flour', name: 'Wheat to Flour', description: '2 Ham Un Bazı → 1 Un Paketi', inputResources: [{ resource: 'Raw Flour Base', amount: 2 }], outputResource: { resource: 'Flour Pack', amount: 1 }, byProduct: { resource: 'Posa', amount: 1 }, processingTime: 15, baseEnergyDraw: 3, image: '/images/factory/flour-pack.svg' },
  { id: 'chain-potato-starch', name: 'Potato to Starch', description: '2 Ham Nişasta → 1 Patates Nişastası', inputResources: [{ resource: 'Raw Starch', amount: 2 }], outputResource: { resource: 'Potato Starch', amount: 1 }, byProduct: { resource: 'Posa', amount: 1 }, processingTime: 20, baseEnergyDraw: 4, image: '/images/factory/potato-starch.svg' },
  { id: 'chain-flour-dough', name: 'Flour & Water to Dough', description: '1 Un Paketi + 1 Su → 1 Besin Hamuru', inputResources: [{ resource: 'Flour Pack', amount: 1 }, { resource: 'Water', amount: 1 }], outputResource: { resource: 'Nutrient Dough', amount: 1 }, byProduct: { resource: 'Posa', amount: 1 }, processingTime: 25, baseEnergyDraw: 5, image: '/images/factory/nutrient-dough.svg' },
  { id: 'chain-dough-pizza', name: 'Dough to Cyber Pizza', description: '1 Besin Hamuru → 1 Siber Pizza', inputResources: [{ resource: 'Nutrient Dough', amount: 1 }], outputResource: { resource: 'Cyber Pizza', amount: 1 }, byProduct: { resource: 'Posa', amount: 1 }, processingTime: 35, baseEnergyDraw: 6, image: '/images/factory/cyber-pizza.svg' },
  { id: 'chain-paste-gel', name: 'Raw Paste Processing', description: '2 Ham Macun → 1 Rafine Jel', inputResources: [{ resource: 'Raw Paste', amount: 2 }], outputResource: { resource: 'Refined Gel', amount: 1 }, byProduct: { resource: 'Posa', amount: 1 }, processingTime: 40, baseEnergyDraw: 8, image: '/images/factory/refined-gel.svg' },
  { id: 'chain-gel-core', name: 'Gel to Quantum Core', description: '10 Rafine Jel + 20 Su → 1 Kuantum Çekirdek', inputResources: [{ resource: 'Refined Gel', amount: 10 }, { resource: 'Water', amount: 20 }], outputResource: { resource: 'Quantum Core', amount: 1 }, byProduct: { resource: 'Posa', amount: 2 }, processingTime: 80, baseEnergyDraw: 15, image: '/images/factory/quantum-core.svg' },
  { id: 'chain-berry-nutrient', name: 'Glow Berry Refinement', description: '2 Parlak Meyve Partisi → 1 Kristalize Besin', inputResources: [{ resource: 'Glow Berry Batch', amount: 2 }], outputResource: { resource: 'Crystalized Nutrient', amount: 1 }, byProduct: { resource: 'Posa', amount: 1 }, processingTime: 60, baseEnergyDraw: 10, image: '/images/factory/crystalized-nutrient.svg' },
  { id: 'chain-lumina-serum', name: 'Lumina to Serum', description: '2 Lumina Özütü + 5 Su → 1 Kuantum Serumu', inputResources: [{ resource: 'Lumina Extract', amount: 2 }, { resource: 'Water', amount: 5 }], outputResource: { resource: 'Quantum Serum', amount: 1 }, byProduct: { resource: 'Posa', amount: 2 }, processingTime: 90, baseEnergyDraw: 12, image: '/images/factory/quantum-serum.svg' },
  { id: 'chain-nano-coating', name: 'Nano Coating Production', description: '2 Nano Sporlar → 1 Nano Kaplama', inputResources: [{ resource: 'Nano Spores', amount: 2 }], outputResource: { resource: 'Nano Coating', amount: 1 }, byProduct: { resource: 'Posa', amount: 2 }, processingTime: 100, baseEnergyDraw: 14, image: '/images/factory/nano-coating.svg' },
  { id: 'chain-void-crystal', name: 'Void Crystal Synthesis', description: '3 Void Özü + 1 Kuantum Çekirdek → 1 Void Kristali', inputResources: [{ resource: 'Void Essence', amount: 3 }, { resource: 'Quantum Core', amount: 1 }], outputResource: { resource: 'Void Crystal', amount: 1 }, byProduct: { resource: 'Posa', amount: 3 }, processingTime: 150, baseEnergyDraw: 18, image: '/images/factory/void-crystal.svg' },
  { id: 'chain-posa-fertilizer', name: 'Posa → Gübre', description: '5 Posa → 1 Gübre', inputResources: [{ resource: 'Posa', amount: 5 }], outputResource: { resource: 'Gübre', amount: 1 }, processingTime: 30, baseEnergyDraw: 3, image: '' },
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

const FactorySystem: React.FC<FactorySystemProps> = ({ currentWater, currentEnergy: _currentEnergy, onWaterChange, onEnergyChange: _onEnergyChange, currentCredits, currentInventory, onInventoryChange, onCreditsChange, onFactoryEnergyConsumptionReport, isEnergyCritical, onFertilizerAdd }) => {
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
    const newInv = { ...currentInventory };
    if (chain.byProduct) {
      newInv[chain.byProduct.resource] = (newInv[chain.byProduct.resource] || 0) + chain.byProduct.amount;
    }
    if (output.resource === 'Gübre') {
      onFertilizerAdd?.(output.amount);
    } else {
      newInv[output.resource] = (newInv[output.resource] || 0) + output.amount;
    }
    onInventoryChange(newInv);
    setJobs(prev => prev.filter(j => j.id !== jobId));
  };

  const collectAll = () => {
    const ready = jobs.filter(j => j.isReady);
    if (ready.length === 0) return;
    const newInv = { ...currentInventory };
    let fertilizerGained = 0;
    ready.forEach(j => {
      const chain = PRODUCTION_CHAINS.find(c => c.id === j.chainId);
      if (chain) {
        if (chain.byProduct) {
          newInv[chain.byProduct.resource] = (newInv[chain.byProduct.resource] || 0) + chain.byProduct.amount;
        }
        const out = chain.outputResource;
        if (out.resource === 'Gübre') {
          fertilizerGained += out.amount;
        } else {
          newInv[out.resource] = (newInv[out.resource] || 0) + out.amount;
        }
      }
    });
    onInventoryChange(newInv);
    if (fertilizerGained > 0) onFertilizerAdd?.(fertilizerGained);
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

      {/* Active Production List */}
      {activeCount > 0 && (
        <section className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#00f3ff]/10 to-[#0088ff]/10 rounded-lg border border-[#00f3ff]/20 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-[#00f3ff] to-[#0088ff] rounded-full" />
              <h3 className="font-mono text-[12px] text-[#00f3ff] uppercase tracking-wider font-bold">
                <Factory className="w-4 h-4 inline mr-2" /> Aktif Üretim
              </h3>
              <span className="font-mono text-[10px] text-[#849495] bg-[#0e0e0f]/60 px-2 py-1 rounded border border-white/5">
                {activeCount} İş
              </span>
            </div>
            {readyCount > 0 && (
              <button onClick={collectAll}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-mono text-[9px] font-bold uppercase rounded-lg cursor-pointer active:scale-95 transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                ✓ TOPLA ({readyCount})
              </button>
            )}
          </div>

          {/* Jobs List - Progress Bar Style */}
          <div className="flex flex-col gap-2">
            {(() => {
              // Group jobs by output resource
              const grouped: Record<string, ProductionJob[]> = {};
              jobs.forEach(job => {
                if (!grouped[job.outputResource]) grouped[job.outputResource] = [];
                grouped[job.outputResource].push(job);
              });

              return Object.entries(grouped).map(([resource, resourceJobs]) => {
                const readyInGroup = resourceJobs.filter(j => j.isReady).length;
                const totalInGroup = resourceJobs.length;
                const avgProgress = Math.round(
                  resourceJobs.reduce((sum, j) => sum + getProgress(j), 0) / totalInGroup
                );
                const minTimeLeft = Math.min(...resourceJobs.map(j => getTimeLeft(j)));

                return (
                  <div key={resource} className="flex flex-col gap-2 p-3 bg-gradient-to-r from-[#0e0e0f] to-[#0a0a0b] rounded-lg border border-[#00f3ff]/20 hover:border-[#00f3ff]/40 transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[#00f3ff] font-bold uppercase">{tcrop(resource)}</span>
                        <span className="font-mono text-[9px] text-[#849495] bg-[#0e0e0f]/60 px-2 py-0.5 rounded border border-white/5">
                          {readyInGroup}/{totalInGroup}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {readyInGroup === totalInGroup ? (
                          <span className="font-mono text-[9px] text-emerald-400 font-bold uppercase">✓ Hazır</span>
                        ) : (
                          <span className="font-mono text-[9px] text-[#00f3ff] font-bold">{minTimeLeft}s</span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-[#0e0e0f]/60 rounded-full overflow-hidden border border-[#00f3ff]/20">
                      <div
                        className={`h-full transition-all duration-1000 linear ${
                          readyInGroup === totalInGroup
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                            : 'bg-gradient-to-r from-[#00f3ff] to-[#0088ff] shadow-[0_0_8px_rgba(0,243,255,0.5)]'
                        }`}
                        style={{ width: `${readyInGroup === totalInGroup ? 100 : avgProgress}%` }}
                      />
                    </div>

                    {/* Job Details */}
                    <div className="flex flex-wrap gap-2">
                      {resourceJobs.map((job) => {
                        const chain = PRODUCTION_CHAINS.find(c => c.id === job.chainId);
                        if (!chain) return null;
                        const pct = getProgress(job);
                        const timeLeft = getTimeLeft(job);

                        return (
                          <button
                            key={job.id}
                            onClick={() => collectJob(job.id)}
                            disabled={!job.isReady}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all cursor-pointer text-[8px] font-mono font-bold ${
                              job.isReady
                                ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300 hover:bg-emerald-600/40'
                                : 'bg-[#0e0e0f]/60 border-[#00f3ff]/30 text-[#00f3ff] hover:border-[#00f3ff]/60'
                            }`}
                          >
                            {job.isReady ? (
                              <>
                                <span>✓</span>
                                <span>Hazır</span>
                              </>
                            ) : (
                              <>
                                <span className="w-8 h-1 bg-[#0e0e0f]/60 rounded-full overflow-hidden border border-[#00f3ff]/20">
                                  <div
                                    className="h-full bg-gradient-to-r from-[#00f3ff] to-[#0088ff]"
                                    style={{ width: `${pct}%` }}
                                  />
                                </span>
                                <span>{timeLeft}s</span>
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </section>
      )}

      {/* Production Chains */}
      <section className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#00f3ff]/10 to-[#0088ff]/10 rounded-lg border border-[#00f3ff]/20 backdrop-blur-sm">
          <div className="w-1 h-6 bg-gradient-to-b from-[#00f3ff] to-[#0088ff] rounded-full" />
          <h3 className="font-mono text-[12px] text-[#00f3ff] uppercase tracking-wider font-bold">Üretim Zincirleri</h3>
        </div>

        {/* Chains Grid */}
        <div className="grid grid-cols-2 gap-3">
        {PRODUCTION_CHAINS.map(chain => {
          const canAffordOne = chain.inputResources.every(r => canAffordResource(r.resource, r.amount));
          return (
            <button key={chain.id} onClick={() => { setSelectedChain(chain); setStartQty(1); }}
              className={`relative overflow-hidden rounded-xl transition-all cursor-pointer active:scale-[0.98] border ${
                canAffordOne
                  ? 'border-[#00f3ff]/30 hover:border-[#00f3ff]/60 hover:shadow-[0_0_16px_rgba(0,243,255,0.2)]'
                  : 'border-white/10 opacity-60'
              } bg-gradient-to-br from-[#0e0e0f] to-[#0a0a0b] p-3`}>

              {/* Neon glow for affordable chains */}
              {canAffordOne && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#00f3ff]/5 via-transparent to-[#0088ff]/5 pointer-events-none" />
              )}

              {/* Processing time badge */}
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#0e0e0f]/80 px-2 py-1 rounded-lg border border-[#00f3ff]/30 backdrop-blur-sm z-10">
                <Timer className="w-3 h-3 text-[#00f3ff]" />
                <span className="font-mono text-[8px] text-[#00f3ff] font-bold">{chain.processingTime}s</span>
              </div>

              {/* Title */}
              <h4 className="font-mono text-[11px] text-[#00f3ff] font-bold mb-3 pr-16 uppercase tracking-wider">{tname(chain.name)}</h4>

              {/* Content */}
              <div className="flex items-start gap-3">
                {/* Product image */}
                <div className="w-16 h-16 rounded-lg flex-shrink-0 relative overflow-hidden border border-[#00f3ff]/20 bg-[#0e0e0f]/60">
                  {chain.image ? (
                    <img src={chain.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">⚙️</div>
                  )}
                  {canAffordOne && (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00f3ff]/10 to-transparent" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <p className="font-mono text-[8px] text-[#b9cacb] leading-tight">{chain.description}</p>

                  {/* Formula */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {chain.inputResources.map((r, idx) => {
                      return (
                        <div key={r.resource} className="flex items-center gap-1 bg-[#0e0e0f]/80 px-1.5 py-0.5 rounded border border-white/10 backdrop-blur-sm">
                          {idx > 0 && <span className="text-[7px] text-[#849495] font-mono">+</span>}
                          <span className="font-mono text-[7px] text-white font-bold">{r.amount}</span>
                          {resourceImage(r.resource) ? (
                            <img src={resourceImage(r.resource)} alt="" className="w-3 h-3 rounded object-cover" />
                          ) : (
                            <span className="text-[7px]">💧</span>
                          )}
                        </div>
                      );
                    })}
                    <span className="text-[9px] text-[#00f3ff] font-mono font-bold">→</span>
                    <div className="flex items-center gap-1 bg-emerald-600/30 px-1.5 py-0.5 rounded border border-emerald-500/40 backdrop-blur-sm">
                      <span className="font-mono text-[7px] text-emerald-300 font-bold">{chain.outputResource.amount}</span>
                      <div className="w-3 h-3 rounded overflow-hidden bg-[#0e0e0f] border border-emerald-500/30 flex-shrink-0">
                        {chain.image ? (
                          <img src={chain.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[5px]">⚙️</div>
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

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-[#0e0e0f]/60 rounded-lg p-3">
                  <span className="font-mono text-[9px] text-[#849495] uppercase tracking-wider">Girdiler (birim)</span>
                  <div className="flex flex-col gap-2 mt-2">
                    {selectedChain.inputResources.map(r => {
                      const owned = r.resource === 'Water' ? currentWater : r.resource === 'Credits' ? currentCredits : (currentInventory[r.resource] || 0);
                      const enough = owned >= r.amount * startQty;
                      const resImg = resourceImage(r.resource);
                      return (
                        <div key={r.resource} className="flex items-center gap-2">
                          {r.resource === 'Water' ? (
                            <Droplet className="w-4 h-4 text-blue-400 shrink-0" />
                          ) : resImg ? (
                            <img src={resImg} alt="" className="w-6 h-6 rounded object-cover" />
                          ) : null}
                          <span className="font-mono text-[9px] text-white/70 flex-1 truncate">
                            {r.resource === 'Water' ? t('resourceLabels.Water') : tcrop(r.resource)}
                          </span>
                          <span className={`font-mono text-[9px] font-bold ${enough ? 'text-emerald-400' : 'text-red-400'}`}>
                            {Math.floor(owned)}/{r.amount * startQty}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[#0e0e0f]/60 rounded-lg p-3">
                  <span className="font-mono text-[9px] text-[#849495] uppercase tracking-wider">Üretim İhtiyacı</span>
                  <div className="flex flex-col gap-2 mt-2">
                    {selectedChain.baseEnergyDraw > 0 && (
                      <div className="bg-[#0e0e0f]/60 rounded-xl p-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Zap className="w-3 h-3 text-yellow-500" />
                          <span className="text-[#849495] font-mono text-[8px]">Enerji Çekişi</span>
                        </div>
                        <span className="font-mono text-[12px] font-bold text-yellow-400">
                          {selectedChain.baseEnergyDraw * startQty}
                        </span>
                        <span className="font-mono text-[7px] text-[#849495] ml-1">/s</span>
                      </div>
                    )}
                    {selectedChain.inputResources.some(r => r.resource === 'Water') && (
                      <div className="bg-[#0e0e0f]/60 rounded-xl p-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Droplet className="w-3 h-3 text-blue-400" />
                          <span className="text-[#849495] font-mono text-[8px]">Su Tüketimi</span>
                        </div>
                        <span className="font-mono text-[12px] font-bold text-blue-300">
                          {(() => {
                            const waterInput = selectedChain.inputResources.find(r => r.resource === 'Water');
                            return waterInput ? waterInput.amount * startQty : 0;
                          })()}
                        </span>
                        <span className="font-mono text-[7px] text-[#849495] ml-1">/birim</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Çıktılar */}
              <div className="bg-[#0e0e0f]/60 rounded-lg p-3">
                <span className="font-mono text-[9px] text-[#849495] uppercase tracking-wider">Çıktılar</span>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5 bg-emerald-600/20 px-2 py-1.5 rounded border border-emerald-500/30">
                    <img src={selectedChain.image || resourceImage(selectedChain.outputResource.resource)} alt="" className="w-5 h-5 rounded object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <span className="font-mono text-[10px] text-emerald-300 font-bold">
                      {selectedChain.outputResource.amount * startQty}× {tcrop(selectedChain.outputResource.resource)}
                    </span>
                  </div>
                  {selectedChain.byProduct && (
                    <div className="flex items-center gap-1.5 bg-amber-600/20 px-2 py-1.5 rounded border border-amber-500/30">
                      <span className="font-mono text-[9px] text-amber-300">🗑️</span>
                      <span className="font-mono text-[10px] text-amber-300 font-bold">
                        {selectedChain.byProduct.amount * startQty}× {selectedChain.byProduct.resource}
                      </span>
                    </div>
                  )}
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
                      className="w-full h-4 appearance-none bg-neutral-800 rounded-full outline-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00f3ff] [&::-webkit-slider-thumb]:shadow-[0_0_14px_rgba(0,243,255,0.6)] [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#00f3ff] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-[0_0_14px_rgba(0,243,255,0.6)] [&::-moz-range-thumb]:cursor-pointer
                        [&::-moz-range-track]:h-4 [&::-moz-range-track]:bg-neutral-800 [&::-moz-range-track]:rounded-full"
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