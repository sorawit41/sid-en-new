import React, { useContext, useState, useMemo, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { ModalWrapper } from '../components/Modals';
import { Sparkles, Lightbulb, Play, Layers, Tag, ShieldCheck, DollarSign, Calculator, LeafyGreen, Zap, Check, ChevronRight, Snowflake, Wind, Droplets, Flame, Factory as FactoryIcon, Settings, Plus, Pencil, Trash2 } from 'lucide-react';

const iconMap = {
  Snowflake: <Snowflake size={18} />,
  Wind: <Wind size={18} />,
  Droplets: <Droplets size={18} />,
  Flame: <Flame size={18} />,
  Factory: <FactoryIcon size={18} />,
  Zap: <Zap size={18} />,
};

import { RECOMMENDATIONS } from '../data/catalogData';

export default function Catalog() {
  const { data, setData, t, lang } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('chiller');
  
  // Modal state
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);

  // Simulation Form states
  const [selectedEqId, setSelectedEqId] = useState('');
  const [selectedRecId, setSelectedRecId] = useState('');
  const [opHours, setOpHours] = useState(6500);
  const [elecRate, setElecRate] = useState(4.50);
  const [investCost, setInvestCost] = useState('');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const [catalogItems, setCatalogItems] = useState(RECOMMENDATIONS);

  // Add Equipment Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [editEqId, setEditEqId] = useState(null);
  const [newCategory, setNewCategory] = useState(activeTab);
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newSpec, setNewSpec] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImage, setNewImage] = useState(null);

  const openAddModal = () => {
    setEditEqId(null);
    setNewCategory(activeTab);
    setNewBrand('');
    setNewModel('');
    setNewSpec('');
    setNewCost('');
    setNewDesc('');
    setNewImage(null);
    setIsConfirmingDelete(false);
    setDeleteInput('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (rec) => {
    setEditEqId(rec.id);
    setNewCategory(activeTab);
    setNewBrand(rec.brand);
    setNewModel(rec.model);
    setNewSpec(rec.spec);
    setNewCost(rec.costEst);
    setNewDesc(rec.desc);
    setNewImage(rec.image || null);
    setIsConfirmingDelete(false);
    setDeleteInput('');
    setIsAddModalOpen(true);
  };

  const activeCategory = data.cats.find(c => c.id === activeTab) || data.cats[0];
  const recommendationsList = catalogItems[activeTab] || [];
  
  // Filter user equipment by active category tab
  const categoryEquipments = useMemo(() => {
    return data.equipments.filter(e => e.catId === activeTab);
  }, [data.equipments, activeTab]);

  const selectedEq = useMemo(() => {
    return categoryEquipments.find(e => e.id === selectedEqId);
  }, [categoryEquipments, selectedEqId]);

  const selectedRec = useMemo(() => {
    return recommendationsList.find(r => r.id === selectedRecId);
  }, [recommendationsList, selectedRecId]);

  // Set default recommendation model and cost when tab changes
  useEffect(() => {
    if (recommendationsList.length > 0) {
      setSelectedRecId(recommendationsList[0].id);
      setInvestCost(recommendationsList[0].costEst);
    } else {
      setSelectedRecId('');
      setInvestCost('');
    }
    setSelectedEqId('');
  }, [activeTab]);

  // Dynamic simulation calculations
  const simResult = useMemo(() => {
    if (!selectedRec) return null;
    
    let kwhYear = 0;
    let costType = selectedRec.energyType; // 'elec' or 'heat'
    
    // Default fallback values if no current equipment is selected
    const legacyHours = parseFloat(opHours) || 6000;
    const rate = parseFloat(elecRate) || 4.5;
    const invest = parseFloat(investCost) || selectedRec.costEst;
    
    if (activeTab === 'chiller') {
      const currentCapacity = selectedEq ? parseFloat(selectedEq.capacity) || 500 : 500;
      const currentKw = selectedEq ? parseFloat(selectedEq.kw) || 320 : 320;
      const currentKwTr = currentCapacity ? currentKw / currentCapacity : 0.64;
      const targetKwTr = selectedRec.efficiency;
      
      const kwTrDiff = Math.max(0, currentKwTr - targetKwTr);
      kwhYear = legacyHours * currentCapacity * kwTrDiff;
    } 
    else if (activeTab === 'compressor') {
      const currentKw = selectedEq ? parseFloat(selectedEq.kw) || 75 : 75;
      kwhYear = legacyHours * currentKw * 0.22; // 22% VSD efficiency upgrade gains
    } 
    else if (activeTab === 'pump') {
      const currentKw = selectedEq ? parseFloat(selectedEq.kw) || 22 : 22;
      kwhYear = legacyHours * currentKw * 0.30; // 30% pump rebuild/VSD efficiency gains
    } 
    else if (activeTab === 'boiler') {
      // 1 Ton/hr is approx 700 kW thermal rating. Default to 5 Ton boiler (3500 kW thermal load)
      const parseVal = (str) => {
        const m = String(str).match(/\d+/);
        return m ? parseFloat(m[0]) : 5;
      };
      const capacityTon = selectedEq ? parseVal(selectedEq.rated) : 5;
      kwhYear = legacyHours * capacityTon * 700 * 0.08; // 8% thermal fuel optimization savings
    } 
    else if (activeTab === 'cooling') {
      const fanKw = selectedEq ? parseFloat(selectedEq.kw) || 15 : 15;
      kwhYear = legacyHours * fanKw * 0.25; // 25% fan motor optimization
    } 
    else {
      // Electrical / General
      const capacityKVA = selectedEq ? parseFloat(selectedEq.rated) || 1000 : 1000;
      kwhYear = 8760 * capacityKVA * 0.015 * 0.65; // Amorphous core loss gains
    }
    
    const emissionFactor = data?.settings?.emissionFactors?.find(ef => ef.id === 'ef_elec')?.value || 0.5562;
    const ghgYear = costType === 'heat' 
      ? (kwhYear * 3.6 * 0.0682) / 1000 
      : (kwhYear * emissionFactor) / 1000;
      
    // Heat fuel savings translated to monetary equivalent (using 3.5 THB/kWh equivalent cost for natural gas)
    const fuelRate = costType === 'heat' ? 3.50 : rate;
    const bahtYear = kwhYear * fuelRate;
    const payback = bahtYear > 0 ? invest / bahtYear : 0;

    return {
      kwhYear: Math.round(kwhYear),
      bahtYear: Math.round(bahtYear),
      ghgYear: parseFloat(ghgYear.toFixed(1)),
      payback: parseFloat(payback.toFixed(2)),
      invest
    };
  }, [data, activeTab, selectedEq, selectedRec, opHours, elecRate, investCost]);

  const handleSaveMeasure = () => {
    if (!selectedRec || !simResult) return;
    
    const factory = selectedEq ? selectedEq.factory : (data.factories[0]?.name || 'โรงงานอยุธยา');
    const eqTag = selectedEq ? selectedEq.tag : `${activeCategory.name} Upgrade`;
    
    const newMeas = {
      id: 'meas_' + Date.now(),
      eqId: selectedEq ? selectedEq.id : 'eq_upgrade_' + Date.now(),
      eqTag,
      catId: activeTab,
      factory,
      measName: lang === 'th' ? `เปลี่ยนอัปเกรดเป็น ${selectedRec.brand} ${selectedRec.model}` : `Upgrade to ${selectedRec.brand} ${selectedRec.model}`,
      measIcon: '⚡',
      pct: activeTab === 'chiller' 
        ? parseFloat((((selectedEq ? parseFloat(selectedEq.kw)/parseFloat(selectedEq.capacity) || 0.64 : 0.64) - selectedRec.efficiency) / (selectedEq ? parseFloat(selectedEq.kw)/parseFloat(selectedEq.capacity) || 0.64 : 0.64) * 100).toFixed(1))
        : activeTab === 'compressor' ? 22 : activeTab === 'pump' ? 30 : activeTab === 'boiler' ? 8 : 25,
      kWhYear: simResult.kwhYear,
      bahtYear: simResult.bahtYear,
      invest: simResult.invest,
      payback: simResult.payback,
      energyType: selectedRec.energyType,
      isUpgrade: true,
      date: new Date().toISOString().slice(0, 10)
    };

    setData({
      ...data,
      measures: [...data.measures, newMeas]
    });

    setShowSaveSuccess(true);
    setShowSaveSuccess(true);
    setTimeout(() => {
      setShowSaveSuccess(false);
      setIsSimModalOpen(false);
    }, 2000);
  };

  const handleAddCatalogItem = (e) => {
    e.preventDefault();
    if (!newBrand || !newModel || !newCost) return;
    
    if (editEqId) {
      if (newCategory !== activeTab) {
        setCatalogItems(prev => {
          const oldList = (prev[activeTab] || []).filter(item => item.id !== editEqId);
          const oldItem = (prev[activeTab] || []).find(item => item.id === editEqId);
          const newItem = { ...oldItem, brand: newBrand, model: newModel, spec: newSpec, costEst: Number(newCost), desc: newDesc, image: newImage };
          const newList = [...(prev[newCategory] || []), newItem];
          return {
            ...prev,
            [activeTab]: oldList,
            [newCategory]: newList
          };
        });
      } else {
        setCatalogItems(prev => ({
          ...prev,
          [activeTab]: (prev[activeTab] || []).map(item => 
            item.id === editEqId 
              ? { ...item, brand: newBrand, model: newModel, spec: newSpec, costEst: Number(newCost), desc: newDesc, image: newImage }
              : item
          )
        }));
      }
    } else {
      const newItem = {
        id: 'rec_new_' + Date.now(),
        brand: newBrand,
        model: newModel,
        spec: newSpec || '-',
        costEst: Number(newCost),
        desc: newDesc || '-',
        efficiency: 1.0,
        energyType: 'elec',
        image: newImage
      };
      setCatalogItems(prev => ({
        ...prev,
        [newCategory]: [...(prev[newCategory] || []), newItem]
      }));
    }
    
    setIsAddModalOpen(false);
  };

  const confirmDelete = () => {
    if (deleteInput === 'delete' && editEqId) {
      setCatalogItems(prev => ({
        ...prev,
        [activeTab]: (prev[activeTab] || []).filter(item => item.id !== editEqId)
      }));
      setIsAddModalOpen(false);
    }
  };

  const fmt = (v) => (v || 0).toLocaleString('en-US');

  return (
    <div className="animate-slide-up space-y-6 pb-12 select-none">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-text flex items-center gap-2">
          <span className="w-1.5 h-4 bg-accent rounded-full animate-pulse" /> {t('catalog_title')}
        </h2>
        <p className="text-xs md:text-sm text-muted mt-1">{t('catalog_desc')}</p>
      </div>

      {/* Category Selection Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-border/40 scrollbar-none">
        {data.cats.map(c => {
          const isActive = activeTab === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveTab(c.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border outline-none cursor-pointer ${isActive ? 'bg-accent/10 border-accent/30 text-accent ring-1 ring-accent/30' : 'bg-surface border-border text-muted hover:text-text hover:border-accent/40'}`}
            >
              {iconMap[c.icon] || <Settings size={14} />} {c.name}
            </button>
          );
        })}
      </div>

      {/* Recommendations catalog grid layout */}
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-2">
            <Layers size={14} className="text-accent" /> {t('recommended_model')} ({activeCategory.name})
          </h3>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-accent hover:bg-accent-hover px-3 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer z-10 relative"
          >
            <Plus size={14} /> เพิ่มอุปกรณ์
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendationsList.map(rec => {
            return (
              <div 
                key={rec.id}
                className="bg-surface border border-border/80 p-5 rounded-2xl flex flex-col justify-between hover-lift relative overflow-hidden group transition-all duration-300 h-auto min-h-[16rem] hover:border-accent/40"
              >
                <div>
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <span className="text-[10px] text-accent font-bold uppercase tracking-wider">{rec.brand}</span>
                      <h4 className="font-bold text-text text-base mt-0.5 line-clamp-1 group-hover:text-accent transition-colors">{rec.model}</h4>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={(e) => { e.stopPropagation(); openEditModal(rec); }} className="p-1.5 rounded-xl border bg-card2 text-dim border-border/40 hover:text-accent hover:border-accent/40 cursor-pointer transition-colors z-20">
                        <Pencil size={14} />
                      </button>
                      <span className="p-1.5 rounded-xl border bg-card2 text-dim border-border/40">
                        {iconMap[activeCategory.icon] || <Settings size={14} />}
                      </span>
                    </div>
                  </div>

                  {rec.image && (
                    <div className="mt-4 w-full h-40 md:h-48 flex items-center justify-center overflow-hidden">
                      <img src={rec.image} alt={rec.model} className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  )}

                  <p className="text-xs text-muted font-medium mt-3 leading-relaxed min-h-[48px] line-clamp-2">{rec.desc}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between gap-4">
                  <div className="text-[10px] font-bold flex-1">
                    <div className="flex justify-between items-center text-muted uppercase tracking-wider mb-1">
                      <span>{t('spec')}</span>
                      <span className="text-text font-mono text-[9px]">{rec.spec}</span>
                    </div>
                    <div className="flex justify-between items-center text-muted uppercase tracking-wider">
                      <span>{t('est_cost')}</span>
                      <span className="text-indigo-500 font-mono text-[9px]">{fmt(rec.costEst)} THB</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedRecId(rec.id);
                      setInvestCost(rec.costEst);
                      setIsSimModalOpen(true);
                    }}
                    className="px-3.5 py-2.5 bg-accent hover:bg-accentHover text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 cursor-pointer border-none active:scale-95 shadow-sm shadow-accent/10 whitespace-nowrap"
                  >
                    <Calculator size={13} /> {lang === 'th' ? 'คำนวณ' : 'Simulate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulator Modal Popup */}
      <ModalWrapper
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        title={selectedRec ? `${t('upgrade_simulator')}: ${selectedRec.brand} ${selectedRec.model}` : t('upgrade_simulator')}
        maxWidth="500px"
      >
        {selectedRec && (
          <div className="space-y-5">
            {/* Current equipment select */}
            <div>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-2">{t('current_equipment')}</label>
              <select 
                value={selectedEqId} 
                onChange={e => setSelectedEqId(e.target.value)}
                className="w-full p-2.5 bg-bg/50 border border-border rounded-xl text-xs font-semibold outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 focus:bg-surface transition-all cursor-pointer"
              >
                <option value="">{t('select_to_compare')}</option>
                {categoryEquipments.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.tag} ({eq.brand} {eq.model})</option>
                ))}
              </select>
            </div>

            {/* Current Spec Capsule if chosen */}
            {selectedEq && (
              <div className="p-3.5 bg-card2/70 border border-border/40 rounded-xl space-y-2 text-[11px] animate-fade-in">
                <div className="font-bold text-text uppercase tracking-wider text-[10px] text-muted">{t('current_spec')}</div>
                <div className="flex justify-between">
                  <span className="text-muted">{lang === 'th' ? 'พิกัด/ข้อมูลจำเพาะ' : 'Rating/Spec'}</span>
                  <span className="font-bold text-text">{selectedEq.rated || '—'}</span>
                </div>
                {activeTab === 'chiller' && selectedEq.capacity && selectedEq.kw && (
                  <div className="flex justify-between">
                    <span className="text-muted">{lang === 'th' ? 'ประสิทธิภาพปัจจุบัน' : 'Current Efficiency'}</span>
                    <span className="font-bold text-amber-500 font-mono">{(parseFloat(selectedEq.kw) / parseFloat(selectedEq.capacity)).toFixed(3)} kW/TR</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted">{t('factory')}</span>
                  <span className="font-bold text-text truncate max-w-[150px]">{selectedEq.factory}</span>
                </div>
              </div>
            )}

            {/* Params Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">{t('operating_hours')}</label>
                <input 
                  type="number" 
                  value={opHours} 
                  onChange={e => setOpHours(e.target.value)}
                  className="w-full p-2.5 bg-bg/50 border border-border rounded-xl text-xs font-bold outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 focus:bg-surface transition-all font-mono" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">{selectedRec.energyType === 'heat' ? (lang === 'th' ? 'อัตราค่าความร้อน (บาท/หน่วย)' : 'Fuel Rate (THB/kWh)') : t('electricity_rate')}</label>
                <input 
                  type="number" 
                  value={elecRate} 
                  step="0.10"
                  onChange={e => setElecRate(e.target.value)}
                  className="w-full p-2.5 bg-bg/50 border border-border rounded-xl text-xs font-bold outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 focus:bg-surface transition-all font-mono" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">{t('est_cost')} (THB)</label>
              <input 
                type="number" 
                value={investCost} 
                onChange={e => setInvestCost(e.target.value)}
                className="w-full p-2.5 bg-bg/50 border border-border rounded-xl text-xs font-bold outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 focus:bg-surface transition-all font-mono" 
              />
            </div>

            {/* Calculations Simulator Display */}
            {simResult && (
              <div className="pt-4 border-t border-border/40 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-card2/50 border border-border/30 rounded-xl">
                    <div className="text-[9px] font-bold text-muted uppercase tracking-wider">{t('annual_savings')}</div>
                    <div className="text-sm font-bold text-emerald-500 font-mono mt-0.5">{fmt(simResult.kwhYear)} <span className="text-[9px] font-sans text-muted">{selectedRec.energyType === 'heat' ? 'kWh th/yr' : 'kWh/yr'}</span></div>
                  </div>

                  <div className="p-3 bg-card2/50 border border-border/30 rounded-xl">
                    <div className="text-[9px] font-bold text-muted uppercase tracking-wider">{t('cost_savings')}</div>
                    <div className="text-sm font-bold text-indigo-500 font-mono mt-0.5">{fmt(simResult.bahtYear)} <span className="text-[9px] font-sans text-muted">THB/yr</span></div>
                  </div>

                  <div className="p-3 bg-card2/50 border border-border/30 rounded-xl">
                    <div className="text-[9px] font-bold text-muted uppercase tracking-wider">{t('carbon_reduction')}</div>
                    <div className="text-sm font-bold text-blue-500 font-mono mt-0.5">{fmt(simResult.ghgYear)} <span className="text-[9px] font-sans text-muted">tCO₂e/yr</span></div>
                  </div>

                  <div className="p-3 bg-card2/50 border border-border/30 rounded-xl">
                    <div className="text-[9px] font-bold text-muted uppercase tracking-wider">{t('payback_years')}</div>
                    <div className="text-sm font-bold text-amber-500 font-mono mt-0.5">{simResult.payback} <span className="text-[9px] font-sans text-muted">{t('years')}</span></div>
                  </div>
                </div>

                {/* Save button */}
                <div className="pt-2">
                  {showSaveSuccess ? (
                    <div className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-center text-xs font-bold flex items-center justify-center gap-1.5 animate-slide-up">
                      <Check size={14} /> {t('add_measure_success')}
                    </div>
                  ) : (
                    <button 
                      onClick={handleSaveMeasure}
                      className="w-full py-3 bg-accent hover:bg-accentHover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-accent/15 flex items-center justify-center gap-1.5 cursor-pointer border-none active:scale-[0.98]"
                    >
                      <Sparkles size={14} /> {t('add_to_measures')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </ModalWrapper>

      {/* Add New Equipment Modal */}
      <ModalWrapper isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={editEqId ? (isConfirmingDelete ? "ยืนยันการลบอุปกรณ์" : "แก้ไขข้อมูลอุปกรณ์") : "เพิ่มอุปกรณ์แนะนำใหม่"} maxWidth="800px">
        {isConfirmingDelete ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center animate-fade-in w-full">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-5 ring-4 ring-red-500/5">
              <Trash2 size={28} />
            </div>
            <h3 className="text-xl font-bold text-text mb-2">ลบอุปกรณ์แนะนำใช่หรือไม่?</h3>
            <p className="text-sm text-muted mb-8 max-w-sm leading-relaxed">
              คุณกำลังจะลบอุปกรณ์ <strong className="text-text font-bold">{newBrand} {newModel}</strong><br/>
              หากต้องการยืนยัน โปรดพิมพ์คำว่า <strong className="text-red-500 font-bold bg-red-500/10 px-1.5 py-0.5 rounded">delete</strong>
            </p>
            <input 
              type="text" 
              value={deleteInput} 
              onChange={e => setDeleteInput(e.target.value)} 
              placeholder="พิมพ์ delete เพื่อยืนยัน" 
              className="w-full max-w-[240px] bg-bg border border-border rounded-xl px-4 py-3 text-center text-sm text-text outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 mb-8 font-mono transition-all"
            />
            <div className="flex gap-3 w-full max-w-[280px]">
              <button type="button" onClick={() => { setIsConfirmingDelete(false); setDeleteInput(''); }} className="flex-1 py-3 rounded-xl bg-surface border border-border text-text text-xs font-bold hover:bg-bg transition-colors cursor-pointer shadow-sm">
                ยกเลิก
              </button>
              <button type="button" onClick={confirmDelete} disabled={deleteInput !== 'delete'} className={`flex-1 py-3 rounded-xl text-white text-xs font-bold transition-all uppercase tracking-wider ${deleteInput === 'delete' ? 'bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 cursor-pointer active:scale-95 border-none' : 'bg-red-300 cursor-not-allowed border-none'}`}>
                ลบข้อมูล
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAddCatalogItem} className="space-y-4">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">รูปภาพอุปกรณ์ (Image)</label>
              <div className="flex gap-4 items-start">
                {newImage && (
                  <div className="w-20 h-20 shrink-0 bg-white border border-border/40 rounded-lg overflow-hidden p-1 relative group">
                    <img src={newImage} alt="preview" className="w-full h-full object-contain" />
                    <button type="button" onClick={() => setNewImage(null)} className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      X
                    </button>
                  </div>
                )}
                <div className="flex-1">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setNewImage(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                    className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text outline-none focus:border-accent" 
                  />
                  <p className="text-[9px] text-muted mt-1">รองรับไฟล์ PNG, JPG</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">หมวดหมู่ (Category) *</label>
              <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text outline-none focus:border-accent">
                {data.cats.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">ยี่ห้อ (Brand) *</label>
              <input type="text" required value={newBrand} onChange={e => setNewBrand(e.target.value)} className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text outline-none focus:border-accent" placeholder="e.g. Daikin" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">รุ่น (Model) *</label>
              <input type="text" required value={newModel} onChange={e => setNewModel(e.target.value)} className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text outline-none focus:border-accent" placeholder="e.g. Magnitude WZH" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">สเปก (Spec)</label>
              <input type="text" value={newSpec} onChange={e => setNewSpec(e.target.value)} className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text outline-none focus:border-accent" placeholder="e.g. 0.48 kW/TR" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">ราคาประเมิน (Cost Estimate ฿) *</label>
              <input type="number" required value={newCost} onChange={e => setNewCost(e.target.value)} className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text outline-none focus:border-accent" placeholder="e.g. 4500000" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">รายละเอียด (Description)</label>
              <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text outline-none focus:border-accent resize-none h-20" placeholder="คำอธิบายเพิ่มเติม..." />
            </div>
          </div>
          
          <div className="pt-2 flex gap-3">
            {editEqId && (
              <button type="button" onClick={() => setIsConfirmingDelete(true)} className="px-5 py-3 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors border border-red-200/50 flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
                <Trash2 size={14} /> ลบ
              </button>
            )}
            <button type="submit" className="flex-1 py-3 bg-accent hover:bg-accent-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-accent/15 flex items-center justify-center cursor-pointer border-none active:scale-[0.98]">
              {editEqId ? "บันทึกการแก้ไข" : "บันทึกอุปกรณ์ใหม่"}
            </button>
          </div>
        </form>
        )}
      </ModalWrapper>
    </div>
  );
}
