# 🌆 NEON AGRICORP

## Underground Cyberpunk Colony Management Simulator

> Humanity can no longer farm on the surface.
> Build the last underground agricultural civilization.

---

# 📌 PROJECT OVERVIEW

NEON AGRICORP is a real-time cyberpunk underground colony simulator built for mobile devices using WebView technology.

The game combines:

* Idle progression
* Colony management
* Production chains
* Research systems
* Resource logistics
* Underground expansion
* Real-time multiplayer economy
* Server-authoritative anti-cheat systems

The player manages an underground agricultural colony after Earth became radioactive and uninhabitable.

The goal is NOT just farming.

The player must:

* survive
* manage energy
* manage water pressure
* expand underground districts
* automate production
* fulfill MegaCorp contracts
* research advanced technologies
* create industrial production chains
* dominate the underground economy

---

# 🎮 CORE GAME LOOP

```text
Extract Water
    ↓
Generate Energy
    ↓
Produce Fertilizer
    ↓
Plant Crops
    ↓
Harvest Resources
    ↓
Process in Factories
    ↓
Craft Advanced Products
    ↓
Sell / Contract Delivery
    ↓
Earn Credits + EXP
    ↓
Unlock Research
    ↓
Expand Colony
    ↓
Reach Deeper Underground Layers
```

---

# 🌍 WORLD LORE

Year: 2087

Earth's surface has collapsed because of:

* radiation
* toxic atmosphere
* MegaCorp wars
* climate collapse

Humanity survives in underground mega-bunkers.

Food production became the most valuable industry in existence.

The player begins with:

* one abandoned underground farming pod
* one broken water pump
* limited electricity
* low oxygen
* old hydroponic equipment

The player slowly transforms this into:
a giant underground agricultural empire.

---

# 🧠 DESIGN PHILOSOPHY

This game should NOT feel like:

* casual farm games
* cute farming simulators
* cartoon idle games

It SHOULD feel like:

* industrial underground survival
* cyberpunk infrastructure management
* post-apocalyptic logistics simulator

Inspirations:

* Fallout Shelter
* Frostpunk
* Oxygen Not Included
* Factorio
* Satisfactory
* Cyberpunk 2077
* Subnautica

---

# 📱 PLATFORM TARGET

Primary Platform:

* Android

Technology:

* React + TypeScript
* Vite
* CapacitorJS
* Supabase
* WebView container

The entire game runs as:

* mobile optimized web application
* packaged into native Android APK/AAB

Performance target:

* stable 60 FPS on mid-range devices
* fast startup time
* low memory usage
* responsive touch interactions

---

# 🎨 VISUAL STYLE

## MAIN VISUAL DIRECTION

Style:

* dark cyberpunk
* industrial sci-fi
* underground dystopia
* neon lighting
* holographic interfaces
* realistic metallic surfaces

Main colors:

* neon cyan
* neon pink
* neon green
* dark metal gray
* radioactive yellow

---

# 🏗️ 3D VISUAL SYSTEM (VERY IMPORTANT)

The game MUST simulate a 3D environment even if built with web technologies.

True heavy 3D is NOT required.

Instead:
use "Fake 3D + Isometric Depth Rendering".

---

# ✅ RECOMMENDED VISUAL TECHNIQUE

## Fake 3D Hybrid Rendering

Use:

* CSS 3D transforms
* perspective camera illusion
* layered parallax
* dynamic shadows
* depth fog
* animated lighting
* moving particles
* perspective skew
* normal maps (optional)

Result:
Looks almost like a real 3D mobile game,
while remaining lightweight for WebView.

---

# 🧱 FARM VISUAL STRUCTURE

The farm is NOT flat.

The colony consists of:

* underground vertical layers
* hexagonal or square production cells
* giant underground chambers
* metal bridges
* pipes
* water systems
* ventilation systems
* glowing hydroponic pods

---

# 🎥 CAMERA SYSTEM

Camera:

* slightly angled top-down
* 35° perspective
* smooth zoom
* smooth drag movement

Features:

* pinch zoom
* camera inertia
* district transitions
* depth blur

---

# 🌫️ ENVIRONMENT EFFECTS

Mandatory effects:

* moving fog
* steam particles
* neon flickering
* pipe condensation
* reactor glow
* hologram scan lines
* animated dust particles
* electrical sparks

The colony must feel ALIVE.

---

# 🌾 FARM SYSTEM

## Underground Hydroponic Farming

Each farm cell contains:

```text
Water Level
Fertilizer Level
Light Exposure
Temperature
Radiation Resistance
Growth Speed
Humidity
Power Consumption
```

Each crop consumes:

* water
* fertilizer
* energy

No free production exists.

---

# 🌱 CROP TIERS

## Tier 1

Basic survival crops:

* Synthetic Wheat
* Rad Potato
* Hydro Lettuce

## Tier 2

Industrial farming:

* Neon Tomato
* Cyber Corn
* Bio Soy

## Tier 3

Advanced economy:

* Glow Berry
* Quantum Fungus
* Plasma Mushroom

## Tier 4

Late game genetic engineering:

* Bio Lumina Fruit
* Nano Orchid
* Void Melon

---

# ☢️ RADIATION SYSTEM

Each underground district has:

* radiation level
* toxicity
* humidity
* temperature

Formula:

```text
Effective Growth =
Base Growth Speed
× Water Modifier
× Fertilizer Modifier
× Power Modifier
× Radiation Modifier
× Research Modifier
```

Example:

```text
10 sec
× 1.2
× 1.1
× 0.8
× 1.4
= 14.78 production/sec
```

Radiation creates:

* mutations
* rare crop bonuses
* production risks

High radiation:

* increases rare drop chance
* increases malfunction chance

---

# 💧 WATER SYSTEM

Water is a CRITICAL resource.

No water = colony collapse.

---

# 🔧 WATER INFRASTRUCTURE

Water flow chain:

```text
Underground Well
    ↓
Pump
    ↓
Purification System
    ↓
Water Tank
    ↓
Pipe Network
    ↓
Farm Cells
```

---

# 🧮 WATER FORMULAS

## Water Production

WaterProduction=(PumpPower\times Efficiency) - Leakage

---

## Water Consumption

TotalWaterUsage=\sum(CropWaterUsage\times ActivePlots)

---

# ⚡ ENERGY SYSTEM

Energy powers EVERYTHING.

Consumers:

* pumps
* factories
* grow lights
* drones
* ventilation
* AI workers
* laboratories

---

# 🔋 ENERGY NETWORK

```text
Generator
    ↓
Battery Storage
    ↓
Power Grid
    ↓
District Distribution
```

---

# 🧮 ENERGY FORMULA

NetEnergy=EnergyProduction-EnergyConsumption

If energy becomes negative:

* factories stop
* crops slow down
* oxygen decreases
* alarms trigger

---

# 🏭 FACTORY SYSTEM (EXTREMELY IMPORTANT)

Factories are NOT optional.

Factories create the REAL economy.

Raw crops are low value.
Processed products generate wealth.

---

# 🧪 INDUSTRIAL PRODUCTION CHAINS

Example:

```text
Neon Wheat
    ↓
Nano Press
    ↓
Flour Pack
    ↓
Nutrient Mixer
    ↓
Nutrient Dough
    ↓
Quantum Kitchen
    ↓
Cyber Pizza
    ↓
MegaCorp Contract
```

---

# 🏗️ FACTORY TYPES

## Basic Factories

* Nano Press
* Bio Reactor
* Water Purifier

## Industrial Factories

* Quantum Kitchen
* Genetic Lab
* Chemical Processor

## Late Game Factories

* AI Assembly
* Nano Forge
* Fusion Refinery

---

# ⚙️ FACTORY MECHANICS

Factories require:

* input resources
* power
* workers
* cooling
* maintenance

Factories can:

* overheat
* malfunction
* explode
* become contaminated

---

# 🤖 AUTOMATION SYSTEM

Late game introduces automation.

Automation tools:

* harvest drones
* transport drones
* repair drones
* AI managers

Automation requires:

* batteries
* AI cores
* energy
* software upgrades

---

# 🔬 RESEARCH SYSTEM (MAIN MONEY SINK)

Research is the PRIMARY progression system.

Money should mainly be spent here.

---

# 🧠 RESEARCH TREE CATEGORIES

## Agriculture

Unlock:

* crops
* growth speed
* yield bonuses
* radiation resistance

## Water Engineering

Unlock:

* stronger pumps
* larger tanks
* purification systems

## Energy

Unlock:

* reactors
* batteries
* efficient power grids

## Automation

Unlock:

* drones
* AI workers
* auto harvesting

## Genetics

Unlock:

* hybrid crops
* mutation farming
* laboratory systems

## Industrialization

Unlock:

* advanced factories
* production efficiency
* contract systems

---

# 📈 RESEARCH COST FORMULA

ResearchCost=BaseCost\times(Level^{1.45})

---

# 🧪 RESEARCH TIME FORMULA

ResearchTime=BaseTime\times ComplexityModifier

---

# 🌍 DISTRICT SYSTEM

The underground world is divided into districts.

Each district contains:

* biome type
* radiation level
* environmental bonuses
* hidden resources

---

# 🗺️ DISTRICT TYPES

| District       | Bonus                   |
| -------------- | ----------------------- |
| Humid Cave     | +Water                  |
| Reactor Zone   | +Energy                 |
| Abandoned Lab  | +Research               |
| Toxic Layer    | Rare mutations          |
| MegaCorp Ruins | High risk / high reward |

---

# 📦 MARKET SYSTEM

Two economies exist:

## Civilian Market

Stable economy.

## Black Market

Illegal economy.

Higher rewards.
Higher risks.

---

# 💼 MEGACORP CONTRACTS

Main late-game economy.

Example:

```text
Deliver:
- 500 Cyber Pizza
- 200 Glow Berry
- 50 Quantum Fungus

Reward:
- 2.5M Credits
- Rare Reactor Core
- AI Blueprint
```

Contracts create:

* long-term goals
* stable progression
* large economic scaling

---

# 🎲 RANDOM EVENTS

Examples:

* radiation leak
* reactor overheating
* black market opportunity
* MegaCorp inspection
* pipe explosion
* hacker attack
* AI rebellion

Events make the colony feel alive.

---

# ♾️ PRESTIGE SYSTEM

Prestige = establish a new underground colony.

Reset rewards:

* permanent bonuses
* unique technologies
* special districts
* faster progression

Prestige should feel like:
"building humanity's next civilization."

---

# ☁️ SERVER ARCHITECTURE (ANTI CHEAT)

VERY IMPORTANT.

The game must be:
SERVER AUTHORITATIVE.

Client must NEVER:

* generate coins
* modify timers
* create items
* validate rewards

Server validates EVERYTHING.

---

# 🔐 SUPABASE ARCHITECTURE

Use:

* Supabase Auth
* Supabase Database
* Supabase Realtime
* Supabase Edge Functions

---

# 🔒 ANTI CHEAT DESIGN

Client:

* sends action request

Server:

* validates time
* validates inventory
* calculates rewards
* updates resources

Use Edge Functions for:

* harvesting
* factory processing
* contract completion
* market transactions

---

# 📊 CORE MATHEMATICAL SYSTEMS

## Crop Yield Formula

Yield=BaseYield\times WaterModifier\times FertilizerModifier\times ResearchBonus\times RadiationBonus

---

## Market Price Formula

MarketPrice=BasePrice\times DemandMultiplier\times EventMultiplier

---

## EXP Formula

EXP=(SellValue\times 0.1)+(ResearchLevel\times 25)

---

## Level Formula

RequiredEXP=100\times(Level^{1.5})

---

# 📱 MOBILE UX RULES

The game must:

* support one-hand gameplay
* have large touch targets
* use responsive scaling
* minimize text clutter
* prioritize smooth animations

All UI should feel:

* futuristic
* holographic
* responsive
* alive

---

# 🎯 FINAL GOAL

The player should eventually build:

* a gigantic underground civilization
* fully automated production chains
* AI-controlled agriculture
* massive reactor-powered districts
* genetically engineered food systems
* MegaCorp-scale industrial networks

The game fantasy is:

"I built humanity's last food empire underground."

---
