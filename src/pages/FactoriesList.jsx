import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { Factory as FactoryIcon, MapPin, Activity, Zap, TrendingDown } from 'lucide-react';

export default function FactoriesList() {
  const { data, t } = useContext(AppContext);
  const factories = data.factories || [];

  return (
    <div className="animate-slide-up space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-text">All Factories</h1>
        <p className="text-sm text-muted">Overview of all industrial facilities and their energy metrics</p>
      </div>

      {/* Grid of factories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {factories.map(factory => {
          // Calculate stats for this factory
          const factoryEquips = data.equipments.filter(e => e.factory === factory.name);
          const factoryMeasures = data.measures.filter(m => m.factory === factory.name);
          
          const totalEnergyUse = factoryEquips.reduce((sum, e) => sum + (e.energyUseYear || 0), 0);
          const totalCost = factoryEquips.reduce((sum, e) => sum + (e.costYear || 0), 0);
          const potentialSavings = factoryMeasures.reduce((sum, m) => sum + (m.bahtYear || 0), 0);
          
          return (
            <Link 
              key={factory.id} 
              to={`/factories/${factory.id}`}
              className="group block bg-surface rounded-2xl border border-border overflow-hidden hover:border-accent hover:shadow-md hover:shadow-accent/5 transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300">
                    <FactoryIcon size={24} />
                  </div>
                  <div className="px-3 py-1 bg-surface-alt rounded-full text-xs font-semibold text-muted flex items-center gap-1.5">
                    <MapPin size={12} />
                    {factory.location}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-text mb-1 group-hover:text-accent transition-colors">{factory.name}</h3>
                <p className="text-xs text-muted mb-6 line-clamp-2 min-h-[32px]">{factory.desc}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-bg/50 p-3 rounded-xl border border-border/50">
                    <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
                      <Activity size={14} className="text-accent" />
                      Equipments
                    </div>
                    <div className="font-bold text-text text-lg">{factoryEquips.length}</div>
                  </div>
                  
                  <div className="bg-bg/50 p-3 rounded-xl border border-border/50">
                    <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
                      <Zap size={14} className="text-amber-500" />
                      Energy (kWh)
                    </div>
                    <div className="font-bold text-text text-lg">{totalEnergyUse.toLocaleString(undefined, {maximumFractionDigits:0})}</div>
                  </div>
                  
                  <div className="col-span-2 bg-bg/50 p-3 rounded-xl border border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <TrendingDown size={14} className="text-emerald-500" />
                      Potential Savings
                    </div>
                    <div className="font-bold text-emerald-500 text-sm">
                      ฿ {potentialSavings.toLocaleString(undefined, {maximumFractionDigits:0})} / yr
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-surface-alt border-t border-border flex items-center justify-between group-hover:bg-accent/5 transition-colors">
                <span className="text-sm font-semibold text-text group-hover:text-accent transition-colors">View Details</span>
                <span className="text-muted group-hover:text-accent group-hover:translate-x-1 transition-all">→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
