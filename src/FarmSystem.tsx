import React, { useState, useEffect, useMemo } from 'react';

interface Crop {
  id: string;
  name: string;
  waterRequired: number;
  energyRequired: number; // One-time planting cost
  baseGrowthTime: number; // in seconds (Base time before modifiers)
  timePlanted: number; // timestamp
  isHarvestable: boolean;
}

interface FarmSystemProps {
  currentWater: number;
  currentEnergy: number;
  currentCredits: number;
  onWaterChange: (newWater: number) => void;
  onEnergyChange: (newEnergy: number) => void;
  onCreditsChange: (newCredits: number) => void;
  onEnergyConsumptionReport: (energyDraw: number) => void;
  cropGrowthModifier: number;
  onWaterConsumptionReport: (waterDraw: number) => void;
  isEnergyCritical: boolean;
  onHarvestRequest: (cropId: string) => void; // NEW: Signals intent to harvest
}

const FarmSystem: React.FC<FarmSystemProps> = ({ 
    currentWater, 
    currentEnergy, 
    currentCredits, 
    onWaterChange, 
    onEnergyChange, 
    onCreditsChange,
    onEnergyConsumptionReport,
    cropGrowthModifier,
    onWaterConsumptionReport,
    isEnergyCritical,
    onHarvestRequest
}) => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [availableCrops] = useState([
    // Tier 1
    { name: 'Hydro Lettuce', waterRequired: 10, energyRequired: 5, baseGrowthTime: 30, baseCreditValue: 5, baseEnergyDraw: 1, waterPerSecond: 0.5, outputResource: 'Raw Lettuce' },
    { name: 'Rad Potato', waterRequired: 15, energyRequired: 7, baseGrowthTime: 45, baseCreditValue: 8, baseEnergyDraw: 1.5, waterPerSecond: 0.6, outputResource: 'Raw Starch' },
    { name: 'Synthetic Wheat', waterRequired: 12, energyRequired: 6, baseGrowthTime: 40, baseCreditValue: 7, baseEnergyDraw: 1.2, waterPerSecond: 0.55, outputResource: 'Raw Flour Base' },
    // Tier 2
    { name: 'Neon Tomato', waterRequired: 20, energyRequired: 10, baseGrowthTime: 60, baseCreditValue: 25, baseEnergyDraw: 2.5, waterPerSecond: 0.8, outputResource: 'Raw Paste' },
  ]);

  // --- Constant Energy Draw Calculation (Grow Lights) ---
  const constantEnergyDraw = useMemo(() => {
    return crops.reduce((total, crop) => {
      const info = availableCrops.find(c => c.name === crop.name);
      return total + (info ? info.baseEnergyDraw : 0);
    }, 0);
  }, [crops, availableCrops]);

  // --- Continuous Resource Consumption Calculation ---
  const continuousWaterUsage = useMemo(() => {
    return crops.reduce((total, crop) => {
        const info = availableCrops.find(c => c.name === crop.name);
        const waterPerSecond = info ? info.waterPerSecond : 0;
        return total + waterPerSecond;
    }, 0);
  }, [crops, availableCrops]);

  // Report consumption back to GameLoop
  useEffect(() => {
    onEnergyConsumptionReport(constantEnergyDraw);
    onWaterConsumptionReport(continuousWaterUsage);
  }, [constantEnergyDraw, continuousWaterUsage, onEnergyConsumptionReport, onWaterConsumptionReport]);

  const plantCrop = (cropIndex: number) => {
    const cropToPlant = availableCrops[cropIndex];
    if (currentWater >= cropToPlant.waterRequired && currentEnergy >= cropToPlant.energyRequired) {
      // Deduct resources (Water/Energy one-time planting cost)
      onWaterChange(currentWater - cropToPlant.waterRequired);
      onEnergyChange(currentEnergy - cropToPlant.energyRequired);

      const newCrop: Crop = {
        id: `${cropToPlant.name}-${Date.now()}-${Math.random()}`,
        name: cropToPlant.name,
        waterRequired: cropToPlant.waterRequired,
        energyRequired: cropToPlant.energyRequired,
        baseGrowthTime: cropToPlant.baseGrowthTime,
        timePlanted: Date.now(),
        isHarvestable: false,
      };
      setCrops(prevCrops => [...prevCrops, newCrop]);
    } else {
      console.warn('Not enough water or energy to plant this crop!');
    }
  };

  const requestHarvest = (cropId: string) => {
    // Signal GameLoop/Server to perform harvest validation and update state
    const harvestedCrop = crops.find(crop => crop.id === cropId);
    if (harvestedCrop) {
        // Update local state temporarily (will be synced upon server validation response)
        setCrops(prevCrops => prevCrops.filter(crop => crop.id !== cropId));
        onHarvestRequest(cropId);
    }
  };

  // Harvest check interval (Now affected by growthModifier and energy status)
  useEffect(() => {
    const harvestCheckInterval = setInterval(() => {
      const now = Date.now();
      setCrops(prevCrops =>
        prevCrops.map(crop => {
          if (crop.isHarvestable) return crop;
          
          const info = availableCrops.find(c => c.name === crop.name);
          const effectiveGrowthTime = info ? crop.baseGrowthTime / cropGrowthModifier : crop.baseGrowthTime;
          
          // If energy is critical, growth slows down significantly
          const speedFactor = isEnergyCritical ? 0.2 : 1.0;
          const slowedEffectiveGrowthTime = effectiveGrowthTime / speedFactor;

          if ((now - crop.timePlanted) / 1000 >= slowedEffectiveGrowthTime) {
            return { ...crop, isHarvestable: true };
          }
          return crop;
        })
      );
    }, 1000);

    return () => clearInterval(harvestCheckInterval);
  }, [cropGrowthModifier, onCreditsChange, currentCredits, availableCrops, isEnergyCritical, onInventoryChange]); 
  
  useEffect(() => {
      if (isEnergyCritical) {
          console.warn("Energy is critical! Crop growth is slowed significantly.");
      }
  }, [isEnergyCritical]);


  return (
    <div>
      <h3>Underground Hydroponics</h3>
      <p>Active Plots: {crops.length}</p>
      <p>Grow Light Energy Draw: {constantEnergyDraw.toFixed(2)}/s</p>
      <p>Water Usage: {continuousWaterUsage.toFixed(2)}/s</p>
      {isEnergyCritical && <p style={{color: '#ff4444', textShadow: 'none'}}>WARNING: ENERGY CRITICAL - Growth Slowed!</p>}
      <div>
        <h4>Available Plots (Tier 1 & 2):</h4>
        {availableCrops.map((crop, index) => (
          <button 
            key={index} 
            onClick={() => plantCrop(index)} 
            disabled={currentWater < crop.waterRequired || currentEnergy < crop.energyRequired}
            title={currentWater < crop.waterRequired ? 'Need more water' : currentEnergy < crop.energyRequired ? 'Need more energy' : ''}
          >
            Plant {crop.name} (W:{crop.waterRequired}, E:{crop.energyRequired}, T:{Math.round(crop.baseGrowthTime / cropGrowthModifier)}s)
          </button>
        ))}
      </div>
      <div>
        <h4>Currently Growing:</h4>
        {crops.length === 0 ? (
          <p>No crops growing.</p>
        ) : (
          <ul>
            {crops.map(crop => (
              <li key={crop.id}>
                {crop.name} - {crop.isHarvestable ? (
                  <button onClick={() => requestHarvest(crop.id)}>Request Harvest (Yield {availableCrops.find(c => c.name === crop.name)?.outputResource})</button>
                ) : (
                  `Growing...`
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FarmSystem;