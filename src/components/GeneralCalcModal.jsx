import React, { useState, useEffect, useContext, useMemo } from 'react';
import { ModalWrapper } from './Modals';
import { AppContext } from '../context/AppContext';
import { Check, AlertTriangle, Lightbulb } from 'lucide-react';

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
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={`${t('general_calculator')} - ${equipment?.tag || 'New'}`} maxWidth="700px">
      <div className="flex flex-col gap-6 h-[70vh] overflow-y-auto pr-2 pb-6">
        
        {/* SECTION 1: Input Parameters */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-text flex items-center gap-2 border-b border-border pb-2">
            <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs">1</span> 
            {t('parameters')} & {t('measures')}
          </h3>
          
          <div className="bg-surface border border-border p-5 rounded-xl space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
        <div className="space-y-4">
          <h3 className="text-base font-bold text-text flex items-center gap-2 border-b border-border pb-2">
            <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs">2</span> 
            {t('results')} & Savings
          </h3>
          
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
          
          <div className="flex justify-end pt-4 mt-4">
            <button 
              onClick={saveMeasure} 
              disabled={!savingsData}
              className={`px-6 py-2.5 text-white font-medium rounded-md transition-colors flex items-center gap-2 shadow-sm border-none cursor-pointer ${savingsData?.isNotWorthIt ? 'bg-slate-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              {t('save_measure')} <Check size={16} />
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
