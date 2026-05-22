import React, { useState, useEffect, useRef, useMemo } from 'react';

interface WaterDistributionSystemProps {
  currentWaterSource: number; // The global water level from the well/pumps
  onWaterSourceChange: (newWater: number) => void;
  onWaterDemandReport: (demand: number) => void; // Reports total water used by farms/factories
}

const WaterDistributionSystem: React.FC<WaterDistributionSystemProps> = ({ 
    currentWaterSource, 
    onWaterSourceChange,
    onWaterDemandReport
}) => {
  const [tankCapacity, setTankCapacity] = useState(500);
  const [currentTankLevel, setCurrentTankLevel] = useState(200);
  const [leakageRate, setLeakageRate] = useState(1); // General network leakage (additional to pump leakage)

  // Placeholder for future research: Increase tank capacity or decrease leakage
  useEffect(() => {
    // Logic to update stats based on research could go here
  }, []);


  // --- Water Flow Logic (Tick based) ---
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      // We'll use the last tick time tracking like in resource systems for precision
      // For simplicity now, we assume 1 second intervals for complex calculations.
      
      // 1. Water inflow from source (Well/Pumps)
      // Since WaterSystem now calculates net water production, we assume currentWaterSource is the result of that system.
      // We need to model water moving from Source -> Tank.

      // For now, assume WaterSystem updates the global pool, and this system pulls from it to fill the tank, and the tank feeds consumers.

      // Pull water from source to fill tank (Simulating Pump/Purification -> Tank)
      let waterToPull = Math.min(tankCapacity - currentTankLevel, currentWaterSource * 0.1); // Pull 10% of the *production* (which is hard to model here) or just pull a fixed amount/until full.
      
      // Simple model: If tank is not full, pull from source pool until full or source runs out (We assume source is infinite for now)
      const maxPull = tankCapacity - currentTankLevel;
      const pulledWater = Math.min(maxPull, currentWaterSource * 0.5); // Pull up to 50% of available source water per tick, limited by capacity

      if (pulledWater > 0) {
        onWaterSourceChange(currentWaterSource - pulledWater);
        setCurrentTankLevel(prev => prev + pulledWater);
      }


      // 2. Water outflow/Consumption (Tank -> Farms/Factories)
      // For now, Farms report their usage (continuousWaterUsage). Let's assume Factories will do the same.
      const totalDemand = useMemo(() => {
        // Demand from Farms is reported via GameLoop props, but this component needs to interact with those demands.
        // Since WaterSystem handles TOTAL consumption rate based on GameLoop's aggregation, this component needs to manage distribution.
        // We will assume for now: Tank feeds distribution network which serves demand.
        // We will model the demand reporting here, and GameLoop will manage the actual draw from WaterSystem.
        
        // Placeholder Demand (Based on FarmSystem - needs to be passed from GameLoop)
        const placeholderFarmDemand = 5; 
        return placeholderFarmDemand; 
      }, []); 

      // 3. Network Leakage
      const waterLostToLeakage = leakageRate * 1; // Leakage per second (assuming 1 second tick)
      
      // Update Tank level based on losses
      let tankAfterLoss = currentTankLevel - waterLostToLeakage;

      // 4. Actual Consumption (Pull from Tank to satisfy demand)
      const waterToSatisfyDemand = Math.min(tankAfterLoss, totalDemand);
      tankAfterLoss -= waterToSatisfyDemand;

      // Final Tank Level
      tankAfterLoss = Math.max(0, tankAfterLoss);
      setCurrentTankLevel(tankAfterLoss);
      
      // Report total satisfied demand back to GameLoop for water system modeling (if needed)
      // For now, we just report the farm demand, and assume GameLoop calculates if demand was met.
      onWaterDemandReport(placeholderFarmDemand); 


    }, 1000); // Tick every second

    return () => clearInterval(interval);
  }, [currentWaterSource, onWaterSourceChange, tankCapacity, currentTankLevel, leakageRate, onWaterDemandReport]);


  return (
    <div>
      <h3>Water Distribution Network</h3>
      <p>Global Water Source (Well): {Math.round(currentWaterSource)} (Will be depleted by this system)</p>
      <p>Water Tank: {Math.round(currentTankLevel)} / {tankCapacity}</p>
      <p>Network Leakage: {leakageRate}/s</p>
      {/* Future: UI to upgrade tank size, repair leaks, manage distribution priorities */}
    </div>
  );
};

export default WaterDistributionSystem;
