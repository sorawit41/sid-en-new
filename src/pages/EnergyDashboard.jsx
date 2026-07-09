import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { Zap, Flame, DollarSign, Target, Clock, LeafyGreen, Filter } from 'lucide-react';

const GHG_ELEC = 0.4999;
const GHG_HEAT = 0.0682;
const MJ_PER_KWH = 3.6;

const fmt = (v, d = 0) => (v || 0).toLocaleString('en-US', { maximumFractionDigits: d });

export default function EnergyDashboard() {
  const { data, t } = useContext(AppContext);
  const [filterFact, setFilterFact] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterType, setFilterType] = useState('');

  const factories = [...new Set(data.equipments.map(e => e.factory).filter(Boolean))];
  const years = [...new Set(data.measures.map(m => m.date?.slice(0,4)).filter(Boolean))].sort().reverse();

  const ms = useMemo(() => {
    return data.measures.filter(m => {
      if (filterCat && m.catId !== filterCat) return false;
      if (filterFact && m.factory !== filterFact) return false;
      if (filterYear && m.date?.slice(0,4) !== filterYear) return false;
      
      const isUpgrade = m.isUpgrade || 
                        m.measName.includes('อัปเกรด') || 
                        m.measName.includes('Upgrade') || 
                        m.measName.includes('เปลี่ยน') || 
                        m.measName.includes('ติดตั้ง VSD') || 
                        m.measName.includes('ติดตั้งอินเวอร์เตอร์') || 
                        m.measName.includes('ติดตั้งเครื่องประหยัด');
                        
      if (filterType === 'upgrade' && !isUpgrade) return false;
      if (filterType === 'maintenance' && isUpgrade) return false;
      
      return true;
    });
  }, [data, filterFact, filterCat, filterYear, filterType]);

  const emissionFactor = data?.settings?.emissionFactors?.find(ef => ef.id === 'ef_elec')?.value || GHG_ELEC;

  const totalElec = ms.filter(m => m.energyType !== 'heat').reduce((a, m) => a + (m.kWhYear || 0), 0);
  const totalHeat = ms.filter(m => m.energyType === 'heat').reduce((a, m) => a + (m.kWhYear || 0), 0);
  const totalBaht = ms.reduce((a, m) => a + (m.bahtYear || 0), 0);

  const ghgElecVal = totalElec * emissionFactor / 1000;
  const ghgHeatVal = totalHeat * MJ_PER_KWH * GHG_HEAT / 1000;
  const totalGHG = ghgElecVal + ghgHeatVal;
  
  const pbMeasures = ms.filter(m => m.payback > 0);
  const avgPayback = pbMeasures.length ? (pbMeasures.reduce((a,m) => a + m.payback, 0) / pbMeasures.length).toFixed(1) : null;

  const totalEnergy = totalElec + totalHeat || 1;
  const ghgElec = ghgElecVal.toFixed(1);
  const ghgHeat = ghgHeatVal.toFixed(1);
  const pE = ((totalElec / totalEnergy) * 100).toFixed(1);
  const pH = ((totalHeat / totalEnergy) * 100).toFixed(1);
  const circ = 2 * Math.PI * 40;
  const dE = (totalElec / totalEnergy) * circ;
  const dH = (totalHeat / totalEnergy) * circ;

  const byMeas = {};
  ms.forEach(m => {
    if (!byMeas[m.measName]) byMeas[m.measName] = { kWh: 0, baht: 0, cnt: 0 };
    byMeas[m.measName].kWh += (m.kWhYear || 0);
    byMeas[m.measName].cnt++;
  });
  const sortedMeas = Object.entries(byMeas).sort((a,b) => b[1].kWh - a[1].kWh);
  const maxMeasKWh = sortedMeas[0]?.[1]?.kWh || 1;

  const factorySummary = useMemo(() => {
    const factList = data.factories || [];
    return factList.map(f => {
      // Find all measures matching this factory
      const fMs = data.measures.filter(m => m.factory === f.name);
      
      // Filter according to category, year, and type
      const filteredFMs = fMs.filter(m => {
        if (filterCat && m.catId !== filterCat) return false;
        if (filterYear && m.date?.slice(0,4) !== filterYear) return false;
        
        const isUpgrade = m.isUpgrade || 
                          m.measName.includes('อัปเกรด') || 
                          m.measName.includes('Upgrade') || 
                          m.measName.includes('เปลี่ยน') || 
                          m.measName.includes('ติดตั้ง VSD') || 
                          m.measName.includes('ติดตั้งอินเวอร์เตอร์') || 
                          m.measName.includes('ติดตั้งเครื่องประหยัด');
                          
        if (filterType === 'upgrade' && !isUpgrade) return false;
        if (filterType === 'maintenance' && isUpgrade) return false;
        
        return true;
      });

      const elec = filteredFMs.filter(m => m.energyType !== 'heat').reduce((a, m) => a + (m.kWhYear || 0), 0);
      const heat = filteredFMs.filter(m => m.energyType === 'heat').reduce((a, m) => a + (m.kWhYear || 0), 0);
      const cost = filteredFMs.reduce((a, m) => a + (m.bahtYear || 0), 0);
      const ghg = (elec * emissionFactor / 1000) + (heat * MJ_PER_KWH * GHG_HEAT / 1000);

      return {
        name: f.name,
        location: f.location,
        elec: elec / 1000,
        heat: heat * MJ_PER_KWH / 1000,
        ghg,
        cost,
        count: filteredFMs.length
      };
    });
  }, [data, filterCat, filterYear, filterType, emissionFactor]);

  const maxFactoryCost = useMemo(() => {
    return Math.max(...factorySummary.map(f => f.cost), 1);
  }, [factorySummary]);

  return (
    <div className="animate-slide-up space-y-8 pb-12 select-none">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-text">
          {t('energy_summary')}
        </h2>
        <p className="text-xs md:text-sm text-muted mt-1">{t('system_desc')}</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={<Zap size={18} />} label={t('elec_savings')} val={fmt(totalElec/1000, 1)} unit="MWh/yr" color="blue" />
        <StatCard icon={<Flame size={18} />} label={t('heat_savings')} val={fmt(totalHeat*MJ_PER_KWH/1000, 1)} unit="GJ/yr" color="amber" />
        <StatCard icon={<LeafyGreen size={18} />} label={t('ghg_reduction')} val={fmt(totalGHG, 1)} unit="tCO₂e/yr" color="emerald" />
        <StatCard icon={<DollarSign size={18} />} label={t('cost_savings')} val={fmt(totalBaht/1e6, 2)} unit="Million THB/yr" color="indigo" />
        <StatCard icon={<Target size={18} />} label={t('total_measures')} val={ms.length} unit={t('total_measures')} color="violet" />
        <StatCard icon={<Clock size={18} />} label={t('avg_payback')} val={avgPayback ? `${avgPayback} ${t('years')}` : '-'} unit={t('payback')} color="slate" />
      </div>

      {/* Filter panel */}
      <div className="flex gap-4 flex-wrap bg-surface/70 border border-border/60 p-5 rounded-2xl backdrop-blur-sm shadow-sm items-center">
        <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider min-w-[80px]">
          <Filter size={14} className="text-dim" /> {t('filter_by')}
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
          <div>
            <select className="w-full p-2.5 bg-bg/50 border border-border rounded-xl text-xs font-semibold outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all" value={filterFact} onChange={e => setFilterFact(e.target.value)}>
              <option value="">{t('all_factories')}</option>
              {factories.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <select className="w-full p-2.5 bg-bg/50 border border-border rounded-xl text-xs font-semibold outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">{t('all_categories')}</option>
              {data.cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <select className="w-full p-2.5 bg-bg/50 border border-border rounded-xl text-xs font-semibold outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
              <option value="">{t('all_years')}</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <select className="w-full p-2.5 bg-bg/50 border border-border rounded-xl text-xs font-semibold outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">{t('all_measures')}</option>
              <option value="upgrade">{t('upgrades_only')}</option>
              <option value="maintenance">{t('maintenance_only')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title={t('savings_by_measure')}>
          {sortedMeas.length > 0 ? (
            <div className="space-y-5">
              {sortedMeas.map(([name, v]) => (
                <div key={name} className="group">
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-text group-hover:text-accent transition-colors">{t(name) || name}</span>
                    <span className="text-muted font-mono">{fmt(v.kWh / 1000, 1)} MWh</span>
                  </div>
                  <div className="h-2 rounded bg-card2 overflow-hidden border border-border/40">
                    <div 
                      className="h-full rounded bg-accent animate-draw-progress" 
                      style={{ width: `${(v.kWh / maxMeasKWh * 100).toFixed(1)}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyState text={t('no_measures')} />}
        </ChartCard>

        <ChartCard title={t('energy_proportion')}>
          {ms.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-8 py-2">
              <div className="relative shrink-0 select-none">
                <svg width="120" height="120" viewBox="0 0 100 100" className="rotate-[-90deg]">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="10" className="opacity-40" />
                  
                  {/* Electricity fill ring */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="var(--accent)" 
                    strokeWidth="10" 
                    strokeDasharray={`${dE.toFixed(1)} ${circ.toFixed(1)}`} 
                    strokeDashoffset="0" 
                    strokeLinecap="round" 
                    className="transition-all duration-1000 ease-out"
                  />
                  
                  {/* Heat fill ring */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="var(--warn)" 
                    strokeWidth="10" 
                    strokeDasharray={`${dH.toFixed(1)} ${circ.toFixed(1)}`} 
                    strokeDashoffset={`-${dE.toFixed(1)}`} 
                    strokeLinecap="round" 
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{t('ratio')}</span>
                  <span className="text-sm font-bold text-text">{pE}%</span>
                </div>
              </div>

              <div className="space-y-3 flex-1 w-full">
                <div className="flex items-center justify-between p-2 rounded bg-card2 border border-border/40">
                  <div className="flex items-center gap-2 text-xs font-bold text-text">
                    <div className="w-2.5 h-2.5 rounded bg-accent" /> {t('electricity')}
                  </div>
                  <span className="text-xs font-mono font-bold text-muted">{pE}%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-card2 border border-border/40">
                  <div className="flex items-center gap-2 text-xs font-bold text-text">
                    <div className="w-2.5 h-2.5 rounded bg-warn" /> {t('heat')}
                  </div>
                  <span className="text-xs font-mono font-bold text-muted">{pH}%</span>
                </div>
                
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-bold text-text">{t('total_ghg_savings')}</span>
                  <span className="text-sm font-bold text-good font-mono">
                    {fmt(parseFloat(ghgElec) + parseFloat(ghgHeat), 1)} tCO₂e
                  </span>
                </div>
              </div>
            </div>
          ) : <EmptyState text={t('no_measures')} />}
        </ChartCard>
      </div>

      {/* Energy Summary by Factory list */}
      <ChartCard title={t('savings_by_factory')}>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] text-muted uppercase tracking-wider bg-card2/50 border-y border-border/40">
              <tr>
                <th className="py-3.5 px-4 font-bold">{t('factory')}</th>
                <th className="py-3.5 px-4 font-bold text-center">{t('stat_measures')}</th>
                <th className="py-3.5 px-4 font-bold">{t('elec_savings')}</th>
                <th className="py-3.5 px-4 font-bold">{t('heat_savings')}</th>
                <th className="py-3.5 px-4 font-bold">{t('ghg_reduction')}</th>
                <th className="py-3.5 px-4 font-bold">{t('cost_savings')}</th>
                <th className="py-3.5 px-4 font-bold w-[180px]">{t('total_savings')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {factorySummary.map(f => (
                <tr 
                  key={f.name} 
                  onClick={() => setFilterFact(f.name === filterFact ? '' : f.name)}
                  className={`hover:bg-card2/35 transition-colors cursor-pointer ${filterFact === f.name ? 'bg-accent/5 font-bold' : ''}`}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-text flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${filterFact === f.name ? 'bg-accent' : 'bg-transparent'}`} />
                      {f.name}
                    </div>
                    <div className="text-[10px] text-muted font-medium mt-0.5">{f.location}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-center">{f.count}</td>
                  <td className="py-3.5 px-4 font-mono font-medium">{fmt(f.elec, 1)} MWh/yr</td>
                  <td className="py-3.5 px-4 font-mono font-medium">{fmt(f.heat, 1)} GJ/yr</td>
                  <td className="py-3.5 px-4 text-emerald-500 font-bold font-mono">{fmt(f.ghg, 1)} tCO₂e</td>
                  <td className="py-3.5 px-4 text-indigo-500 font-bold font-mono">{fmt(f.cost)} THB/yr</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded bg-card2 overflow-hidden border border-border/40">
                        <div 
                          className="h-full rounded bg-accent transition-all duration-500" 
                          style={{ width: `${(f.cost / maxFactoryCost * 100).toFixed(1)}%` }} 
                        />
                      </div>
                      <span className="text-[10px] text-muted font-mono w-8 text-right">{((f.cost / maxFactoryCost) * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Measures Table list */}
      <ChartCard title={t('all_energy_measures')}>
        {ms.length > 0 ? (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-muted uppercase tracking-wider bg-card2/50 border-y border-border/40">
                <tr>
                  <th className="py-3.5 px-4 font-bold">{t('equipment')}</th>
                  <th className="py-3.5 px-4 font-bold">{t('factory')}</th>
                  <th className="py-3.5 px-4 font-bold">{t('measure_name')}</th>
                  <th className="py-3.5 px-4 font-bold">{t('save_pct')}</th>
                  <th className="py-3.5 px-4 font-bold">{t('kwh_yr')}</th>
                  <th className="py-3.5 px-4 font-bold">{t('thb_yr')}</th>
                  <th className="py-3.5 px-4 font-bold">{t('payback')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {[...ms].sort((a,b) => b.kWhYear - a.kWhYear).map((m, idx) => (
                  <tr key={idx} className="hover:bg-card2/25 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-text">{m.eqTag || '—'}</td>
                    <td className="py-3.5 px-4 text-muted font-medium">{m.factory || '—'}</td>
                    <td className="py-3.5 px-4 text-text font-semibold">{t(m.measName) || m.measName}</td>
                    <td className="py-3.5 px-4 text-accent font-bold">{(m.pct || 0).toFixed(1)}%</td>
                    <td className="py-3.5 px-4 font-mono font-medium">{fmt(m.kWhYear)}</td>
                    <td className="py-3.5 px-4 text-indigo-500 font-bold font-mono">{fmt(m.bahtYear)}</td>
                    <td className="py-3.5 px-4 font-semibold text-amber-500">{m.payback > 0 ? `${m.payback.toFixed(1)} ${t('years').slice(0, 2)}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState text={t('no_measures')} />}
      </ChartCard>
    </div>
  );
}

function StatCard({ icon, label, val, unit, color }) {
  const colorMap = {
    blue: { text: 'text-accent', bg: 'bg-accent/10 border-accent/20' },
    amber: { text: 'text-warn', bg: 'bg-warn/10 border-warn/25' },
    emerald: { text: 'text-good', bg: 'bg-good/10 border-good/25' },
    indigo: { text: 'text-accent', bg: 'bg-accent/10 border-accent/20' },
    violet: { text: 'text-accent', bg: 'bg-accent/10 border-accent/20' },
    slate: { text: 'text-muted', bg: 'bg-card2 border-border/60' },
  };

  const current = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between hover-lift">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-muted uppercase tracking-wider">{label}</span>
        <div className={`p-1.5 rounded-lg border ${current.bg} ${current.text} shrink-0`}>
          {icon}
        </div>
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold text-text font-mono tracking-tight">{val}</div>
        <div className="text-[10px] text-muted font-bold mt-1 uppercase tracking-wide">{unit}</div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-bold text-text mb-6 pb-2 border-b border-border/60">
        {title}
      </h3>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="text-center py-10 text-muted">
      <p className="text-xs font-semibold">{text}</p>
    </div>
  );
}
