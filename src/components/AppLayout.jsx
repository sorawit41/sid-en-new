import React, { useState, useContext, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AddEquipmentModal from './AddEquipmentModal';
import { AppContext } from '../context/AppContext';

export default function AppLayout() {
  const { data } = useContext(AppContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAddEquipOpen, setIsAddEquipOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const theme = data?.settings?.theme;
    const html = document.documentElement;
    html.classList.remove('dark', 'corporate');
    if (theme === 'Dark Mode') {
      html.classList.add('dark');
    } else if (theme === 'Corporate Mode') {
      html.classList.add('corporate');
    }
  }, [data?.settings?.theme]);
  
  let title = 'Dashboard';
  if (location.pathname.startsWith('/energy')) title = 'Energy Summary';
  if (location.pathname.startsWith('/equip')) title = 'Equipment Registry';
  if (location.pathname.startsWith('/history')) title = 'Inspections History';
  if (location.pathname.startsWith('/report')) title = 'Reports';
  if (location.pathname.startsWith('/cat/')) title = 'Category Detail';
  if (location.pathname === '/factories') title = 'All Factories';
  if (location.pathname.startsWith('/factories/')) title = 'Factory Details';

  return (
    <div className="flex flex-row min-h-screen bg-bg">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isCollapsed}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      
      <div className={`flex-1 flex flex-col min-h-screen transition-[margin] duration-300 ${isCollapsed ? 'md:ml-[80px]' : 'md:ml-[260px]'}`}>
        <Topbar 
          title={title} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />
        
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </div>

      <AddEquipmentModal 
        isOpen={isAddEquipOpen} 
        onClose={() => setIsAddEquipOpen(false)} 
      />
    </div>
  );
}
