import React, { useEffect, useMemo } from 'react';

// Define the structure for research state that will be read from GameLoop
interface ResearchTechData {
  id: string;
  level: number;
  isResearched: boolean;
}

interface ResearchTechDefinition {
  id: string;
  name: string;
  category: 'Agriculture' | 'Water' | 'Energy' | 'District';
  baseCost: number;
  unlocks: { stat: string; value: number };
}

interface ResearchSystemProps {
  currentCredits: number;
  onCreditsChange: (newCredits: number) => void;
  onStatBoost: (statName: string, boostValue: number) => void;
  researchState: { techs: ResearchTechData[]; timers: { [key: string]: number } };
  onResearchStateUpdate: (newState: { techs: ResearchTechData[]; timers: { [key: string]: number } }) => void;
}

const initialResearchDefinitions: ResearchTechDefinition[] = [
  // Tier 1
  { id: 'agri-1', name: 'Hydroponic Efficiency I', category: 'Agriculture', baseCost: 500, unlocks: { stat: 'farmCropGrowthSpeed', value: 0.1 } },
  { id: 'water-1', name: 'Deep Well Pumping I', category: 'Water', baseCost: 800, unlocks: { stat: 'pumpPower', value: 2 } },
  { id: 'energy-1', name: 'Basic Reactor Core I', category: 'Energy', baseCost: 1000, unlocks: { stat: 'baseEnergyProduction', value: 5 } },
  // Tier 2
  { id: 'water-2', name: 'Hydroponic Water Mgmt I', category: 'Water', baseCost: 1500, unlocks: { stat: 'waterEfficiency', value: 0.1 } },
  { id: 'energy-2', name: 'Capacitor Bank V1', category: 'Energy', baseCost: 2000, unlocks: { stat: 'maxEnergyCapacity', value: 500 } },
  // Tier 3 Candidate 1 (Energy/District)
  { id: 'district-1', name: 'Geothermal Tapping', category: 'Energy', baseCost: 3500, unlocks: { stat: 'baseEnergyProduction', value: 10 } },
  // Tier 3 Candidate 2 (Agriculture/District unlock)
  { id: 'agri-2', name: 'Laboratory Systems', category: 'Agriculture', baseCost: 4000, unlocks: { stat: 'tier3CropUnlock', value: 1 } },
  // Tier 3 Candidate 3 (District/Expansion)
  { id: 'district-2', name: 'Excavation Protocol I', category: 'District', baseCost: 5000, unlocks: { stat: 'unlockedT3Factories', value: 1 } },
  // Tier 4 Candidate (Prestige Unlock)
  { id: 'prestige-1', name: 'Civilization Blueprint', category: 'District', baseCost: 15000, unlocks: { stat: 'unlockedPrestige', value: 1 } },
];

// Helper to map definitions to the initial state structure if GameLoop is loading a fresh state
const getInitialResearchState = (): { techs: ResearchTechData[], timers: { [key: string]: number } } => {
    const techs: ResearchTechData[] = initialResearchDefinitions.map(def => ({
        id: def.id,
        level: 1,
        isResearched: false
    }));
    return { techs, timers: {} };
};


const ResearchSystem: React.FC<ResearchSystemProps> = ({ 
    currentCredits, 
    onCreditsChange, 
    onStatBoost,
    researchState,
    onResearchStateUpdate
}) => {
  
  const { techs, timers } = researchState;

  // Formula: ResearchCost = BaseCost * (Level ^ 1.45)
  const calculateCost = (techId: string, level: number): number => {
    const def = initialResearchDefinitions.find(d => d.id === techId);
    if (!def) return Infinity;
    return Math.round(def.baseCost * Math.pow(level, 1.45));
  };

  const calculateBaseTimeSeconds = (techId: string): number => {
    const def = initialResearchDefinitions.find(d => d.id === techId);
    if (!def) return 999;
    return Math.round(def.baseCost / 250);
  };

  // --- Research Tick ---
  useEffect(() => {
    const researchInterval = setInterval(() => {
      let stateUpdated = false;
      const newTimers = { ...timers };
      const newTechs = [...techs];

      let statBoostsToApply: { statName: string, boostValue: number }[] = [];

      techs.forEach(tech => {
        if (tech.isResearched) return;

        const remainingTime = newTimers[tech.id] || 0;
        if (remainingTime > 0) {
          const newRemainingTime = Math.max(0, remainingTime - 1);
          newTimers[tech.id] = newRemainingTime;
          stateUpdated = true;

          if (newRemainingTime === 0) {
            console.log(`Research Complete: ${tech.name}!`);
            const def = initialResearchDefinitions.find(d => d.id === tech.id);
            if (def) {
                statBoostsToApply.push({ statName: def.unlocks.stat, boostValue: def.unlocks.value });
            }
            
            // Update tech state: Mark researched and increment level for next tier
            const techIndex = newTechs.findIndex(t => t.id === tech.id);
            if (techIndex !== -1) {
                newTechs[techIndex] = { ...tech, isResearched: true, level: tech.level + 1 };
            }
          }
        }
      });
      
      if (stateUpdated) {
        statBoostsToApply.forEach(boost => onStatBoost(boost.statName, boost.boostValue));
        
        onResearchStateUpdate({ techs: newTechs, timers: newTimers });
      }
      
    }, 1000);

    return () => clearInterval(researchInterval);
  }, [techs, timers, onStatBoost, onResearchStateUpdate]);


  const startResearch = (techDef: ResearchTechDefinition) => {
    const currentTechData = techs.find(t => t.id === techDef.id) || { id: techDef.id, level: 1, isResearched: false };
    if (currentTechData.isResearched) return;

    const cost = calculateCost(techDef.id, currentTechData.level);
    if (currentCredits < cost) {
      console.warn('Not enough credits to start research.');
      return;
    }

    onCreditsChange(currentCredits - cost);

    const baseTime = calculateBaseTimeSeconds(techDef.id);
    
    // Update state
    const newTechs = techs.map(tech => 
        tech.id === techDef.id ? {...tech, isResearched: false} : tech
    );
    const newTimers = { ...timers, [techDef.id]: baseTime };
    
    onResearchStateUpdate({ techs: newTechs, timers: newTimers });
    
    console.log(`Starting research on ${techDef.name}. Cost: ${cost} Credits. Time: ${baseTime}s`);
  };

  return (
    <div>
      <h3>Research & Development</h3>
      <p>Total Researched Techs: {techs.filter(t => t.isResearched).length}</p>
      
      {initialResearchDefinitions.map(techDef => {
        const techData = techs.find(t => t.id === techDef.id) || { id: techDef.id, level: 1, isResearched: false };
        const cost = calculateCost(techDef.id, techData.level);
        const time = timers[techDef.id] || 0;

        return (
          <div key={techDef.id} style={{ border: '1px dashed #ff00ff', margin: '5px', padding: '5px' }}>
            <p><strong>[{techDef.category}] {techDef.name} (Lvl {techData.level})</strong></p>
            <p>Cost: {cost} Credits | Unlocks: +{techDef.unlocks.value} to {techDef.unlocks.stat}</p>
            
            {techData.isResearched ? (
              <p style={{ color: '#00ff00' }}>COMPLETED (Next Level available for {calculateCost(techDef.id, techData.level + 1)} Credits)</p>
            ) : time > 0 ? (
              <p style={{ color: '#ffff00' }}>Researching... {time}s remaining</p>
            ) : (
              <button onClick={() => startResearch(techDef)} disabled={currentCredits < cost}>
                Research ({cost} Credits)
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ResearchSystem;