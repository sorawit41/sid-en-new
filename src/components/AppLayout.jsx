import React, { useState, useContext, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AddEquipmentModal from './AddEquipmentModal';
import { AppContext } from '../context/AppContext';

export default function AppLayout() {
  const { data } = useContext(AppContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
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
  if (location.pathname.startsWith('/factories/')) {
    const factoryId = location.pathname.split('/')[2];
    const factory = data?.factories?.find(f => f.id === factoryId);
    title = factory ? factory.name : 'Factory Details';
  }

  return (
    <div className="flex flex-row min-h-screen bg-bg">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isCollapsed}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      
      <div className={`flex-1 flex flex-col min-h-screen min-w-0 ${isCollapsed ? 'md:ml-[80px]' : 'md:ml-[260px]'} transition-all duration-300 ease-in-out`}>
        <Topbar 
          title={title} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />
        
        <div className="flex-1 min-w-0 p-4 md:p-8 overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
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
