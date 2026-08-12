import React, { useContext } from 'react';
import { Menu } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export default function Topbar({ title, onMenuClick }) {
  const { t } = useContext(AppContext);

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
    </header>
  );
}

