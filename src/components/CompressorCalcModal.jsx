import React, { useState, useEffect, useContext, useMemo } from 'react';
import { ModalWrapper } from './Modals';
import { Zap, Target, ArrowRight, ArrowLeft, Check, Activity, Settings, Lightbulb, AlertTriangle } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { MEASURE_TYPES } from '../context/AppContext';

// Color performance indicator for compressor
const getSerStatus = (ser) => {
  if (!ser || ser <= 0) return null;
  // SER in kW/(m³/min) - lower is better
  if (ser <= 6.5) return { cls: 'bg-green-500/15 text-green-600 border-green-500/30', label: '✅ ดีมาก', info: '≤ 6.5' };
  if (ser <= 8.0) return { cls: 'bg-amber-500/15 text-amber-600 border-amber-500/30', label: '⚠️ พอใช้', info: '6.5–8.0' };
  return { cls: 'bg-red-500/15 text-red-600 border-red-500/30', label: '🔴 ต้องปรับปรุง', info: '> 8.0' };
};

const ColorLegend = () => (
  <div className="flex items-center gap-3 flex-wrap text-[10px] font-bold">
    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> ดีมาก</span>
    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> ควรปรับปรุง</span>
    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> เกินเกณฑ์</span>
  </div>
);

const MEASURES = [
  { id: 'leak', name: 'ลดลมรั่ว', nameEn: 'Reduce Air Leaks', desc: 'ซ่อมแซม/เปลี่ยนข้อต่อ ท่อ และวาล์วที่รั่ว', descEn: 'Repair or replace leaking pipe couplings, hoses and valves', icon: 'Settings' },
  { id: 'replace', name: 'เปลี่ยนเครื่องใหม่', nameEn: 'Replace with High-Efficiency Compressor', desc: 'เปลี่ยนทดแทนด้วยรุ่นประสิทธิภาพสูง', descEn: 'Replace legacy compressor with high efficiency units', icon: 'Zap' },
  { id: 'inlet_temp', name: 'ลดอุณหภูมิขาเข้า', nameEn: 'Optimize Inlet Air Temp', desc: 'ปรับระบบระบายความร้อน หรือท่อดูดอากาศ', descEn: 'Improve cooling ventilation or draw air from cooler source', icon: 'Activity' },
  { id: 'pressure', name: 'ลดความดันใช้งาน', nameEn: 'Reduce System Operating Pressure', desc: 'ปรับลดความดันระบบลงให้เหมาะสม', descEn: 'Reduce discharge pressure setpoint to match demand requirements', icon: 'Target' },
  { id: 'vsd', name: 'ติดตั้ง VSD', nameEn: 'Install VSD Controller', desc: 'ควบคุมความเร็วรอบตามภาระงานจริง', descEn: 'Control motor frequency with variable speed drive matching actual load', icon: 'Zap' }
];

const iconMap = {
  Settings: <Settings size={24} />,
  Zap: <Zap size={24} />,
  Activity: <Activity size={24} />,
  Target: <Target size={24} />
};

export default function CompressorCalcModal({ isOpen, onClose, equipment }) {
  const { data, setData, t, lang } = useContext(AppContext);
  
  const [params, setParams] = useState({
    processType: 'isentropic',
    p1: 101.325, p2: 700, t1: 30, gamma: 1.4, n_poly: 1.3, molWt: 28.97,
    eta_is: 80, flowRate: 10, stages: 1, pMotor: 55, etaMotor: 95, etaMech: 98,
    vDisplace: 5, rpm: 1450
  });

  const [selectedMeasure, setSelectedMeasure] = useState(null);
  const [measureData, setMeasureData] = useState({
    pctReduction: 10,
    opHours: 8000,
    elecRate: 4.50,
    investCost: 0,
    remark: '',
    measType: 'housekeeping',
    beforePhotos: []
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedMeasure(null);
      if (equipment) {
        setParams(p => ({
          ...p,
          pMotor: parseFloat(equipment.kw || equipment.capacity || p.pMotor) || p.pMotor
        }));
      }
    }
  }, [isOpen, equipment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams(p => ({ ...p, [name]: isNaN(parseFloat(value)) || value === '' ? value : parseFloat(value) }));
  };

  const handleMeasureDataChange = (e) => {
    setMeasureData(p => ({ ...p, [e.target.name]: parseFloat(e.target.value) || e.target.value }));
  };

  const calcResult = useMemo(() => {
    const R_u = 8314;
    const P1 = (params.p1 || 0) * 1000;
    const P2 = (params.p2 || 0) * 1000;
    const T1 = (params.t1 || 0) + 273.15;
    const gamma = params.gamma || 1.4;
    const n = params.n_poly || 1.3;
    const M = params.molWt || 28.97;
    const eta_is = (params.eta_is || 0) / 100;
    const Q_m3m = params.flowRate || 0;
    const P_mot = params.pMotor || 0;
    const etaMot = (params.etaMotor || 0) / 100;
    const etaMch = (params.etaMech || 0) / 100;
    
    if (P2 <= P1 || P1 <= 0 || T1 <= 0 || Q_m3m <= 0 || P_mot <= 0) return null;

    const R = R_u / M;
    const rho1 = P1 / (R * T1);
    const Q_s = Q_m3m / 60;
    const mdot = rho1 * Q_s;
    const pr = P2 / P1;

    let w_ideal, T2_ideal;
    if (params.processType === 'isentropic') {
      const exp = (gamma - 1) / gamma;
      T2_ideal = T1 * Math.pow(pr, exp);
      const Cp = gamma * R / (gamma - 1);
      w_ideal = Cp * (T2_ideal - T1);
    } else if (params.processType === 'polytropic') {
      const exp = (n - 1) / n;
      T2_ideal = T1 * Math.pow(pr, exp);
      const Cn = n * R / (n - 1);
      w_ideal = Cn * (T2_ideal - T1);
    } else {
      T2_ideal = T1;
      w_ideal = R * T1 * Math.log(pr);
    }

    const exp_is = (gamma - 1) / gamma;
    const T2_is_ideal = T1 * Math.pow(pr, exp_is);
    const T2_actual = T1 + (T2_is_ideal - T1) / eta_is;

    const P_ideal_kW = mdot * w_ideal / 1000;
    const P_shaft_kW = P_mot * etaMot * etaMch;
    const overall_eta = P_shaft_kW > 0 ? (P_ideal_kW / P_shaft_kW) * 100 : 0;
    const spec_power = Q_m3m > 0 ? P_shaft_kW / Q_m3m : 0;

    const Q_theoretical = ((params.vDisplace || 0) * 0.001 * (params.rpm || 0));
    const eta_vol = Q_theoretical > 0 ? (Q_m3m / Q_theoretical) * 100 : null;

    return {
      overall_eta, P_ideal_kW, P_shaft_kW, spec_power, eta_vol,
      T2_actual: T2_actual - 273.15, mdot, Q_m3m
    };
  }, [params]);

  const savingsData = useMemo(() => {
    if (!calcResult || !selectedMeasure) return null;
    
    const pShaft = calcResult.P_shaft_kW;
    const pctReduction = measureData.pctReduction || 0;
    const opHours = measureData.opHours || 0;
    const elecRate = measureData.elecRate || 0;
    
    const energyBefore = pShaft * opHours;
    const kWhSave = pShaft * (pctReduction / 100) * opHours;
    const bahtSave = kWhSave * elecRate;
    const ghgSave = (kWhSave * 0.4999) / 1000;
    const payback = measureData.investCost > 0 && bahtSave > 0 ? (measureData.investCost / bahtSave) : null;

    const isNotWorthIt = kWhSave <= 0;

    return {
      kWhSave, bahtSave, ghgSave, payback, energyBefore, pctRed: pctReduction, isNotWorthIt
    };
  }, [calcResult, selectedMeasure, measureData]);

  const saveMeasure = () => {
    if (!savingsData || !selectedMeasure) return;
    if (savingsData.isNotWorthIt) return; // blocked by UI
    if (!confirm('ยืนยันการบันทึกมาตรการประหยัดพลังงานนี้?')) return;

    const newMeasure = {
      id: 'm_' + Date.now(),
      eqId: equipment?.id,
      eqTag: equipment?.tag,
      catId: equipment?.catId,
      factory: equipment?.factory,
      date: new Date().toISOString(),
      measName: lang === 'th' ? selectedMeasure.name : selectedMeasure.nameEn,
      measType: measureData.measType || 'housekeeping',
      pct: parseFloat(savingsData.pctRed.toFixed(2)),
      opHours: measureData.opHours,
      kWhYear: savingsData.kWhSave,
      bahtYear: savingsData.bahtSave,
      invest: measureData.investCost,
      payback: savingsData.payback,
      energyType: 'elec',
      ghgTon: savingsData.ghgSave,
      status: 'in_progress',
      beforePhotos: measureData.beforePhotos || [],
      afterPhotos: []
    };

    setData({
      ...data,
      measures: [...data.measures, newMeasure]
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={`Compressor Calculator - ${equipment?.tag || 'New'}`} maxWidth="800px">
      <div className="flex flex-col gap-8 h-[70vh] overflow-y-auto pr-2 pb-6">
        
        {/* SECTION 1: Input Parameters */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-text flex items-center gap-2 border-b border-border pb-2">
            <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs">1</span> 
            {t('parameters')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Process / Environment</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-muted mb-1">Process Type</label>
                  <select name="processType" value={params.processType} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent">
                    <option value="isentropic">Isentropic</option>
                    <option value="polytropic">Polytropic</option>
                    <option value="isothermal">Isothermal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">P1 Inlet (kPa)</label>
                  <input type="number" name="p1" value={params.p1} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">P2 Outlet (kPa)</label>
                  <input type="number" name="p2" value={params.p2} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">T1 Inlet (°C)</label>
                  <input type="number" name="t1" value={params.t1} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Flow Rate (m³/min)</label>
                  <input type="number" name="flowRate" value={params.flowRate} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
                </div>
              </div>

              {params.processType === 'polytropic' && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Polytropic Index (n)</label>
                    <input type="number" name="n_poly" value={params.n_poly} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Motor & Machine</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Motor Power (kW)</label>
                  <input type="number" name="pMotor" value={params.pMotor} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Isentropic Eff (%)</label>
                  <input type="number" name="eta_is" value={params.eta_is} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Motor Eff (%)</label>
                  <input type="number" name="etaMotor" value={params.etaMotor} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Mech Eff (%)</label>
                  <input type="number" name="etaMech" value={params.etaMech} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Real-time Results */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-text flex items-center gap-2 border-b border-border pb-2">
            <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs">2</span> 
            {t('results')}
          </h3>
          
          {calcResult ? (
            <div className="animate-fade-in space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="col-span-2 md:col-span-4 mb-2">
                  <ResultBox label="Overall Isothermal Efficiency" val={calcResult.overall_eta} unit="%" color={calcResult.overall_eta >= 60 ? 'text-emerald-600' : (calcResult.overall_eta >= 45 ? 'text-amber-600' : 'text-red-600')} highlight large />
                </div>
                <ResultBox label="Specific Power" val={calcResult.spec_power} unit="kW/(m³/min)" color={calcResult.spec_power < 6.5 ? 'text-emerald-600' : (calcResult.spec_power < 8 ? 'text-amber-600' : 'text-red-600')} />
                <ResultBox label="Mass Flow Rate" val={calcResult.mdot} unit="kg/s" />
                <ResultBox label="Actual T2 (Outlet)" val={calcResult.T2_actual} unit="°C" />
                <ResultBox label="Ideal Power" val={calcResult.P_ideal_kW} unit="kW" />
              </div>
            </div>
          ) : (
            <div className="text-sm text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-200 flex gap-2">
              <AlertTriangle size={18} /> Please ensure P2 {'>'} P1 and all required parameters are valid to see results.
            </div>
          )}
        </div>

        {/* SECTION 3: Measures & Savings */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-text flex items-center gap-2 border-b border-border pb-2">
            <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs">3</span> 
            {t('measures')} & Savings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {MEASURES.map(m => (
              <div 
                key={m.id} 
                className={`p-3 border rounded-xl cursor-pointer transition-all ${selectedMeasure?.id === m.id ? 'border-accent bg-accent/5 shadow-sm' : 'border-border bg-surface hover:border-accent/50'}`}
                onClick={() => setSelectedMeasure(m)}
              >
                <div className="flex items-center gap-3 mb-1 text-slate-700">
                  {iconMap[m.icon]}
                  <span className="font-semibold text-sm text-text">{lang === 'th' ? m.name : m.nameEn}</span>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">{lang === 'th' ? m.desc : m.descEn}</p>
              </div>
            ))}
          </div>

          {selectedMeasure && (
            <div className="animate-fade-in bg-surface border border-border p-5 rounded-2xl">
              <h4 className="text-sm font-bold text-text mb-4 border-b border-border pb-2">
                Evaluate: {lang === 'th' ? selectedMeasure.name : selectedMeasure.nameEn}
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">{t('energy_reduction')} (%)</label>
                  <input type="number" name="pctReduction" value={measureData.pctReduction} onChange={handleMeasureDataChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent bg-blue-50 font-bold text-blue-700" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Operating (hrs/yr)</label>
                  <input type="number" name="opHours" value={measureData.opHours} onChange={handleMeasureDataChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Elec Cost (Baht/kWh)</label>
                  <input type="number" name="elecRate" value={measureData.elecRate} onChange={handleMeasureDataChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">{t('investment_cost')} (Baht)</label>
                  <input type="number" name="investCost" value={measureData.investCost} onChange={handleMeasureDataChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-bold" />
                </div>
              </div>

              {savingsData && (
                <div className={`p-5 border rounded-xl mt-4 flex flex-wrap justify-between items-center gap-4 ${savingsData.isNotWorthIt ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-100'}`}>
                  {savingsData.isNotWorthIt ? (
                    <div className="w-full flex items-center gap-3 text-red-600 font-bold">
                      <AlertTriangle size={24} />
                      <div>
                        ไม่คุ้มค่า (Not Cost-Effective)
                        <div className="text-xs font-normal text-red-500 mt-1">มาตรการนี้ไม่ก่อให้เกิดผลประหยัดพลังงานที่คุ้มค่า (ผลประหยัด ≤ 0)</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="text-xs text-emerald-800 uppercase tracking-wide font-medium mb-1">{t('estimated_savings')}</div>
                        <div className="text-xl font-bold text-emerald-600 font-mono">
                          {(savingsData.kWhSave || 0).toLocaleString(undefined, {maximumFractionDigits:0})} <span className="text-xs text-emerald-700/80 font-sans">{t('kwh_yr')}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-emerald-800 uppercase tracking-wide font-medium mb-1">{t('carbon_reduction')}</div>
                        <div className="text-xl font-bold text-emerald-600 font-mono">
                          {(savingsData.ghgSave || 0).toLocaleString(undefined, {maximumFractionDigits:1})} <span className="text-xs text-emerald-700/80 font-sans">tCO₂e/yr</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-emerald-800 uppercase tracking-wide font-medium mb-1">{t('cost_savings')}</div>
                        <div className="text-xl font-bold text-emerald-600 font-mono">
                          {(savingsData.bahtSave || 0).toLocaleString(undefined, {maximumFractionDigits:0})} <span className="text-xs text-emerald-700/80 font-sans">{t('thb_yr')}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              <div className="flex justify-end pt-4 mt-4">
                <button 
                  onClick={saveMeasure} 
                  disabled={!savingsData || savingsData.isNotWorthIt}
                  className={`px-6 py-2.5 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm border-none text-sm ${
                    !savingsData || savingsData.isNotWorthIt
                      ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 cursor-pointer'
                  }`}
                >
                  {t('save_measure')} <Check size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}

function ResultBox({ label, val, unit, color = "text-text", highlight, large }) {
  return (
    <div className={`p-4 border rounded-xl ${highlight ? 'bg-accent/5 border-accent/40 shadow-sm' : 'bg-surface border-border'} flex flex-col justify-center`}>
      <div className={`font-medium text-muted uppercase tracking-wider mb-1 ${large ? 'text-xs text-accent' : 'text-[11px]'}`}>{label}</div>
      <div className={`font-bold font-mono ${color} ${large ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'}`}>
        {typeof val === 'number' ? val.toFixed(2) : val}
      </div>
      <div className="text-[10px] text-muted mt-1">{unit}</div>
    </div>
  );
}
