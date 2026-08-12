import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Check, AlertTriangle, ArrowLeft, Settings, Activity } from 'lucide-react';



export default function GeneralCalcModal({ isOpen, onClose, equipment }) {
  const { data, setData, t, lang } = useContext(AppContext);
  
  const [params, setParams] = useState({
    measureName: 'เปลี่ยนอุปกรณ์ประสิทธิภาพสูง',
    measureNameEn: 'Replace with High-Efficiency Equipment',
    category: 'Minor',
    customName: '',
    currentKW: 10,
    proposedKW: 5,
    opHours: 8000,
    elecRate: 4.5,
    investCost: 50000
  });

  useEffect(() => {
    if (isOpen) {
      if (equipment) {
        setParams(p => ({
          ...p,
          measureName: lang === 'th' ? 'ปรับปรุงประสิทธิภาพเครื่องจักร' : 'Improve Equipment Efficiency',
          measureNameEn: 'Improve Equipment Efficiency',
          currentKW: parseFloat(equipment.kw || equipment.capacity || p.currentKW) || p.currentKW
        }));
      }
    }
  }, [isOpen, equipment, lang]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams(p => ({ ...p, [name]: (name.includes('Name') || name === 'category' || name === 'customName') ? value : (isNaN(parseFloat(value)) || value === '' ? value : parseFloat(value)) }));
  };

  const savingsData = useMemo(() => {
    const { currentKW, proposedKW, opHours, elecRate, investCost } = params;
    
    if (currentKW <= 0 || proposedKW <= 0 || opHours <= 0) return null;

    const kwSaved = currentKW - proposedKW;
    const kWhYear = kwSaved * opHours;
    const bahtYear = kWhYear * elecRate;
    const payback = investCost > 0 && bahtYear > 0 ? (investCost / bahtYear) : null;
    const ghgTon = (kWhYear * 0.4999) / 1000;

    const isNotWorthIt = kwSaved <= 0;

    return {
      kwSaved, kWhYear, bahtYear, payback, ghgTon, investCost, isNotWorthIt
    };
  }, [params]);

  const saveMeasure = () => {
    if (!savingsData) return;
    
    if (savingsData.isNotWorthIt) {
      if (!confirm('ข้อมูลแสดงให้เห็นว่า "ไม่คุ้มค่า" (ผลประหยัดติดลบหรือเท่ากับ 0) คุณแน่ใจหรือไม่ว่าต้องการบันทึกมาตรการนี้?')) {
        return;
      }
    }
    
    const pct = ((params.currentKW - params.proposedKW) / params.currentKW) * 100;

    const finalName = params.customName.trim() !== '' 
      ? params.customName 
      : (lang === 'th' ? params.measureName : params.measureNameEn);

    const newMeasure = {
      id: 'm_' + Date.now(),
      eqId: equipment?.id || null,
      eqTag: equipment?.tag || 'General',
      catId: equipment?.catId || 'other',
      factory: equipment?.factory || 'Unknown',
      date: new Date().toISOString(),
      measName: `[${params.category}] ${finalName}`,
      pct: pct,
      opHours: params.opHours,
      kWhYear: savingsData.kWhYear,
      bahtYear: savingsData.bahtYear,
      invest: savingsData.investCost,
      payback: savingsData.payback,
      energyType: 'elec',
      ghgTon: savingsData.ghgTon
    };

    setData({
      ...data,
      measures: [...data.measures, newMeasure]
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6 pb-20 pt-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold text-text">
            {t('general_calculator')} — {equipment?.tag || 'General'}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-sm text-muted">{equipment?.factory || ''}</span>
            {equipment?.brand && <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-xs font-medium">{equipment.brand} {equipment.model}</span>}
            {equipment?.kw && <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-600 rounded text-xs font-medium">{equipment.kw} kW</span>}
            {equipment?.capacity && <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded text-xs font-medium">{equipment.capacity} TR</span>}
            {equipment?.opHoursYear && <span className="px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-600 rounded text-xs font-medium">{equipment.opHoursYear} hrs/yr</span>}
            {equipment?.efficiency && <span className="px-2 py-0.5 bg-purple-50 border border-purple-100 text-purple-600 rounded text-xs font-medium">{equipment.efficiency} kW/TR</span>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-1.5 bg-surface text-text cursor-pointer">
            <ArrowLeft size={16} /> {t('cancel')}
          </button>
          <button
            onClick={saveMeasure}
            disabled={!savingsData || savingsData.isNotWorthIt}
            className={`px-4 py-2 text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-sm border-none cursor-pointer active:scale-95 ${
              !savingsData || savingsData.isNotWorthIt ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <Check size={16} /> {t('save_measure')}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* SECTION 1: Input Parameters */}
        <div className="bg-surface border border-border p-6 rounded-xl space-y-4 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-accent/50 group-hover:bg-accent transition-colors"></div>
          <h4 className="text-sm font-bold text-text uppercase tracking-wider mb-2 border-b border-border pb-2 flex items-center gap-2">
            <Settings size={16} className="text-muted" /> {t('parameters')} & {t('measures')}
          </h4>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">ประเภทมาตรการ (Category)</label>
                <select name="category" value={params.category} onChange={handleChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-semibold">
                  <option value="Housekeeping">Housekeeping (No/Low Cost)</option>
                  <option value="Minor">Minor (Medium Cost)</option>
                  <option value="Major">Major (High Cost)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">{t('measure_name')} (ระบุเองได้)</label>
                <input 
                  type="text" 
                  name="customName" 
                  placeholder={lang === 'th' ? params.measureName : params.measureNameEn}
                  value={params.customName} 
                  onChange={handleChange} 
                  className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">{t('current_power')}</label>
                <input type="number" name="currentKW" value={params.currentKW} onChange={handleChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">{lang === 'th' ? "กำลังไฟฟ้าหลังปรับปรุง (kW)" : "Proposed Power (kW)"}</label>
                <input type="number" name="proposedKW" value={params.proposedKW} onChange={handleChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">{t('operating_hours')}</label>
                <input type="number" name="opHours" value={params.opHours} onChange={handleChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">{t('electricity_rate')}</label>
                <input type="number" name="elecRate" value={params.elecRate} onChange={handleChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-muted mb-1">{t('investment_cost')}</label>
                <input type="number" name="investCost" value={params.investCost} onChange={handleChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono font-bold" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Real-time Results */}
        <div className="bg-surface border border-border p-6 rounded-xl space-y-4 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50 group-hover:bg-emerald-500 transition-colors"></div>
          <h4 className="text-sm font-bold text-text uppercase tracking-wider mb-2 border-b border-border pb-2 flex items-center gap-2">
            <Activity size={16} className="text-muted" /> {t('results')} & Savings
          </h4>
          
          {savingsData ? (
            <div className={`p-5 border rounded-xl mt-4 flex flex-wrap justify-between items-center gap-4 ${savingsData.isNotWorthIt ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-100'}`}>
              {savingsData.isNotWorthIt ? (
                <div className="w-full flex items-center gap-3 text-red-600 font-bold">
                  <AlertTriangle size={24} />
                  <div>
                    ไม่คุ้มค่า (Not Cost-Effective)
                    <div className="text-xs font-normal text-red-500 mt-1">
                      กำลังไฟฟ้าหลังปรับปรุง ({params.proposedKW} kW) สูงกว่าหรือเท่ากับกำลังไฟฟ้าปัจจุบัน ({params.currentKW} kW)
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="text-xs text-emerald-800 uppercase tracking-wide font-medium mb-1">{t('estimated_savings')}</div>
                    <div className="text-xl font-bold text-emerald-600 font-mono">
                      {(savingsData.kWhYear || 0).toLocaleString(undefined, {maximumFractionDigits:0})} <span className="text-xs text-emerald-700/80 font-sans">{t('kwh_yr')}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-emerald-800 uppercase tracking-wide font-medium mb-1">{t('carbon_reduction')}</div>
                    <div className="text-xl font-bold text-emerald-600 font-mono">
                      {(savingsData.ghgTon || 0).toLocaleString(undefined, {maximumFractionDigits:1})} <span className="text-xs text-emerald-700/80 font-sans">tCO₂e/yr</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-emerald-800 uppercase tracking-wide font-medium mb-1">{t('cost_savings')}</div>
                    <div className="text-xl font-bold text-emerald-600 font-mono">
                      {(savingsData.bahtYear || 0).toLocaleString(undefined, {maximumFractionDigits:0})} <span className="text-xs text-emerald-700/80 font-sans">{t('thb_yr')}</span>
                    </div>
                  </div>
                  
                  {savingsData.payback !== null && (
                    <div className="w-full pt-3 mt-1 border-t border-emerald-200 flex justify-between items-center">
                      <span className="text-sm text-emerald-800 font-medium">ระยะเวลาคืนทุน (Payback Period):</span>
                      <span className="text-lg font-bold text-emerald-700 font-mono">{savingsData.payback.toFixed(2)} <span className="text-sm font-sans">ปี</span></span>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="text-sm text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-200 flex gap-2">
              <AlertTriangle size={18} /> กรุณากรอกข้อมูลให้ครบถ้วนเพื่อคำนวณผลประหยัด
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
