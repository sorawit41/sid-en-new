import React, { useState, useEffect, useContext, useMemo } from 'react';
import { ModalWrapper } from './Modals';
import { ArrowRight, ArrowLeft, Check, Lightbulb, Settings, Zap, Droplets, ThermometerSnowflake, AlertTriangle, Camera, X } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { MEASURE_TYPES } from '../context/AppContext';

// Color performance indicator helper
const getKwTrStatus = (kwTr) => {
  if (!kwTr || kwTr <= 0) return null;
  if (kwTr <= 0.65) return { color: 'green', label: '✅ ดีมาก', range: '≤ 0.65', cls: 'bg-green-500/15 text-green-600 border-green-500/30' };
  if (kwTr <= 0.80) return { color: 'amber', label: '⚠️ พอใช้', range: '0.65–0.80', cls: 'bg-amber-500/15 text-amber-600 border-amber-500/30' };
  return { color: 'red', label: '🔴 ต้องปรับปรุง', range: '> 0.80', cls: 'bg-red-500/15 text-red-600 border-red-500/30' };
};

const getCopStatus = (cop) => {
  if (!cop || cop <= 0) return null;
  if (cop >= 5.5) return { color: 'green', label: '✅ ดีมาก', cls: 'bg-green-500/15 text-green-600 border-green-500/30' };
  if (cop >= 4.5) return { color: 'amber', label: '⚠️ พอใช้', cls: 'bg-amber-500/15 text-amber-600 border-amber-500/30' };
  return { color: 'red', label: '🔴 ต่ำมาก', cls: 'bg-red-500/15 text-red-600 border-red-500/30' };
};

const CHILLER_BENCHMARKS = [
  { label: 'kW/TR', goodRange: '≤ 0.65', warnRange: '0.65–0.80', badRange: '> 0.80' },
  { label: 'COP', goodRange: '≥ 5.5', warnRange: '4.5–5.5', badRange: '< 4.5' },
];

const ColorLegend = () => (
  <div className="flex items-center gap-3 flex-wrap text-[10px] font-bold">
    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> ดีมาก</span>
    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> ควรปรับปรุง</span>
    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> เกินเกณฑ์</span>
  </div>
);

const MEASURES = [
  { id: 'clean_tube', name: 'ล้าง Tube Condenser', nameEn: 'Clean Condenser Tubes', desc: 'ทำความสะอาดคราบตะกรันในท่อแลกเปลี่ยนความร้อน', descEn: 'Remove scale build-up inside condenser heat exchanger tubes', icon: 'Settings' },
  { id: 'inc_chws', name: 'ปรับเพิ่มอุณหภูมิน้ำเย็น', nameEn: 'Increase Chilled Water Temp (CHWS)', desc: 'เพิ่ม Setpoint ของน้ำเย็นจ่าย (CHWS) ตามโหลดจริง', descEn: 'Raise chilled water setpoint (CHWS) based on actual load demand', icon: 'ThermometerSnowflake' },
  { id: 'dec_cws', name: 'ลดอุณหภูมิน้ำหล่อเย็น', nameEn: 'Decrease Condenser Water Temp (CWS)', desc: 'เพิ่มรอบพัดลม Cooling Tower เพื่อลด T_CWS', descEn: 'Increase cooling tower fan speed to lower condenser water temperature T_CWS', icon: 'Droplets' },
  { id: 'vsd_chiller', name: 'ติดตั้ง VSD ที่ Chiller', nameEn: 'Install VSD on Chiller', desc: 'ควบคุมความเร็วรอบ Compressor ตามภาระงาน', descEn: 'Control compressor speed with variable speed drives matching load profile', icon: 'Zap' },
  { id: 'replace_chiller', name: 'เปลี่ยนเครื่อง Chiller ใหม่', nameEn: 'Replace with High-Efficiency Chiller', desc: 'เปลี่ยนทดแทนด้วย Chiller ประสิทธิภาพสูงรุ่นใหม่', descEn: 'Replace legacy chiller with a state-of-the-art high efficiency model', icon: 'Zap' }
];

const RECOMMENDED_CHILLERS = [
  { id: 'c1', brand: 'Trane', model: 'CVHE Centrifugal', kw_tr: 0.55, desc: 'High Efficiency Water Cooled' },
  { id: 'c2', brand: 'Carrier', model: '19DV Centrifugal', kw_tr: 0.52, desc: 'Ultra High Efficiency' },
  { id: 'c3', brand: 'Daikin', model: 'Magnitude Magnetic', kw_tr: 0.48, desc: 'Magnetic Bearing Oil-Free' },
  { id: 'c4', brand: 'York', model: 'YMC2 Magnetic', kw_tr: 0.49, desc: 'Magnetic Bearing VSD' }
];

const iconMap = {
  Settings: <Settings size={24} />,
  Zap: <Zap size={24} />,
  Droplets: <Droplets size={24} />,
  ThermometerSnowflake: <ThermometerSnowflake size={24} />
};

export default function ChillerCalcModal({ isOpen, onClose, equipment }) {
  const { data, setData, t, lang } = useContext(AppContext);
  
  const [params, setParams] = useState({
    coolingType: 'water',
    tchws: 45.6, tchwr: 54, chwFlowGPM: 2400, cpWater: 4.187, rhoWater: 1.0,
    tcws: 84.1, tcwr: 90.6, qcw: 38,
    tdb: 84.1,
    pInput: 657.84, loadPct: 70, refrigerant: 'R-134a',
    opHoursPerDay: 10, opDaysPerYear: 250, elecRate: 4.65
  });

  const [selectedMeasure, setSelectedMeasure] = useState(null);
  const [measureData, setMeasureData] = useState({
    pctReduction: 20,
    targetKwTr: 0.55,
    investCost: 5130000,
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
          pInput: parseFloat(equipment.kw || equipment.capacity || p.pInput) || p.pInput
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
    const T_CHWS_F = params.tchws || 0;
    const T_CHWR_F = params.tchwr || 0;
    const chwFlowGPM = params.chwFlowGPM || 0;
    const Cp = params.cpWater || 0;
    const rho = params.rhoWater || 0;
    const P_in   = params.pInput || 0;
    
    if (T_CHWR_F <= T_CHWS_F || P_in <= 0) return null;

    const TR = (chwFlowGPM * (T_CHWR_F - T_CHWS_F)) / 24;
    const kWperTR = P_in / TR;
    const Q_cool_kW = TR * 3.517;
    const COP = Q_cool_kW / P_in;
    const EER = COP * 3.412;

    const T_CHWS = (T_CHWS_F - 32) * 5 / 9;
    const T_CHWR = (T_CHWR_F - 32) * 5 / 9;

    let Q_rej_kW = 0;
    let heatBalance = 0;
    let T_cond = 0;

    if (params.coolingType === 'water') {
      const T_CWS_F = params.tcws || 0;
      const T_CWR_F = params.tcwr || 0;
      if (T_CWR_F > T_CWS_F) {
        const T_CWS = (T_CWS_F - 32) * 5 / 9;
        const T_CWR = (T_CWR_F - 32) * 5 / 9;
        const Q_CW   = params.qcw || 0;
        const mdot_cw  = Q_CW * rho;
        Q_rej_kW = mdot_cw * Cp * (T_CWR - T_CWS);
        heatBalance = ((Q_rej_kW - (Q_cool_kW + P_in)) / Q_rej_kW) * 100;
        T_cond = T_CWR + 5;
      }
    } else {
      const T_DB_F = params.tdb || 0;
      const T_DB = (T_DB_F - 32) * 5 / 9;
      Q_rej_kW = Q_cool_kW + P_in;
      heatBalance = 0;
      T_cond = T_DB + 15;
    }

    const T_evap = T_CHWS - 5;
    const T_evap_K = T_evap + 273.15;
    const T_cond_K = T_cond + 273.15;
    const COP_carnot = T_evap_K / (T_cond_K - T_evap_K);
    const eta_carnot = (COP / COP_carnot) * 100;

    return {
      coolingType: params.coolingType,
      Q_cool_kW, Q_rej_kW, TR, COP, EER, kWperTR, heatBalance, eta_carnot, P_in
    };
  }, [params]);

  const selectRecommendation = (model) => {
    setMeasureData(p => ({ ...p, targetKwTr: model.kw_tr }));
  };

  const savingsData = useMemo(() => {
    if (!calcResult || !selectedMeasure) return null;
    
    const pInput = calcResult.P_in;
    const annualHours = (params.opHoursPerDay || 0) * (params.opDaysPerYear || 0);
    const loadFactor = (params.loadPct || 0) / 100;
    
    const energyBefore = pInput * loadFactor * annualHours;
    let pctRed = measureData.pctReduction || 0;
    
    if (selectedMeasure.id === 'replace_chiller' && measureData.targetKwTr) {
       pctRed = ((calcResult.kWperTR - measureData.targetKwTr) / calcResult.kWperTR) * 100;
    }

    const kWhSave = energyBefore * (pctRed / 100);
    const bahtSave = kWhSave * (params.elecRate || 0);
    const ghgSave = (kWhSave * 0.4999) / 1000;
    const payback = measureData.investCost > 0 && bahtSave > 0 ? (measureData.investCost / bahtSave) : null;

    const isNotWorthIt = kWhSave <= 0;

    return {
      annualHours, kWhSave, bahtSave, ghgSave, payback, pctRed, energyBefore, isNotWorthIt
    };
  }, [calcResult, selectedMeasure, measureData, params]);

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
      opHours: savingsData.annualHours,
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
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={`Chiller Calculator - ${equipment?.tag || 'New'}`} maxWidth="800px">
      <div className="flex flex-col gap-8 h-[70vh] overflow-y-auto pr-2 pb-6">
        
        {/* SECTION 1: Input Parameters */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-text flex items-center gap-2 border-b border-border pb-2">
            <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs">1</span> 
            {t('parameters')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Operation Data</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Time/day (hr/day)</label>
                  <input type="number" name="opHoursPerDay" value={params.opHoursPerDay} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Day/Year (day/yr)</label>
                  <input type="number" name="opDaysPerYear" value={params.opDaysPerYear} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">% Load</label>
                  <input type="number" name="loadPct" value={params.loadPct} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Elec Cost (Baht/kWh)</label>
                  <input type="number" name="elecRate" value={params.elecRate} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
                </div>
              </div>

              <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-2 pt-4">Measurement (Chilled Water)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">T_CHWS (°F)</label>
                  <input type="number" name="tchws" value={params.tchws} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">T_CHWR (°F)</label>
                  <input type="number" name="tchwr" value={params.tchwr} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-muted mb-1">Flow CHW (GPM)</label>
                  <input type="number" name="chwFlowGPM" value={params.chwFlowGPM} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">{t('power_load')}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">{t('cooling_type')}</label>
                  <select name="coolingType" value={params.coolingType} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent">
                    <option value="water">{t('water_cooled')}</option>
                    <option value="air">{t('air_cooled')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Power Input (kW)</label>
                  <input type="number" name="pInput" value={params.pInput} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-muted mb-1">Refrigerant</label>
                  <select name="refrigerant" value={params.refrigerant} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent">
                    <option value="R-134a">R-134a</option>
                    <option value="R-123">R-123</option>
                    <option value="R-410A">R-410A</option>
                    <option value="R-32">R-32</option>
                  </select>
                </div>
              </div>

              {params.coolingType === 'water' ? (
                <>
                  <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-2 pt-4">{t('condenser_water')}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">T_CWS (°F)</label>
                      <input type="number" name="tcws" value={params.tcws} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">T_CWR (°F)</label>
                      <input type="number" name="tcwr" value={params.tcwr} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted mb-1">Flow CW (L/s)</label>
                      <input type="number" name="qcw" value={params.qcw} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-2 pt-4">{t('dry_bulb_temp')}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-muted mb-1">T_DB (°F)</label>
                      <input type="number" name="tdb" value={params.tdb} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
                    </div>
                  </div>
                </>
              )}
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
              {/* Color Legend */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">เกณฑ์มาตรฐาน</span>
                <ColorLegend />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* COP - Big highlight with color */}
                {(() => {
                  const st = getCopStatus(calcResult.COP);
                  return (
                    <div className={`col-span-2 md:col-span-2 p-4 rounded-xl border ${st?.cls || 'bg-card2 border-border'}`}>
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">{t('cop_desc')}</div>
                      <div className="text-2xl font-bold font-mono">{calcResult.COP?.toFixed(2)}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-muted">เกณฑ์: ≥ 5.5 = ดี, 4.5–5.5 = พอใช้</span>
                        {st && <span className="text-[10px] font-bold">{st.label}</span>}
                      </div>
                    </div>
                  );
                })()}

                {/* kW/TR - highlight with color */}
                {(() => {
                  const st = getKwTrStatus(calcResult.kWperTR);
                  return (
                    <div className={`col-span-2 p-4 rounded-xl border ${st?.cls || 'bg-card2 border-border'}`}>
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">{t('specific_power')}</div>
                      <div className="text-2xl font-bold font-mono">{calcResult.kWperTR?.toFixed(3)} <span className="text-sm font-normal">kW/TR</span></div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-muted">เกณฑ์: ≤ 0.65 = ดี, 0.65–0.80 = พอใช้</span>
                        {st && <span className="text-[10px] font-bold">{st.label}</span>}
                      </div>
                    </div>
                  );
                })()}

                <ResultBox label={t('cooling_capacity')} val={calcResult.Q_cool_kW} unit="kW" />
                <ResultBox label={t('capacity_tr')} val={calcResult.TR} unit="TR" />
                <ResultBox label={t('heat_rejection')} val={calcResult.Q_rej_kW} unit="kW" />
                <ResultBox label="EER" val={calcResult.EER} unit="BTU/W" />
              </div>
            </div>
          ) : (
            <div className="text-sm text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-200 flex gap-2">
              <AlertTriangle size={18} /> Please ensure T_CHWR {'>'} T_CHWS and Power Input {'>'} 0 to see results.
            </div>
          )}
        </div>

        {/* SECTION 3: Measures & Savings */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-text flex items-center gap-2 border-b border-border pb-2">
            <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs">3</span> 
            {t('measures')} & Savings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 mb-6">
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

              {selectedMeasure.id === 'replace_chiller' && (
                <div className="bg-slate-50 border border-border rounded-xl p-4 mb-4">
                  <h5 className="text-xs font-semibold text-text mb-2 flex items-center gap-2">
                    <Lightbulb size={14} className="text-accent" /> {t('chiller_recommend')}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {RECOMMENDED_CHILLERS.map(rc => (
                      <div 
                        key={rc.id} 
                        onClick={() => selectRecommendation(rc)}
                        className="bg-white border border-border rounded-lg p-2 cursor-pointer hover:border-accent hover:shadow-sm transition-all flex justify-between items-center group"
                      >
                        <div>
                          <div className="text-[11px] font-bold text-text group-hover:text-accent transition-colors">{rc.brand} {rc.model}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-emerald-600 font-mono">{rc.kw_tr} <span className="text-[9px] text-muted">kW/TR</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                {selectedMeasure.id === 'replace_chiller' ? (
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Expected Efficiency After (kW/TR)</label>
                    <input type="number" name="targetKwTr" value={measureData.targetKwTr} onChange={handleMeasureDataChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent bg-blue-50 font-bold text-blue-700" />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">{t('energy_reduction')} (%)</label>
                    <input type="number" name="pctReduction" value={measureData.pctReduction} onChange={handleMeasureDataChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">{t('investment_cost')} (Baht)</label>
                  <input type="number" name="investCost" value={measureData.investCost} onChange={handleMeasureDataChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-bold" />
                </div>
              </div>


              {/* Measure Type Selector */}
              <div className="mb-2">
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">ประเภทมาตรการ</label>
                <div className="flex gap-2 flex-wrap">
                  {MEASURE_TYPES.map(mt => {
                    const colorMap = { green: 'bg-green-500/15 text-green-700 border-green-500/30 hover:bg-green-500/25', amber: 'bg-amber-500/15 text-amber-700 border-amber-500/30 hover:bg-amber-500/25', red: 'bg-red-500/15 text-red-700 border-red-500/30 hover:bg-red-500/25' };
                    const isSel = measureData.measType === mt.id;
                    return (
                      <button
                        key={mt.id}
                        type="button"
                        onClick={() => setMeasureData(p => ({ ...p, measType: mt.id }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${colorMap[mt.color]} ${isSel ? 'ring-2 ring-offset-1 ring-current' : ''}`}
                      >
                        {isSel && <Check size={11} className="inline mr-1" />}
                        {lang === 'th' ? mt.labelTh : mt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Savings summary */}
              {savingsData && (
                <div className={`p-5 border rounded-xl flex flex-wrap justify-between items-center gap-4 ${savingsData.isNotWorthIt ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-700'}`}>
                  {savingsData.isNotWorthIt ? (
                    <div className="w-full flex items-center gap-3 text-red-600 font-bold">
                      <AlertTriangle size={24} />
                      <div>
                        ⛔ ไม่คุ้มค่า — ประหยัดได้ติดลบหรือเท่ากับศูนย์
                        <div className="text-xs font-normal text-red-500 mt-1">มาตรการนี้ไม่ทำให้ประหยัดพลังงาน ไม่สามารถบันทึกได้</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="text-xs text-emerald-800 dark:text-emerald-200 uppercase tracking-wide font-medium mb-1">{t('estimated_savings')}</div>
                        <div className="text-xl font-bold text-emerald-600 font-mono">
                          {(savingsData.kWhSave || 0).toLocaleString(undefined, {maximumFractionDigits:0})} <span className="text-xs text-emerald-700/80 font-sans">{t('kwh_yr')}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-emerald-800 dark:text-emerald-200 uppercase tracking-wide font-medium mb-1">{t('carbon_reduction')}</div>
                        <div className="text-xl font-bold text-emerald-600 font-mono">
                          {(savingsData.ghgSave || 0).toLocaleString(undefined, {maximumFractionDigits:1})} <span className="text-xs text-emerald-700/80 font-sans">tCO₂e/yr</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-emerald-800 dark:text-emerald-200 uppercase tracking-wide font-medium mb-1">{t('cost_savings')}</div>
                        <div className="text-xl font-bold text-emerald-600 font-mono">
                          {(savingsData.bahtSave || 0).toLocaleString(undefined, {maximumFractionDigits:0})} <span className="text-xs text-emerald-700/80 font-sans">{t('thb_yr')}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              <div className="flex justify-end pt-4">
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
