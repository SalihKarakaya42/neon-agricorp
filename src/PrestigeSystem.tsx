import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';

interface PrestigeSystemProps {
    currentCredits: number;
    onCreditsChange: (newCredits: number) => void;
    onResetGame: () => void; // Function to reset perishable state
    onPermanentStatBoost: (statName: string, boostValue: number) => void; // Function to apply permanent boosts
    unlockedPrestigeLevel: number;
    researchState: { techs: { id: string; level: number; isResearched: boolean }[]; timers: { [key: string]: number } };
}

const PrestigeSystem: React.FC<PrestigeSystemProps> = ({
    currentCredits,
    onCreditsChange,
    onResetGame,
    onPermanentStatBoost,
    unlockedPrestigeLevel,
    researchState
}) => {
    const PRESTIGE_COST_BASE = 50000;
    const PRESTIGE_BONUS_PER_LEVEL = 0.1; // 10% flat increase to base production per level (as simulated in GameLoop)
    
    const currentPrestigeCost = Math.round(PRESTIGE_COST_BASE * Math.pow(unlockedPrestigeLevel + 1, 2)); // Adjusted cost scaling
    
    const canPrestige = currentCredits >= currentPrestigeCost && researchState.techs.find(t => t.id === 'prestige-1' && t.isResearched);

    const initiatePrestige = async () => {
        if (!canPrestige) return;

        console.log(`Initiating Prestige Cycle ${unlockedPrestigeLevel + 1}.`);

        // 1. Deduct Cost
        onCreditsChange(currentCredits - currentPrestigeCost);

        // 2. Apply Permanent Boost (Only once per level achieved)
        const newLevel = unlockedPrestigeLevel + 1;
        
        // Apply permanent boost to base production (per prestige level achieved)
        onPermanentStatBoost('baseEnergyProduction', 5); 
        // We are relying on GameLoop to set unlockedPrestige state itself, so we don't do it here.
        
        // 3. Reset Perishable State
        onResetGame();
        
        alert(`Prestige Cycle ${newLevel} Completed! Permanent energy production boost applied.`);
    };

    return (
        <div style={{ border: '2px solid #ff00ff', margin: '10px auto', padding: '15px', backgroundColor: 'rgba(50, 0, 50, 0.5)' }}>
            <h3>Prestige System</h3>
            <p>Current Prestige Level: {unlockedPrestigeLevel}</p>
            <p>Next Prestige Cost: {currentPrestigeCost} Credits</p>
            <p>Next Permanent Bonus: +5 Base Energy Production per level</p>
            <p style={{ color: '#ffff00' }}>Requirement: Research 'Civilization Blueprint' (prestige-1)</p>
            
            <button 
                onClick={initiatePrestige}
                disabled={!canPrestige}
                style={{ backgroundColor: canPrestige ? '#ff00ff' : '#550055', color: 'white', borderColor: '#ff00ff' }}
            >
                {canPrestige ? `ENTER PRESTIGE CYCLE ${unlockedPrestigeLevel + 1}` : 'Prerequisites Not Met'}
            </button>
        </div>
    );
};

export default PrestigeSystem;