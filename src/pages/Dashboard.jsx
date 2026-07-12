import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Eye, Trash2, Settings, Activity, ArrowRight, Zap, Target, Factory as FactoryIcon, Clock, Snowflake, Wind, Droplets, Flame, Tag, MapPin, AlignLeft, DollarSign, TrendingUp, Leaf } from 'lucide-react';
import { ModalWrapper } from '../components/Modals';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// FontAwesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIndustry, faLeaf, faBolt, faChartLine, faTrophy } from '@fortawesome/free-solid-svg-icons';

const iconMap = {
  Snowflake: <Snowflake size={14} />,
  Wind: <Wind size={14} />,
  Droplets: <Droplets size={14} />,
  Flame: <Flame size={14} />,
  Factory: <FactoryIcon size={14} />,
  Zap: <Zap size={14} />,
};

const COLORS = [
  '#0F2854', // Dark Navy
  '#4988C4', // Grayish Blue
  '#BDE8F5', // Light Blue
  '#1C4D8D', // Blue
  '#f97316', // Orange
  '#eab308', // Yellow
  '#10b981', // Emerald
];

const getCategoryBadgeStyle = (catId) => {
  if (catId === 'chiller') return 'bg-sky-50 text-sky-600 border-sky-200';
  if (catId === 'compressor') return 'bg-violet-50 text-violet-600 border-violet-200';
  if (catId === 'boiler') return 'bg-orange-50 text-orange-600 border-orange-200';
  if (catId === 'pump') return 'bg-emerald-50 text-emerald-600 border-emerald-200';
  return 'bg-card2 text-text border-border/40';
};

export default function Dashboard() {
  const { user, data, setData, addFactory, t, lang } = useContext(AppContext);
  const navigate = useNavigate();
  const [isAddFactoryOpen, setIsAddFactoryOpen] = useState(false);
  const [newFactory, setNewFactory] = useState({ name: '', location: '', desc: '' });
  
  const dtxt = new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});
  
  const eqCount = data.equipments.length;
  const insCount = data.inspections.length;
  const measCount = data.measures.length;
  const totalKWh = data.measures.reduce((a, m) => a + (m.kWhYear || 0), 0);
  
  const emissionFactor = data.settings?.emissionFactors?.find(ef => ef.id === 'ef_elec')?.value || 0.5562;
  const carbonTaxRate = data.settings?.carbonTaxRate || 200;
  
  const totalCo2Saved = totalKWh * emissionFactor;
  const totalTaxSaved = (totalCo2Saved / 1000) * carbonTaxRate;

  const factories = data.factories || [];
  const factoryCount = factories.length;

  const recentInspections = [...data.inspections].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  // Top Opportunities Calculation
  const eqSavingsMap = data.measures.reduce((acc, m) => {
    if (!acc[m.eqId]) acc[m.eqId] = 0;
    acc[m.eqId] += m.kWhYear || 0;
    return acc;
  }, {});
  
  const topOpportunities = Object.keys(eqSavingsMap)
    .map(eqId => {
      const eq = data.equipments.find(e => e.id === eqId);
      return { ...eq, savedKwh: eqSavingsMap[eqId] };
    })
    .filter(eq => eq.tag) // Ensure it's a valid equipment
    .sort((a, b) => b.savedKwh - a.savedKwh)
    .slice(0, 3);

  // Real Trend Data for the chart based on Measures
  const sortedMeasures = [...data.measures].filter(m => m.date).sort((a, b) => new Date(a.date) - new Date(b.date));
  let cumulativeEnergy = 0;
  let cumulativeCarbon = 0;
  const trendMap = {};

  sortedMeasures.forEach(m => {
    const d = new Date(m.date);
    const monthYear = d.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { month: 'short', year: '2-digit' });
    cumulativeEnergy += (m.kWhYear || 0);
    
    // Calculate carbon savings using the system's electricity emission factor
    const co2Saved = (m.kWhYear || 0) * emissionFactor;
    cumulativeCarbon += co2Saved;
    
    trendMap[monthYear] = {
      energy: cumulativeEnergy,
      carbon: cumulativeCarbon
    };
  });

  const trendData = Object.keys(trendMap).map(key => ({
    name: key,
    savings: Math.round(trendMap[key].energy),
    carbon: Math.round(trendMap[key].carbon)
  }));

  if (trendData.length === 0) {
    trendData.push({ name: lang === 'th' ? 'ไม่มีข้อมูล' : 'No Data', savings: 0, carbon: 0 });
  }

  const handleDeleteInspection = (id) => {
    if (confirm('Are you sure you want to delete this inspection?')) {
      setData({ ...data, inspections: data.inspections.filter(i => i.id !== id) });
    }
  };

  const handleSaveFactory = (e) => {
    e.preventDefault();
    if (!newFactory.name.trim()) return alert('Factory Name is required');
    addFactory(newFactory);
    setNewFactory({ name: '', location: '', desc: '' });
    setIsAddFactoryOpen(false);
  };

  return (
    <div className="animate-slide-up space-y-8 pb-12 select-none">
      {/* Greetings Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-text flex items-center gap-2">
            {t('hello')}, {user?.name?.split(' ')[0] || 'User'} <span className="animate-bounce">👋</span>
          </h2>
          <p className="text-xs md:text-sm text-muted mt-1">{t('system_desc')}</p>
        </div>
        <div className="text-xs font-semibold text-muted bg-surface border border-border/80 px-4 py-2 rounded-xl shadow-sm self-start md:self-auto font-mono">
          📅 {t('overview_for')} {dtxt}
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard title={t('stat_equipments')} value={eqCount} subtitle={lang === 'th' ? 'จำนวนเครื่องจักร' : 'Total Units'} icon={<Settings size={18} />} color="indigo" link="/equip" />
        <StatCard title={t('stat_inspections')} value={insCount} subtitle={lang === 'th' ? 'รายงานที่เสร็จสิ้น' : 'Completed Reports'} icon={<Activity size={18} />} color="blue" link="/history" />
        <StatCard title={t('stat_measures')} value={measCount} subtitle={lang === 'th' ? 'มาตรการที่พบ' : 'Identified Measures'} icon={<Target size={18} />} color="violet" link="/energy" />
        <StatCard title={t('stat_potential')} value={(totalKWh/1000).toFixed(0)} subtitle={lang === 'th' ? 'MWh/ปี' : 'MWh/Year'} icon={<Zap size={18} />} color="amber" link="/energy" />
        <StatCard title={t('stat_factories')} value={factoryCount} subtitle={lang === 'th' ? 'สาขาทั้งหมด' : 'Operating Sites'} icon={<FactoryIcon size={18} />} color="emerald" link="/factories" />
        <StatCard title={lang === 'th' ? 'ภาษีคาร์บอน' : 'Carbon Tax'} value={`฿${totalTaxSaved.toLocaleString(undefined, {maximumFractionDigits: 0})}`} subtitle={lang === 'th' ? 'มูลค่าภาษีที่ลดได้' : 'Tax Savings'} icon={<DollarSign size={18} />} color="emerald" />
      </div>



      {/* Hero Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface rounded-2xl p-5 border border-border/50 shadow-sm relative overflow-hidden group hover-lift hover:border-accent/30 transition-all" data-aos="fade-up" data-aos-delay="0">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1">{t('stat_factories')}</p>
              <h3 className="text-3xl font-black text-text font-mono">{factoryCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shadow-inner">
              <FontAwesomeIcon icon={faIndustry} className="text-lg" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-accent relative z-10">
            <ArrowRight size={14} />
            <span>{t('view_all')}</span>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-5 border border-border/50 shadow-sm relative overflow-hidden group hover-lift hover:border-blue-500/30 transition-all" data-aos="fade-up" data-aos-delay="100">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1">{t('stat_equipments')}</p>
              <h3 className="text-3xl font-black text-text font-mono">{eqCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner">
              <Settings size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-muted relative z-10">
            <span className="text-text font-bold">{data.cats?.length || 6}</span> categories
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-5 border border-border/50 shadow-sm relative overflow-hidden group hover-lift hover:border-emerald-500/30 transition-all" data-aos="fade-up" data-aos-delay="200">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1">{t('stat_savings')}</p>
              <div className="flex items-baseline gap-1">
                <h3 className="text-3xl font-black text-emerald-500 font-mono">{(totalKWh / 1000).toFixed(0)}</h3>
                <span className="text-xs font-bold text-muted">MWh/yr</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
              <FontAwesomeIcon icon={faBolt} className="text-lg" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md w-fit relative z-10">
            <TrendingUp size={12} />
            <span className="font-bold">฿{Math.round(totalTaxSaved).toLocaleString()}</span> {lang === 'th' ? 'ภาษีคาร์บอนที่ลดได้' : 'Tax Saved'}
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-5 border border-border/50 shadow-sm relative overflow-hidden group hover-lift hover:border-teal-500/30 transition-all" data-aos="fade-up" data-aos-delay="300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1">{t('stat_co2')}</p>
              <div className="flex items-baseline gap-1">
                <h3 className="text-3xl font-black text-teal-500 font-mono">{(totalCo2Saved / 1000).toFixed(1)}</h3>
                <span className="text-xs font-bold text-muted">tCO₂e</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500 shadow-inner">
              <FontAwesomeIcon icon={faLeaf} className="text-lg" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-muted relative z-10">
            <span className="text-text font-bold">{measCount}</span> measures implemented
          </div>
        </div>
      </div>

      {/* Charts & Top lists */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8" data-aos="fade-up" data-aos-delay="400">
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-text mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-accent" />
              {lang === 'th' ? 'แนวโน้มการประหยัดพลังงานสะสม' : 'Cumulative Savings Trend'}
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#0F2854]"></div> Energy (kWh)</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#10b981]"></div> Carbon (kgCO₂e)</span>
            </div>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4988C4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4988C4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted)' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--muted)' }} width={45} tickFormatter={(v) => (v > 999 ? (v/1000).toFixed(0) + 'k' : v)} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#10b981' }} width={45} tickFormatter={(v) => (v > 999 ? (v/1000).toFixed(0) + 'k' : v)} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: 'var(--text)', fontWeight: 'bold' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="savings" name="Energy (kWh)" stroke="#0F2854" strokeWidth={3} fillOpacity={1} fill="url(#colorSavings)" />
                <Area yAxisId="right" type="monotone" dataKey="carbon" name="Carbon (kgCO₂e)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCarbon)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faTrophy} className="text-warn" />
            {lang === 'th' ? 'โอกาสในการประหยัดสูงสุด' : 'Top Savings Opportunities'}
          </h3>
          <div className="flex-1 space-y-3">
            {topOpportunities.length > 0 ? topOpportunities.map((opp, i) => {
              return (
                <div key={opp.id} className="p-3 bg-card2 border border-border/40 rounded-xl flex items-center justify-between hover:border-accent/40 transition-colors cursor-default group">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold ${i === 0 ? 'bg-warn/20 text-warn border border-warn/30' : i === 1 ? 'bg-border text-muted' : 'bg-orange-500/10 text-orange-600 border border-orange-500/20'}`}>
                      #{i + 1}
                    </div>
                    <div>
                      <div className="font-bold text-text text-[13px] line-clamp-1 group-hover:text-accent transition-colors">{opp.tag}</div>
                      <div className="text-[10px] text-muted font-medium flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {opp.factory}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-500 text-sm font-mono">{(opp.savedKwh/1000).toFixed(1)}k</div>
                    <div className="text-[9px] text-muted uppercase tracking-wider font-bold">kWh/yr</div>
                  </div>
                </div>
              );
            }) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted opacity-60">
                <Target size={32} className="mb-2" />
                <p className="text-xs font-semibold">{lang === 'th' ? 'ยังไม่มีข้อมูลการประหยัด' : 'No potential savings data yet'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Feed / Alerts */}
      <div className="mb-8" data-aos="fade-up" data-aos-delay="450">
        <h3 className="text-base font-bold text-text flex items-center gap-2 mb-4">
          <Activity size={18} className="text-accent" />
          {lang === 'th' ? 'การตรวจวัดและแจ้งเตือนล่าสุด' : 'Recent Activities & Alerts'}
        </h3>
        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-border/60">
            {data.inspections?.length > 0 ? data.inspections.slice(0, 5).map((ins, idx) => {
              const eq = data.equipments.find(e => e.id === ins.eqId);
              return (
                <div key={ins.id} className="p-4 hover:bg-card2 transition-colors flex items-start gap-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                    <Activity size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 justify-between">
                      <h4 className="text-sm font-bold text-text truncate group-hover:text-accent transition-colors">
                        {eq ? eq.tag : 'System'} {eq && `- ${eq.factory}`}
                      </h4>
                      <span className="text-[10px] text-muted font-medium whitespace-nowrap bg-bg border border-border px-2 py-0.5 rounded-full">
                        {new Date(ins.date).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-1.5 line-clamp-2">{ins.summary}</p>
                  </div>
                </div>
              );
            }) : (
              <div className="p-8 text-center text-muted">
                <p className="text-sm font-medium">{lang === 'th' ? 'ไม่มีการเคลื่อนไหวใหม่' : 'No recent activities'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Factory Breakdown using Swiper */}
      <div data-aos="fade-up" data-aos-delay="500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-text flex items-center gap-2">
            <FontAwesomeIcon icon={faIndustry} className="text-accent" />
            {t('factories_overview')}
          </h3>
          <button 
            onClick={() => setIsAddFactoryOpen(true)}
            className="py-1.5 px-3 bg-accent hover:bg-accentHover text-white text-xs font-semibold rounded shadow-sm cursor-pointer border-none flex items-center gap-1 active:scale-95 transition-all"
          >
            <Plus size={14} /> {t('add_factory')}
          </button>
        </div>

        <div className="pb-8">
          <Swiper
            modules={[Pagination, Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            className="px-2 pb-10"
          >
            {factories.length > 0 ? factories.map((fact, idx) => {
              const factoryName = fact.name;
              const fEqs = data.equipments.filter(e => e.factory === factoryName);
              const fEqIds = fEqs.map(e => e.id);
              const fIns = data.inspections.filter(i => fEqIds.includes(i.eqId));
              const fMeas = data.measures.filter(m => fEqIds.includes(m.eqId));
              
              const fKWh = fMeas.reduce((a, m) => a + (m.kWhYear || 0), 0);
              const fCatIds = [...new Set(fEqs.map(e => e.catId))];
              const fCats = data.cats.filter(c => fCatIds.includes(c.id));
              
              return (
                <SwiperSlide key={factoryName}>
                  <Link 
                    to={`/factories/${fact.id}`} 
                    className="block h-full bg-surface border border-border rounded-xl p-5 hover:shadow-md relative overflow-hidden group cursor-pointer hover:border-accent/40 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4 mt-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent/10 text-accent border border-accent/20 shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                          <FontAwesomeIcon icon={faIndustry} />
                        </div>
                        <div>
                          <h4 className="font-bold text-text text-[15px] line-clamp-1 group-hover:text-accent transition-colors" title={factoryName}>{factoryName}</h4>
                          <p className="text-xs text-muted font-medium mt-0.5">{fEqs.length} {t('stat_equipments')}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-card2 border border-border/40 rounded-xl">
                      <div className="text-center">
                        <div className="text-[9px] text-muted font-bold uppercase tracking-wider mb-1">{t('stat_inspections')}</div>
                        <div className="font-mono text-xs font-bold text-text">{fIns.length}</div>
                      </div>
                      <div className="text-center border-l border-r border-border/50">
                        <div className="text-[9px] text-muted font-bold uppercase tracking-wider mb-1">{t('stat_measures')}</div>
                        <div className="font-mono text-xs font-bold text-accent">{fMeas.length}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[9px] text-muted font-bold uppercase tracking-wider mb-1">{t('savings_mwh')}</div>
                        <div className="font-mono text-xs font-bold text-emerald-500">{(fKWh/1000).toFixed(0)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {fCats.slice(0,3).map(c => (
                        <span key={c.id} className={`text-[9px] px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1 ${getCategoryBadgeStyle(c.id)}`}>
                          {iconMap[c.icon] || <Settings size={8} />}
                          {c.name}
                        </span>
                      ))}
                      {fCats.length > 3 && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold bg-bg text-muted border border-border/40">
                          +{fCats.length - 3}
                        </span>
                      )}
                    </div>
                  </Link>
                </SwiperSlide>
              );
            }) : (
              <div className="col-span-full py-10 flex flex-col items-center justify-center text-muted border-2 border-dashed border-border/50 rounded-xl bg-card2/50">
                <FactoryIcon size={32} className="mb-2 opacity-30" />
                <p className="text-sm font-medium">{t('no_factories')}</p>
                <p className="text-xs opacity-60 mt-1">{t('add_factory_to_start')}</p>
              </div>
            )}
          </Swiper>
        </div>
      </div>

      {/* Recent Inspections */}
      <div>
        <div className="flex items-center justify-between mb-4 mt-4">
          <h3 className="text-base font-bold text-text">
            {t('recent_inspections')}
          </h3>
          <Link to="/history" className="text-xs font-bold text-accent hover:text-accentHover flex items-center gap-1">
            {t('view_all')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="bg-surface border border-border/60 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-muted uppercase tracking-wider bg-card2/50 border-b border-border/40">
                <tr>
                  <th className="px-5 py-3.5 font-bold">{t('date')}</th>
                  <th className="px-5 py-3.5 font-bold">{t('equipment')}</th>
                  <th className="px-5 py-3.5 font-bold">{t('factory')}</th>
                  <th className="px-5 py-3.5 font-bold">{t('category')}</th>
                  <th className="px-5 py-3.5 font-bold">{t('summary')}</th>
                  <th className="px-5 py-3.5 font-bold text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {recentInspections.length > 0 ? recentInspections.map(i => {
                  const eq = data.equipments.find(e => e.id === i.eqId);
                  const cat = data.cats.find(c => c.id === i.catId);
                  const dt = i.date ? new Date(i.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
                  
                  return (
                    <tr key={i.id} className="hover:bg-card2/35 transition-colors">
                      <td className="px-5 py-4 text-muted whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]"><Clock size={12} className="text-dim"/> {dt}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-text">{eq?.tag || '—'}</div>
                        <div className="text-[10px] text-muted font-medium mt-0.5">{[eq?.brand, eq?.model].filter(Boolean).join('/') || ''}</div>
                      </td>
                      <td className="px-5 py-4 text-muted font-medium">
                        {eq?.factory || '—'}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold border ${cat ? getCategoryBadgeStyle(cat.id) : 'bg-card2 text-text border-border/40'}`}>
                          {cat?.name || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted max-w-[220px] truncate" title={i.summary}>{i.summary || '—'}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => navigate('/history')} className="p-2 text-muted hover:text-accent rounded-lg hover:bg-accent/10 transition-all cursor-pointer border-none bg-transparent active:scale-90" title={t('view_details')}><Eye size={15} /></button>
                          <button onClick={() => handleDeleteInspection(i.id)} className="p-2 text-muted hover:text-bad rounded-lg hover:bg-red-500/10 transition-all cursor-pointer border-none bg-transparent active:scale-90" title={t('delete_equipment')}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-muted">
                      <Activity size={32} className="mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-semibold">{t('no_inspections')}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Factory Modal */}
      <ModalWrapper 
        isOpen={isAddFactoryOpen} 
        onClose={() => setIsAddFactoryOpen(false)} 
        title={t('add_factory')}
        maxWidth="500px"
      >
        <form onSubmit={handleSaveFactory} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">{t('factory_name')} *</label>
            <div className="relative">
              <input 
                required 
                type="text" 
                value={newFactory.name} 
                onChange={e => setNewFactory({ ...newFactory, name: e.target.value })} 
                placeholder="e.g. โรงงานอยุธยา" 
                className="w-full p-2.5 pl-10 bg-bg/50 border border-border rounded-xl text-xs font-semibold outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 focus:bg-surface transition-all"
              />
              <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">{t('location')}</label>
            <div className="relative">
              <input 
                type="text" 
                value={newFactory.location} 
                onChange={e => setNewFactory({ ...newFactory, location: e.target.value })} 
                placeholder="e.g. นิคมอุตสาหกรรมโรจนะ" 
                className="w-full p-2.5 pl-10 bg-bg/50 border border-border rounded-xl text-xs font-semibold outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 focus:bg-surface transition-all"
              />
              <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">{t('description')}</label>
            <div className="relative">
              <textarea 
                value={newFactory.desc} 
                onChange={e => setNewFactory({ ...newFactory, desc: e.target.value })} 
                placeholder="Short description..." 
                className="w-full p-2.5 pl-10 bg-bg/50 border border-border rounded-xl text-xs font-semibold outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 focus:bg-surface transition-all min-h-[80px]"
              />
              <AlignLeft size={14} className="absolute left-3.5 top-5 text-dim" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <button 
              type="button" 
              onClick={() => setIsAddFactoryOpen(false)} 
              className="px-4 py-2 rounded border border-border text-text font-semibold text-xs hover:bg-card2 transition-colors cursor-pointer active:scale-95"
            >
              {t('cancel')}
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 bg-accent text-white font-semibold text-xs rounded hover:bg-accentHover transition-all cursor-pointer active:scale-95 border-none"
            >
              {t('add_factory')}
            </button>
          </div>
        </form>
      </ModalWrapper>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, color, link }) {
  const cMap = {
    indigo: { text: 'text-accent', bg: 'bg-accent/10 border-accent/20', hoverFrom: 'from-accent/0', hoverTo: 'to-accent/5' },
    blue: { text: 'text-accent', bg: 'bg-accent/10 border-accent/20', hoverFrom: 'from-accent/0', hoverTo: 'to-accent/5' },
    violet: { text: 'text-accent', bg: 'bg-accent/10 border-accent/20', hoverFrom: 'from-accent/0', hoverTo: 'to-accent/5' },
    amber: { text: 'text-warn', bg: 'bg-warn/10 border-warn/25', hoverFrom: 'from-warn/0', hoverTo: 'to-warn/10' },
    emerald: { text: 'text-good', bg: 'bg-good/10 border-good/25', hoverFrom: 'from-good/0', hoverTo: 'to-good/10' },
  };

  const style = cMap[color] || cMap.indigo;

  const content = (
    <>
      <div className={`absolute inset-0 bg-gradient-to-br ${style.hoverFrom} ${style.hoverTo} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl`} />
      <div className="flex items-center justify-between mb-3 relative z-10">
        <span className="text-xs font-bold text-muted uppercase tracking-wider group-hover:text-text transition-colors">{title}</span>
        <div className={`p-1.5 rounded-lg border ${style.bg} ${style.text} shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      <div className="mt-2 relative z-10">
        <div className="text-2xl font-bold text-text font-mono tracking-tight group-hover:translate-x-1 transition-transform duration-300">{value}</div>
        {subtitle && <div className="text-[10px] text-muted font-medium mt-1">{subtitle}</div>}
      </div>
    </>
  );

  const className = "bg-surface border border-border rounded-xl p-5 flex flex-col justify-between group relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-accent/5 hover:border-accent/40";

  if (link) {
    return (
      <Link to={link} className={`${className} cursor-pointer block`}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
}
