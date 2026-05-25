import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout, Droplet, Zap, Clock, Box } from 'lucide-react';
import { useLanguage } from './i18n';
import { ALL_DISTRICTS } from './DistrictSystem';

interface Crop {
  id: string;
  uniqueId: string;
  regionId: string;
  gridIndex: number;
  name: string;
  waterRequired: number;
  energyRequired: number;
  baseGrowthTime: number;
  timePlanted: number;
  isHarvestable: boolean;
  fertilized?: boolean;
}

interface FarmSystemProps {
  currentWater: number;
  currentEnergy: number;
  credits: number;
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
  gridCapacity: number;
  tier4Unlocked: number;
  waterPerSec: number;
  energyPerSec: number;
  maxWater: number;
  maxEnergy: number;
  unlockedRegions: string[];
  onDistrictUnlock: (districtId: string, stat: string, value: number, cost: number) => void;
}

function getLevelInfo(current: number, max: number, t: (key: string) => string): { label: string; multiplier: number; color: string; icon: string } {
  const pct = max > 0 ? current / max : 0;
  if (pct >= 0.75) return { label: t('farm.statGood'), multiplier: 1, color: 'text-emerald-400', icon: '🟢' };
  if (pct >= 0.50) return { label: t('farm.statMedium'), multiplier: 1.25, color: 'text-yellow-400', icon: '🟡' };
  if (pct >= 0.25) return { label: t('farm.statBad'), multiplier: 1.5, color: 'text-orange-400', icon: '🟠' };
  return { label: t('farm.statCritical'), multiplier: 2, color: 'text-red-400', icon: '🔴' };
}

const REGION_NAMES: { id: string; label: string }[] = [
  { id: 'humid-cave', label: 'Nemli Mağara' },
  { id: 'reactor-zone', label: 'Reaktör Bölgesi' },
  { id: 'abandoned-lab', label: 'Terk Edilmiş Lab' },
  { id: 'toxic-layer', label: 'Toksik Katman' },
  { id: 'megacorp-ruins', label: 'MegaCorp Kalıntıları' },
];

const FarmSystem: React.FC<FarmSystemProps> = ({
    currentWater, currentEnergy, credits, onWaterChange, onEnergyChange,
    onEnergyConsumptionReport, cropGrowthModifier, onWaterConsumptionReport,
    onBatchHarvest, radiationLevel, fertilizer, onFertilizerChange,
    gridCapacity, tier4Unlocked, waterPerSec: _waterPerSec, energyPerSec: _energyPerSec, maxWater: _maxWater, maxEnergy, unlockedRegions,
    onDistrictUnlock
}) => {
  const { t } = useLanguage();
  const energyLevel = getLevelInfo(currentEnergy, maxEnergy, t);
  const [crops, setCrops] = useState<Crop[]>(() => {
    try {
      const saved = localStorage.getItem('neon_farm_crops');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate old crops without gridIndex
        return parsed.map((crop: any) => {
          if (crop.gridIndex !== undefined) return crop;
          // Eski crop'lar için gridIndex hesapla (insertion order'a göre)
          const regionCrops = parsed.filter((c: any) => c.regionId === crop.regionId);
          const indexInRegion = regionCrops.indexOf(crop);
          return { ...crop, gridIndex: Math.floor(indexInRegion / gridCapacity) };
        });
      }
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

  const [plantModal, setPlantModal] = useState<{ regionId: string; gridIndex: number } | null>(null);
  const [hoveredCrop, setHoveredCrop] = useState<typeof availableCrops[0] | null>(availableCrops[0]);
  const [plantQty, setPlantQty] = useState(1);
  const [useFertilizer, setUseFertilizer] = useState(false);

  const tcrop = (key: string) => t(`crops.${key}`) || key;

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
    const regionId = plantModal.regionId;
    const gridIndex = plantModal.gridIndex;

    // Grid'deki ürünleri bul: gridIndex property'sine göre
    const gridCrops = crops.filter(c => c.regionId === regionId && c.gridIndex === gridIndex);

    const gridCount = gridCrops.length;
    const existingTypeInGrid = gridCrops.length > 0 && gridCrops.every(c => c.name === gridCrops[0].name) ? gridCrops[0].name : null;
    // Enforce single crop type per grid (not per region)
    if (existingTypeInGrid && cropToPlant.name !== existingTypeInGrid) return;
    const canPlant = Math.min(plantQty, gridCapacity - gridCount);
    if (canPlant <= 0) return;

    const fertilizerToUse = useFertilizer ? Math.min(canPlant, fertilizer) : 0;
    const totalWater = cropToPlant.waterRequired * canPlant;
    const totalEnergy = cropToPlant.energyRequired * canPlant;
    if (currentWater < totalWater || currentEnergy < totalEnergy) return;

    onWaterChange(currentWater - totalWater);
    onEnergyChange(currentEnergy - totalEnergy);
    if (fertilizerToUse > 0) onFertilizerChange(fertilizer - fertilizerToUse);

    const newCrops: Crop[] = Array.from({ length: canPlant }, (_, i) => ({
      id: cropToPlant.id,
      uniqueId: `${cropToPlant.name}-${Date.now()}-${Math.random()}`,
      regionId,
      gridIndex,
      name: cropToPlant.name,
      waterRequired: cropToPlant.waterRequired,
      energyRequired: cropToPlant.energyRequired,
      baseGrowthTime: cropToPlant.baseGrowthTime,
      timePlanted: Date.now(),
      isHarvestable: false,
      fertilized: i < fertilizerToUse,
    }));
    setCrops(prev => [...prev, ...newCrops]);
    setPlantModal(null);
    setPlantQty(1);
    setUseFertilizer(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCrops(prev =>
        prev.map(crop => {
          if (crop.isHarvestable) return crop;
          const info = availableCrops.find(c => c.name === crop.name);
          const baseTime = info ? crop.baseGrowthTime : 30;
          const fertilizeMod = crop.fertilized ? 1.01 : 1.0;
          const totalMod = cropGrowthModifier * (1 / energyLevel.multiplier) * (radiationLevel > 70 ? 0.5 : radiationLevel > 40 ? 0.8 : 1.2) * fertilizeMod;
          if ((now - crop.timePlanted) / 1000 >= baseTime / totalMod) {
            return { ...crop, isHarvestable: true };
          }
          return crop;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [cropGrowthModifier, energyLevel.multiplier, radiationLevel]);

  const getGrowthPercent = (crop: Crop) => {
    const info = availableCrops.find(c => c.name === crop.name);
    const baseTime = info ? crop.baseGrowthTime : 30;
    const fertilizeMod = crop.fertilized ? 1.01 : 1.0;
    const totalMod = cropGrowthModifier * (1 / energyLevel.multiplier) * (radiationLevel > 70 ? 0.5 : radiationLevel > 40 ? 0.8 : 1.2) * fertilizeMod;
    return Math.min(100, Math.round(((Date.now() - crop.timePlanted) / 1000 / (baseTime / totalMod)) * 100));
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-4">
        {REGION_NAMES.map(region => {
          const isUnlocked = unlockedRegions.includes(region.id);

          // Her bölge için 2×2 = 4 grid oluştur
          const gridsForRegion = Array.from({ length: 4 }, (_, i) => ({
            id: `${region.id}-grid-${i}`,
            regionId: region.id,
            gridIndex: i,
          }));

          return (
            <div key={region.id} className="flex flex-col gap-4">
              {/* Bölge Başlığı - Geliştirilmiş Tasarım */}
              <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-[#00f3ff]/10 to-[#0088ff]/10 rounded-lg border border-[#00f3ff]/20 backdrop-blur-sm">
                <div className="w-1 h-6 bg-gradient-to-b from-[#00f3ff] to-[#0088ff] rounded-full" />
                <span className="font-mono text-[13px] text-[#00f3ff] font-bold uppercase tracking-wider flex-1">{region.label}</span>
                {!isUnlocked && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-red-500/20 rounded border border-red-500/30 relative">
                    <div className="absolute left-0 top-0 h-full w-1 bg-red-500" />
                    <span className="text-sm">🔒</span>
                    <span className="font-mono text-[8px] text-red-300 uppercase">Kilitli</span>
                    {(() => {
                      const district = ALL_DISTRICTS.find(d => d.id === region.id);
                      if (district && credits >= district.cost) {
                        return (
                          <>
                            <button
                              onClick={() => {
                                onDistrictUnlock(district.id, district.bonusStat, district.bonusValue, district.cost);
                              }}
                              className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center bg-red-500/20 hover:bg-red-500/30 rounded border border-red-500/40 text-red-300 text-[9px] font-mono"
                            >
                              +
                            </button>
                            <div className="absolute left-4 top-[calc(100%+2px)] text-[8px] text-red-300 font-mono whitespace-nowrap">
                              {district.cost}₿
                            </div>
                          </>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>

              {/* 2×2 Grid Layout */}
              <div className="grid grid-cols-2 gap-3">
                {gridsForRegion.map(grid => {
                  const gridCrops = crops.filter(c => c.regionId === region.id && c.gridIndex === grid.gridIndex);
                  const used = gridCrops.length;
                  const singleType = gridCrops.length > 0
                    ? (gridCrops.every(c => c.name === gridCrops[0].name) ? gridCrops[0].name : null)
                    : null;
                  const cropInfo = singleType ? findCropInfo(singleType) : null;

                  const growing = gridCrops.filter(c => !c.isHarvestable);
                  const readyCrops = gridCrops.filter(c => c.isHarvestable);
                  const readyCount = readyCrops.length;
                  const avgPct = growing.length > 0
                    ? Math.round(growing.reduce((s, c) => s + getGrowthPercent(c), 0) / growing.length)
                    : (gridCrops.length > 0 ? 100 : 0);
                  const minRemaining = growing.length > 0
                    ? Math.min(...growing.map(c => {
                        const info = findCropInfo(c.name);
                        const base = info ? c.baseGrowthTime : 30;
                        const fertilizeMod = c.fertilized ? 1.01 : 1.0;
                        const mod = cropGrowthModifier * (1 / energyLevel.multiplier) * (radiationLevel > 70 ? 0.5 : radiationLevel > 40 ? 0.8 : 1.2) * fertilizeMod;
                        return Math.max(0, Math.ceil(base / mod - (Date.now() - c.timePlanted) / 1000));
                      }))
                    : 0;

                  return (
                    <div key={grid.id} onClick={() => {
                          if (!isUnlocked) return;
                          const initialCrop = singleType
                            ? availableCrops.find(c => c.name === singleType) ?? availableCrops[0]
                            : availableCrops[0];
                          setPlantModal({ regionId: region.id, gridIndex: grid.gridIndex }); setPlantQty(1); setHoveredCrop(initialCrop);
                        }}
                        className={`relative overflow-hidden min-h-[160px] rounded-xl transition-all ${isUnlocked ? 'cursor-pointer active:scale-[0.98] hover:shadow-[0_8px_32px_rgba(0,243,255,0.2)]' : 'cursor-not-allowed opacity-50'} shadow-[0_4px_20px_rgba(0,0,0,0.6)] border border-[#00f3ff]/20`}>
                      {/* Arkaplan resmi */}
                      <img src="/images/backgrounds/tarım.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-b from-[#0e0e0f]/20 via-[#0e0e0f]/40 to-[#0e0e0f]/60" />

                      {/* Kilit overlay - kapalı bölgeler için */}
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20 rounded-xl backdrop-blur-sm">
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl">🔒</span>
                            <span className="font-mono text-[9px] text-red-300 uppercase">Kilitli</span>
                          </div>
                        </div>
                      )}

                      {/* Full background reveal image when crops exist */}
                      {cropInfo && (
                        <>
                          <img src={cropInfo.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15 saturate-[0.3] scale-110" />
                          {avgPct > 0 && (
                            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - avgPct}% 0 0)` }}>
                              <img src={cropInfo.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 saturate-100 scale-110" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0f] via-[#0e0e0f]/70 to-[#0e0e0f]/30" />
                          {readyCount > 0 && (
                            <div className="absolute inset-0 bg-green-500/10 animate-pulse" />
                          )}
                        </>
                      )}
                      <div className="scanline-overlay z-0" />

                      {/* Header - Grid Numarası ve Kapasite */}
                      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/40 to-transparent px-3 py-2 flex justify-between items-center z-10 border-b border-[#00f3ff]/10">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-[#00f3ff] font-bold uppercase tracking-wider">Grid {grid.gridIndex + 1}</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-[#0e0e0f]/60 rounded border border-[#00f3ff]/30 backdrop-blur-sm">
                          <span className="font-mono text-[9px] text-[#00f3ff] font-bold">{used}</span>
                          <span className="font-mono text-[8px] text-[#849495]">/ 4</span>
                        </div>
                      </div>

                      {/* Center countdown when growing */}
                      {gridCrops.length > 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 py-1">
                          {readyCount === gridCrops.length ? (
                            <button onClick={(e) => {
                              e.stopPropagation();
                              const outputs = readyCrops.map(c => {
                                const info = findCropInfo(c.name);
                                return info?.outputResource || 'Raw Lettuce';
                              });
                              onBatchHarvest(outputs);
                              setCrops(prev => prev.filter(c => !(c.isHarvestable && gridCrops.includes(c))));
                            }}
                              className="px-4 py-2 font-mono text-[10px] text-green-300 font-bold uppercase tracking-wider cursor-pointer hover:text-white active:scale-95 transition-all z-10 bg-green-600/30 rounded-lg border border-green-500/50 shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:bg-green-600/40 animate-pulse">
                              ✓ HASAT ({readyCount}/{gridCrops.length})
                            </button>
                          ) : readyCount > 0 ? (
                            <button onClick={(e) => {
                              e.stopPropagation();
                              const outputs = readyCrops.map(c => {
                                const info = findCropInfo(c.name);
                                return info?.outputResource || 'Raw Lettuce';
                              });
                              onBatchHarvest(outputs);
                              setCrops(prev => prev.filter(c => !(c.isHarvestable && readyCrops.includes(c))));
                            }}
                              className="px-4 py-2 font-mono text-[10px] text-yellow-300 font-bold uppercase tracking-wider cursor-pointer hover:text-white active:scale-95 transition-all z-10 bg-yellow-600/30 rounded-lg border border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:bg-yellow-600/40">
                              ⚠ HASAT ({readyCount}/{gridCrops.length})
                            </button>
                          ) : minRemaining > 0 ? (
                            <>
                              <span className="font-mono text-[20px] text-[#00f3ff] font-bold drop-shadow-[0_0_12px_rgba(0,243,255,0.5)]">{minRemaining}</span>
                              <span className="font-mono text-[8px] text-[#849495] uppercase tracking-widest">saniye</span>
                            </>
                          ) : null}
                        </div>
                      )}

                      {/* Crop list with individual timers */}
                      {gridCrops.length > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-1 z-10 max-h-[80px] overflow-y-auto p-2 bg-gradient-to-t from-[#0e0e0f] to-transparent">
                          {(() => {
                            const grouped: Record<string, Crop[]> = {};
                            gridCrops.forEach(c => {
                              if (!grouped[c.name]) grouped[c.name] = [];
                              grouped[c.name].push(c);
                            });
                            return Object.entries(grouped).map(([name, crops]) => {
                              const readyInGroup = crops.filter(c => c.isHarvestable).length;
                              const growingInGroup = crops.filter(c => !c.isHarvestable);
                              const minRemainingInGroup = growingInGroup.length > 0
                                ? Math.min(...growingInGroup.map(c => {
                                    const info = findCropInfo(c.name);
                                    const base = info ? c.baseGrowthTime : 30;
                                    const fertilizeMod = c.fertilized ? 1.01 : 1.0;
                                    const mod = cropGrowthModifier * (1 / energyLevel.multiplier) * (radiationLevel > 70 ? 0.5 : radiationLevel > 40 ? 0.8 : 1.2) * fertilizeMod;
                                    return Math.max(0, Math.ceil(base / mod - (Date.now() - c.timePlanted) / 1000));
                                  }))
                                : 0;
                              const hasFertilized = crops.some(c => c.fertilized);
                              return (
                                <div key={name} className="flex items-center justify-between gap-1 bg-[#0e0e0f]/60 rounded px-2 py-1 border border-[#00f3ff]/20 backdrop-blur-sm">
                                  <span className="font-mono text-[7px] text-[#00f3ff] truncate flex-1 font-semibold">
                                    {crops.length}× {tcrop(name)}
                                    {hasFertilized && <span className="text-emerald-400 ml-1">🧪</span>}
                                  </span>
                                  {readyInGroup > 0 && (
                                    <span className="font-mono text-[7px] text-green-400 font-bold">✓{readyInGroup}</span>
                                  )}
                                  {minRemainingInGroup > 0 && (
                                    <span className="font-mono text-[7px] text-[#00f3ff] font-bold">{minRemainingInGroup}s</span>
                                  )}
                                </div>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
                  <h3 className="font-sans text-base font-bold text-white uppercase tracking-wider">{REGION_NAMES.find(r => r.id === plantModal.regionId)?.label || plantModal.regionId} — {t('farm.plant')}</h3>
                </div>
                <button onClick={() => { setPlantModal(null); setUseFertilizer(false); }} className="p-1 text-white/60 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer">
                  KAPAT
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {/* Adet seçici - grid kapasitesine göre */}
                <div className="flex items-center justify-between bg-[#0e0e0f]/60 rounded-lg p-2">
                  <span className="font-mono text-[10px] text-[#b9cacb] uppercase">Adet</span>
                  <div className="flex gap-2">
                    {(() => {
                      const gridCrops = crops.filter(c => c.regionId === plantModal.regionId && c.gridIndex === plantModal.gridIndex);
                      const gridCount = gridCrops.length;
                      return [1, 2, 3, 4, 5, 10].filter(n => n <= (gridCapacity - gridCount)).map(n => (
                        <button key={n} onClick={() => setPlantQty(n)}
                          className={`w-8 py-1 text-[11px] font-mono font-bold rounded transition-all cursor-pointer ${
                            plantQty === n ? 'bg-[#00f3ff] text-neutral-950' : 'bg-neutral-900 border border-white/10 text-[#849495]'
                          }`}>{n}</button>
                      ));
                    })()}
                  </div>
                </div>

                {/* Gübre toggle */}
                <div className="flex items-center justify-between bg-[#0e0e0f]/60 rounded-lg p-2 border border-[#00f3ff]/10">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px]">🧪</span>
                    <span className="font-mono text-[10px] text-[#b9cacb] uppercase">Gübre Kullan</span>
                    <span className="font-mono text-[9px] text-[#00f3ff] font-bold">{fertilizer} adet</span>
                  </div>
                  <button
                    onClick={() => setUseFertilizer(!useFertilizer)}
                    disabled={fertilizer <= 0}
                    className={`px-3 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer active:scale-95 ${
                      useFertilizer
                        ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : fertilizer > 0
                          ? 'bg-[#0e0e0f] border border-[#00f3ff]/30 text-[#00f3ff] hover:border-[#00f3ff]/60'
                          : 'bg-neutral-900 border border-white/10 text-[#3a494b] cursor-not-allowed'
                    }`}
                  >
                    {useFertilizer ? 'Aktif' : fertilizer > 0 ? 'Kullan' : 'Yok'}
                  </button>
                </div>
                {useFertilizer && (
                  <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-lg px-3 py-2">
                    <span className="font-mono text-[9px] text-emerald-300">
                      🌱 Her bitkiye 1 gübre uygulanır → Büyüme süresi %1 hızlanır
                      {fertilizer >= plantQty
                        ? ` (${plantQty} gübre kullanılacak)`
                        : ` (${fertilizer}/${plantQty} gübre mevcut)`}
                    </span>
                  </div>
                )}

                {/* Ürün grid - sadece grid ile uyumlu ürünler */}
                {(() => {
                  const gridCrops = crops.filter(c => c.regionId === plantModal.regionId && c.gridIndex === plantModal.gridIndex);
                  const existingTypeInGrid = gridCrops.length > 0 && gridCrops.every(c => c.name === gridCrops[0].name) ? gridCrops[0].name : null;
                  const eligibleCrops = existingTypeInGrid
                    ? availableCrops.filter(c => c.name === existingTypeInGrid)
                    : availableCrops;
                  return (
                    <div className="grid grid-cols-5 gap-2">
                      {eligibleCrops.map((crop) => {
                        const totalWater = crop.waterRequired * plantQty;
                        const totalEnergy = crop.energyRequired * plantQty;
                        const canAfford = currentWater >= totalWater && currentEnergy >= totalEnergy;
                        return (
                          <button key={crop.id} onClick={() => setHoveredCrop(crop)}
                            className={`aspect-square rounded-lg overflow-hidden border transition-all ${
                              hoveredCrop?.id === crop.id ? 'ring-1 ring-[#00f3ff] border-[#00f3ff]' : 'border-white/5'
                            } ${!canAfford ? 'opacity-50' : ''}`}>
                            <img src={crop.image} alt="" className="w-full h-full object-cover" />
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
                    <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] font-mono">
                      <div className="bg-[#0e0e0f]/60 rounded-xl p-2.5">
                        <div className="text-[#b9cacb] uppercase tracking-wider mb-2 text-[9px]">Ekim İhtiyacı</div>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Droplet className="w-3 h-3 text-blue-400" />
                              <span className="text-[#849495]">Su</span>
                            </div>
                            <span className={`font-mono font-bold ${currentWater >= hoveredCrop.waterRequired * plantQty ? 'text-white' : 'text-red-400'}`}>
                              {hoveredCrop.waterRequired * plantQty} ({Math.floor(currentWater)})
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Zap className="w-3 h-3 text-yellow-500" />
                              <span className="text-[#849495]">Enerji</span>
                            </div>
                            <span className={`font-mono font-bold ${currentEnergy >= hoveredCrop.energyRequired * plantQty ? 'text-white' : 'text-red-400'}`}>
                              {hoveredCrop.energyRequired * plantQty} ({Math.floor(currentEnergy)})
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#0e0e0f]/60 rounded-xl p-2.5">
                        <div className="text-[#b9cacb] uppercase tracking-wider mb-2 text-[9px]">Saniyelik Büyüme İhtiyacı</div>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Droplet className="w-3 h-3 text-blue-400" />
                              <span className="text-[#849495]">Su</span>
                            </div>
                            <span className="font-mono font-bold text-blue-300">{(hoveredCrop.waterPerSecond * plantQty).toFixed(1)}/s</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Zap className="w-3 h-3 text-yellow-500" />
                              <span className="text-[#849495]">Enerji</span>
                            </div>
                            <span className="font-mono font-bold text-yellow-400">{(hoveredCrop.baseEnergyDraw * plantQty).toFixed(1)}/s</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#849495]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-yellow-400" />
                        <span>Süre: <strong className="text-white">{hoveredCrop.baseGrowthTime}s</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Box className="w-3 h-3 text-emerald-400" />
                        <span>Çıktı: <strong className="text-white">{tcrop(hoveredCrop.outputResource)}</strong></span>
                      </div>
                    </div>
                    <button onClick={() => plantCrop(availableCrops.indexOf(hoveredCrop))}
                      disabled={currentWater < hoveredCrop.waterRequired * plantQty || currentEnergy < hoveredCrop.energyRequired * plantQty}
                      className={`w-full py-2.5 mt-2 rounded font-mono font-bold uppercase text-xs cursor-pointer active:scale-95 transition-all ${
                        currentWater >= hoveredCrop.waterRequired * plantQty && currentEnergy >= hoveredCrop.energyRequired * plantQty
                          ? 'bg-[#00f3ff] text-neutral-950'
                          : 'bg-neutral-800 text-white/40 cursor-not-allowed'
                      }`}>
                      {plantQty} ADET EK {useFertilizer && fertilizer > 0 ? `+ ${Math.min(plantQty, fertilizer)} GÜBRE` : ''}
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
