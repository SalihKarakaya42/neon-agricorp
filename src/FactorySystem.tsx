import React, { useState, useEffect, useMemo } from 'react';

// Define interfaces for Production Chains and Factories
interface ProductionChain {
  id: string;
  name: string;
  inputResources: { resource: string; amount: number }[];
  outputResource: { resource: string; amount: number };
  processingTime: number; // in seconds
  factoryType: string; // e.g., 'Nano Press', 'Quantum Kitchen'
  baseEnergyDraw: number; // Energy consumption per second while active
}

interface Factory {
  id: string;
  type: string;
  level: number;
  currentProductionChain: ProductionChain | null;
  timeStarted: number | null; // timestamp
  isProcessing: boolean;
}

interface FactorySystemProps {
  currentWater: number;
  currentEnergy: number;
  currentCredits: number;
  onWaterChange: (newWater: number) => void;
  onEnergyChange: (newEnergy: number) => void;
  onCreditsChange: (newCredits: number) => void;
  currentInventory: Record<string, number>;
  onInventoryChange: (newInventory: Record<string, number>) => void;
  onFactoryEnergyConsumptionReport: (energyDraw: number) => void;
  isEnergyCritical: boolean;
}

const FactorySystem: React.FC<FactorySystemProps> = ({ 
  currentCredits, 
  onCreditsChange, 
  currentInventory,
  onInventoryChange,
  onFactoryEnergyConsumptionReport,
  currentWater,
  onWaterChange,
  isEnergyCritical
}) => {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [productionChains] = useState<ProductionChain[]>([
    // Tier 1: Raw crops to basic processed goods
    { id: 'chain-wheat-flour', name: 'Wheat to Flour', inputResources: [{ resource: 'Raw Flour Base', amount: 10 }], outputResource: { resource: 'Flour Pack', amount: 5 }, processingTime: 15, factoryType: 'Nano Press', baseEnergyDraw: 3 },
    { id: 'chain-potato-starch', name: 'Potato to Starch', inputResources: [{ resource: 'Raw Starch', amount: 15 }], outputResource: { resource: 'Potato Starch', amount: 7 }, processingTime: 20, factoryType: 'Bio Reactor', baseEnergyDraw: 4 },
    // Tier 2: Basic goods to advanced products
    { id: 'chain-flour-dough', name: 'Flour & Water to Dough', inputResources: [{ resource: 'Flour Pack', amount: 8 }, { resource: 'Water', amount: 10 }], outputResource: { resource: 'Nutrient Dough', amount: 10 }, processingTime: 25, factoryType: 'Quantum Kitchen', baseEnergyDraw: 5 },
    { id: 'chain-dough-pizza', name: 'Dough to Cyber Pizza', inputResources: [{ resource: 'Nutrient Dough', amount: 10 }], outputResource: { resource: 'Cyber Pizza', amount: 8 }, processingTime: 35, factoryType: 'Quantum Kitchen', baseEnergyDraw: 6 },
    // Tier 2/3: Raw Paste to Refined Gel
    { id: 'chain-paste-gel', name: 'Raw Paste Processing', inputResources: [{ resource: 'Raw Paste', amount: 5 }], outputResource: { resource: 'Refined Gel' , amount: 3 }, processingTime: 40, factoryType: 'Chemical Processor', baseEnergyDraw: 8 },
    // Tier 3: Advanced Economy (Requires T3 Factory Unlock)
    { id: 'chain-gel-core', name: 'Gel to Quantum Core', inputResources: [{ resource: 'Refined Gel', amount: 10 }, { resource: 'Water', amount: 20 }], outputResource: { resource: 'Quantum Core', amount: 1 }, processingTime: 80, factoryType: 'Fusion Refinery', baseEnergyDraw: 15 },
  ]);

  // --- Resource Drawing Calculation ---
  const totalFactoryEnergyDraw = useMemo(() => {
    return factories.reduce((total, factory) => {
      if (factory.isProcessing && factory.currentProductionChain) {
        return total + factory.currentProductionChain.baseEnergyDraw;
      }
      return total;
    }, 0);
  }, [factories]);

  // Report energy draw to GameLoop
  useEffect(() => {
    onFactoryEnergyConsumptionReport(isEnergyCritical ? 0 : totalFactoryEnergyDraw);
  }, [totalFactoryEnergyDraw, onFactoryEnergyConsumptionReport, isEnergyCritical]);
  // --- End Resource Drawing Calculation ---


  // Initialize factories (Ensure Chemical Processor and Fusion Refinery are available now)
  useEffect(() => {
    const initialFactories: Factory[] = [
        { id: 'factory-nanopress-1', type: 'Nano Press', level: 1, currentProductionChain: null, timeStarted: null, isProcessing: false },
        { id: 'factory-bioreactor-1', type: 'Bio Reactor', level: 1, currentProductionChain: null, timeStarted: null, isProcessing: false },
        { id: 'factory-quantumkitchen-1', type: 'Quantum Kitchen', level: 1, currentProductionChain: null, timeStarted: null, isProcessing: false },
        { id: 'factory-chemicalprocessor-1', type: 'Chemical Processor', level: 1, currentProductionChain: null, timeStarted: null, isProcessing: false },
        { id: 'factory-fusionrefinery-1', type: 'Fusion Refinery', level: 1, currentProductionChain: null, timeStarted: null, isProcessing: false }, // New Factory Type
    ];
    setFactories(initialFactories);
  }, []);

  // Factory processing logic (Tick based)
  useEffect(() => {
    const factoryInterval = setInterval(() => {
      setFactories(prevFactories =>
        prevFactories.map(factory => {
          let updatedFactory = { ...factory };

          // STOP PROCESSING if energy is critical
          if (isEnergyCritical) {
            if (updatedFactory.isProcessing) {
                console.warn(`Factory ${updatedFactory.id} stopped processing due to energy critical state.`);
                return {
                    ...updatedFactory,
                    isProcessing: false,
                    currentProductionChain: updatedFactory.currentProductionChain,
                    timeStarted: null,
                };
            }
            return updatedFactory;
          }
          
          // Continue processing if energy is okay
          if (updatedFactory.isProcessing && updatedFactory.currentProductionChain && updatedFactory.timeStarted) {
            const elapsedTime = (Date.now() - updatedFactory.timeStarted) / 1000;
            if (elapsedTime >= updatedFactory.currentProductionChain.processingTime) {
              // Production finished
              const output = updatedFactory.currentProductionChain.outputResource;
              
              // Add output to inventory (via handler)
              setInventory(prevInv => {
                  const newInv = { ...prevInv };
                  newInv[output.resource] = (newInv[output.resource] || 0) + output.amount;
                  onInventoryChange(newInv);
                  return newInv;
              });
              
              console.log(`Finished producing ${output.amount} ${output.resource} in ${factory.type}.`);
              
              updatedFactory = {
                ...updatedFactory,
                isProcessing: false,
                currentProductionChain: null,
                timeStarted: null,
              };
            }
          }
          return updatedFactory;
        })
      );
    }, 1000);

    return () => clearInterval(factoryInterval);
  }, [onInventoryChange, isEnergyCritical]); 

  const canAffordResource = (resource: string, amount: number): boolean => {
    if (resource === 'Credits') {
      return currentCredits >= amount;
    }
    return (currentInventory[resource] || 0) >= amount;
  };

  const deductResource = (resource: string, amount: number) => {
    if (resource === 'Credits') {
      onCreditsChange(currentCredits - amount);
    } else if (resource === 'Water') {
        onWaterChange(currentWater - amount);
    }
    else {
      onInventoryChange({ ...currentInventory, [resource]: (currentInventory[resource] || 0) - amount });
    }
  };

  const startProduction = (factoryId: string, chainId: string) => {
    if (isEnergyCritical) {
        console.warn(`Cannot start production in ${factoryId}. Energy is critical.`);
        return;
    }
    
    setFactories(prevFactories =>
      prevFactories.map(factory => {
        if (factory.id === factoryId && !factory.isProcessing) {
          const chain = productionChains.find(pc => pc.id === chainId);
          if (chain) {
            // 1. Check input availability
            let allResourcesAvailable = true;
            for (const input of chain.inputResources) {
              if (!canAffordResource(input.resource, input.amount)) {
                allResourcesAvailable = false;
                console.warn(`Not enough ${input.resource} to start production for ${chain.name}.`);
                break;
              }
            }

            if (allResourcesAvailable) {
              // 2. Deduct input resources immediately
              chain.inputResources.forEach(input => {
                deductResource(input.resource, input.amount);
              });

              // 3. Start processing
              return {
                ...factory,
                currentProductionChain: chain,
                timeStarted: Date.now(),
                isProcessing: true,
              };
            }
          }
        }
        return factory;
      })
    );
  };

  return (
    <div>
      <h3>Industrial Processing</h3>
      <div>
        <h4>Available Production Chains:</h4>
        {productionChains.map(chain => (
          <div key={chain.id} style={{ border: '1px dotted #00ffff', padding: '5px', margin: '5px' }}>
            <p><strong>{chain.name}</strong> (Factory: {chain.factoryType})</p>
            <p>Inputs: {chain.inputResources.map(r => `${r.amount} ${r.resource}`).join(', ')} | Output: {chain.outputResource.amount} {chain.outputResource.resource} | Time: {chain.processingTime}s | Power: {chain.baseEnergyDraw}/s</p>
            {/* Button to assign chain to an available factory */}
            {factories.filter(f => f.type === chain.factoryType && !f.isProcessing).map(factory => (
              <button key={factory.id} onClick={() => startProduction(factory.id, chain.id)} disabled={currentCredits < 1 || isEnergyCritical}>
                Start on {factory.type} {factory.id} {isEnergyCritical ? '(Energy Critical)' : ''}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div>
        <h4>Active Factories:</h4>
        {factories.length === 0 ? (
          <p>No factories available.</p>
        ) : (
          factories.map(factory => (
            <div key={factory.id} style={{ border: '1px solid grey', margin: '10px', padding: '10px' }}>
              <p><strong>{factory.type} {factory.id}</strong> (Lvl {factory.level})</p>
              {factory.isProcessing && factory.currentProductionChain ? (
                <>
                  <p>Processing: {factory.currentProductionChain.name}</p>
                  <p>
                    Time Remaining: {Math.max(0, factory.currentProductionChain.processingTime - Math.floor(((Date.now() - (factory.timeStarted || Date.now())) / 1000)))}s
                  </p>
                </>
              ) : (
                <p>Idle</p>
              )}
            </div>
          ))
        )}
      </div>
      <div>
        <h4>Inventory Overview:</h4>
        {Object.keys(currentInventory).length === 0 ? <p>Empty</p> : 
          <ul>
            {Object.entries(currentInventory).filter(([, amount]) => amount > 0).map(([resource, amount]) => (
              <li key={resource}>{resource}: {amount}</li>
            ))}
          </ul>
        }
      </div>
    </div>
  );
};

export default FactorySystem;