export interface Translations {
  app: {
    title: string;
    checking: string;
    inventory: string;
    empty: string;
    boosts: string;
    growth: string;
    waterEff: string;
    energyCap: string;
    t3Factories: string;
    prestigeLvl: string;
    prod: string;
  };
  auth: {
    login: string;
    register: string;
    email: string;
    password: string;
    confirmPassword: string;
    passwordMismatch: string;
    username: string;
    chooseAvatar: string;
    pleaseWait: string;
    noAccount: string;
    hasAccount: string;
    error: string;
    accountCreated: string;
  };
  water: {
    title: string;
    level: string;
    netRate: string;
    formula: string;
  };
  energy: {
    title: string;
    level: string;
    netRate: string;
  };
  farm: {
    title: string;
    activePlots: string;
    growLightDraw: string;
    waterUsage: string;
    warning: string;
    availablePlots: string;
    needMoreWater: string;
    needMoreEnergy: string;
    plant: string;
    currentlyGrowing: string;
    noCrops: string;
    requestHarvest: string;
    growing: string;
    radiation: string;
    fertilizer: string;
    statGood: string;
    statMedium: string;
    statBad: string;
    statCritical: string;
  };
  factory: {
    title: string;
    availableChains: string;
    inputs: string;
    output: string;
    time: string;
    power: string;
    startOn: string;
    energyCritical: string;
    activeFactories: string;
    noFactories: string;
    processing: string;
    timeRemaining: string;
    idle: string;
    inventoryOverview: string;
  };
  research: {
    title: string;
    totalResearched: string;
    cost: string;
    unlocks: string;
    completed: string;
    nextLevel: string;
    researching: string;
    remaining: string;
    research: string;
  };
  event: {
    title: string;
    lastEvent: string;
    idle: string;
    potentialEffect: string;
    none: string;
    left: string;
  };
  prestige: {
    title: string;
    currentLevel: string;
    nextCost: string;
    nextBonus: string;
    requirement: string;
    enterCycle: string;
    prerequisitesNotMet: string;
  };
  crops: Record<string, string>;
  factoryTypes: Record<string, string>;
  productionChains: Record<string, string>;
  researchNames: Record<string, string>;
  categories: Record<string, string>;
  events: Record<string, string>;
  district: {
    title: string;
    unlocked: string;
    unlock: string;
  };
  districts: {
    [key: string]: string;
  };
  market: {
    title: string;
    nothingToSell: string;
    demand: string;
    inventory: string;
    sell: string;
  };
  tabs: {
    farm: string;
    factory: string;
    research: string;
    market: string;
    contracts: string;
    districts: string;
    system: string;
  };
  resourceLabels: {
    [key: string]: string;
  };
}
