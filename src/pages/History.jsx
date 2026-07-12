import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { Search, Eye, Trash2, Clock, History as HistoryIcon, Filter, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

export default function History() {
  const { data, setData, t, lang } = useContext(AppContext);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterFact, setFilterFact] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const factories = [...new Set(data.equipments.map(e => e.factory).filter(Boolean))];

  const availableYears = useMemo(() => {
    const years = [...new Set(data.inspections.map(i => i.date ? new Date(i.date).getFullYear() : null).filter(Boolean))].sort((a,b) => b-a);
    return years;
  }, [data.inspections]);

  const MONTHS = [
    {v:'1',l:'ม.ค.'},{v:'2',l:'ก.พ.'},{v:'3',l:'มี.ค.'},{v:'4',l:'เม.ย.'},
    {v:'5',l:'พ.ค.'},{v:'6',l:'มิ.ย.'},{v:'7',l:'ก.ค.'},{v:'8',l:'ส.ค.'},
    {v:'9',l:'ก.ย.'},{v:'10',l:'ต.ค.'},{v:'11',l:'พ.ย.'},{v:'12',l:'ธ.ค.'}
  ];

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this inspection?')) {
      setData({ ...data, inspections: data.inspections.filter(i => i.id !== id) });
    }
  };

  const inspections = useMemo(() => {
    return data.inspections.filter(i => {
      if (filterCat && i.catId !== filterCat) return false;
      const eq = data.equipments.find(e => e.id === i.eqId);
      if (filterFact && (!eq || eq.factory !== filterFact)) return false;
      if (filterYear && i.date && new Date(i.date).getFullYear() !== parseInt(filterYear)) return false;
      if (filterMonth && i.date && (new Date(i.date).getMonth() + 1) !== parseInt(filterMonth)) return false;
      if (search) {
        const q = search.toLowerCase();
        return JSON.stringify(i).toLowerCase().includes(q) || (eq && JSON.stringify(eq).toLowerCase().includes(q));
      }
      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data.inspections, data.equipments, search, filterCat, filterFact, filterYear, filterMonth]);

  const hasFilters = search || filterCat || filterFact || filterMonth || filterYear;
  const clearFilters = () => { setSearch(''); setFilterCat(''); setFilterFact(''); setFilterMonth(''); setFilterYear(''); };

  return (
    <div className="animate-slide-up space-y-6 pb-12 select-none">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-text flex items-center gap-2">
            <span className="w-1.5 h-4 bg-accent rounded-full animate-pulse" /> {t('inspections_history')}
          </h2>
          <p className="text-xs md:text-sm text-muted mt-1">{t('log_inspections')}</p>
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs font-bold text-muted hover:text-text px-3 py-1.5 bg-card2 border border-border rounded-lg transition-all cursor-pointer">
            ล้างตัวกรองทั้งหมด
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center bg-surface/70 border border-border/60 p-4 rounded-2xl backdrop-blur-sm shadow-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder={t('search_records')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full py-2.5 px-4 pl-10 bg-bg/50 border border-border rounded-xl text-xs font-semibold transition-all focus:border-accent focus:ring-4 focus:ring-accent/5 focus:bg-surface outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select className="py-2 px-3 bg-bg/50 border border-border rounded-xl text-xs font-bold outline-none focus:border-accent transition-all cursor-pointer" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">{t('all_categories')}</option>
            {data.cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="py-2 px-3 bg-bg/50 border border-border rounded-xl text-xs font-bold outline-none focus:border-accent transition-all cursor-pointer" value={filterFact} onChange={e => setFilterFact(e.target.value)}>
            <option value="">{t('all_factories')}</option>
            {factories.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select className="py-2 px-3 bg-bg/50 border border-border rounded-xl text-xs font-bold outline-none focus:border-accent transition-all cursor-pointer" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
            <option value="">ทุกปี</option>
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="py-2 px-3 bg-bg/50 border border-border rounded-xl text-xs font-bold outline-none focus:border-accent transition-all cursor-pointer" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
            <option value="">ทุกเดือน</option>
            {MONTHS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted">
        <HistoryIcon size={13} />
        พบ <span className="font-bold text-text mx-1">{inspections.length}</span> รายการ
        {hasFilters && <span className="text-accent font-bold">(กรองอยู่)</span>}
      </div>

      {/* History Table */}
      <div className="bg-surface border border-border/60 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] text-muted uppercase tracking-wider bg-card2/50 border-b border-border/40">
              <tr>
                <th className="px-5 py-3.5 font-bold">{t('date')}</th>
                <th className="px-5 py-3.5 font-bold">{t('equipment')}</th>
                <th className="px-5 py-3.5 font-bold">{t('category')}</th>
                <th className="px-5 py-3.5 font-bold">{t('factory')}</th>
                <th className="px-5 py-3.5 font-bold">{t('summary')}</th>
                <th className="px-5 py-3.5 font-bold text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {inspections.length > 0 ? inspections.map(i => {
                const eq = data.equipments.find(e => e.id === i.eqId);
                const cat = data.cats.find(c => c.id === i.catId);
                const dt = i.date ? new Date(i.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
                const isExpanded = expandedId === i.id;

                return (
                  <React.Fragment key={i.id}>
                    <tr
                      className={`hover:bg-card2/25 transition-colors cursor-pointer ${isExpanded ? 'bg-accent/5' : ''}`}
                      onClick={() => setExpandedId(isExpanded ? null : i.id)}
                    >
                      <td className="px-5 py-4 text-muted whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Clock size={13} className="text-dim" /> {dt}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-text">{eq?.tag || '—'}</div>
                        <div className="text-[10px] text-muted font-medium mt-0.5">{[eq?.brand, eq?.model].filter(Boolean).join('/') || ''}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-accent/10 text-accent uppercase tracking-wide border border-accent/10">
                          {cat?.name || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted font-medium">{eq?.factory || '—'}</td>
                      <td className="px-5 py-4 text-muted max-w-[200px] truncate">{i.summary || '—'}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={e => { e.stopPropagation(); setExpandedId(isExpanded ? null : i.id); }}
                            className={`p-2 rounded-lg hover:bg-accent/10 transition-all cursor-pointer border-none bg-transparent ${isExpanded ? 'text-accent' : 'text-muted hover:text-accent'}`}
                          >
                            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(i.id); }}
                            className="p-2 text-bad hover:text-bad rounded-lg hover:bg-red-500/10 transition-all cursor-pointer border-none bg-transparent active:scale-90"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-accent/5 border-b border-accent/10">
                        <td colSpan={6} className="px-5 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="text-[10px] font-bold text-muted uppercase tracking-wider">รายละเอียดอุปกรณ์</div>
                              <div className="bg-card2/60 border border-border/40 rounded-xl p-3 space-y-1.5">
                                {[['Tag', eq?.tag], ['Brand/Model', [eq?.brand, eq?.model].filter(Boolean).join(' ')], ['กำลังไฟ', eq?.kw ? `${eq.kw} kW` : null], ['แผนก', eq?.dept]].map(([k, v]) => v ? (
                                  <div key={k} className="flex justify-between text-xs">
                                    <span className="text-muted">{k}:</span>
                                    <span className="font-bold text-text">{v}</span>
                                  </div>
                                ) : null)}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-[10px] font-bold text-muted uppercase tracking-wider">บันทึกการตรวจวัด</div>
                              <div className="bg-card2/60 border border-border/40 rounded-xl p-3">
                                <p className="text-xs text-text leading-relaxed">{i.summary || '—'}</p>
                                <div className="mt-3 pt-3 border-t border-border/30 flex items-center gap-2 text-[10px] text-muted">
                                  <Calendar size={11} />
                                  {i.date ? new Date(i.date).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              }) : (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center text-muted">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-card2 border border-border/60 flex items-center justify-center">
                        <HistoryIcon size={24} className="opacity-25" />
                      </div>
                      <p className="text-xs font-bold">{hasFilters ? 'ไม่พบรายการที่ตรงกัน' : t('no_inspections')}</p>
                      {hasFilters && (
                        <button onClick={clearFilters} className="text-[10px] text-accent font-bold cursor-pointer bg-transparent border-none hover:underline">
                          ล้างตัวกรอง
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
