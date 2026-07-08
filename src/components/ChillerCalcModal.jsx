import React, { useState, useEffect, useContext } from 'react';
import { ModalWrapper } from './Modals';
import { ArrowRight, ArrowLeft, Check, Lightbulb, Settings, Zap, Droplets, ThermometerSnowflake } from 'lucide-react';
import { AppContext } from '../context/AppContext';

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
  const [step, setStep] = useState(1);
  const [calcResult, setCalcResult] = useState(null);
  
  // Step 1: Input State
  const [params, setParams] = useState({
    coolingType: 'water',
    tchws: 45.6, tchwr: 54, chwFlowGPM: 2400, cpWater: 4.187, rhoWater: 1.0,
    tcws: 84.1, tcwr: 90.6, qcw: 38,
    tdb: 84.1,
    pInput: 657.84, loadPct: 70, refrigerant: 'R-134a',
    opHoursPerDay: 10, opDaysPerYear: 250, elecRate: 4.65
  });

  // Step 2-4: Measure State
  const [selectedMeasure, setSelectedMeasure] = useState(null);
  const [measureData, setMeasureData] = useState({
    pctReduction: 20,
    targetKwTr: 0.55,
    investCost: 5130000,
    remark: ''
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCalcResult(null);
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

  const calculate = () => {
    const T_CHWS_F = params.tchws;
    const T_CHWR_F = params.tchwr;
    const chwFlowGPM = params.chwFlowGPM;
    const Cp = params.cpWater;
    const rho = params.rhoWater;
    const P_in   = params.pInput;
    
    if (T_CHWR_F <= T_CHWS_F) return alert(lang === 'th' ? 'T_CHWR ต้องมากกว่า T_CHWS' : 'T_CHWR must be greater than T_CHWS');
    if (P_in   <= 0)      return alert(lang === 'th' ? 'กำลังไฟฟ้า P_input ต้องมากกว่า 0' : 'Power input P_input must be greater than 0');

    // Calculate TR using Excel formula: TR = GPM * deltaT / 24
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
      const T_CWS_F = params.tcws;
      const T_CWR_F = params.tcwr;
      if (T_CWR_F <= T_CWS_F) return alert(lang === 'th' ? 'T_CWR ต้องมากกว่า T_CWS' : 'T_CWR must be greater than T_CWS');
      
      const T_CWS = (T_CWS_F - 32) * 5 / 9;
      const T_CWR = (T_CWR_F - 32) * 5 / 9;
      const Q_CW   = params.qcw;
      const mdot_cw  = Q_CW * rho;
      Q_rej_kW = mdot_cw * Cp * (T_CWR - T_CWS);
      heatBalance = ((Q_rej_kW - (Q_cool_kW + P_in)) / Q_rej_kW) * 100;
      T_cond = T_CWR + 5;
    } else {
      // Air Cooled
      const T_DB_F = params.tdb;
      const T_DB = (T_DB_F - 32) * 5 / 9;
      Q_rej_kW = Q_cool_kW + P_in;
      heatBalance = 0;
      T_cond = T_DB + 15; // Approximated Condensation Temperature is Dry Bulb + 15°C
    }

    const T_evap = T_CHWS - 5;
    const T_evap_K = T_evap + 273.15;
    const T_cond_K = T_cond + 273.15;
    const COP_carnot = T_evap_K / (T_cond_K - T_evap_K);
    const eta_carnot = (COP / COP_carnot) * 100;

    setCalcResult({
      coolingType: params.coolingType,
      tchws: T_CHWS_F,
      tchwr: T_CHWR_F,
      chwFlowGPM,
      tcws: params.tcws,
      tcwr: params.tcwr,
      qcw: params.qcw,
      tdb: params.tdb,
      Q_cool_kW, Q_rej_kW, TR, COP, EER, kWperTR, heatBalance, iplv: null, eta_carnot, P_in
    });
    setStep(2);
  };

  const saveMeasure = () => {
    if (!calcResult || !selectedMeasure) return;
    
    const pInput = calcResult.P_in;
    const annualHours = params.opHoursPerDay * params.opDaysPerYear;
    const loadFactor = params.loadPct / 100;
    
    const energyBefore = pInput * loadFactor * annualHours;
    let pctRed = measureData.pctReduction;
    
    if (selectedMeasure.id === 'replace_chiller' && measureData.targetKwTr) {
       pctRed = ((calcResult.kWperTR - measureData.targetKwTr) / calcResult.kWperTR) * 100;
    }

    const kWhSave = energyBefore * (pctRed / 100);
    const bahtSave = kWhSave * params.elecRate;
    const payback = measureData.investCost > 0 && bahtSave > 0 ? (measureData.investCost / bahtSave) : null;

    const newMeasure = {
      id: 'm_' + Date.now(),
      eqId: equipment?.id,
      eqTag: equipment?.tag,
      catId: equipment?.catId,
      factory: equipment?.factory,
      date: new Date().toISOString(),
      measName: lang === 'th' ? selectedMeasure.name : selectedMeasure.nameEn,
      pct: parseFloat(pctRed.toFixed(2)),
      opHours: annualHours,
      kWhYear: kWhSave,
      bahtYear: bahtSave,
      invest: measureData.investCost,
      payback: payback,
      energyType: 'elec',
      ghgTon: (kWhSave * 0.4999) / 1000
    };

    setData({
      ...data,
      measures: [...data.measures, newMeasure]
    });
    
    onClose();
  };

  const handleMeasureDataChange = (e) => {
    setMeasureData(p => ({ ...p, [e.target.name]: parseFloat(e.target.value) || e.target.value }));
  };

  const selectRecommendation = (model) => {
    if (!calcResult || !calcResult.kWperTR) return;
    const currentKwTr = calcResult.kWperTR;
    const newKwTr = model.kw_tr;
    
    if (currentKwTr > newKwTr) {
      setMeasureData(p => ({ ...p, targetKwTr: newKwTr }));
    } else {
      alert(lang === 'th' 
        ? `รุ่นที่แนะนำ (${newKwTr} kW/TR) ไม่มีประสิทธิภาพมากกว่าระดับการทำงานปัจจุบัน (${currentKwTr.toFixed(2)} kW/TR)`
        : `The recommended model (${newKwTr} kW/TR) is not more efficient than the current operation (${currentKwTr.toFixed(2)} kW/TR).`);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={`Chiller Calculator - ${equipment?.tag || 'New'}`} maxWidth="800px">
      
      {/* Steps Indicator */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[
          {n: 1, label: t('parameters')},
          {n: 2, label: t('results')},
          {n: 3, label: t('measures')},
          {n: 4, label: t('save')}
        ].map(s => (
          <div key={s.n} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= s.n ? 'bg-accent text-white' : 'bg-slate-100 text-slate-400'}`}>
              {step > s.n ? <Check size={16} /> : s.n}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${step >= s.n ? 'text-text' : 'text-slate-400'}`}>{s.label}</span>
            {s.n < 4 && <div className={`w-8 h-px ${step > s.n ? 'bg-accent' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <div className="min-h-[400px]">
        
        {/* Step 1: Input Parameters */}
        {step === 1 && (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-text uppercase tracking-wider mb-2 border-b border-border pb-2">Operation Data</h4>
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
                    <label className="block text-xs font-medium text-muted mb-1">Electricity Cost (Baht/kWh)</label>
                    <input type="number" name="elecRate" value={params.elecRate} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
                  </div>
                </div>

                <h4 className="text-sm font-bold text-text uppercase tracking-wider mb-2 border-b border-border pb-2 pt-4">Measurement (Chilled Water)</h4>
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

                {params.coolingType === 'water' ? (
                  <>
                    <h4 className="text-sm font-bold text-text uppercase tracking-wider mb-2 border-b border-border pb-2 pt-4">{t('condenser_water')}</h4>
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
                    <h4 className="text-sm font-bold text-text uppercase tracking-wider mb-2 border-b border-border pb-2 pt-4">{t('dry_bulb_temp')}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-muted mb-1">T_DB (°F)</label>
                        <input type="number" name="tdb" value={params.tdb} onChange={handleChange} className="w-full p-2 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-mono" />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-text uppercase tracking-wider mb-2 border-b border-border pb-2">{t('power_load')}</h4>
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
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border mt-6">
              <button onClick={calculate} className="px-6 py-2.5 bg-accent text-white font-medium rounded-md hover:bg-accentHover transition-colors flex items-center gap-2 shadow-sm border-none cursor-pointer">
                {t('calculate')} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Results */}
        {step === 2 && calcResult && (
          <div className="animate-fade-in space-y-6">
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="col-span-2 md:col-span-3 mb-2">
                <ResultBox label={t('cop_desc')} val={calcResult.COP} unit="kW/kW" color={calcResult.COP >= 5.5 ? 'text-emerald-600' : (calcResult.COP >= 4.0 ? 'text-amber-600' : 'text-red-600')} highlight large />
              </div>
              <ResultBox label={t('cooling_capacity')} val={calcResult.Q_cool_kW} unit="kW" />
              <ResultBox label={t('capacity_tr')} val={calcResult.TR} unit="TR" />
              <ResultBox label={t('specific_power')} val={calcResult.kWperTR} unit="kW/TR" color={calcResult.kWperTR < 0.6 ? 'text-emerald-600' : (calcResult.kWperTR < 0.8 ? 'text-amber-600' : 'text-red-600')} />
              <ResultBox label={t('heat_rejection')} val={calcResult.Q_rej_kW} unit="kW" />
              <ResultBox label={t('carnot_efficiency')} val={calcResult.eta_carnot} unit="%" />
            </div>

            <div className={`p-4 rounded-lg flex items-start gap-3 border ${calcResult.COP >= 5.5 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : (calcResult.COP >= 4.0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-red-50 border-red-200 text-red-800')}`}>
              <Lightbulb size={20} className="shrink-0 mt-0.5" />
              <div className="text-sm">
                {calcResult.COP >= 5.5 
                  ? (lang === 'th' ? "COP อยู่ในระดับดีมาก รักษาการบำรุงรักษาตามกำหนด ตรวจสอบ Heat Balance เสมอ" : "COP is in excellent range. Maintain routine scheduling and check heat balance.")
                  : (calcResult.COP >= 4.0 
                    ? (lang === 'th' ? "COP อยู่ในระดับกลาง ควรทำความสะอาด Tube Condenser หรือเช็ค Approach Temp" : "COP is average. Recommended to clean condenser tubes or inspect approach temperature.") 
                    : (lang === 'th' ? "COP ต่ำกว่าเกณฑ์มาตรฐาน ตรวจสอบการปนเปื้อน ท่ออุดตัน และประสิทธิภาพ Condenser" : "COP is below average. Inspect for tube fouling and condenser efficiency drops."))}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-border mt-6">
              <button onClick={() => setStep(1)} className="px-5 py-2.5 bg-white border border-border text-text font-medium rounded-md hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm cursor-pointer">
                <ArrowLeft size={16} /> {t('parameters')}
              </button>
              <button onClick={() => setStep(3)} className="px-6 py-2.5 bg-accent text-white font-medium rounded-md hover:bg-accentHover transition-colors flex items-center gap-2 shadow-sm border-none cursor-pointer">
                {t('measures')} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Select Measures */}
        {step === 3 && (
          <div className="animate-fade-in space-y-6">
            <h3 className="text-base font-bold text-text mb-4">{t('select_measure')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
              {MEASURES.map(m => (
                <div 
                  key={m.id} 
                  className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedMeasure?.id === m.id ? 'border-accent bg-accent/5' : 'border-border bg-surface hover:border-accent/50 hover:shadow-sm'}`}
                  onClick={() => setSelectedMeasure(m)}
                >
                  <div className="flex items-center gap-3 mb-2 text-slate-700">
                    {iconMap[m.icon]}
                    <span className="font-semibold text-text">{lang === 'th' ? m.name : m.nameEn}</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{lang === 'th' ? m.desc : m.descEn}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-border mt-6">
              <button onClick={() => setStep(2)} className="px-5 py-2.5 bg-white border border-border text-text font-medium rounded-md hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm cursor-pointer">
                <ArrowLeft size={16} /> {t('results')}
              </button>
              <button 
                onClick={() => setStep(4)} 
                disabled={!selectedMeasure}
                className="px-6 py-2.5 bg-accent text-white font-medium rounded-md hover:bg-accentHover transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 border-none cursor-pointer"
              >
                {t('save')} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Estimation */}
        {step === 4 && (
          <div className="animate-fade-in space-y-6">
            <h3 className="text-base font-bold text-text mb-4 border-b border-border pb-2">{t('potential_assessment')}: {lang === 'th' ? selectedMeasure?.name : selectedMeasure?.nameEn}</h3>
            
            {selectedMeasure?.id === 'replace_chiller' && (
              <div className="bg-slate-50 border border-border rounded-xl p-4 mb-6">
                <h4 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                  <Lightbulb size={16} className="text-accent" /> {t('chiller_recommend')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {RECOMMENDED_CHILLERS.map(rc => (
                    <div 
                      key={rc.id} 
                      onClick={() => selectRecommendation(rc)}
                      className="bg-white border border-border rounded-lg p-3 cursor-pointer hover:border-accent hover:shadow-sm transition-all flex justify-between items-center group"
                    >
                      <div>
                        <div className="text-sm font-bold text-text group-hover:text-accent transition-colors">{rc.brand} {rc.model}</div>
                        <div className="text-xs text-muted">{rc.desc}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-emerald-600 font-mono">{rc.kw_tr}</div>
                        <div className="text-[10px] text-muted">kW/TR</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-muted mt-3 italic">
                  * {t('chiller_recommend_desc')}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {selectedMeasure?.id === 'replace_chiller' ? (
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Target Efficiency (kW/TR)</label>
                  <input type="number" name="targetKwTr" value={measureData.targetKwTr} onChange={handleMeasureDataChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent bg-yellow-50 font-bold text-emerald-700" />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">{t('energy_reduction')} (%)</label>
                  <input type="number" name="pctReduction" value={measureData.pctReduction} onChange={handleMeasureDataChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-muted mb-1">{t('investment_cost')} (Baht)</label>
                <input type="number" name="investCost" value={measureData.investCost} onChange={handleMeasureDataChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent bg-yellow-50 font-bold" />
              </div>
            </div>

            {calcResult && (() => {
              const annualHours = params.opHoursPerDay * params.opDaysPerYear;
              const loadFactor = params.loadPct / 100;
              const energyBefore = calcResult.P_in * loadFactor * annualHours;
              
              let pctRed = measureData.pctReduction;
              if (selectedMeasure?.id === 'replace_chiller' && measureData.targetKwTr) {
                pctRed = ((calcResult.kWperTR - measureData.targetKwTr) / calcResult.kWperTR) * 100;
              }
              
              const kWhSave = energyBefore * (pctRed / 100);
              const bahtSave = kWhSave * params.elecRate;
              const ghgSave = (kWhSave * 0.4999) / 1000;
              
              return (
                <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-xl mt-4 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <div className="text-xs text-emerald-800 uppercase tracking-wide font-medium mb-1">{t('estimated_savings')}</div>
                    <div className="text-2xl font-bold text-emerald-600 font-mono">
                      {(kWhSave || 0).toLocaleString(undefined, {maximumFractionDigits:0})} <span className="text-sm text-emerald-700/80 font-sans">{t('kwh_yr')}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-emerald-800 uppercase tracking-wide font-medium mb-1">{t('carbon_reduction')}</div>
                    <div className="text-2xl font-bold text-emerald-600 font-mono">
                      {(ghgSave || 0).toLocaleString(undefined, {maximumFractionDigits:1})} <span className="text-sm text-emerald-700/80 font-sans">tCO₂e/yr</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-emerald-800 uppercase tracking-wide font-medium mb-1">{t('cost_savings')}</div>
                    <div className="text-2xl font-bold text-emerald-600 font-mono">
                      {(bahtSave || 0).toLocaleString(undefined, {maximumFractionDigits:0})} <span className="text-sm text-emerald-700/80 font-sans">{t('thb_yr')}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-between pt-4 border-t border-border mt-6">
              <button onClick={() => setStep(3)} className="px-5 py-2.5 bg-white border border-border text-text font-medium rounded-md hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm cursor-pointer">
                <ArrowLeft size={16} /> {t('measures')}
              </button>
              <button 
                onClick={saveMeasure} 
                className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm border-none cursor-pointer"
              >
                {t('save_measure')} <Check size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
    </ModalWrapper>
  );
}

function ResultBox({ label, val, unit, color = "text-text", highlight, large }) {
  return (
    <div className={`p-4 border rounded-xl ${highlight ? 'bg-accent/5 border-accent/40 shadow-sm' : 'bg-surface border-border'} flex flex-col justify-center`}>
      <div className={`font-medium text-muted uppercase tracking-wider mb-1 ${large ? 'text-xs text-accent' : 'text-[11px]'}`}>{label}</div>
      <div className={`font-bold font-mono ${color} ${large ? 'text-4xl' : 'text-2xl'}`}>
        {typeof val === 'number' ? val.toFixed(2) : val}
      </div>
      <div className="text-[10px] text-muted mt-1">{unit}</div>
    </div>
  );
}
