import React, { useEffect, useRef } from 'react';

interface WaterSystemProps {
  currentWater: number;
  onWaterChange: (newWater: number) => void;
  totalConsumption: number; // Water usage from farming/factories
  pumpPower: number; // Boosted pump power from research
  waterEfficiency: number; // New: Multiplier for overall water production/retention
}

const WaterSystem: React.FC<WaterSystemProps> = ({ currentWater, onWaterChange, totalConsumption, pumpPower, waterEfficiency }) => {
  const initialEfficiency = 1.0; // Base efficiency multiplier (will be multiplied by research efficiency)
  const leakage = 2; // Static for now

  const lastTickTimeRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedTime = (now - lastTickTimeRef.current) / 1000; // Time elapsed in seconds
      lastTickTimeRef.current = now;

      // Effective Efficiency = Initial Efficiency * Water Efficiency Research Multiplier
      const effectiveEfficiency = initialEfficiency * waterEfficiency;

      // WaterProduction = (PumpPower * Effective Efficiency) - Leakage
      const waterProductionRate = (pumpPower * effectiveEfficiency) - leakage;
      
      // Net Rate = Production Rate - Total Consumption Rate
      const netRate = waterProductionRate - totalConsumption;

      const netWaterChange = netRate * elapsedTime;
      
      let newWater = currentWater + netWaterChange;

      // Water cannot go below 0 (No water = colony collapse)
      newWater = Math.max(0, newWater); 
      
      onWaterChange(newWater); 

    }, 1000);

    return () => clearInterval(interval);
  }, [currentWater, onWaterChange, pumpPower, totalConsumption, waterEfficiency]);

  const netRate = (pumpPower * initialEfficiency * waterEfficiency) - leakage - totalConsumption;

  return (
    <div>
      <h3>Water Infrastructure</h3>
      <p>Water Level: {Math.round(currentWater)}</p>
      <p>Net Rate: {netRate.toFixed(2)}/s (Production - Leakage - Consumption)</p>
    </div>
  );
};

export default WaterSystem;