import { useState, useEffect, useRef, useCallback } from 'react';
import WaterSystem from './WaterSystem';
import EnergySystem from './EnergySystem';
import FarmSystem from './FarmSystem';
import FactorySystem from './FactorySystem';
import ResearchSystem from './ResearchSystem';
import EventSystem from './EventSystem';
import PrestigeSystem from './PrestigeSystem';
import MarketSystem from './MarketSystem';
import type { ContractState } from './ContractSystem';
import DistrictSystem from './DistrictSystem';
import ResourceStatusDashboard from './ResourceStatusDashboard';
import EventNotification from './EventNotification';
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

const getRandomInterval = () => Math.floor(Math.random() * (600000 - 120000 + 1)) + 120000; // 2-10 dk

interface EventDef {
  name: string;
  desc: string;
  minDuration: number;
  maxDuration: number;
  startCreditPct: number;
  startEnergyPct: number;
  startWaterPct: number;
  inventoryPct: number;
  tickEnergyPct: number;
  tickWaterPct: number;
}

const possibleEvents: EventDef[] = [
  { name: 'Radiation Leak', desc: 'event.desc.radiation', minDuration: 10, maxDuration: 20, startCreditPct: 0, startEnergyPct: 0, startWaterPct: 0, inventoryPct: 0, tickEnergyPct: -0.05, tickWaterPct: -0.05 },
  { name: 'Pipe Burst', desc: 'event.desc.pipeburst', minDuration: 5, maxDuration: 10, startCreditPct: 0, startEnergyPct: 0, startWaterPct: -0.20, inventoryPct: 0, tickEnergyPct: 0, tickWaterPct: 0 },
  { name: 'Hacker Attack', desc: 'event.desc.hacker', minDuration: 15, maxDuration: 30, startCreditPct: -0.20, startEnergyPct: 0, startWaterPct: 0, inventoryPct: 0, tickEnergyPct: 0, tickWaterPct: 0 },
  { name: 'Warehouse Fire', desc: 'event.desc.fire', minDuration: 10, maxDuration: 15, startCreditPct: 0, startEnergyPct: 0, startWaterPct: 0, inventoryPct: -0.15, tickEnergyPct: 0, tickWaterPct: 0 },
  { name: 'Factory Overload', desc: 'event.desc.overload', minDuration: 10, maxDuration: 20, startCreditPct: 0, startEnergyPct: 0, startWaterPct: 0, inventoryPct: 0, tickEnergyPct: -0.08, tickWaterPct: 0 },
  { name: 'Workers Strike', desc: 'event.desc.strike', minDuration: 15, maxDuration: 25, startCreditPct: 0, startEnergyPct: 0, startWaterPct: 0, inventoryPct: 0, tickEnergyPct: 0, tickWaterPct: -0.05 },
  { name: 'Black Market Deal', desc: 'event.desc.blackmarket', minDuration: 5, maxDuration: 10, startCreditPct: 0.25, startEnergyPct: 0, startWaterPct: 0, inventoryPct: 0, tickEnergyPct: 0, tickWaterPct: 0 },
  { name: 'Condensation Surge', desc: 'event.desc.condensation', minDuration: 8, maxDuration: 15, startCreditPct: 0, startEnergyPct: 0, startWaterPct: 0, inventoryPct: 0, tickEnergyPct: 0, tickWaterPct: 0.08 },
  { name: 'Power Surge', desc: 'event.desc.powersurge', minDuration: 8, maxDuration: 15, startCreditPct: 0, startEnergyPct: 0, startWaterPct: 0, inventoryPct: 0, tickEnergyPct: 0.10, tickWaterPct: 0 },
  { name: 'Supply Drop', desc: 'event.desc.supplydrop', minDuration: 5, maxDuration: 10, startCreditPct: 0.15, startEnergyPct: 0, startWaterPct: 0, inventoryPct: 0, tickEnergyPct: 0, tickWaterPct: 0 },
];

const LS_KEY = 'neon_game_state';

interface LocalSave {
  water: number; energy: number; credits: number; inventory: Record<string, number>;
  pumpPower: number; baseEnergyProduction: number; cropGrowthModifier: number; waterEfficiency: number;
  maxWaterCapacity: number; maxEnergyCapacity: number;
  unlockedT3Factories: number; tier4Unlocked: number; unlockedPrestige: number;
  podCapacity: number; researchState: ResearchState; contractState: ContractState; exp: number; level: number; fertilizer: number; radiationLevel: number;
  unlockedDistricts: string[];
  savedAt: string;
}

const GameLoop: React.FC<GameLoopProps> = ({ userId }) => {
  const { t } = useLanguage();
  const INITIAL_WATER = 100;
  const INITIAL_ENERGY = 100;
  const INITIAL_CREDITS = 1000;
  const INITIAL_CAPACITY = 1000;
  const INITIAL_WATER_CAPACITY = 500;
  const INITIAL_PRODUCTION = 15;

  const loadFromStorage = (): LocalSave | null => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw) as LocalSave;
    } catch {}
    return null;
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
  const [_tier3Unlocked, setTier3Unlocked] = useState(0);
  const [unlockedPrestige, setUnlockedPrestige] = useState(saved?.unlockedPrestige ?? 0);
  const [_researchSpeed, setResearchSpeed] = useState(1.0);
  const [_rareDropChance, setRareDropChance] = useState(0);
  const [_blackMarketAccess, setBlackMarketAccess] = useState(0);
  const [radiationLevel, setRadiationLevel] = useState(saved?.radiationLevel ?? 20);
  const [fertilizer, setFertilizer] = useState(saved?.fertilizer ?? 0);
  const [regionCapacity, setRegionCapacity] = useState(saved?.podCapacity ?? 16);
  const [unlockedDistricts, setUnlockedDistricts] = useState<string[]>(saved?.unlockedDistricts ?? ['humid-cave']);

  const [farmEnergyDraw, setFarmEnergyDraw] = useState(0);
  const [farmWaterDraw, setFarmWaterDraw] = useState(0);
  const [factoryEnergyDraw, setFactoryEnergyDraw] = useState(0);
  const [eventEnergyDraw, setEventEnergyDraw] = useState(0);
  const [eventWaterDraw, setEventWaterDraw] = useState(0);

  const [researchState, setResearchState] = useState<ResearchState>(
    saved?.researchState ?? { techs: [], timers: {} }
  );

  const [contractState, setContractState] = useState<ContractState>(
    saved?.contractState ?? { active: null, completedCount: 0, expiresAt: null }
  );

  const [level, setLevel] = useState(saved?.level ?? 1);
  const [exp, setExp] = useState(saved?.exp ?? 0);
  const expRef = useRef(exp);
  const levelRef = useRef(level);
  levelRef.current = level;
  const [resourceDashboardOpen, setResourceDashboardOpen] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'alert' | 'info' } | null>(null);
  const [activeTab, setActiveTab] = useState('farm');
  const notify = (text: string, type: 'success' | 'alert' | 'info' = 'info') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const [eventNotification, setEventNotification] = useState<{ name: string; description: string; beneficial: boolean } | null>(null);

  const gainExp = (amount: number) => {
    let currentExp = expRef.current;
    let currentLevel = levelRef.current;
    currentExp = Math.max(0, currentExp + amount);
    const maxLevel = 500;
    while (currentLevel < maxLevel && currentExp >= (80 + currentLevel * 8 + Math.pow(currentLevel, 0.65) * 12)) {
      currentExp -= (80 + currentLevel * 8 + Math.pow(currentLevel, 0.65) * 12);
      currentLevel += 1;
    }
    expRef.current = currentExp;
    levelRef.current = currentLevel;
    if (currentLevel !== level) setLevel(currentLevel);
    if (currentExp !== exp) setExp(currentExp);
  };

  const totalEnergyConsumption = farmEnergyDraw + factoryEnergyDraw + eventEnergyDraw;
  const totalWaterConsumption = farmWaterDraw + eventWaterDraw;

  // ==================== ENVIRONMENTAL EVENT LOGIC ====================
  const [currentEvent, setCurrentEvent] = useState<{ name: string; desc: string; duration: number } | null>(null);
  const nextEventTime = useRef(Date.now() + getRandomInterval());

  const triggerEvent = useCallback(() => {
    const idx = Math.floor(Math.random() * possibleEvents.length);
    const def = possibleEvents[idx];
    const duration = Math.floor(Math.random() * (def.maxDuration - def.minDuration + 1)) + def.minDuration;
    setCurrentEvent({ name: def.name, desc: def.desc, duration });

    // Calculate percentage-based effects using current state
    const creditChange = Math.ceil(credits * def.startCreditPct);
    const energyDrop = Math.ceil(energy * def.startEnergyPct);
    const waterDrop = Math.ceil(water * def.startWaterPct);
    const tickEnergy = Math.ceil(maxEnergyCapacity * def.tickEnergyPct);
    const tickWater = Math.ceil(maxWaterCapacity * def.tickWaterPct);

    setEventEnergyDraw(-tickEnergy);
    setEventWaterDraw(-tickWater);
    if (energyDrop) setEnergy(prev => Math.max(0, prev + energyDrop));
    if (waterDrop) setWater(prev => Math.max(0, prev + waterDrop));
    if (creditChange) setCredits(prev => Math.max(0, prev + creditChange));
    if (def.inventoryPct && Object.keys(inventory).length > 0) {
      setInventory(prev => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          next[key] = Math.max(0, Math.round(next[key] * (1 + def.inventoryPct)));
          if (next[key] <= 0) delete next[key];
        }
        return next;
      });
    }
    nextEventTime.current = Date.now() + getRandomInterval();

    // Event notification
    const tdesc = (key: string) => t(key) || key;
    const beneficial = creditChange > 0 || tickWater > 0 || tickEnergy > 0;
    setEventNotification({ name: t(`events.${def.name}`) || def.name, description: tdesc(def.desc), beneficial });
  }, [energy, water, credits, inventory, maxEnergyCapacity, maxWaterCapacity, t]);

  const loadGameState = async () => {
    try {
      const { data, error } = await supabase
        .from('player_data')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) {
        if (error.code === 'PGRST116') {
          await saveGameState();
          return;
        }
        throw error;
      }
      if (!data) {
        await saveGameState();
        return;
      }
      setWater(Number(data.water));
      setEnergy(Number(data.energy));
      setCredits(Number(data.credits));
      setInventory(data.inventory ?? {});
      setPumpPower(Number(data.pump_power));
      setBaseEnergyProduction(Number(data.base_energy_production));
      setCropGrowthModifier(Number(data.crop_growth_modifier));
      setWaterEfficiency(Number(data.water_efficiency));
      setMaxWaterCapacity(Number(data.max_water_capacity));
      setMaxEnergyCapacity(Number(data.max_energy_capacity));
      setUnlockedT3Factories(Number(data.unlocked_t3_factories));
      setTier4Unlocked(Number(data.tier4_unlocked));
      setUnlockedPrestige(Number(data.unlocked_prestige));
      setRegionCapacity(Number(data.pod_capacity));
      if (data.research_state) setResearchState(data.research_state as ResearchState);
    } catch (e) {
      if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'PGRST116') return;
      console.warn('Failed to load game state from server, using local state.', e);
    }
  };

  const saveGameState = async () => {
    try {
      await supabase.from('player_data').upsert(
        {
          id: userId,
          water, energy, credits,
          inventory,
          pump_power: pumpPower,
          base_energy_production: baseEnergyProduction,
          crop_growth_modifier: cropGrowthModifier,
          water_efficiency: waterEfficiency,
          max_water_capacity: maxWaterCapacity,
          max_energy_capacity: maxEnergyCapacity,
          unlocked_t3_factories: unlockedT3Factories,
          tier4_unlocked: tier4Unlocked,
          unlocked_prestige: unlockedPrestige,
          pod_capacity: regionCapacity,
          research_state: researchState,
          last_saved: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    } catch (e) {
      if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'PGRST116') return;
      console.warn('Failed to save game state to server.', e);
    }
  };

  // Global tick – checks for new event & counts down active event duration
  useEffect(() => {
    const tick = setInterval(() => {
      // If an event is active, just count its remaining seconds
      if (currentEvent) {
        const nextDur = currentEvent.duration - 1;
        if (nextDur <= 0) {
          setCurrentEvent(null);
          setEventEnergyDraw(0);
          setEventWaterDraw(0);
        } else {
          setCurrentEvent(prev => prev ? { ...prev, duration: nextDur } : prev);
        }
      } else {
        // No active event – see if it's time for a new one
        if (Date.now() >= nextEventTime.current) {
          triggerEvent();
        }
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [currentEvent, triggerEvent]);

  // =================================================================

  useEffect(() => {
    loadGameState();
  }, [userId]);

  // Save to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        water, energy, credits, inventory,
        pumpPower, baseEnergyProduction, cropGrowthModifier, waterEfficiency,
        maxWaterCapacity, maxEnergyCapacity,
        unlockedT3Factories, tier4Unlocked, unlockedPrestige,
        podCapacity: regionCapacity, researchState, contractState, exp, level, fertilizer, radiationLevel,
        unlockedDistricts,
        savedAt: new Date().toISOString(),
      } as LocalSave));
    } catch {}
  }, [water, energy, credits, inventory, pumpPower, baseEnergyProduction, cropGrowthModifier, waterEfficiency, maxWaterCapacity, maxEnergyCapacity, unlockedT3Factories, tier4Unlocked, unlockedPrestige, regionCapacity, researchState, contractState, exp, level, fertilizer, radiationLevel, unlockedDistricts]);

  // Save to Supabase every 60s
  useEffect(() => {
    const saveInterval = setInterval(saveGameState, 60000);
    return () => {
      clearInterval(saveInterval);
      saveGameState();
    };
  }, []);

  // Report callbacks for farm / factory consumption
  const handleFarmEnergyReport = (draw: number) => setFarmEnergyDraw(draw);
  const handleFarmWaterReport = (draw: number) => setFarmWaterDraw(draw);
  const handleFactoryEnergyReport = (draw: number) => setFactoryEnergyDraw(draw);

  // ==== Tick: water & energy changes (unchanged) ====
  useEffect(() => {
    const interval = setInterval(() => {
      setWater(prev => {
        const netRate = pumpPower * waterEfficiency - 2 - totalWaterConsumption;
        const next = prev + netRate;
        return Math.max(0, Math.min(maxWaterCapacity, next));
      });
      setEnergy(prev => {
        const netRate = baseEnergyProduction - totalEnergyConsumption;
        const next = prev + netRate;
        return Math.max(0, Math.min(maxEnergyCapacity, next));
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pumpPower, waterEfficiency, totalWaterConsumption, maxWaterCapacity, baseEnergyProduction, totalEnergyConsumption, maxEnergyCapacity]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRadiationLevel(prev => {
        const drift = (Math.random() - 0.5) * 4;
        return Math.max(0, Math.min(100, prev + drift));
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Report callbacks are already defined above

  // ==== UI state & notifications (unchanged) ====
  const handleWaterChange = (newWater: number) => setWater(newWater);
  const handleEnergyChange = (newEnergy: number) => setEnergy(newEnergy);
  const handleCreditsChange = (newCredits: number) => setCredits(newCredits);
  const handleInventoryChange = (newInventory: Record<string, number>) => setInventory(newInventory);

  // ==== Event handlers ====
  const handleStatBoost = (statName: string, boostValue: number) => {
    gainExp(25 * level);
    switch (statName) {
      case 'farmCropGrowthSpeed': setCropGrowthModifier(prev => prev + boostValue); break;
      case 'waterEfficiency': setWaterEfficiency(prev => prev + boostValue); break;
      case 'maxEnergyCapacity': setMaxEnergyCapacity(prev => prev + boostValue); break;
      case 'unlockedT3Factories': setUnlockedT3Factories(prev => prev + boostValue); break;
      case 'unlockedPrestige': setUnlockedPrestige(prev => prev + boostValue); break;
      case 'podCapacity': setRegionCapacity(prev => prev + boostValue); break;
      case 'maxWaterCapacity': setMaxWaterCapacity(prev => prev + boostValue); break;
      case 'tier4CropUnlock': setTier4Unlocked(prev => prev + boostValue); break;
      case 'pumpPower': setPumpPower(prev => prev + boostValue); break;
      case 'baseEnergyProduction': setBaseEnergyProduction(prev => prev + boostValue); break;
      case 'tier3CropUnlock': setTier3Unlocked(prev => prev + boostValue); break;
      default: console.warn(`Unknown stat boost: ${statName}`);
    }
  };

  const handleResearchStateUpdate = (newState: ResearchState) => setResearchState(newState);
  const handleContractUpdate = (newState: ContractState) => setContractState(newState);

  const handleSell = (resource: string, amount: number, totalPrice: number) => {
    const newInv = { ...inventory };
    newInv[resource] = (newInv[resource] ?? 0) - amount;
    if (newInv[resource] <= 0) delete newInv[resource];
    setInventory(newInv);
    setCredits(prev => prev + totalPrice);
    gainExp(Math.round(totalPrice * 0.1));
  };

  const handlePrestigeReset = () => {
    setWater(INITIAL_WATER);
    setEnergy(INITIAL_ENERGY);
    setInventory({});
    setFarmEnergyDraw(0);
    setFarmWaterDraw(0);
    setFactoryEnergyDraw(0);
    setEventEnergyDraw(0);
    setEventWaterDraw(0);
    setResearchState({ techs: [], timers: {} });
    setContractState({ active: null, completedCount: 0, expiresAt: null });
    setUnlockedDistricts(['humid-cave']);
    setEnergy(Math.min(INITIAL_ENERGY, maxEnergyCapacity));
  };

  const handleDistrictUnlock = (_districtId: string, stat: string, value: number, cost: number) => {
    setCredits(prev => prev - cost);
    setUnlockedDistricts(prev => [...prev, _districtId]);
    switch (stat) {
      case 'waterEfficiency': setWaterEfficiency(prev => prev + value); break;
      case 'baseEnergyProduction': setBaseEnergyProduction(prev => prev + value); break;
      case 'researchSpeed': setResearchSpeed(prev => prev + value); break;
      case 'rareDropChance': setRareDropChance(prev => prev + value); break;
      case 'blackMarketAccess': setBlackMarketAccess(prev => prev + value); break;
    }
  };

  const handleBatchHarvest = (outputResources: string[]) => {
    const count = outputResources.length;
    setInventory(prev => {
      const next = { ...prev };
      outputResources.forEach(r => { next[r] = (next[r] ?? 0) + 1; });
      return next;
    });
    gainExp(10 * count);
    syncWithFallback('harvest', { userId, outputResources },
      () => {},
      () => { console.warn('Harvest server sync failed, local state kept.'); }
    );
  };

  const waterPerSec = pumpPower * waterEfficiency - 2 - totalWaterConsumption;
  const energyPerSec = baseEnergyProduction - totalEnergyConsumption;
  // -------------------------------------------------

  // ==== Top bar & layout (unchanged) ====
  const topBar = (
    <header className="fixed top-0 left-0 w-full z-40 bg-[#0e0e0f]/95 backdrop-blur-xl border-b border-[#3a494b]/20 shadow-[0_4px_30px_rgba(0,0,0,0.8)] flex flex-col transition-all">
      <div className="flex items-center justify-between p-2 bg-[#0e0e0f] rounded-b-lg shadow-inner">
        <h1 className="text-white text-lg font-semibold flex items-center gap-1">
          <span>NEON Agricorp</span>
          <span className="text-xs text-gray-400">v0.1</span>
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">💧 {String(water).padStart(3,'0')}%</span>
          <span className="text-sm text-gray-300">⚡ {String(energy).padStart(3,'0')}%</span>
          <span className="text-sm text-gray-300">💲 {credits}</span>
        </div>
      </div>
    </header>
  );

  // ==== Resource Status Dashboard (unchanged) ====
  // -------------------------------------------------

  return (
    <>
      {/* Resource Status Dashboard */}
      <ResourceStatusDashboard
        currentWater={water}
        maxWater={maxWaterCapacity}
        currentEnergy={energy}
        maxEnergy={maxEnergyCapacity}
        waterPerSec={waterPerSec}
        energyPerSec={energyPerSec}
        radiationLevel={radiationLevel}
        fertilizer={fertilizer}
        inventory={inventory}
        isOpen={resourceDashboardOpen}
        onToggle={setResourceDashboardOpen}
      />

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

      {/* Event notification overlay */}
      {eventNotification && (
        <EventNotification
          eventName={eventNotification.name}
          description={eventNotification.description}
          isBeneficial={eventNotification.beneficial}
          onClose={() => setEventNotification(null)}
          onNavigate={() => setActiveTab('system')}
        />
      )}

      {/* Layout */}
      <Layout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        topBar={topBar}
        tabs={[
          /* Farm tab */
          {
            id: 'farm',
            icon: '🌾',
            label: t('tabs.farm'),
            content: (
              <>
                <div className="hidden">
                  <WaterSystem
                    currentWater={water}
                    totalConsumption={totalWaterConsumption}
                    pumpPower={pumpPower}
                    waterEfficiency={waterEfficiency}
                    maxWater={maxWaterCapacity}
                  />
                  <EnergySystem
                    currentEnergy={energy}
                    totalConsumption={totalEnergyConsumption}
                    baseProduction={baseEnergyProduction}
                    maxEnergy={maxEnergyCapacity}
                  />
                </div>
                <FarmSystem
                  currentWater={water}
                  currentEnergy={energy}
                  credits={credits}
                  onWaterChange={handleWaterChange}
                  onEnergyChange={handleEnergyChange}
                  onEnergyConsumptionReport={handleFarmEnergyReport}
                  onWaterConsumptionReport={handleFarmWaterReport}
                  cropGrowthModifier={cropGrowthModifier}
                  isEnergyCritical={energy < (maxEnergyCapacity * 0.1)}
                  onBatchHarvest={handleBatchHarvest}
                  radiationLevel={radiationLevel}
                  fertilizer={fertilizer}
                onFertilizerChange={setFertilizer}
                  gridCapacity={4}
                  tier4Unlocked={tier4Unlocked}
                  waterPerSec={waterPerSec}
                  energyPerSec={energyPerSec}
                  maxWater={maxWaterCapacity}
                  maxEnergy={maxEnergyCapacity}
                  unlockedRegions={unlockedDistricts}
                  onDistrictUnlock={handleDistrictUnlock}
                />
              </>
            )
          },
          /* Factory tab */
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
                isEnergyCritical={energy < (maxEnergyCapacity * 0.1)}
                userId={userId}
                onFertilizerAdd={(amount: number) => setFertilizer(prev => prev + amount)}
              />
            )
          },
          /* Research tab */
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
                currentInventory={inventory}
                onInventoryChange={handleInventoryChange}
              />
            )
          },
          /* Market tab */
          {
            id: 'market',
            icon: '🏪',
            label: t('tabs.market'),
            content: (
              <MarketSystem
                inventory={inventory}
                onSell={handleSell}
                userId={userId}
                currentCredits={credits}
                contractState={contractState}
                onContractUpdate={handleContractUpdate}
                onCreditsChange={handleCreditsChange}
                onInventoryChange={handleInventoryChange}
                onExpGain={gainExp}
                onNotification={notify}
              />
            )
          },
          /* System tab – show EventSystem only when System tab is active */
          {
            id: 'system',
            icon: '⚙️',
            label: t('tabs.system'),
            content: (
              <div className="flex flex-col gap-3">
                <EventSystem
                  currentEvent={currentEvent}
                />
                <DistrictSystem
                  credits={credits}
                  onDistrictUnlock={handleDistrictUnlock}
                  unlockedDistricts={unlockedDistricts}
                />
                <PrestigeSystem
                  currentCredits={credits}
                  onCreditsChange={handleCreditsChange}
                  onResetGame={handlePrestigeReset}
                  onPermanentStatBoost={handleStatBoost}
                  unlockedPrestigeLevel={unlockedPrestige}
                  researchState={researchState}
                />
              </div>
            )
          }
        ]}
        defaultTab="farm"
      />
    </>
  );
};

export default GameLoop;