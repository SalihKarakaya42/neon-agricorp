import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout, Droplet, Zap } from 'lucide-react';
import { useLanguage } from './i18n';

interface Crop {
  id: string;
  podId: string;
  name: string;
  waterRequired: number;
  energyRequired: number;
  baseGrowthTime: number;
  timePlanted: number;
  isHarvestable: boolean;
}

interface FarmSystemProps {
  currentWater: number;
  currentEnergy: number;
  onWaterChange: (newWater: number) => void;
  onEnergyChange: (newEnergy: number) => void;
  onEnergyConsumptionReport: (energyDraw: number) => void;
  cropGrowthModifier: number;
  onWaterConsumptionReport: (waterDraw: number) => void;
  isEnergyCritical: boolean;
  onBatchHarvest: (outputResources: string[]) => void;
  radiationLevel: number;
  fertilizer: number;
  onFertilizerChange: (newAmount: number) => void;
  podCapacity: number;
  tier4Unlocked: number;
  waterPerSec: number;
  energyPerSec: number;
}

const POD_COUNT = 4;
const POD_IDS = Array.from({ length: POD_COUNT }, (_, i) => `POD_${String(i + 1).padStart(2, '0')}`);

const FarmSystem: React.FC<FarmSystemProps> = ({ 
    currentWater, currentEnergy, onWaterChange, onEnergyChange,
    onEnergyConsumptionReport, cropGrowthModifier, onWaterConsumptionReport,
    isEnergyCritical, onBatchHarvest, radiationLevel, fertilizer, onFertilizerChange,
    podCapacity, tier4Unlocked, waterPerSec, energyPerSec
}) => {
  const { t } = useLanguage();
  const [crops, setCrops] = useState<Crop[]>(() => {
    try {
      const saved = localStorage.getItem('neon_farm_crops');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem('neon_farm_crops', JSON.stringify(crops));
  }, [crops]);
  const [availableCrops] = useState([
    { id: 'hydro-lettuce', name: 'Hydro Lettuce', waterRequired: 10, energyRequired: 5, baseGrowthTime: 30, baseEnergyDraw: 1, waterPerSecond: 0.5, outputResource: 'Raw Lettuce', image: '/images/hydro-lettuce.png' },
    { id: 'rad-potato', name: 'Rad Potato', waterRequired: 15, energyRequired: 7, baseGrowthTime: 45, baseEnergyDraw: 1.5, waterPerSecond: 0.6, outputResource: 'Raw Starch', image: '/images/rad-potato.png' },
    { id: 'synthetic-wheat', name: 'Synthetic Wheat', waterRequired: 12, energyRequired: 6, baseGrowthTime: 40, baseEnergyDraw: 1.2, waterPerSecond: 0.55, outputResource: 'Raw Flour Base', image: '/images/synthetic-wheat.png' },
    { id: 'neon-tomato', name: 'Neon Tomato', waterRequired: 20, energyRequired: 10, baseGrowthTime: 60, baseEnergyDraw: 2.5, waterPerSecond: 0.8, outputResource: 'Raw Paste', image: '/images/neon-tomato.png' },
    { id: 'glow-berry', name: 'Glow Berry', waterRequired: 30, energyRequired: 18, baseGrowthTime: 120, baseEnergyDraw: 4, waterPerSecond: 1.1, outputResource: 'Glow Berry Batch', image: '/images/glow-berry.png' },
    ...(tier4Unlocked > 0 ? [
      { id: 'bio-lumina-fruit', name: 'Bio Lumina Fruit', waterRequired: 40, energyRequired: 25, baseGrowthTime: 200, baseEnergyDraw: 6, waterPerSecond: 1.5, outputResource: 'Lumina Extract', image: '/images/bio-lumina-fruit.svg' },
      { id: 'nano-orchid', name: 'Nano Orchid', waterRequired: 50, energyRequired: 30, baseGrowthTime: 250, baseEnergyDraw: 7, waterPerSecond: 1.8, outputResource: 'Nano Spores', image: '/images/nano-orchid.svg' },
      { id: 'void-melon', name: 'Void Melon', waterRequired: 60, energyRequired: 35, baseGrowthTime: 300, baseEnergyDraw: 8, waterPerSecond: 2.0, outputResource: 'Void Essence', image: '/images/void-melon.svg' },
    ] : []),
  ]);

  const [plantModal, setPlantModal] = useState<{ podId: string } | null>(null);
  const [hoveredCrop, setHoveredCrop] = useState<typeof availableCrops[0] | null>(availableCrops[0]);
  const [plantQty, setPlantQty] = useState(1);

  const tcrop = (key: string) => t(`crops.${key}`) || key;

  const cropsInPod = useMemo(() => {
    const map: Record<string, Crop[]> = {};
    POD_IDS.forEach(id => map[id] = []);
    crops.forEach(c => { if (map[c.podId]) map[c.podId].push(c); });
    return map;
  }, [crops]);

  // Determine single crop type in a pod (null if empty or mixed)
  const podCropType = (podId: string) => {
    const podCrops = cropsInPod[podId] || [];
    if (podCrops.length === 0) return null;
    const firstName = podCrops[0].name;
    return podCrops.every(c => c.name === firstName) ? firstName : null;
  };

  const findCropInfo = (cropName: string) => availableCrops.find(c => c.name === cropName);

  const constantEnergyDraw = useMemo(() => {
    return crops.reduce((total, crop) => {
      const info = availableCrops.find(c => c.name === crop.name);
      return total + (info ? info.baseEnergyDraw : 0);
    }, 0);
  }, [crops]);

  const continuousWaterUsage = useMemo(() => {
    return crops.reduce((total, crop) => {
      const info = availableCrops.find(c => c.name === crop.name);
      return total + (info ? info.waterPerSecond : 0);
    }, 0);
  }, [crops]);

  useEffect(() => {
    onEnergyConsumptionReport(constantEnergyDraw);
    onWaterConsumptionReport(continuousWaterUsage);
  }, [constantEnergyDraw, continuousWaterUsage, onEnergyConsumptionReport, onWaterConsumptionReport]);

  const plantCrop = (cropIndex: number) => {
    const cropToPlant = availableCrops[cropIndex];
    if (!plantModal) return;
    const podId = plantModal.podId;
    const currentCount = cropsInPod[podId].length;
    const existingType = podCropType(podId);
    // Enforce single crop type per pod
    if (existingType && cropToPlant.name !== existingType) return;
    const canPlant = Math.min(plantQty, podCapacity - currentCount);
    if (canPlant <= 0) return;

    const totalWater = cropToPlant.waterRequired * canPlant;
    const totalEnergy = cropToPlant.energyRequired * canPlant;
    if (currentWater < totalWater || currentEnergy < totalEnergy) return;

    onWaterChange(currentWater - totalWater);
    onEnergyChange(currentEnergy - totalEnergy);

    const newCrops: Crop[] = Array.from({ length: canPlant }, () => ({
      id: `${cropToPlant.name}-${Date.now()}-${Math.random()}`,
      podId,
      name: cropToPlant.name,
      waterRequired: cropToPlant.waterRequired,
      energyRequired: cropToPlant.energyRequired,
      baseGrowthTime: cropToPlant.baseGrowthTime,
      timePlanted: Date.now(),
      isHarvestable: false,
    }));
    setCrops(prev => [...prev, ...newCrops]);
    setPlantModal(null);
    setPlantQty(1);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCrops(prev =>
        prev.map(crop => {
          if (crop.isHarvestable) return crop;
          const info = availableCrops.find(c => c.name === crop.name);
          const baseTime = info ? crop.baseGrowthTime : 30;
          const totalMod = cropGrowthModifier * (isEnergyCritical ? 0.2 : 1.0) * (radiationLevel > 70 ? 0.5 : radiationLevel > 40 ? 0.8 : 1.2) * (fertilizer > 0 ? 1.3 : 1.0);
          if ((now - crop.timePlanted) / 1000 >= baseTime / totalMod) {
            if (fertilizer > 0) onFertilizerChange(fertilizer - 1);
            return { ...crop, isHarvestable: true };
          }
          return crop;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [cropGrowthModifier, isEnergyCritical, radiationLevel, fertilizer, onFertilizerChange]);

  const getGrowthPercent = (crop: Crop) => {
    const info = availableCrops.find(c => c.name === crop.name);
    const baseTime = info ? crop.baseGrowthTime : 30;
    const totalMod = cropGrowthModifier * (isEnergyCritical ? 0.2 : 1.0) * (radiationLevel > 70 ? 0.5 : radiationLevel > 40 ? 0.8 : 1.2) * (fertilizer > 0 ? 1.3 : 1.0);
    return Math.min(100, Math.round(((Date.now() - crop.timePlanted) / 1000 / (baseTime / totalMod)) * 100));
  };

  return (
    <div className="flex flex-col gap-4">

      <section className="grid grid-cols-2 gap-3">
        {/* Water Cell */}
        <div className="rounded-lg p-3 flex flex-col gap-2 relative overflow-hidden min-h-[160px] shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
          <img src="/images/backgrounds/su.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#0e0e0f]/60" />
          <div className="absolute top-1.5 right-2 z-10">
            <span className={`font-mono text-[11px] font-bold uppercase ${waterPerSec >= 0 ? 'text-emerald-400' : 'text-red-400'} drop-shadow-[0_0_6px_rgba(0,0,0,0.8)]`}>
              {waterPerSec >= 0 ? '+' : ''}{waterPerSec.toFixed(1)}/s
            </span>
          </div>
          <div className="relative z-10 flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-2">
              <Droplet className="w-5 h-5 text-blue-400" />
              <span className="font-mono text-[11px] text-white font-bold uppercase">Su</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <span className="font-mono text-[28px] text-blue-300 font-bold drop-shadow-[0_0_10px_rgba(96,165,250,0.3)]">{Math.floor(currentWater)}</span>
            </div>
          </div>
        </div>
        {/* Energy Cell */}
        <div className="rounded-lg p-3 flex flex-col gap-2 relative overflow-hidden min-h-[160px] shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
          <img src="/images/backgrounds/enerji.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#0e0e0f]/60" />
          <div className="absolute top-1.5 right-2 z-10">
            <span className={`font-mono text-[11px] font-bold uppercase ${energyPerSec >= 0 ? 'text-emerald-400' : 'text-red-400'} drop-shadow-[0_0_6px_rgba(0,0,0,0.8)]`}>
              {energyPerSec >= 0 ? '+' : ''}{energyPerSec.toFixed(1)}/s
            </span>
          </div>
          <div className="relative z-10 flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="font-mono text-[11px] text-white font-bold uppercase">Enerji</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <span className={`font-mono text-[28px] font-bold drop-shadow-[0_0_10px_rgba(234,179,8,0.3)] ${isEnergyCritical ? 'text-red-400' : 'text-yellow-400'}`}>{Math.floor(currentEnergy)}</span>
            </div>
          </div>
        </div>

        {POD_IDS.map(podId => {
          const podCrops = cropsInPod[podId] || [];
          const used = podCrops.length;
          const remaining = podCapacity - used;
          const singleType = podCropType(podId);
          const cropInfo = singleType ? findCropInfo(singleType) : null;

          const growing = podCrops.filter(c => !c.isHarvestable);
          const readyCrops = podCrops.filter(c => c.isHarvestable);
          const readyCount = readyCrops.length;
          const avgPct = growing.length > 0
            ? Math.round(growing.reduce((s, c) => s + getGrowthPercent(c), 0) / growing.length)
            : (podCrops.length > 0 ? 100 : 0);
          const minRemaining = growing.length > 0
            ? Math.min(...growing.map(c => {
                const info = findCropInfo(c.name);
                const base = info ? c.baseGrowthTime : 30;
                const mod = cropGrowthModifier * (isEnergyCritical ? 0.2 : 1.0) * (radiationLevel > 70 ? 0.5 : radiationLevel > 40 ? 0.8 : 1.2) * (fertilizer > 0 ? 1.3 : 1.0);
                return Math.max(0, Math.ceil(base / mod - (Date.now() - c.timePlanted) / 1000));
              }))
            : 0;

          return (
            <div key={podId} className="glass-panel rounded-lg p-3 flex flex-col gap-2 relative overflow-hidden min-h-[200px] shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
              {/* Arkaplan resmi */}
              <img src="/images/backgrounds/tarım.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-[#0e0e0f]/40" />
              {/* Full background reveal image when crops exist */}
              {cropInfo && (
                <>
                  {/* Base faded image */}
                  <img src={cropInfo.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15 saturate-[0.3] scale-110" />
                  {/* Revealed image clipped from left */}
                  {avgPct > 0 && (
                    <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - avgPct}% 0 0)` }}>
                      <img src={cropInfo.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 saturate-100 scale-110" />
                    </div>
                  )}
                  {/* Gradient overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0f] via-[#0e0e0f]/70 to-[#0e0e0f]/30" />
                  {readyCount > 0 && (
                    <div className="absolute inset-0 bg-green-500/5" />
                  )}
                </>
              )}
              <div className="scanline-overlay z-0" />

              {/* Header */}
              <div className="flex justify-between items-center z-10">
                <span className="font-mono text-[10px] text-[#849495] font-semibold">{podId}</span>
                <span className="font-mono text-[9px] text-[#00f3ff] font-bold">{used}/{podCapacity}</span>
              </div>

              {/* Center countdown when growing */}
              {podCrops.length > 0 && (
                <div className="flex-1 flex flex-col items-center justify-center z-10 py-2">
                  {readyCount === podCrops.length ? (
                    <span className="font-mono text-[11px] text-green-400 font-bold uppercase tracking-wider">Hazır</span>
                  ) : minRemaining > 0 ? (
                    <>
                      <span className="font-mono text-[28px] text-white font-bold drop-shadow-[0_0_12px_rgba(0,243,255,0.5)]">{minRemaining}</span>
                      <span className="font-mono text-[8px] text-[#849495] uppercase tracking-widest">saniye</span>
                    </>
                  ) : null}
                </div>
              )}

              {/* Empty state */}
              {podCrops.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center py-4 select-none z-10">
                  <span className="text-[24px] text-[#3a494b]">⬜</span>
                  <p className="font-mono text-[9px] text-[#849495] uppercase tracking-widest mt-1">{t('farm.noCrops')}</p>
                </div>
              )}

              {/* Crop list - grouped by name */}
              {podCrops.length > 0 && (
                <div className="flex flex-col gap-1 z-10 max-h-[100px] overflow-y-auto">
                  {(() => {
                    const grouped: Record<string, number> = {};
                    podCrops.forEach(c => { grouped[c.name] = (grouped[c.name] || 0) + 1; });
                    const entries = Object.entries(grouped).slice(0, 4);
                    return (
                      <>
                        {entries.map(([name, count]) => (
                          <div key={name} className="flex items-center gap-1.5 bg-[#0e0e0f]/40 rounded px-1.5 py-1">
                            <span className="font-mono text-[8px] text-white/80 truncate flex-1">{count} adet {tcrop(name)}</span>
                          </div>
                        ))}
                        {Object.keys(grouped).length > 4 && (
                          <p className="text-[7px] font-mono text-[#849495] text-center">+{podCrops.length} toplam</p>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Toplu hasat button */}
              {readyCount >= 1 && (
                <button onClick={() => {
                  const outputs = readyCrops.map(c => {
                    const info = findCropInfo(c.name);
                    return info?.outputResource || 'Raw Lettuce';
                  });
                  onBatchHarvest(outputs);
                  setCrops(prev => prev.filter(c => !(c.isHarvestable && c.podId === podId)));
                }}
                  className="w-full py-1.5 bg-emerald-600 text-white font-mono text-[9px] font-bold uppercase rounded shadow-[0_0_10px_rgba(16,185,129,0.3)] cursor-pointer active:scale-95 transition-all z-10">
                  TOPLU HASAT ({readyCount})
                </button>
              )}

              {/* Ekim button */}
              {remaining > 0 && (
                <button onClick={() => {
                  const initialCrop = singleType
                    ? availableCrops.find(c => c.name === singleType) ?? availableCrops[0]
                    : availableCrops[0];
                  setPlantModal({ podId }); setPlantQty(1); setHoveredCrop(initialCrop);
                }}
                  className="w-full py-1.5 border border-[#00f3ff]/60 text-[#00f3ff] hover:bg-[#00f3ff]/10 font-mono text-[9px] uppercase rounded transition-all cursor-pointer text-center block z-10 active:scale-95">
                  {singleType ? `${tcrop(singleType)} +` : t('farm.plant')} (+{remaining})
                </button>
              )}
            </div>
          );
        })}
      </section>

      <AnimatePresence>
        {plantModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-[#131314] rounded-2xl border border-[#00f3ff]/30 p-4 shadow-[0_0_35px_rgba(0,243,255,0.2)]"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-[#00f3ff]" />
                  <h3 className="font-sans text-base font-bold text-white uppercase tracking-wider">{plantModal.podId} — {t('farm.plant')}</h3>
                </div>
                <button onClick={() => setPlantModal(null)} className="p-1 text-white/60 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer">
                  KAPAT
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {/* Adet seçici - pod kapasitesine göre */}
                <div className="flex items-center justify-between bg-[#0e0e0f]/60 rounded-lg p-2">
                  <span className="font-mono text-[10px] text-[#b9cacb] uppercase">Adet</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 10].filter(n => n <= (podCapacity - (cropsInPod[plantModal.podId]?.length || 0))).map(n => (
                      <button key={n} onClick={() => setPlantQty(n)}
                        className={`w-8 py-1 text-[11px] font-mono font-bold rounded transition-all cursor-pointer ${
                          plantQty === n ? 'bg-[#00f3ff] text-neutral-950' : 'bg-neutral-900 border border-white/10 text-[#849495]'
                        }`}>{n}</button>
                    ))}
                  </div>
                </div>

                {/* Ürün grid - sadece pod ile uyumlu ürünler */}
                {(() => {
                  const existingType = podCropType(plantModal.podId);
                  const eligibleCrops = existingType
                    ? availableCrops.filter(c => c.name === existingType)
                    : availableCrops;
                  return (
                    <div className="grid grid-cols-5 gap-2">
                      {eligibleCrops.map((crop) => {
                        const totalWater = crop.waterRequired * plantQty;
                        const totalEnergy = crop.energyRequired * plantQty;
                        const canAfford = currentWater >= totalWater && currentEnergy >= totalEnergy;
                        return (
                          <button key={crop.id} onClick={() => setHoveredCrop(crop)}
                            className={`aspect-square p-1 rounded-lg flex flex-col items-center justify-center gap-1 border transition-all ${
                              hoveredCrop?.id === crop.id ? 'bg-[#00f3ff]/15 border-[#00f3ff]' : 'bg-neutral-900 border-white/5'
                            } ${!canAfford ? 'opacity-50' : ''}`}>
                            <img src={crop.image} alt="" className="w-8 h-8 object-cover rounded" />
                            <span className="text-[7px] font-mono text-[#b9cacb]">{crop.waterRequired*plantQty}💧</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}

                {hoveredCrop && (
                  <div className="bg-[#0e0e0f]/80 p-3 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <img src={hoveredCrop.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <h4 className="text-sm font-bold text-white">{tcrop(hoveredCrop.name)}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] font-mono text-[#849495]">
                      <span>Su: <strong className="text-white">{hoveredCrop.waterRequired * plantQty}</strong></span>
                      <span>Enerji: <strong className="text-white">{hoveredCrop.energyRequired * plantQty}</strong></span>
                      <span>Süre: <strong className="text-white">{hoveredCrop.baseGrowthTime}s</strong></span>
                      <span>Çıktı: <strong className="text-white">{tcrop(hoveredCrop.outputResource)}</strong></span>
                    </div>
                    <button onClick={() => plantCrop(availableCrops.indexOf(hoveredCrop))}
                      disabled={currentWater < hoveredCrop.waterRequired * plantQty || currentEnergy < hoveredCrop.energyRequired * plantQty}
                      className={`w-full py-2.5 mt-2 rounded font-mono font-bold uppercase text-xs cursor-pointer active:scale-95 transition-all ${
                        currentWater >= hoveredCrop.waterRequired * plantQty && currentEnergy >= hoveredCrop.energyRequired * plantQty
                          ? 'bg-[#00f3ff] text-neutral-950'
                          : 'bg-neutral-800 text-white/40 cursor-not-allowed'
                      }`}>
                      {plantQty} ADET EK
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FarmSystem;
