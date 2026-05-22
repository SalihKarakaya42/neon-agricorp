import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from './i18n';
import { Coins, TrendingUp, TrendingDown } from 'lucide-react';

const BASE_PRICES: Record<string, number> = {
  'Raw Lettuce': 8, 'Raw Starch': 10, 'Raw Flour Base': 12, 'Raw Paste': 20, 'Glow Berry Batch': 80,
  'Flour Pack': 30, 'Potato Starch': 25, 'Nutrient Dough': 50, 'Cyber Pizza': 100, 'Refined Gel': 60, 'Quantum Core': 400, 'Crystalized Nutrient': 200,
};

const RESOURCE_IMAGES: Record<string, string> = {
  'Raw Lettuce': '/images/hydro-lettuce.png',
  'Raw Starch': '/images/rad-potato.png',
  'Raw Flour Base': '/images/synthetic-wheat.png',
  'Raw Paste': '/images/neon-tomato.png',
  'Glow Berry Batch': '/images/glow-berry.png',
};

interface MarketSystemProps { inventory: Record<string, number>; onSell: (resource: string, amount: number, totalPrice: number) => void; }

const MarketSystem: React.FC<MarketSystemProps> = ({ inventory, onSell }) => {
  const { t } = useLanguage();
  const [demand, setDemand] = useState<Record<string, number>>(() => {
    const d: Record<string, number> = {};
    Object.keys(BASE_PRICES).forEach(k => d[k] = 0.8 + Math.random() * 0.4);
    return d;
  });
  const [sliderOpen, setSliderOpen] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState(1);
  const tname = (key: string) => t(`crops.${key}`) || key;

  useEffect(() => {
    const interval = setInterval(() => {
      setDemand(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          const drift = (1.0 - next[k]) * 0.1;
          next[k] = Math.max(0.3, Math.min(3.0, next[k] + drift + (Math.random() - 0.5) * 0.05));
        });
        return next;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const sellableItems = useMemo(() => Object.keys(BASE_PRICES).filter(r => (inventory[r] || 0) > 0).sort(), [inventory]);

  const handleSell = (resource: string, amount: number) => {
    const price = Math.round(BASE_PRICES[resource] * demand[resource]);
    onSell(resource, amount, price * amount);
    setDemand(prev => ({ ...prev, [resource]: Math.max(0.3, prev[resource] - 0.05) }));
    setSliderOpen(null);
    setSliderValue(1);
  };

  return (
    <div className="flex flex-col gap-4">
      <span className="font-mono text-[10px] text-[#b9cacb] uppercase tracking-wider">{t('market.title')}</span>

      {sellableItems.length === 0 ? (
        <div className="glass-panel rounded-xl p-4 text-center">
          <p className="text-xs text-[#b9cacb]/60">{t('market.nothingToSell')}</p>
        </div>
      ) : (
        sellableItems.map(resource => {
          const price = Math.round(BASE_PRICES[resource] * (demand[resource] || 1));
          const demandPct = Math.round((demand[resource] || 1) * 100);
          const owned = inventory[resource] || 0;
          const trendIcon = demandPct > 110 ? <TrendingUp className="w-3 h-3 text-green-400" /> : demandPct < 90 ? <TrendingDown className="w-3 h-3 text-red-400" /> : null;
          const img = RESOURCE_IMAGES[resource];

          return (
            <div key={resource} className="glass-panel rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                {/* Product image */}
                <div className="w-[72px] h-[72px] rounded-lg overflow-hidden bg-[#0e0e0f] border border-white/5 flex-shrink-0">
                  {img ? (
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[24px] text-[#3a494b]">📦</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-mono text-[11px] text-white font-bold truncate">{tname(resource)}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      demandPct > 110 ? 'bg-green-500/10 text-green-400' : demandPct < 90 ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-slate-300'
                    }`}>%{demandPct}</span>
                    {trendIcon}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Coins className="w-3.5 h-3.5 text-[#00f3ff]" />
                    <span className="font-mono text-[11px] text-[#00f3ff] font-bold">{price}</span>
                    <span className="font-mono text-[9px] text-[#849495] ml-auto">{t('market.inventory')}: <strong className="text-white">{owned}</strong></span>
                  </div>
                </div>
              </div>

              {/* Slider */}
              {sliderOpen === resource ? (
                <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <input type="range" min={1} max={owned} value={sliderValue}
                      onChange={e => setSliderValue(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-[#353436] rounded-full appearance-none cursor-pointer accent-[#00f3ff]"
                      style={{ background: `linear-gradient(to right, #00f3ff ${(sliderValue / owned) * 100}%, #353436 ${(sliderValue / owned) * 100}%)` }}
                    />
                    <span className="font-mono text-[11px] text-white font-bold w-8 text-right">{sliderValue}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setSliderOpen(null); setSliderValue(1); }}
                      className="flex-1 py-1.5 border border-white/10 text-[#849495] font-mono text-[9px] rounded uppercase cursor-pointer active:scale-95 transition-all">
                      {t('market.cancel') || 'İPTAL'}
                    </button>
                    <button onClick={() => handleSell(resource, sliderValue)}
                      className="flex-1 py-1.5 bg-[#00f3ff] text-neutral-950 font-mono text-[9px] font-bold rounded uppercase cursor-pointer active:scale-95 transition-all">
                      {sliderValue} ADET SAT ({sliderValue * price}₿)
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setSliderOpen(resource); setSliderValue(1); }}
                  className="w-full py-1.5 border border-[#00f3ff]/60 text-[#00f3ff] hover:bg-[#00f3ff]/10 font-mono text-[9px] uppercase rounded transition-all cursor-pointer active:scale-95">
                  {t('market.sell') || 'SAT'}
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default MarketSystem;
