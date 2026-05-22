import React, { useEffect, useRef } from 'react';

interface EnergySystemProps {
  currentEnergy: number;
  onEnergyChange: (newEnergy: number) => void;
  totalConsumption: number; // Total energy draw from farming/factories
  baseProduction: number; // Boosted base energy production from research
  maxEnergy: number; // New: Max capacity from research
}

const EnergySystem: React.FC<EnergySystemProps> = ({ currentEnergy, onEnergyChange, totalConsumption, baseProduction, maxEnergy }) => {
  const lastTickTimeRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedTime = (now - lastTickTimeRef.current) / 1000; // Time elapsed in seconds
      lastTickTimeRef.current = now;

      // NetEnergyChangeRate = Production - TotalConsumption
      const netEnergyChangeRate = baseProduction - totalConsumption;
      
      const netEnergyChange = netEnergyChangeRate * elapsedTime;
      
      let newEnergy = currentEnergy + netEnergyChange;

      // Energy cannot go below 0 or above maxEnergy
      newEnergy = Math.max(0, Math.min(newEnergy, maxEnergy)); 
      
      onEnergyChange(newEnergy); // Propagate new state immediately

    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [currentEnergy, onEnergyChange, totalConsumption, baseProduction, maxEnergy]);

  const netRate = baseProduction - totalConsumption;

  return (
    <div>
      <h3>Energy Network</h3>
      <p>Energy Level: {Math.round(currentEnergy)} / {Math.round(maxEnergy)}</p>
      <p>Net Rate: {netRate.toFixed(2)}/s</p>
    </div>
  );
};

export default EnergySystem;