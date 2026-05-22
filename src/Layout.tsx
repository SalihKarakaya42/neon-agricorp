import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon: string;
  content: React.ReactNode;
}

interface LayoutProps {
  topBar: React.ReactNode;
  tabs: Tab[];
  defaultTab?: string;
}

const Layout: React.FC<LayoutProps> = ({ topBar, tabs, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeContent = tabs.find(t => t.id === activeTab)?.content;

  return (
    <div className="min-h-screen min-h-dvh text-[#e5e2e3] flex flex-col pb-24 relative select-none selection:bg-cyan-500/20">
      <div className="fixed top-[10%] left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-gradient-to-b from-[#00f3ff]/5 to-transparent rounded-full pointer-events-none blur-[80px]" />

      {topBar}

      <main className="flex-grow pt-[112px] px-4 max-w-md mx-auto w-full flex flex-col gap-4 pb-6 mt-2">
        {activeContent}
      </main>

      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-[env(safe-area-inset-bottom,0px)] h-20 bg-[#131314]/90 backdrop-blur-xl border-t border-[#3a494b]/30 shadow-[0_-5px_25px_rgba(0,0,0,0.6)]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center transition-all cursor-pointer w-16 h-full relative ${
              activeTab === tab.id ? 'text-[#00f3ff]' : 'text-[#b9cacb]/60 hover:text-white'
            }`}
          >
            {activeTab === tab.id && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#00f3ff] shadow-[0_0_10px_#00f3ff]" />
            )}
            <span className="text-[20px] mb-1 leading-none select-none">{tab.icon}</span>
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase select-none">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
