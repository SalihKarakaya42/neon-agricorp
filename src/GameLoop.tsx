import { useState, useEffect, useRef } from 'react';
import { Coins, Droplet, Zap, Star, Radiation, Clock, Package } from 'lucide-react';
import WaterSystem from './WaterSystem';
import EnergySystem from './EnergySystem';
import FarmSystem from './FarmSystem';
import FactorySystem from './FactorySystem';
import ResearchSystem from './ResearchSystem';
import EventSystem from './EventSystem';
import PrestigeSystem from './PrestigeSystem';
import MarketSystem from './MarketSystem';
import ContractSystem from './ContractSystem';
import type { ContractState } from './ContractSystem';
import DistrictSystem from './DistrictSystem';
import Layout from './Layout';
import { supabase } from './supabaseClient';
import { useLanguage } from './i18n';
import { syncWithFallback } from './syncService';

interface ResearchState {
  techs: { id: string; level: number; isResearched: boolean }[];
  timers: { [key: string]: number };
}

interface GameLoopProps {
    userId: string;
    username: string;
    avatarId: string;
}

interface LocalSave {
  water: number; energy: number; credits: number; inventory: Record<string, number>;
  pumpPower: number; baseEnergyProduction: number; cropGrowthModifier: number; waterEfficiency: number;
  maxWaterCapacity: number; maxEnergyCapacity: number;
  unlockedT3Factories: number; tier4Unlocked: number; unlockedPrestige: number;
  podCapacity: number; researchState: ResearchState; contractState: ContractState; exp: number; level: number; fertilizer: number; radiationLevel: number;
  savedAt: string;
}

const GameLoop: React.FC<GameLoopProps> = ({ userId, username, avatarId }) => {
  const { t } = useLanguage();
  const INITIAL_WATER = 100;
  const INITIAL_ENERGY = 100;
  const INITIAL_CREDITS = 1000;
  const INITIAL_CAPACITY = 1000;
  const INITIAL_WATER_CAPACITY = 500;
  const INITIAL_PRODUCTION = 15;

  const LS_KEY = 'neon_game_state';

  const loadFromStorage = (): LocalSave | null => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw) as LocalSave;
    } catch {}
    return null;
  };

  const saveToStorage = () => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        water, energy, credits, inventory,
        pumpPower, baseEnergyProduction, cropGrowthModifier, waterEfficiency,
        maxWaterCapacity, maxEnergyCapacity,
        unlockedT3Factories, tier4Unlocked, unlockedPrestige,
        podCapacity, researchState, contractState, exp, level, fertilizer, radiationLevel,
        savedAt: new Date().toISOString(),
      } as LocalSave));
    } catch {}
  };

  const saved = loadFromStorage();

  const [water, setWater] = useState(saved?.water ?? INITIAL_WATER);
  const [energy, setEnergy] = useState(saved?.energy ?? INITIAL_ENERGY);
  const [credits, setCredits] = useState(saved?.credits ?? INITIAL_CREDITS);
  const [inventory, setInventory] = useState<Record<string, number>>(saved?.inventory ?? {});
  
  const [pumpPower, setPumpPower] = useState(saved?.pumpPower ?? 10);
  const [baseEnergyProduction, setBaseEnergyProduction] = useState(saved?.baseEnergyProduction ?? INITIAL_PRODUCTION);
  const [cropGrowthModifier, setCropGrowthModifier] = useState(saved?.cropGrowthModifier ?? 1.0);
  const [waterEfficiency, setWaterEfficiency] = useState(saved?.waterEfficiency ?? 1.0);
  const [maxWaterCapacity, setMaxWaterCapacity] = useState(saved?.maxWaterCapacity ?? INITIAL_WATER_CAPACITY);
  const [maxEnergyCapacity, setMaxEnergyCapacity] = useState(saved?.maxEnergyCapacity ?? INITIAL_CAPACITY);
  const [unlockedT3Factories, setUnlockedT3Factories] = useState(saved?.unlockedT3Factories ?? 0);
  const [tier4Unlocked, setTier4Unlocked] = useState(saved?.tier4Unlocked ?? 0);
  const [unlockedPrestige, setUnlockedPrestige] = useState(saved?.unlockedPrestige ?? 0);
  const [_prestigeBonusMultiplier, setPrestigeBonusMultiplier] = useState(1.0);
  const [radiationLevel, setRadiationLevel] = useState(saved?.radiationLevel ?? 20);
  const [fertilizer, setFertilizer] = useState(saved?.fertilizer ?? 0);
  const [podCapacity, setPodCapacity] = useState(saved?.podCapacity ?? 4);

  const [researchState, setResearchState] = useState<ResearchState>(
    saved?.researchState ?? { techs: [], timers: {} }
  );

  const [contractState, setContractState] = useState<ContractState>(
    saved?.contractState ?? { active: null, completedCount: 0, expiresAt: null }
  );

  const [exp, setExp] = useState(saved?.exp ?? 0);
  const [level, setLevel] = useState(saved?.level ?? 1);
  const expRef = useRef(exp);
  expRef.current = exp;
  const levelRef = useRef(level);
  levelRef.current = level;
  const [showExpPopup, setShowExpPopup] = useState(false);
  const expPopupRef = useRef<HTMLDivElement>(null);
  const lvlBtnRef = useRef<HTMLButtonElement>(null);
  const [showDepoPopup, setShowDepoPopup] = useState(false);
  const depoPopupRef = useRef<HTMLDivElement>(null);
  const depoBtnRef = useRef<HTMLButtonElement>(null);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'alert' | 'info' } | null>(null);
  const notify = (text: string, type: 'success' | 'alert' | 'info' = 'info') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const expForLevel = (lvl: number) => Math.floor(80 + lvl * 8 + Math.pow(lvl, 0.65) * 12);
  const expForNextLevel = expForLevel(level);

  const gainExp = (amount: number) => {
    let currentExp = expRef.current;
    let currentLevel = levelRef.current;
    currentExp = Math.max(0, currentExp + amount);
    const maxLevel = 500;
    while (currentLevel < maxLevel && currentExp >= expForLevel(currentLevel)) {
      currentExp -= expForLevel(currentLevel);
      currentLevel += 1;
    }
    expRef.current = currentExp;
    levelRef.current = currentLevel;
    if (currentLevel !== level) setLevel(currentLevel);
    if (currentExp !== exp) setExp(currentExp);
  };

  const [farmEnergyDraw, setFarmEnergyDraw] = useState(0);
  const [farmWaterDraw, setFarmWaterDraw] = useState(0);
  const [factoryEnergyDraw, setFactoryEnergyDraw] = useState(0);
  const [eventEnergyDraw, setEventEnergyDraw] = useState(0);
  const [eventWaterDraw, setEventWaterDraw] = useState(0);
  
  const saveGameState = async () => {
    if (!userId) return;
    let factoryJobs = [];
    try {
      const saved = localStorage.getItem('neon_factory_jobs');
      if (saved) factoryJobs = JSON.parse(saved);
    } catch (e) {}
    const { error } = await supabase
      .from('player_data')
      .upsert([
        { 
          id: userId, 
          water, energy, credits, inventory,
          pump_power: pumpPower, 
          base_energy_production: baseEnergyProduction,
          crop_growth_modifier: cropGrowthModifier,
          water_efficiency: waterEfficiency,
          max_water_capacity: maxWaterCapacity,
          max_energy_capacity: maxEnergyCapacity,
          unlocked_t3_factories: unlockedT3Factories,
          unlocked_prestige: unlockedPrestige,
          pod_capacity: podCapacity,
          tier4_unlocked: tier4Unlocked,
          research_state: researchState,
          factory_jobs: factoryJobs,
          last_saved: new Date().toISOString() 
        },
      ]);
    if (error) console.error('Error saving game state:', error);
  };

  const loadGameState = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('player_data')
      .select('water, energy, credits, inventory, pump_power, base_energy_production, crop_growth_modifier, water_efficiency, max_water_capacity, max_energy_capacity, unlocked_t3_factories, unlocked_prestige, research_state, pod_capacity, tier4_unlocked, factory_jobs, last_saved')
      .eq('id', userId)
      .single();
    if (error) console.error('Error loading game state:', error);
    else if (data) {
      // Only apply Supabase data if it's newer than localStorage (or no local save)
      const localSaved = loadFromStorage();
      if (localSaved && data.last_saved && new Date(data.last_saved) <= new Date(localSaved.savedAt)) {
        return; // localStorage is newer, keep it
      }
      setWater(Number(data.water) || INITIAL_WATER);
      setEnergy(Number(data.energy) || INITIAL_ENERGY);
      setCredits(Number(data.credits) || INITIAL_CREDITS);
      setInventory(typeof data.inventory === 'string' ? JSON.parse(data.inventory) : (data.inventory || {}));
      setPumpPower(data.pump_power || 10);
      setBaseEnergyProduction(data.base_energy_production || INITIAL_PRODUCTION);
      setCropGrowthModifier(data.crop_growth_modifier || 1.0);
      setWaterEfficiency(data.water_efficiency || 1.0);
      setMaxWaterCapacity(data.max_water_capacity || INITIAL_WATER_CAPACITY);
      setMaxEnergyCapacity(data.max_energy_capacity || INITIAL_CAPACITY);
      setUnlockedT3Factories(data.unlocked_t3_factories || 0);
      setUnlockedPrestige(data.unlocked_prestige || 0);
      setPodCapacity(data.pod_capacity || 4);
      setTier4Unlocked((data as any).tier4_unlocked || 0);

      if ((data as any).factory_jobs) {
        localStorage.setItem('neon_factory_jobs', JSON.stringify((data as any).factory_jobs));
      }
      
      if (data.research_state) {
        try {
          const parsed = typeof data.research_state === 'string' 
            ? JSON.parse(data.research_state) 
            : data.research_state;
          setResearchState(parsed);
        } catch (e) {
          console.error("Failed to parse research state from DB", e);
        }
      }
      
      setPrestigeBonusMultiplier(1.0 + (data.unlocked_prestige || 0) * 0.1);
    }
  };

  useEffect(() => {
    loadGameState();
  }, [userId]);

  // Save to localStorage on every state change
  useEffect(() => {
    saveToStorage();
  }, [water, energy, credits, inventory, pumpPower, baseEnergyProduction, cropGrowthModifier, waterEfficiency, maxWaterCapacity, maxEnergyCapacity, unlockedT3Factories, tier4Unlocked, unlockedPrestige, podCapacity, researchState, contractState, exp, level, fertilizer, radiationLevel]);

  // Save to Supabase every 60s
  useEffect(() => {
    const saveInterval = setInterval(saveGameState, 60000);
    return () => {
      clearInterval(saveInterval);
      saveGameState();
    };
  }, [water, energy, credits, inventory, pumpPower, baseEnergyProduction, cropGrowthModifier, waterEfficiency, maxWaterCapacity, maxEnergyCapacity, unlockedT3Factories, tier4Unlocked, unlockedPrestige, researchState, userId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRadiationLevel(prev => {
        const drift = (Math.random() - 0.5) * 4;
        return Math.max(0, Math.min(100, prev + drift));
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleWaterChange = (newWater: number) => setWater(newWater);
  const handleEnergyChange = (newEnergy: number) => setEnergy(newEnergy);
  const handleCreditsChange = (newCredits: number) => setCredits(newCredits);
  const handleInventoryChange = (newInventory: Record<string, number>) => setInventory(newInventory);
  const handleFarmEnergyReport = (draw: number) => setFarmEnergyDraw(draw);
  const handleFarmWaterReport = (draw: number) => setFarmWaterDraw(draw);
  const handleFactoryEnergyReport = (draw: number) => setFactoryEnergyDraw(draw);
  

  const handleStatBoost = (statName: string, boostValue: number) => {
    gainExp(25 * level);
    switch (statName) {
      case 'pumpPower':
        setPumpPower(prev => prev + boostValue);
        break;
      case 'baseEnergyProduction':
        setBaseEnergyProduction(prev => prev + boostValue);
        break;
      case 'farmCropGrowthSpeed':
        setCropGrowthModifier(prev => prev + boostValue);
        break;
      case 'waterEfficiency':
        setWaterEfficiency(prev => prev + boostValue);
        break;
      case 'maxEnergyCapacity':
        setMaxEnergyCapacity(prev => prev + boostValue);
        break;
      case 'unlockedT3Factories':
        setUnlockedT3Factories(prev => prev + boostValue);
        break;
      case 'unlockedPrestige':
        setUnlockedPrestige(prev => prev + boostValue);
        break;
      case 'podCapacity':
        setPodCapacity(prev => prev + boostValue);
        break;
      case 'maxWaterCapacity':
        setMaxWaterCapacity(prev => prev + boostValue);
        break;
      case 'tier4CropUnlock':
        setTier4Unlocked(prev => prev + boostValue);
        break;
      default:
        console.warn(`Unknown stat boost: ${statName}`);
    }
  };

  const handleResearchStateUpdate = (newState: ResearchState) => {
    setResearchState(newState);
  };

  const handleContractUpdate = (newState: ContractState) => {
    setContractState(newState);
  };
  
  const handleSell = (resource: string, amount: number, totalPrice: number) => {
    const newInv = { ...inventory };
    newInv[resource] = (newInv[resource] || 0) - amount;
    if (newInv[resource] <= 0) delete newInv[resource];
    setInventory(newInv);
    setCredits(prev => prev + totalPrice);
    gainExp(Math.round(totalPrice * 0.1));
  };

  const handlePrestigeReset = () => {
      setWater(Math.min(INITIAL_WATER, maxWaterCapacity));
      setEnergy(INITIAL_ENERGY);
      setInventory({});
      setFarmEnergyDraw(0);
      setFarmWaterDraw(0);
      setFactoryEnergyDraw(0);
      setEventEnergyDraw(0);
      setEventWaterDraw(0);
      
      setResearchState(prev => ({
          ...prev,
          timers: {}
      }));
      
      setEnergy(Math.min(INITIAL_ENERGY, maxEnergyCapacity)); 
  };

  const handleDistrictUnlock = (_districtId: string, stat: string, value: number, cost: number) => {
    setCredits(prev => prev - cost);
    if (stat === 'waterEfficiency') setWaterEfficiency(prev => prev + value);
    else if (stat === 'baseEnergyProduction') setBaseEnergyProduction(prev => prev + value);
  };

  const handlePermanentStatBoost = (statName: string, boostValue: number) => {
      if (statName === 'baseEnergyProduction') {
      }
      handleStatBoost(statName, boostValue);
  };

  const handleBatchHarvest = (outputResources: string[]) => {
    const count = outputResources.length;

    setInventory(prev => {
      const next = { ...prev };
      outputResources.forEach(r => { next[r] = (next[r] || 0) + 1; });
      return next;
    });
    gainExp(10 * count);

    syncWithFallback('harvest', { userId, outputResources },
      () => {},
      () => { console.warn('Harvest server sync failed, local state kept.'); }
    );
  };
  
  

  const totalEnergyConsumption = farmEnergyDraw + factoryEnergyDraw + eventEnergyDraw;
  const totalWaterConsumption = farmWaterDraw + eventWaterDraw;
  
  const energyThreshold = maxEnergyCapacity * 0.1;
  const isEnergyCritical = energy < energyThreshold;

  const xpPercent = Math.min(100, Math.floor((exp / expForNextLevel) * 100));
  const tname = (key: string) => t(`crops.${key}`) || key;

  const waterPerSec = pumpPower * waterEfficiency - 2 - totalWaterConsumption;
  const energyPerSec = baseEnergyProduction - totalEnergyConsumption;

  // Outside click handler for popups
  useEffect(() => {
    if (!showExpPopup && !showDepoPopup) return;
    const handleClick = (e: MouseEvent) => {
      if (
        showExpPopup &&
        expPopupRef.current && !expPopupRef.current.contains(e.target as Node) &&
        lvlBtnRef.current && !lvlBtnRef.current.contains(e.target as Node)
      ) setShowExpPopup(false);
      if (
        showDepoPopup &&
        depoPopupRef.current && !depoPopupRef.current.contains(e.target as Node) &&
        depoBtnRef.current && !depoBtnRef.current.contains(e.target as Node)
      ) setShowDepoPopup(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showExpPopup, showDepoPopup]);

  const radColor = radiationLevel > 70 ? 'text-red-400' : radiationLevel > 40 ? 'text-orange-400' : 'text-green-400';

  const topBar = (
    <header className="fixed top-0 left-0 w-full z-40 bg-[#0e0e0f]/95 backdrop-blur-xl border-b border-[#3a494b]/20 shadow-[0_4px_30px_rgba(0,0,0,0.8)] flex flex-col transition-all">
      {/* Row 1: Profile + Level */}
      <div className="flex justify-between items-center px-4 h-10 border-b border-[#3a494b]/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full overflow-hidden border border-[#00f3ff]/50 shadow-[0_0_6px_rgba(0,243,255,0.2)] flex-shrink-0">
            <img src={`/images/avatars/avatar-${avatarId}.svg`} alt="" className="w-full h-full object-cover" />
          </div>
          <span className="font-mono text-[10px] text-white font-bold tracking-wider max-w-[80px] truncate">
            {username}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
        </div>

        <button ref={lvlBtnRef} onClick={() => setShowExpPopup(prev => !prev)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer active:scale-95">
          <Star className="w-3.5 h-3.5 text-[#00f3ff]" />
          <span className="font-mono text-[11px] text-white font-bold tracking-wider">LVL {level}</span>
        </button>
      </div>

      {/* Row 2: Resources + Depo (inventory) */}
      <div className="flex items-center gap-2 px-4 py-1.5 overflow-x-auto no-scrollbar" style={{ scrollbarWidth: 'none' }}>
        <div className="flex items-center gap-1.5 bg-[#1c1b1c]/60 px-2.5 py-1 rounded-lg border border-white/5 flex-shrink-0">
          <Coins className="w-3.5 h-3.5 text-[#00f3ff]" style={{ filter: 'drop-shadow(0 0 3px rgba(0,243,255,0.3))' }} />
          <span className="font-mono text-[10px] text-white font-semibold">{credits.toLocaleString('tr-TR')}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#1c1b1c]/60 px-2.5 py-1 rounded-lg border border-white/5 flex-shrink-0">
          <Droplet className="w-3.5 h-3.5 text-blue-400" style={{ filter: 'drop-shadow(0 0 3px rgba(96,165,250,0.3))' }} />
          <span className="font-mono text-[10px] text-white font-semibold">{Math.floor(water)}</span>
          <span className={`font-mono text-[8px] ${waterPerSec >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {waterPerSec >= 0 ? '+' : ''}{waterPerSec.toFixed(1)}/s
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#1c1b1c]/60 px-2.5 py-1 rounded-lg border border-white/5 flex-shrink-0">
          <Zap className="w-3.5 h-3.5 text-yellow-500" style={{ filter: 'drop-shadow(0 0 3px rgba(234,179,8,0.3))' }} />
          <span className="font-mono text-[10px] text-white font-semibold">{Math.round((energy / maxEnergyCapacity) * 100)}%</span>
          <span className={`font-mono text-[8px] ${energyPerSec >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {energyPerSec >= 0 ? '+' : ''}{energyPerSec.toFixed(1)}/s
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#1c1b1c]/60 px-2.5 py-1 rounded-lg border border-white/5 flex-shrink-0">
          <Radiation className={`w-3.5 h-3.5 ${radiationLevel > 70 ? 'text-red-400 animate-pulse' : radColor}`} />
          <span className={`font-mono text-[10px] font-semibold ${radColor}`}>{Math.round(radiationLevel)}</span>
        </div>

        {/* Depo */}
        <button ref={depoBtnRef} onClick={() => setShowDepoPopup(prev => !prev)}
          className="flex items-center gap-1.5 bg-[#1c1b1c]/40 px-2.5 py-1 rounded-lg border border-white/5 flex-shrink-0 ml-auto cursor-pointer hover:bg-[#1c1b1c]/60 active:scale-95 transition-all">
          <Package className="w-3.5 h-3.5 text-[#00f3ff]" />
          <span className="font-mono text-[9px] text-[#00f3ff] uppercase tracking-wider font-semibold">Depo</span>
        </button>
      </div>

      {/* EXP Popup */}
      {showExpPopup && (
        <div ref={expPopupRef} className="absolute top-full right-4 mt-1 z-50 glass-panel rounded-xl p-3.5 w-56 border border-[#00f3ff]/20 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] text-[#00f3ff] font-bold tracking-wider uppercase">SEVİYE {level}</span>
            <Star className="w-4 h-4 text-[#00f3ff]" />
          </div>
          <div className="progress-bar-container mb-1.5">
            <div className="progress-bar-fill bg-gradient-to-r from-[#006b71] to-[#00f3ff]" style={{ width: `${xpPercent}%` }} />
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono text-[9px] text-[#b9cacb]">{Math.round(exp)} / {expForNextLevel} EXP</span>
            <span className="font-mono text-[9px] text-[#849495]">%{xpPercent}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-[#849495]" />
            <span className="font-mono text-[9px] text-[#849495]">Kazanç: <strong className="text-white">+10 EXP</strong>/hasat</span>
          </div>
        </div>
      )}

      {/* Depo Popup */}
      {showDepoPopup && (
        <div ref={depoPopupRef} className="absolute top-full right-4 mt-1 z-50 glass-panel rounded-xl p-3.5 w-56 max-h-72 overflow-y-auto border border-[#00f3ff]/20 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] text-[#00f3ff] font-bold uppercase tracking-wider">Depo</span>
            <span className="font-mono text-[8px] text-[#849495]">{Object.keys(inventory).length} ürün</span>
          </div>
          {Object.keys(inventory).length === 0 ? (
            <p className="font-mono text-[10px] text-[#849495] text-center py-4">Depo boş</p>
          ) : (
            (() => {
              const imgMap: Record<string, string> = {
                'Raw Lettuce': '/images/hydro-lettuce.png',
                'Raw Starch': '/images/rad-potato.png',
                'Raw Flour Base': '/images/synthetic-wheat.png',
                'Raw Paste': '/images/neon-tomato.png',
                'Glow Berry Batch': '/images/glow-berry.png',
                'Lumina Extract': '/images/bio-lumina-fruit.svg',
                'Nano Spores': '/images/nano-orchid.svg',
                'Void Essence': '/images/void-melon.svg',
              };
              return Object.entries(inventory).sort(([, a], [, b]) => b - a).map(([res, qty]) => (
                <div key={res} className="flex items-center gap-2.5 py-1.5 border-b border-white/5 last:border-0">
                  {imgMap[res] ? (
                    <img src={imgMap[res]} alt="" className="w-7 h-7 rounded object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded bg-[#0e0e0f] flex items-center justify-center text-[12px]">📦</div>
                  )}
                  <span className="font-mono text-[9px] text-white/80 flex-1 truncate">{tname(res)}</span>
                  <span className="font-mono text-[10px] text-white font-bold">{qty}</span>
                </div>
              ));
            })()
          )}
        </div>
      )}
    </header>
  );

  return (
    <>
      {/* Notification toast */}
      {notification && (
        <div className="fixed top-24 left-4 right-4 z-[100] flex justify-center pointer-events-none">
          <div className={`px-3 py-2 rounded-lg border flex items-center gap-2 max-w-sm shadow-xl ${
            notification.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200'
              : notification.type === 'alert'
              ? 'bg-red-950/95 border-red-500 text-red-200'
              : 'bg-neutral-900/95 border-[#00f3ff] text-slate-200'
          }`}>
            <span className="font-mono text-[10px]">{notification.text}</span>
          </div>
        </div>
      )}
      <Layout
      topBar={topBar}
      tabs={[
        {
          id: 'farm',
          icon: '🌾',
          label: t('tabs.farm'),
          content: (
            <>
              <div className="hidden">
                <WaterSystem 
                  currentWater={water} 
                  onWaterChange={handleWaterChange} 
                  totalConsumption={totalWaterConsumption}
                  pumpPower={pumpPower}
                  waterEfficiency={waterEfficiency}
                  maxWater={maxWaterCapacity}
                />
                <EnergySystem 
                  currentEnergy={energy} 
                  onEnergyChange={handleEnergyChange} 
                  totalConsumption={totalEnergyConsumption}
                  baseProduction={baseEnergyProduction}
                  maxEnergy={maxEnergyCapacity}
                />
              </div>
              <FarmSystem 
                currentWater={water} 
                currentEnergy={energy} 
                onWaterChange={handleWaterChange} 
                onEnergyChange={handleEnergyChange}
                onEnergyConsumptionReport={handleFarmEnergyReport}
                onWaterConsumptionReport={handleFarmWaterReport}
                cropGrowthModifier={cropGrowthModifier}
                isEnergyCritical={isEnergyCritical}
                onBatchHarvest={handleBatchHarvest}
                radiationLevel={radiationLevel}
                fertilizer={fertilizer}
                onFertilizerChange={setFertilizer}
                podCapacity={podCapacity}
                tier4Unlocked={tier4Unlocked}
                waterPerSec={waterPerSec}
                energyPerSec={energyPerSec}
                maxWater={maxWaterCapacity}
                maxEnergy={maxEnergyCapacity}
              />
            </>
          )
        },
        {
          id: 'factory',
          icon: '🏭',
          label: t('tabs.factory'),
          content: (
            <FactorySystem 
              currentWater={water} 
              currentEnergy={energy} 
              currentCredits={credits} 
              onWaterChange={handleWaterChange} 
              onEnergyChange={handleEnergyChange}
              onCreditsChange={handleCreditsChange}
              currentInventory={inventory}
              onInventoryChange={handleInventoryChange}
              onFactoryEnergyConsumptionReport={handleFactoryEnergyReport}
              isEnergyCritical={isEnergyCritical}
              userId={userId}
            />
          )
        },
        {
          id: 'research',
          icon: '🔬',
          label: t('tabs.research'),
          content: (
            <ResearchSystem 
              currentCredits={credits}
              onCreditsChange={handleCreditsChange}
              onStatBoost={handleStatBoost}
              researchState={researchState}
              onResearchStateUpdate={handleResearchStateUpdate}
            />
          )
        },
        {
          id: 'market',
          icon: '🏪',
          label: t('tabs.market'),
          content: (
            <MarketSystem 
              inventory={inventory}
              onSell={handleSell}
            />
          )
        },
        {
          id: 'contracts',
          icon: '📋',
          label: t('tabs.contracts'),
          content: (
            <ContractSystem
              userId={userId}
              inventory={inventory}
              contractState={contractState}
              onContractUpdate={handleContractUpdate}
              onCreditsChange={handleCreditsChange}
              onExpGain={gainExp}
              onNotification={notify}
            />
          )
        },
        {
          id: 'districts',
          icon: '🗺️',
          label: t('tabs.districts'),
          content: (
            <DistrictSystem 
              credits={credits}
              onDistrictUnlock={handleDistrictUnlock}
            />
          )
        },
        {
          id: 'system',
          icon: '⚙️',
          label: t('tabs.system'),
          content: (
            <>
              <div className="glass-panel rounded-xl p-4">
                <h4 className="font-mono text-[10px] text-[#849495] uppercase tracking-widest mb-2">{t('app.inventory')}:</h4>
                {Object.keys(inventory).length === 0 ? (
                  <p className="text-xs text-[#b9cacb]/60">{t('app.empty')}</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(inventory).map(([resource, amount]) => (
                      <div key={resource} className="font-mono text-[10px] text-[#b9cacb] bg-[#0e0e0f]/50 px-2 py-1 rounded border border-white/5">
                        {tname(resource)}: <strong className="text-white">{amount}</strong>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-2 text-[9px] font-mono text-[#849495]">
                  {t('app.boosts')}: {t('app.growth')}: x{cropGrowthModifier.toFixed(2)} | {t('app.waterEff')}: x{waterEfficiency.toFixed(2)} | {t('app.energyCap')}: +{maxEnergyCapacity - 1000} | {t('app.t3Factories')}: {unlockedT3Factories} | {t('app.prestigeLvl')}: {unlockedPrestige}
                </div>
              </div>
              <EventSystem 
                onEnergyDrawReport={setEventEnergyDraw}
                onWaterDrawReport={setEventWaterDraw}
                onCreditsChange={handleCreditsChange}
                isEnergyCritical={isEnergyCritical}
              />
              <PrestigeSystem 
                currentCredits={credits}
                onCreditsChange={handleCreditsChange}
                onResetGame={handlePrestigeReset}
                onPermanentStatBoost={handlePermanentStatBoost}
                unlockedPrestigeLevel={unlockedPrestige}
                researchState={researchState}
              />
            </>
          )
        }
      ]}
      defaultTab="farm"
    />
    </>);
};

export default GameLoop;
