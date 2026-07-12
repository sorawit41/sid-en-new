import React, { useContext, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Search, Plus, Settings, Edit, Trash2, Calculator, Snowflake, Wind, Droplets, Flame, Factory as FactoryIcon, Zap, LayoutGrid } from 'lucide-react';
import CompressorCalcModal from '../components/CompressorCalcModal';
import ChillerCalcModal from '../components/ChillerCalcModal';
import GeneralCalcModal from '../components/GeneralCalcModal';
import AddEquipmentModal from '../components/AddEquipmentModal';

const iconMap = {
  Snowflake: <Snowflake size={18} />,
  Wind: <Wind size={18} />,
  Droplets: <Droplets size={18} />,
  Flame: <Flame size={18} />,
  Factory: <FactoryIcon size={18} />,
  Zap: <Zap size={18} />,
};

export default function EquipmentRegistry() {
  const { data, setData, t, lang } = useContext(AppContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const factoryParam = searchParams.get('factory');

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [calcEq, setCalcEq] = useState(null);
  
  // Dynamic sub-category filter when viewing a specific factory
  const [selectedSubCat, setSelectedSubCat] = useState('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editEq, setEditEq] = useState(null);

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this equipment? Associated measures and inspections might be affected.')) {
      setData({ ...data, equipments: data.equipments.filter(e => e.id !== id) });
    }
  };

  // Compute category counts for this specific factory
  const categoryCounts = useMemo(() => {
    if (!factoryParam) return [];
    const factoryEquips = data.equipments.filter(e => e.factory === factoryParam);
    return data.cats.map(c => {
      const count = factoryEquips.filter(e => e.catId === c.id).length;
      return { ...c, count };
    });
  }, [data.equipments, data.cats, factoryParam]);

  const factoryEquipmentsTotal = useMemo(() => {
    if (!factoryParam) return 0;
    return data.equipments.filter(e => e.factory === factoryParam).length;
  }, [data.equipments, factoryParam]);

  const equipments = useMemo(() => {
    return data.equipments.filter(e => {
      if (factoryParam && e.factory !== factoryParam) return false;
      
      // Apply sub-category selection filter
      if (factoryParam && selectedSubCat && e.catId !== selectedSubCat) return false;
      
      // Apply main select filter
      if (filterCat && e.catId !== filterCat) return false;
      
      if (search) {
        const q = search.toLowerCase();
        return JSON.stringify(e).toLowerCase().includes(q);
      }
      return true;
    });
  }, [data.equipments, search, filterCat, factoryParam, selectedSubCat]);

  // Calculations for specific factory overview dashboard banner
  const factoryDashboardStats = useMemo(() => {
    if (!factoryParam) return null;
    
    const fEqs = data.equipments.filter(e => e.factory === factoryParam);
    const fEqIds = fEqs.map(e => e.id);
    
    // Inspections
    const fIns = data.inspections.filter(i => fEqIds.includes(i.eqId));
    const totalIns = fIns.length;
    
    // Find last audit date
    let lastDateStr = null;
    if (totalIns > 0) {
      const sortedIns = [...fIns].sort((a,b) => new Date(b.date) - new Date(a.date));
      lastDateStr = sortedIns[0].date;
    }
    
    const lastDateFormatted = lastDateStr 
      ? new Date(lastDateStr).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : (lang === 'th' ? 'ไม่มีการวัด' : 'No measurements');

    // Carbon reduction potential
    const fMeas = data.measures.filter(m => m.factory === factoryParam);
    const elec = fMeas.filter(m => m.energyType !== 'heat').reduce((a, m) => a + (m.kWhYear || 0), 0);
    const heat = fMeas.filter(m => m.energyType === 'heat').reduce((a, m) => a + (m.kWhYear || 0), 0);
    const emissionFactor = data?.settings?.emissionFactors?.find(ef => ef.id === 'ef_elec')?.value || 0.5562;
    const ghgSaved = (elec * emissionFactor / 1000) + (heat * 3.6 * 0.0682 / 1000);
    
    return {
      totalEquips: fEqs.length,
      totalIns,
      lastDate: lastDateFormatted,
      ghgSaved: parseFloat(ghgSaved.toFixed(1))
    };
  }, [data, factoryParam, lang]);

  const categorySavingsBreakdown = useMemo(() => {
    if (!factoryParam) return [];
    
    const fEqs = data.equipments.filter(e => e.factory === factoryParam);
    const fEqIds = fEqs.map(e => e.id);
    
    const fMeas = data.measures.filter(m => m.factory === factoryParam || fEqIds.includes(m.eqId));
    const emissionFactor = data?.settings?.emissionFactors?.find(ef => ef.id === 'ef_elec')?.value || 0.5562;
    
    const byCat = {};
    data.cats.forEach(c => {
      byCat[c.id] = { name: c.name, icon: c.icon, ghg: 0 };
    });
    
    fMeas.forEach(m => {
      const elec = m.energyType !== 'heat' ? (m.kWhYear || 0) : 0;
      const heat = m.energyType === 'heat' ? (m.kWhYear || 0) : 0;
      const ghg = (elec * emissionFactor / 1000) + (heat * 3.6 * 0.0682 / 1000);
      
      if (byCat[m.catId]) {
        byCat[m.catId].ghg += ghg;
      }
    });

    const list = Object.entries(byCat)
      .map(([id, item]) => ({ id, ...item }))
      .filter(item => item.ghg > 0)
      .sort((a, b) => b.ghg - a.ghg);
      
    return list;
  }, [data.measures, data.cats, factoryParam, data.settings]);
  
  const totalCatSavings = useMemo(() => {
    return categorySavingsBreakdown.reduce((a, b) => a + b.ghg, 0) || 1;
  }, [categorySavingsBreakdown]);

  return (
    <div className="animate-slide-up space-y-6 pb-12 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-text">
            {t('equipment_registry')}
          </h2>
          <p className="text-xs md:text-sm text-muted mt-1">
            {factoryParam ? `${t('factory')}: ${factoryParam}` : t('manage_equipments')}
          </p>
          {factoryParam && (
            <div className="flex items-center gap-2 mt-2">
              <button 
                onClick={() => { setSearchParams({}); setSelectedSubCat(''); }} 
                className="text-[10px] font-bold text-bad hover:underline bg-transparent border-none cursor-pointer p-0"
              >
                ← {t('clear_filter')}
              </button>
            </div>
          )}
        </div>

        <button 
          className="py-2.5 px-4 rounded-xl bg-accent hover:bg-accentHover text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-accent/15 active:scale-95 cursor-pointer border-none"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus size={14} /> {t('add_equipment')}
        </button>
      </div>

      {/* Factory Overview Dashboard Banner */}
      {factoryParam && factoryDashboardStats && (
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm relative overflow-hidden group transition-all duration-300 hover:border-accent/40 animate-fade-in flex flex-col lg:flex-row gap-6">
          
          {/* Left Block: Stats Cards */}
          <div className="flex-1 space-y-4">
            <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-3 bg-accent rounded-full" /> {t('factory_summary_title')} ({factoryParam})
            </h3>
            
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="p-4 bg-card2 border border-border/40 rounded-xl">
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">{t('total_machines_label')}</span>
                <span className="text-xl font-bold text-text font-mono block mt-1">{factoryDashboardStats.totalEquips}</span>
              </div>
              
              <div className="p-4 bg-card2 border border-border/40 rounded-xl">
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">{t('inspections_performed_label')}</span>
                <span className="text-xl font-bold text-text font-mono block mt-1">{factoryDashboardStats.totalIns}</span>
              </div>
              
              <div className="p-4 bg-card2 border border-border/40 rounded-xl">
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">{t('last_audit_date_label')}</span>
                <span className="text-sm font-bold text-text font-mono block mt-2">{factoryDashboardStats.lastDate}</span>
              </div>
              
              <div className="p-4 bg-card2 border border-border/40 rounded-xl">
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">{t('ghg_reduction_potential_label')}</span>
                <span className="text-xl font-bold text-good font-mono block mt-1">{factoryDashboardStats.ghgSaved} <span className="text-[10px] font-sans font-medium text-muted">tCO₂e/yr</span></span>
              </div>
            </div>
          </div>

          {/* Right Block: Modern Chart Graph */}
          <div className="w-full lg:w-[320px] bg-card2/30 border border-border/30 rounded-2xl p-5 flex flex-col justify-between shrink-0">
            <div>
              <h4 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                {lang === 'th' ? 'สัดส่วนคาร์บอนที่ลดได้ตามประเภท' : 'Carbon Reduction Share by Type'}
              </h4>
              
              {categorySavingsBreakdown.length > 0 ? (
                <div className="space-y-4">
                  {categorySavingsBreakdown.map(item => {
                    const pct = ((item.ghg / totalCatSavings) * 100).toFixed(0);
                    return (
                      <div key={item.id} className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-bold text-text">
                          <div className="flex items-center gap-1">
                            <span className="text-accent">{iconMap[item.icon] || <Settings size={10} />}</span>
                            <span>{item.name}</span>
                          </div>
                          <span className="font-mono text-muted">{item.ghg.toFixed(1)} tCO₂e ({pct}%)</span>
                        </div>
                        <div className="h-1.5 rounded bg-border/40 overflow-hidden">
                          <div 
                            className="h-full rounded bg-accent transition-all duration-700" 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-28 text-center text-[10px] text-muted italic">
                  {lang === 'th' ? 'ไม่มีข้อมูลการประหยัดพลังงาน' : 'No savings measures recorded'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Summary Counts Grid for Active Factory */}
      {factoryParam && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            {lang === 'th' ? 'สรุปจำนวนเครื่องจักรตามประเภท' : 'Equipment Category Breakdown'}
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {/* All card option */}
            <div 
              onClick={() => setSelectedSubCat('')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-24 ${selectedSubCat === '' ? 'border-accent bg-accent/5 ring-1 ring-accent/30 shadow-sm' : 'border-border bg-surface hover:border-accent/40'}`}
            >
              <div className="flex justify-between items-start text-muted">
                <LayoutGrid size={16} className={selectedSubCat === '' ? 'text-accent' : 'text-dim'} />
              </div>
              <div className="mt-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted line-clamp-1">{t('all_types')}</div>
                <div className="text-lg font-bold text-text mt-0.5 font-mono">
                  {factoryEquipmentsTotal} <span className="text-[10px] text-muted font-sans font-medium">{t('units')}</span>
                </div>
              </div>
            </div>

            {/* Category lists cards */}
            {categoryCounts.map(c => {
              const IconComp = iconMap[c.icon] || <Settings size={16} />;
              const isSelected = selectedSubCat === c.id;
              
              return (
                <div 
                  key={c.id}
                  onClick={() => setSelectedSubCat(c.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-24 ${c.count === 0 ? 'opacity-55 hover:opacity-100' : ''} ${isSelected ? 'border-accent bg-accent/5 ring-1 ring-accent/30 shadow-sm' : 'border-border bg-surface hover:border-accent/40'}`}
                >
                  <div className="flex justify-between items-start text-muted">
                    <span className={isSelected ? 'text-accent' : 'text-dim'}>{IconComp}</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted line-clamp-1" title={c.name}>{c.name}</div>
                    <div className="text-lg font-bold text-text mt-0.5 font-mono">
                      {c.count} <span className="text-[10px] text-muted font-sans font-medium">{t('units')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Control panel bar */}
      <div className="flex gap-3 flex-wrap items-center bg-surface/70 border border-border/60 p-4 rounded-2xl backdrop-blur-sm shadow-sm">
        <div className="flex-1 min-w-[240px] relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input 
            type="text" 
            placeholder={t('search_placeholder')} 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full py-2.5 px-4 pl-10 bg-bg/50 border border-border rounded-xl text-xs font-semibold transition-all focus:border-accent focus:ring-4 focus:ring-accent/5 focus:bg-surface outline-none"
          />
        </div>
        
        <div className="flex gap-2 shrink-0 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <select 
              className="w-full py-2.5 px-4 bg-bg/50 border border-border rounded-xl text-xs font-bold outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all cursor-pointer"
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
            >
              <option value="">{t('all_categories')}</option>
              {data.cats.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Equipment List Grid */}
      {equipments.length > 0 ? (
        <div className="grid gap-3.5 animate-fade-in">
          {equipments.map(e => {
            const cat = data.cats.find(c => c.id === e.catId) || { name: 'Unknown', icon: 'Settings' };
            const ic = data.inspections.filter(i => i.eqId === e.id).length;
            const mc = data.measures.filter(m => m.eqId === e.id).length;
            const IconComp = iconMap[cat.icon] || <Settings size={18} />;

            return (
              <div 
                key={e.id} 
                className="bg-surface border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-accent/40 hover:shadow-md hover:shadow-accent/[0.02] group animate-fade-in"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-accent bg-accent/5 border border-accent/10 transition-transform duration-300">
                    {IconComp}
                  </div>
                  
                  <div className="min-w-0">
                    <div className="text-[15px] font-bold text-text flex items-center gap-2">
                      {e.tag}
                      <span className="text-[9px] font-bold text-muted bg-card2 px-2 py-0.5 rounded border border-border/60">
                        {cat.name}
                      </span>
                    </div>
                    <div className="text-xs text-muted mt-0.5 font-medium">
                      {[e.brand, e.model].filter(Boolean).join(' · ') || t('no_brand_info')}
                    </div>
                    
                    <div className="text-[10px] text-muted font-bold mt-2.5 flex gap-2 flex-wrap items-center">
                      {e.factory && (
                        <span className="bg-card2 border border-border/40 px-2 py-0.5 rounded text-text">
                          {e.factory}
                        </span>
                      )}
                      <span className="bg-accent/10 border border-accent/20 text-accent px-2 py-0.5 rounded">
                        {ic} {t('stat_inspections')}
                      </span>
                      {mc > 0 && (
                        <span className="bg-good/10 border border-good/20 text-good px-2 py-0.5 rounded">
                          {mc} {t('stat_measures')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="flex gap-2 shrink-0 sm:self-center self-end">
                  <button 
                    className="p-2.5 rounded border border-border bg-surface text-slate-500 hover:text-accent hover:border-accent/40 hover:bg-accent/5 transition-all active:scale-90 cursor-pointer shadow-sm flex items-center justify-center" 
                    title={t('audit_calculation')}
                    onClick={() => setCalcEq(e)}
                  >
                    <Calculator size={15} />
                  </button>
                  <button 
                    className="p-2.5 rounded border border-border bg-surface text-slate-500 hover:text-accent hover:border-accent/40 hover:bg-accent/5 transition-all active:scale-90 cursor-pointer shadow-sm flex items-center justify-center" 
                    title={t('edit_specification')}
                    onClick={() => setEditEq(e)}
                  >
                    <Edit size={15} />
                  </button>
                  <button 
                    className="p-2.5 rounded border border-border bg-surface text-slate-500 hover:text-bad hover:border-bad/40 hover:bg-red-500/10 transition-all active:scale-90 cursor-pointer shadow-sm flex items-center justify-center" 
                    title={t('delete_equipment')}
                    onClick={() => handleDelete(e.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-surface border-2 border-dashed border-border/40 rounded-2xl space-y-4 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-card2 border border-border/60 flex items-center justify-center">
            <Settings size={28} className="text-muted opacity-40" />
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-text mb-1">
              {lang === 'th' ? 'ไม่พบอุปกรณ์' : 'No Equipment Found'}
            </p>
            <p className="text-xs text-muted">
              {search || filterCat || selectedSubCat
                ? (lang === 'th' ? 'ลองเปลี่ยนตัวกรองหรือล้างการค้นหา' : 'Try adjusting your filters or search')
                : (lang === 'th' ? 'เริ่มต้นด้วยการเพิ่มอุปกรณ์ชิ้นแรก' : 'Start by adding your first equipment')}
            </p>
          </div>
          {!search && !filterCat && !selectedSubCat && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accentHover text-white text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer border-none shadow-sm"
            >
              <Plus size={14} /> {t('add_equipment')}
            </button>
          )}
          {(search || filterCat || selectedSubCat) && (
            <button
              onClick={() => { setSearch(''); setFilterCat(''); setSelectedSubCat(''); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-card2 hover:bg-border text-muted text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer border border-border"
            >
              {t('clear_filter')}
            </button>
          )}
        </div>
      )}

      {calcEq && calcEq.catId === 'compressor' && (
        <CompressorCalcModal 
          isOpen={!!calcEq} 
          onClose={() => setCalcEq(null)} 
          equipment={calcEq} 
        />
      )}
      
      {calcEq && calcEq.catId === 'chiller' && (
        <ChillerCalcModal 
          isOpen={!!calcEq} 
          onClose={() => setCalcEq(null)} 
          equipment={calcEq} 
        />
      )}

      {calcEq && calcEq.catId !== 'chiller' && calcEq.catId !== 'compressor' && (
        <GeneralCalcModal 
          isOpen={!!calcEq} 
          onClose={() => setCalcEq(null)} 
          equipment={calcEq} 
        />
      )}

      {/* Add / Edit Equipment Modal */}
      {(isAddOpen || editEq) && (
        <AddEquipmentModal 
          isOpen={isAddOpen || !!editEq}
          onClose={() => { setIsAddOpen(false); setEditEq(null); }}
          equipment={editEq}
        />
      )}
    </div>
  );
}
