import React, { useContext, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ArrowLeft, MapPin, Factory as FactoryIcon, Activity, Zap, DollarSign, TrendingDown, Clock, Leaf, Settings, LayoutGrid, Snowflake, Wind, Droplets, Flame, Plus, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import AddEquipmentModal from '../components/AddEquipmentModal';

const iconMap = {
  Snowflake: <Snowflake size={18} />,
  Wind: <Wind size={18} />,
  Droplets: <Droplets size={18} />,
  Flame: <Flame size={18} />,
  Factory: <FactoryIcon size={18} />,
  Zap: <Zap size={18} />,
};

const MONTH_KEYS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_KEYS_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

const CATALOG_COSTS = {
  chiller: 3800000,
  compressor: 1100000,
  pump: 250000,
  boiler: 2400000,
  cooling: 500000,
  electrical: 1500000,
};

export default function FactoryDetail() {
  const { factoryId } = useParams();
  const navigate = useNavigate();
  const { data, setData, t, lang } = useContext(AppContext);
  const [selectedSubCat, setSelectedSubCat] = useState('');
  const [isAddEqOpen, setIsAddEqOpen] = useState(false);
  const [budget, setBudget] = useState('');
  const [selectedEqIds, setSelectedEqIds] = useState(new Set());
  
  const factory = data.factories?.find(f => f.id === factoryId);
  const factoryParam = factory?.name;
  
  if (!factory) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-bold text-text mb-4">Factory not found</h2>
        <button onClick={() => navigate('/factories')} className="px-4 py-2 bg-accent text-white rounded-lg">
          Back to Factories
        </button>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const storedMonthly = factory.monthlyUsage?.[currentYear] || {};

  const handleMonthlyChange = (monthIndex, value) => {
    const updated = data.factories.map(f => {
      if (f.id !== factoryId) return f;
      const mu = { ...(f.monthlyUsage || {}) };
      mu[currentYear] = { ...(mu[currentYear] || {}) };
      mu[currentYear][monthIndex] = value === '' ? undefined : parseFloat(value);
      return { ...f, monthlyUsage: mu };
    });
    setData({ ...data, factories: updated });
  };

  const emissionFactor = data?.settings?.emissionFactors?.find(ef => ef.id === 'ef_elec')?.value || 0.5562;
  const carbonTaxRate = parseFloat(data?.settings?.carbonTaxRate) || 200;

  const monthlyChartData = (() => {
    const monthKeys = lang === 'th' ? MONTH_KEYS_TH : MONTH_KEYS;
    return monthKeys.map((name, i) => ({
      name,
      kWh: storedMonthly[i] != null && storedMonthly[i] !== '' ? parseFloat(storedMonthly[i]) : null,
    }));
  })();

  const filledMonths = Object.keys(storedMonthly).filter(k => storedMonthly[k] !== undefined && storedMonthly[k] !== '');
  const totalKWhRecorded = filledMonths.reduce((s, k) => s + (parseFloat(storedMonthly[k]) || 0), 0);
  const annualizedKWh = filledMonths.length > 0 ? (totalKWhRecorded / filledMonths.length) * 12 : 0;
  const annualCo2 = annualizedKWh * emissionFactor / 1000;
  const annualTax = annualCo2 * carbonTaxRate;

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

  // Equipment Replacement Advisor
  const replacementAdvisor = useMemo(() => {
    const fEqs = data.equipments.filter(e => e.factory === factoryParam);
    const currentYr = new Date().getFullYear();
    return fEqs
      .map(eq => {
        const age = eq.year ? (currentYr - parseInt(eq.year)) : 0;
        const kWh = eq.energyUseYear || 0;
        const score = kWh * (age + 1);
        const co2PerYear = (kWh * emissionFactor) / 1000;
        const taxPerYear = co2PerYear * carbonTaxRate;
        const estCost = CATALOG_COSTS[eq.catId] || 500000;
        return { ...eq, age, score, co2PerYear, taxPerYear, estCost };
      })
      .sort((a, b) => b.score - a.score);
  }, [data.equipments, factoryParam, emissionFactor, carbonTaxRate]);

  // Budget Planner - Manual checkbox selection
  const budgetNum = parseFloat(budget) || 0;

  const toggleBudgetEq = (id, estCost) => {
    setSelectedEqIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const budgetPlan = replacementAdvisor.filter(eq => selectedEqIds.has(eq.id));
  const budgetTotalSavings = budgetPlan.reduce((s, e) => s + (e.costYear || 0), 0);
  const budgetTotalCo2 = budgetPlan.reduce((s, e) => s + e.co2PerYear, 0);
  const budgetTotalCost = budgetPlan.reduce((s, e) => s + e.estCost, 0);
  const budgetRemaining = budgetNum - budgetTotalCost;

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

  // Filter data for this factory
  const equipments = data.equipments.filter(e => {
    if (e.factory !== factory.name) return false;
    if (selectedSubCat && e.catId !== selectedSubCat) return false;
    return true;
  });
  const measures = data.measures.filter(m => m.factory === factory.name);
  
  // Chart Data preparation (Simple mockup breakdown by category)
  const categoryBreakdown = useMemo(() => {
    const allEqs = data.equipments.filter(e => e.factory === factory.name);
    const breakdown = {};
    allEqs.forEach(eq => {
      if (!breakdown[eq.catId]) breakdown[eq.catId] = { name: eq.catId, energy: 0, cost: 0 };
      breakdown[eq.catId].energy += (eq.energyUseYear || 0);
      breakdown[eq.catId].cost += (eq.costYear || 0);
    });
    return Object.values(breakdown).sort((a,b) => b.energy - a.energy);
  }, [data.equipments, factory.name]);

  const potentialSavingsBaht = measures.reduce((sum, m) => sum + (m.bahtYear || 0), 0);
  const totalInvestment = measures.reduce((sum, m) => sum + (m.invest || 0), 0);

  return (
    <div className="animate-slide-up space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/factories')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface border border-border text-muted hover:text-text hover:border-accent transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text flex items-center gap-2">
              <FactoryIcon size={24} className="text-accent" />
              {factory.name}
            </h1>
            <p className="text-sm text-muted flex items-center gap-2 mt-1">
              <MapPin size={14} /> {factory.location} &bull; {factory.desc}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsAddEqOpen(true)}
          className="py-2 px-4 bg-accent hover:bg-accentHover text-white text-sm font-medium rounded-lg shadow-sm cursor-pointer border-none flex items-center gap-2 active:scale-95 transition-all"
        >
          <Plus size={16} /> {lang === 'th' ? 'เพิ่มอุปกรณ์ใหม่' : 'Add Equipment'}
        </button>
      </div>

      {/* Factory Overview Dashboard Banner */}
      {factoryParam && factoryDashboardStats && (
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm relative overflow-hidden group transition-all duration-300 hover:border-accent/40 animate-fade-in flex flex-col lg:flex-row gap-6">
          
          {/* Left Block: Stats Cards */}
          <div className="flex-1 space-y-4">
            <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-3 bg-accent rounded-full" /> {t ? t('factory_summary_title') : 'FACTORY PERFORMANCE DASHBOARD'} ({factoryParam})
            </h3>
            
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="p-4 bg-card2 border border-border/40 rounded-xl">
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">{t ? t('total_machines_label') : 'ACTIVE EQUIPMENTS'}</span>
                <span className="text-xl font-bold text-text font-mono block mt-1">{factoryDashboardStats.totalEquips}</span>
              </div>
              
              <div className="p-4 bg-card2 border border-border/40 rounded-xl">
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">{t ? t('inspections_performed_label') : 'AUDITS / MEASUREMENTS'}</span>
                <span className="text-xl font-bold text-text font-mono block mt-1">{factoryDashboardStats.totalIns}</span>
              </div>
              
              <div className="p-4 bg-card2 border border-border/40 rounded-xl">
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">{t ? t('last_audit_date_label') : 'LAST MEASUREMENT DATE'}</span>
                <span className="text-sm font-bold text-text font-mono block mt-2">{factoryDashboardStats.lastDate}</span>
              </div>
              
              <div className="p-4 bg-card2 border border-border/40 rounded-xl">
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">{t ? t('ghg_reduction_potential_label') : 'CARBON SAVINGS POTENTIAL'}</span>
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

      {/* ===== Monthly Energy & Carbon Tracker ===== */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text flex items-center gap-2">
            <Activity size={16} className="text-accent" />
            {lang === 'th' ? `บันทึกการใช้ไฟฟ้ารายเดือน (${currentYear})` : `Monthly Electricity Usage (${currentYear})`}
          </h3>
          <span className="text-[10px] text-muted">{lang === 'th' ? 'ค่าจากมิเตอร์หลักโรงงาน (kWh)' : 'From main factory meter (kWh)'}</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {(lang === 'th' ? MONTH_KEYS_TH : MONTH_KEYS).map((mName, i) => (
            <div key={i} className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-muted uppercase text-center">{mName}</label>
              <input
                type="number"
                placeholder="kWh"
                value={storedMonthly[i] ?? ''}
                onChange={e => handleMonthlyChange(i, e.target.value)}
                className="w-full p-2 text-center bg-bg/50 border border-border rounded-lg text-[11px] font-mono font-bold outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
              />
            </div>
          ))}
        </div>

        {filledMonths.length > 0 && (
          <div className="h-40 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMonthlyFd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4988C4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4988C4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted)' }} width={50} tickFormatter={v => v > 999 ? (v/1000).toFixed(0)+'k' : v} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }} formatter={v => [v ? v.toLocaleString() + ' kWh' : 'N/A', 'kWh']} />
                <Area type="monotone" dataKey="kWh" stroke="#0F2854" strokeWidth={2} fill="url(#colorMonthlyFd)" connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-border/50">
          <div className="p-3.5 bg-card2 rounded-xl border border-border/40">
            <div className="text-[9px] font-bold uppercase tracking-wider text-muted">{lang === 'th' ? 'รวมที่บันทึก' : 'Total Recorded'}</div>
            <div className="text-base font-bold text-text font-mono mt-1">{totalKWhRecorded.toLocaleString()} <span className="text-[9px] font-sans text-muted">kWh</span></div>
            <div className="text-[9px] text-muted mt-0.5">{filledMonths.length} {lang === 'th' ? 'เดือน' : 'months'}</div>
          </div>
          <div className="p-3.5 bg-card2 rounded-xl border border-border/40">
            <div className="text-[9px] font-bold uppercase tracking-wider text-muted">{lang === 'th' ? 'คาดการณ์ 1 ปี' : 'Annualized Est.'}</div>
            <div className="text-base font-bold text-amber-500 font-mono mt-1">{Math.round(annualizedKWh).toLocaleString()} <span className="text-[9px] font-sans text-muted">kWh/yr</span></div>
            <div className="text-[9px] text-muted mt-0.5">{lang === 'th' ? 'ค่าเฉลี่ย × 12' : 'Monthly avg × 12'}</div>
          </div>
          <div className="p-3.5 bg-card2 rounded-xl border border-green-500/30">
            <div className="text-[9px] font-bold uppercase tracking-wider text-green-600">{lang === 'th' ? 'CO₂ คาดการณ์/ปี' : 'Est. CO₂/Year'}</div>
            <div className="text-base font-bold text-green-500 font-mono mt-1">{annualCo2.toFixed(1)} <span className="text-[9px] font-sans text-muted">tCO₂e</span></div>
            <div className="text-[9px] text-muted mt-0.5">@ {emissionFactor} kgCO₂e/kWh</div>
          </div>
          <div className="p-3.5 bg-card2 rounded-xl border border-red-500/30">
            <div className="text-[9px] font-bold uppercase tracking-wider text-red-500">{lang === 'th' ? 'ภาษีคาร์บอน/ปี' : 'Carbon Tax Est./Year'}</div>
            <div className="text-base font-bold text-red-400 font-mono mt-1">฿{Math.round(annualTax).toLocaleString()}</div>
            <div className="text-[9px] text-muted mt-0.5">@ ฿{carbonTaxRate}/tCO₂e</div>
          </div>
        </div>
        {filledMonths.length === 0 && (
          <div className="text-center text-[11px] text-muted py-2 border-t border-border/30">
            {lang === 'th' ? '← กรอกค่า kWh แต่ละเดือนเพื่อดูการคาดการณ์ต่อปี' : '← Enter monthly kWh values to see annual projections'}
          </div>
        )}
      </div>

      {/* ===== Equipment Replacement Advisor ===== */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            {lang === 'th' ? 'คำแนะนำเปลี่ยน/ซ่อมบำรุงอุปกรณ์' : 'Equipment Replacement & Service Advisor'}
          </h3>
          <span className="text-[10px] text-muted px-2.5 py-1 bg-amber-500/10 rounded-lg font-bold text-amber-600">
            {lang === 'th' ? 'เรียงตามความเร่งด่วน' : 'Ranked by Priority Score'}
          </span>
        </div>

        {replacementAdvisor.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {replacementAdvisor.slice(0, 6).map((eq, idx) => {
              // Determine recommended action based on age, category, and energy
              let action, actionColor, actionBg, actionDesc;
              if (eq.age >= 12 || (eq.age >= 8 && eq.score > 500000)) {
                action = lang === 'th' ? '🔄 เปลี่ยนเครื่องใหม่' : '🔄 Replace Equipment';
                actionColor = 'text-red-400';
                actionBg = 'bg-red-500/10 border-red-500/25';
                actionDesc = lang === 'th' 
                  ? `อุปกรณ์อายุ ${eq.age} ปี เกินอายุการใช้งาน ควรเปลี่ยนเป็นรุ่นใหม่ประสิทธิภาพสูง` 
                  : `Equipment is ${eq.age} years old. Replace with high-efficiency model for max ROI.`;
              } else if (['chiller','cooling'].includes(eq.catId) && eq.age >= 3) {
                action = lang === 'th' ? '🧹 ล้างทำความสะอาด' : '🧹 Clean & Service';
                actionColor = 'text-blue-400';
                actionBg = 'bg-blue-500/10 border-blue-500/25';
                actionDesc = lang === 'th' 
                  ? 'ล้างคอยล์ระบายความร้อน เปลี่ยนฟิลเตอร์ และตรวจสอบสารทำความเย็น ลดการใช้พลังงานได้ 10-15%' 
                  : 'Clean condenser coils, replace filters, check refrigerant. Can reduce energy 10-15%.';
              } else if (eq.age >= 5) {
                action = lang === 'th' ? '🔧 ซ่อมบำรุงใหญ่' : '🔧 Major Overhaul';
                actionColor = 'text-amber-500';
                actionBg = 'bg-amber-500/10 border-amber-500/25';
                actionDesc = lang === 'th' 
                  ? 'ตรวจสภาพ ปรับแต่ง และเปลี่ยนชิ้นส่วนสึกหรอ เพื่อรักษาประสิทธิภาพการทำงาน' 
                  : 'Inspect, tune, and replace worn parts to restore full operating efficiency.';
              } else {
                action = lang === 'th' ? '📊 ติดตามการใช้งาน' : '📊 Monitor Usage';
                actionColor = 'text-purple-400';
                actionBg = 'bg-purple-500/10 border-purple-500/25';
                actionDesc = lang === 'th' 
                  ? 'อุปกรณ์ยังอยู่ในช่วงอายุใช้งาน ติดตามค่า kWh และทำการบำรุงรักษาตามกำหนด' 
                  : 'Equipment in good age range. Monitor kWh trends and keep scheduled PM.';
              }

              // Pick catalog image from RECOMMENDATIONS by catId
              const CAT_IMAGE_MAP = {
                chiller: '/catalog/rec_ch_1.png',
                compressor: '/catalog/rec_cp_1.png',
                pump: '/catalog/rec_pm_1.png',
                boiler: '/catalog/rec_bl_1.png',
                cooling: '/catalog/rec_ct_1.png',
                electrical: '/catalog/rec_el_1.png',
              };
              const imgSrc = CAT_IMAGE_MAP[eq.catId] || null;

              const priorityColors = [
                'from-red-500/20 to-red-500/5 border-red-500/30',
                'from-amber-500/20 to-amber-500/5 border-amber-500/30',
                'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30',
                'from-border/20 to-border/5 border-border/30',
              ];
              const priorityBadge = idx === 0 ? 'bg-red-500 text-white' : idx === 1 ? 'bg-amber-500 text-white' : idx === 2 ? 'bg-yellow-500 text-white' : 'bg-border/80 text-muted';

              return (
                <div key={eq.id} className={`rounded-xl border bg-gradient-to-b overflow-hidden transition-all hover:scale-[1.01] hover:shadow-lg ${priorityColors[Math.min(idx, 3)]}`}>
                  {/* Equipment image */}
                  <div className="h-36 bg-card2/60 relative overflow-hidden">
                    {imgSrc ? (
                      <img src={imgSrc} alt={eq.catId} className="w-full h-full object-contain p-4 opacity-90" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Zap size={40} className="text-muted/30" />
                      </div>
                    )}
                    {/* Priority badge */}
                    <span className={`absolute top-2.5 left-2.5 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shadow-md ${priorityBadge}`}>
                      {idx + 1}
                    </span>
                    {/* Age badge */}
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/50 backdrop-blur-sm text-white text-[9px] font-bold rounded-full">
                      {eq.age} yr old
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="font-bold text-text text-sm">{eq.tag}</div>
                      <div className="text-[10px] text-muted">{eq.brand} {eq.model} · {data.cats.find(c => c.id === eq.catId)?.name || eq.catId}</div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/30">
                      <div className="text-center">
                        <div className="text-[8px] text-muted uppercase font-bold">kWh/yr</div>
                        <div className="text-xs font-bold text-amber-500 font-mono">{((eq.energyUseYear || 0) / 1000).toFixed(0)}k</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[8px] text-muted uppercase font-bold">CO₂/yr</div>
                        <div className="text-xs font-bold text-green-500 font-mono">{eq.co2PerYear.toFixed(1)}t</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[8px] text-muted uppercase font-bold">{lang === 'th' ? 'ราคา' : 'Cost'}</div>
                        <div className="text-xs font-bold text-text font-mono">฿{(eq.estCost / 1000000).toFixed(1)}M</div>
                      </div>
                    </div>

                    {/* Recommended action card */}
                    <div className={`rounded-lg border p-3 ${actionBg}`}>
                      <div className={`text-[11px] font-black mb-1 ${actionColor}`}>{action}</div>
                      <div className="text-[10px] text-muted leading-relaxed">{actionDesc}</div>
                    </div>

                    {/* Tax info */}
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted">{lang === 'th' ? 'ภาษีคาร์บอน/ปี:' : 'Carbon Tax/yr:'}</span>
                      <span className="font-bold text-red-400 font-mono">฿{Math.round(eq.taxPerYear).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-muted text-xs py-12 border-2 border-dashed border-border/40 rounded-xl">
            {lang === 'th' ? 'เพิ่มอุปกรณ์เข้าระบบก่อนเพื่อดูคำแนะนำ' : 'Add equipment to see replacement recommendations'}
          </div>
        )}
      </div>

      {/* ===== Budget Planner ===== */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-text flex items-center gap-2">
          <DollarSign size={16} className="text-good" />
          {lang === 'th' ? 'วางแผนงบประมาณเปลี่ยนอุปกรณ์' : 'Equipment Replacement Budget Planner'}
        </h3>
        
        {/* Budget input + summary bar */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-bold text-muted shrink-0">{lang === 'th' ? 'งบประมาณที่มี:' : 'Available Budget:'}</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs font-bold text-muted">฿</span>
            <input
              type="number"
              value={budget}
              onChange={e => { setBudget(e.target.value); setSelectedEqIds(new Set()); }}
              placeholder={lang === 'th' ? 'เช่น 5000000' : 'e.g. 5000000'}
              className="pl-7 pr-4 py-2.5 w-52 bg-bg/50 border border-border rounded-xl text-xs font-mono font-bold outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
            />
          </div>
          {budgetNum > 0 && (
            <div className="flex items-center gap-3 ml-auto">
              <div className="text-right">
                <div className="text-[9px] text-muted font-bold uppercase">{lang === 'th' ? 'ใช้ไปแล้ว' : 'Spent'}</div>
                <div className="text-xs font-bold text-red-400 font-mono">฿{budgetTotalCost.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-muted font-bold uppercase">{lang === 'th' ? 'คงเหลือ' : 'Remaining'}</div>
                <div className={`text-xs font-bold font-mono ${budgetRemaining < 0 ? 'text-red-500' : 'text-good'}`}>฿{budgetRemaining.toLocaleString()}</div>
              </div>
            </div>
          )}
        </div>

        {/* Budget bar progress */}
        {budgetNum > 0 && (
          <div className="space-y-1">
            <div className="h-2 rounded-full bg-border/40 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${budgetTotalCost > budgetNum ? 'bg-red-500' : 'bg-accent'}`}
                style={{ width: `${Math.min(100, (budgetTotalCost / budgetNum) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-muted">
              <span>฿0</span>
              <span className="font-bold">{Math.min(100, ((budgetTotalCost / budgetNum) * 100)).toFixed(0)}% {lang === 'th' ? 'ใช้แล้ว' : 'used'}</span>
              <span>฿{budgetNum.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Selectable equipment list */}
        {replacementAdvisor.length > 0 ? (
          <div className="overflow-x-auto border border-border/50 rounded-xl">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="bg-card2/50 text-[10px] uppercase tracking-wider text-muted font-bold border-b border-border/50">
                <tr>
                  <th className="px-4 py-2.5 text-center">{lang === 'th' ? 'เลือก' : 'Select'}</th>
                  <th className="px-4 py-2.5">Tag</th>
                  <th className="px-4 py-2.5">{lang === 'th' ? 'ประเภท' : 'Type'}</th>
                  <th className="px-4 py-2.5 text-right">{lang === 'th' ? 'ราคาเปลี่ยน' : 'Replace Cost'}</th>
                  <th className="px-4 py-2.5 text-right">{lang === 'th' ? 'ประหยัด/ปี' : 'Savings/yr'}</th>
                  <th className="px-4 py-2.5 text-right">{lang === 'th' ? 'CO₂/ปี' : 'CO₂/yr'}</th>
                  <th className="px-4 py-2.5 text-right">ROI</th>
                  <th className="px-4 py-2.5 text-right">{lang === 'th' ? 'สถานะงบ' : 'Budget Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {replacementAdvisor.map(eq => {
                  const isSelected = selectedEqIds.has(eq.id);
                  const hypotheticalSpent = budgetTotalCost + (isSelected ? 0 : eq.estCost);
                  const canAfford = !isSelected ? (budgetNum === 0 || hypotheticalSpent <= budgetNum) : true;
                  return (
                    <tr 
                      key={eq.id} 
                      onClick={() => toggleBudgetEq(eq.id, eq.estCost)}
                      className={`cursor-pointer transition-colors ${isSelected ? 'bg-accent/5 border-l-2 border-accent' : 'hover:bg-bg/30'}`}
                    >
                      <td className="px-4 py-2.5 text-center">
                        <div className={`w-4 h-4 rounded border-2 mx-auto flex items-center justify-center transition-all ${isSelected ? 'bg-accent border-accent' : 'border-border/60'}`}>
                          {isSelected && <span className="text-white text-[8px] font-black">✓</span>}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-bold text-text">{eq.tag} <span className="font-normal text-muted">| {eq.brand}</span></td>
                      <td className="px-4 py-2.5 text-muted">{data.cats.find(c => c.id === eq.catId)?.name || eq.catId}</td>
                      <td className={`px-4 py-2.5 text-right font-mono font-bold ${isSelected ? 'text-accent' : 'text-text'}`}>฿{eq.estCost.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-good">฿{(eq.costYear || 0).toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-green-500">{eq.co2PerYear.toFixed(2)} t</td>
                      <td className="px-4 py-2.5 text-right font-mono text-muted">{eq.costYear ? (eq.estCost / eq.costYear).toFixed(1) : '—'} yr</td>
                      <td className="px-4 py-2.5 text-right">
                        {isSelected ? (
                          <span className="px-2 py-0.5 bg-accent/15 text-accent text-[9px] font-bold rounded-full">{lang === 'th' ? '✓ เลือกแล้ว' : '✓ Selected'}</span>
                        ) : budgetNum > 0 && !canAfford ? (
                          <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[9px] font-bold rounded-full">{lang === 'th' ? 'งบไม่พอ' : 'Over budget'}</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-border/40 text-muted text-[9px] font-bold rounded-full">{lang === 'th' ? 'กดเลือก' : 'Click to add'}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-muted text-xs py-6">{lang === 'th' ? 'ยังไม่มีข้อมูลอุปกรณ์' : 'No equipment data yet'}</div>
        )}

        {/* Summary totals */}
        {budgetPlan.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-border/50">
            <div className="p-3.5 bg-accent/10 rounded-xl border border-accent/20">
              <div className="text-[9px] font-bold uppercase tracking-wider text-accent">{lang === 'th' ? 'เครื่องที่เลือก' : 'Items Selected'}</div>
              <div className="text-sm font-bold text-accent font-mono mt-1">{budgetPlan.length} {lang === 'th' ? 'เครื่อง' : 'units'}</div>
            </div>
            <div className="p-3.5 bg-good/10 rounded-xl border border-good/20">
              <div className="text-[9px] font-bold uppercase tracking-wider text-good">{lang === 'th' ? 'ประหยัดค่าไฟ/ปี' : 'Energy Savings/yr'}</div>
              <div className="text-sm font-bold text-good font-mono mt-1">฿{budgetTotalSavings.toLocaleString()}</div>
            </div>
            <div className="p-3.5 bg-green-500/10 rounded-xl border border-green-500/20">
              <div className="text-[9px] font-bold uppercase tracking-wider text-green-500">{lang === 'th' ? 'CO₂ ลดได้/ปี' : 'CO₂ Reduced/yr'}</div>
              <div className="text-sm font-bold text-green-500 font-mono mt-1">{budgetTotalCo2.toFixed(2)} t</div>
            </div>
            <div className="p-3.5 bg-card2 rounded-xl border border-border/40">
              <div className="text-[9px] font-bold uppercase tracking-wider text-muted">{lang === 'th' ? 'คืนทุนใน' : 'Payback Period'}</div>
              <div className="text-sm font-bold text-text font-mono mt-1">
                {budgetTotalSavings > 0 ? (budgetTotalCost / budgetTotalSavings).toFixed(1) : '—'} <span className="text-[9px] font-sans text-muted">yrs</span>
              </div>
            </div>
          </div>
        )}
      </div>

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
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted line-clamp-1">{t ? t('all_types') : 'ALL EQUIPMENT TYPES'}</div>
                <div className="text-lg font-bold text-text mt-0.5 font-mono">
                  {factoryEquipmentsTotal} <span className="text-[10px] text-muted font-sans font-medium">{t ? t('units') : 'units'}</span>
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
                      {c.count} <span className="text-[10px] text-muted font-sans font-medium">{t ? t('units') : 'units'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-border p-6">
          <h3 className="text-lg font-bold text-text mb-6">Energy Consumption Breakdown by Category</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdown} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text)' }}
                  formatter={(value) => [value.toLocaleString() + ' kWh', 'Energy Use']}
                />
                <Bar dataKey="energy" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Savings Opportunities */}
        <div className="bg-surface rounded-2xl border border-border p-6 flex flex-col">
          <h3 className="text-lg font-bold text-text mb-6 flex items-center gap-2">
            <TrendingDown className="text-emerald-500" size={20} />
            Savings Opportunities
          </h3>
          
          <div className="space-y-4 flex-1">
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <div className="text-sm text-muted mb-1">Potential Savings (Year)</div>
              <div className="text-2xl font-bold text-emerald-500">
                ฿ {potentialSavingsBaht.toLocaleString()}
              </div>
            </div>
            
            <div className="p-4 rounded-xl border border-border bg-bg/50">
              <div className="text-sm text-muted mb-1">Required Investment</div>
              <div className="text-xl font-bold text-text">
                ฿ {totalInvestment.toLocaleString()}
              </div>
            </div>
            
            <div className="p-4 rounded-xl border border-border bg-bg/50">
              <div className="text-sm text-muted mb-1">Est. Payback Period</div>
              <div className="text-xl font-bold text-text">
                {totalInvestment && potentialSavingsBaht ? (totalInvestment / potentialSavingsBaht).toFixed(2) : 0} Years
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment List */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-bold text-text">{selectedSubCat ? `Filtered Equipments` : `Factory Equipments`}</h3>
          <Link to={`/equip?factory=${factory.name}`} className="text-sm text-accent hover:underline font-medium">Manage All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg/50 text-xs text-muted uppercase tracking-wider">
                <th className="p-4 font-semibold">Tag</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold">Brand / Model</th>
                <th className="p-4 font-semibold text-right">Energy (kWh/yr)</th>
                <th className="p-4 font-semibold text-right">Cost (฿/yr)</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-border">
              {equipments.map(eq => (
                <tr key={eq.id} className="hover:bg-bg/30 transition-colors">
                  <td className="p-4 font-bold text-text">{eq.tag}</td>
                  <td className="p-4 text-muted">{eq.dept}</td>
                  <td className="p-4 text-muted">{eq.brand} <span className="opacity-50">|</span> {eq.model}</td>
                  <td className="p-4 text-right font-medium text-amber-500">{(eq.energyUseYear || 0).toLocaleString()}</td>
                  <td className="p-4 text-right font-medium text-emerald-500">{(eq.costYear || 0).toLocaleString()}</td>
                </tr>
              ))}
              {equipments.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-muted">No equipment found for this filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddEquipmentModal 
        isOpen={isAddEqOpen} 
        onClose={() => setIsAddEqOpen(false)} 
        equipment={{ factory: factory.name }} 
      />
    </div>
  );
}
