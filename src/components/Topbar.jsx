import React, { useContext, useState } from 'react';
import { Menu, Factory, ChevronDown, Check } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export default function Topbar({ title, onMenuClick }) {
  const { t, currentFactory, accessibleFactories, setCurrentFactory } = useContext(AppContext);
  const [factoryOpen, setFactoryOpen] = useState(false);

  const getTranslatedTitle = (title) => {
    if (title === 'Dashboard') return t('dashboard');
    if (title === 'Energy Summary') return t('energy_summary');
    if (title === 'Equipment Registry') return t('equipment_registry');
    if (title === 'Inspections History') return t('inspections_history');
    if (title === 'Reports') return t('reports');
    return title;
  };

  return (
    <header className="h-[64px] bg-surface/80 backdrop-blur-md border-b border-border/40 flex items-center px-4 md:px-6 gap-4 sticky top-0 z-40 shrink-0 select-none">
      <button 
        className="md:hidden text-muted hover:text-text p-1.5 shrink-0 transition-all active:scale-90 bg-transparent border-none cursor-pointer hover:bg-card2 rounded-lg" 
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
      
      <div className="flex-1 text-[15px] font-bold text-text tracking-wide animate-fade-in">
        {getTranslatedTitle(title)}
      </div>

      {/* Factory Switcher */}
      {accessibleFactories.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setFactoryOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 hover:bg-accent/20 border border-accent/20 rounded-xl text-xs font-bold text-accent transition-all cursor-pointer active:scale-95"
          >
            <Factory size={13} />
            <span className="max-w-[140px] truncate">
              {currentFactory ? currentFactory.name : 'เลือกโรงงาน'}
            </span>
            <ChevronDown size={12} className={`transition-transform duration-200 ${factoryOpen ? 'rotate-180' : ''}`} />
          </button>

          {factoryOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setFactoryOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                <div className="px-3 py-2 border-b border-border/50">
                  <div className="text-[10px] font-bold text-muted uppercase tracking-wider">เลือกโรงงานที่ทำงาน</div>
                </div>
                <div className="py-1">
                  {accessibleFactories.map(f => (
                    <button
                      key={f.id}
                      onClick={() => { setCurrentFactory(f.id); setFactoryOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-xs transition-all cursor-pointer border-none ${currentFactory?.id === f.id ? 'bg-accent/10 text-accent font-bold' : 'text-text hover:bg-card2 font-medium'}`}
                    >
                      <Factory size={13} className={currentFactory?.id === f.id ? 'text-accent' : 'text-muted'} />
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{f.name}</div>
                        <div className="text-[10px] text-muted truncate">{f.location}</div>
                      </div>
                      {currentFactory?.id === f.id && <Check size={12} className="text-accent shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
