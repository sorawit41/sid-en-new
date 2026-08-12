import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { Factory as FactoryIcon, MapPin, Activity, Zap, TrendingDown, Plus, X, Building, ArrowLeft } from 'lucide-react';

export default function FactoriesList() {
  const { data, setData, t, user } = useContext(AppContext);
  const factories = data.factories || [];

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newFactory, setNewFactory] = useState({ name: '', location: '', desc: '' });

  const handleAddFactory = (e) => {
    e.preventDefault();
    if (!newFactory.name.trim()) return;

    const added = {
      id: 'fac_' + Date.now(),
      name: newFactory.name.trim(),
      location: newFactory.location.trim() || 'Unknown',
      desc: newFactory.desc.trim()
    };
    
    setData({
      ...data,
      factories: [...factories, added]
    });
    setNewFactory({ name: '', location: '', desc: '' });
    setIsAddOpen(false);
  };

  if (isAddOpen) {
    return (
      <div className="animate-fade-in max-w-4xl mx-auto space-y-6 pb-20">
        <form onSubmit={handleAddFactory} className="space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <h2 className="text-xl font-bold text-text">
                {t?.lang === 'th' ? '➕ เพิ่มโรงงานใหม่' : 'Add New Factory'}
              </h2>
              <p className="text-sm text-muted mt-1">
                {t?.lang === 'th' ? 'กรอกข้อมูลรายละเอียดของโรงงานให้ครบถ้วน' : 'Fill in the factory details below'}
              </p>
            </div>
            <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-1.5 bg-surface text-text cursor-pointer">
              <ArrowLeft size={16} /> {t('cancel') || 'Cancel'}
            </button>
          </div>

          {/* Section 1: Identification */}
          <div className="bg-surface border border-border p-6 rounded-xl space-y-4 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-accent/50 group-hover:bg-accent transition-colors"></div>
            <h4 className="text-sm font-bold text-text uppercase tracking-wider mb-2 border-b border-border pb-2 flex items-center gap-2">
              <Building size={16} className="text-muted" /> Factory Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted mb-1.5">Factory Name <span className="text-red-500">*</span></label>
                <input 
                  required 
                  type="text" 
                  value={newFactory.name} 
                  onChange={e => setNewFactory({...newFactory, name: e.target.value})}
                  placeholder="e.g. Bangpoo Plant" 
                  className="w-full p-2.5 bg-bg border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all" 
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted mb-1.5">Location</label>
                <input 
                  type="text" 
                  value={newFactory.location} 
                  onChange={e => setNewFactory({...newFactory, location: e.target.value})}
                  placeholder="e.g. Samut Prakan, Thailand" 
                  className="w-full p-2.5 bg-bg border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all" 
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted mb-1.5">Description</label>
                <textarea 
                  rows="4" 
                  value={newFactory.desc} 
                  onChange={e => setNewFactory({...newFactory, desc: e.target.value})}
                  placeholder="Brief details about this facility..." 
                  className="w-full p-2.5 bg-bg border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none" 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={() => setIsAddOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-surface border border-border text-text hover:bg-slate-50 transition-colors cursor-pointer">
              {t('cancel') || 'Cancel'}
            </button>
            <button type="submit" disabled={!newFactory.name.trim()} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-accent text-white hover:bg-accentHover transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 shadow-md shadow-accent/20">
              <Plus size={16} /> Add Factory
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-text">All Factories</h1>
          <p className="text-sm text-muted">Overview of all industrial facilities and their energy metrics</p>
        </div>
        {user?.role === 'admin' && (
          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accentHover transition-colors shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus size={16} /> Add Factory
          </button>
        )}
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
                    <div className="font-bold text-text text-lg">{totalEnergyUse.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>

                  <div className="col-span-2 bg-bg/50 p-3 rounded-xl border border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <TrendingDown size={14} className="text-emerald-500" />
                      Potential Savings
                    </div>
                    <div className="font-bold text-emerald-500 text-sm">
                      ฿ {potentialSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })} / yr
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
