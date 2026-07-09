import React, { useContext, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { LayoutDashboard, Zap, FileText, Settings, History, LogOut, ShieldCheck, ChevronLeft, ChevronRight, User as UserIcon, Sliders, Sun, Moon, BookOpen, Factory } from 'lucide-react';
import logoImg from '../assets/Logo.png';

export default function Sidebar({ isOpen, onClose, isCollapsed, toggleCollapse }) {
  const { user, logout, data, t } = useContext(AppContext);
  const [isDark, setIsDark] = useState(false);

  // Sync state with HTML classlist
  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    // Observe class changes on html
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleThemeToggle = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <>
      {/* Backdrop (mobile) */}
      <div 
        className={`fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside className={`min-h-screen bg-surface/90 backdrop-blur-xl border-r border-border/80 flex flex-col fixed top-0 bottom-0 left-0 z-50 transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isCollapsed ? 'w-[80px]' : 'w-[260px]'}`}>
        
        {/* Brand Header */}
        <div className="p-4 pb-4 border-b border-border/50 relative">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} mb-5 transition-all duration-300`}>
            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
              <img src={logoImg} alt="Logo" className="w-full h-full object-contain drop-shadow-sm" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap animate-fade-in">
                <div className="text-[15px] font-bold text-text tracking-wide">ENGINSPECT</div>
                <div className="text-[10px] text-muted font-semibold">Audit System</div>
              </div>
            )}
          </div>
          
          <button 
            onClick={toggleCollapse}
            className="absolute -right-3 top-[22px] w-6 h-6 bg-surface border border-border rounded-full flex items-center justify-center text-muted hover:text-accent hover:border-accent z-50 hidden md:flex transition-all hover:scale-110 active:scale-95 shadow-sm"
          >
            {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
          
          {/* User profile capsule */}
          <div className={`flex items-center gap-3 p-2.5 rounded-xl bg-card2/60 border border-border/40 ${isCollapsed ? 'justify-center' : ''} transition-all`}>
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-[13px] font-bold text-accent shrink-0 border border-accent/20">
              {user?.initials || user?.name?.[0] || 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 overflow-hidden animate-fade-in">
                <div className="text-xs font-semibold text-text truncate">{user?.name || 'Guest'}</div>
                <div className="text-[10px] text-muted font-medium mt-0.5">{user?.role || 'User'}</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation list */}
        <nav className={`flex-1 py-5 overflow-y-auto custom-scrollbar space-y-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {!isCollapsed && <div className="text-xs font-bold text-muted/80 px-3 mb-2">{t('main')}</div>}
          
          <NavItem to="/" icon={<LayoutDashboard size={18} />} label={t('dashboard')} count={0} isCollapsed={isCollapsed} />
          <NavItem to="/factories" icon={<Factory size={18} />} label="Factories" count={data?.factories?.length} isCollapsed={isCollapsed} />
          <NavItem to="/energy" icon={<Zap size={18} />} label={t('energy_summary')} count={data?.measures?.length} isCollapsed={isCollapsed} />
          <NavItem to="/report" icon={<FileText size={18} />} label={t('reports')} count={data?.reports?.length} isCollapsed={isCollapsed} />
          
          {!isCollapsed && <div className="text-xs font-bold text-muted/80 px-3 mb-2 mt-6">{t('database')}</div>}
          
          <NavItem to="/equip" icon={<Settings size={18} />} label={t('equipments')} count={data?.equipments?.length} isCollapsed={isCollapsed} />
          <NavItem to="/history" icon={<History size={18} />} label={t('inspections')} count={data?.inspections?.length} isCollapsed={isCollapsed} />

          {!isCollapsed && <div className="text-xs font-bold text-muted/80 px-3 mb-2 mt-6">{t('upgrade')}</div>}
          <NavItem to="/catalog" icon={<BookOpen size={18} />} label={t('catalog')} isCollapsed={isCollapsed} />

          {!isCollapsed && <div className="text-xs font-bold text-muted/80 px-3 mb-2 mt-6">{t('preferences')}</div>}

          <NavItem to="/account" icon={<UserIcon size={18} />} label={t('account_settings')} isCollapsed={isCollapsed} />
          <NavItem to="/system" icon={<Sliders size={18} />} label={t('system_settings')} isCollapsed={isCollapsed} />
        </nav>

        {/* Footer Actions */}
        <div className={`p-3 border-t border-border/50 flex gap-2 ${isCollapsed ? 'flex-col items-center' : ''}`}>
          <button 
            className={`flex-1 p-2 rounded-lg text-muted hover:bg-card2 hover:text-text transition-all duration-300 flex items-center justify-center gap-2 text-xs font-semibold ${isCollapsed ? 'w-9 h-9 p-0' : 'px-3'} active:scale-95 border-none cursor-pointer`}
            onClick={handleThemeToggle}
            title={t('theme')}
          >
            <div className={`transition-transform duration-500 ${isDark ? 'rotate-180 text-yellow-400' : 'rotate-0 text-slate-500'}`}>
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </div>
            {!isCollapsed && <span>{isDark ? t('theme_light') : t('theme_dark')}</span>}
          </button>
          <button 
            className={`flex-1 p-2 rounded-lg text-muted hover:bg-red-500/10 hover:text-bad transition-all duration-300 flex items-center justify-center gap-2 text-xs font-semibold ${isCollapsed ? 'w-9 h-9 p-0' : 'px-3'} active:scale-95 border-none cursor-pointer`}
            onClick={logout}
            title={t('logout')}
          >
            <LogOut size={16} /> {!isCollapsed && <span>{t('logout')}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

function NavItem({ to, icon, label, count, isCollapsed }) {
  return (
    <NavLink 
      to={to} 
      title={isCollapsed ? label : ''}
      className={({isActive}) => `flex items-center gap-3 p-2.5 rounded-xl text-[13px] w-full text-left transition-all duration-300 relative group active:scale-[0.98] border ${isActive ? 'bg-accent/10 text-accent font-bold border-accent/20' : 'text-muted hover:bg-card2/80 hover:text-text border-transparent'} ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
    >
      {({isActive}) => (
        <>
          <span className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-accent' : 'text-muted'}`}>{icon}</span>
          {!isCollapsed && <span className="flex-1 whitespace-nowrap overflow-hidden transition-all duration-300">{label}</span>}
          {!isCollapsed && count !== undefined && count > 0 && (
            <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full min-w-[20px] text-center border transition-colors duration-300 ${isActive ? 'bg-accent text-white border-accent' : 'bg-border/40 text-text border-border'}`}>
              {count}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}
