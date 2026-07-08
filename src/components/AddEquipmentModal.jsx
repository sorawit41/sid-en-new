import React, { useState, useEffect, useContext } from 'react';
import { ModalWrapper } from './Modals';
import { AppContext } from '../context/AppContext';
import { Settings, Tag, Zap, Activity } from 'lucide-react';

const CATALOG_MODELS = {
  chiller: [
    { brand: 'Daikin', model: 'Magnitude WZH', kw: 240, capacity: 500, rated: '500 TR' },
    { brand: 'York', model: 'YMC2 Centrifugal', kw: 245, capacity: 500, rated: '500 TR' },
    { brand: 'Carrier', model: '19DV AquaEdge', kw: 260, capacity: 500, rated: '500 TR' },
    { brand: 'Trane', model: 'CVHE CenTraVac', kw: 275, capacity: 500, rated: '500 TR' }
  ],
  compressor: [
    { brand: 'Atlas Copco', model: 'GA 75 VSD+', kw: 75, capacity: '', rated: '75 kW' },
    { brand: 'Ingersoll Rand', model: 'Nirvana VSD', kw: 90, capacity: '', rated: '90 kW' },
    { brand: 'Sullair', model: 'LS 90 VSD', kw: 90, capacity: '', rated: '90 kW' }
  ],
  pump: [
    { brand: 'Grundfos', model: 'CR 45 VSD', kw: 22, capacity: '', rated: '22 kW' },
    { brand: 'Ebara', model: '3M End Suction', kw: 15, capacity: '', rated: '15 kW' },
    { brand: 'Lowara', model: 'e-NSC Series', kw: 30, capacity: '', rated: '30 kW' }
  ],
  boiler: [
    { brand: 'Miura', model: 'LX-200 Once-Through', kw: 11, capacity: '', rated: '5 Ton/hr' },
    { brand: 'Cleaver-Brooks', model: 'CBE Firetube', kw: 18, capacity: '', rated: '10 Ton/hr' },
    { brand: 'Fulton', model: 'FB-F Tubeless', kw: 15, capacity: '', rated: '7 Ton/hr' }
  ],
  cooling: [
    { brand: 'Marley', model: 'NC 8410', kw: 22, capacity: '', rated: '1500 GPM' },
    { brand: 'Liang Chi', model: 'LBC Counterflow', kw: 15, capacity: '', rated: '900 GPM' }
  ],
  electrical: [
    { brand: 'ABB', model: 'EcoDry Transformer', kw: 45, capacity: '', rated: '2000 kVA' }
  ]
};

export default function AddEquipmentModal({ isOpen, onClose, equipment }) {
  const { data, setData, t, lang } = useContext(AppContext);
  const factories = (data.factories || []).map(f => f.name);

  const [formData, setFormData] = useState({
    tag: '',
    brand: '',
    model: '',
    catId: 'other',
    factory: 'โรงงานอยุธยา',
    kw: '',
    capacity: '',
    efficiency: '',
    rated: ''
  });

  const catalogOptions = CATALOG_MODELS[formData?.catId] || [];

  useEffect(() => {
    if (isOpen) {
      if (equipment) {
        setFormData({
          tag: equipment.tag || '',
          brand: equipment.brand || '',
          model: equipment.model || '',
          catId: equipment.catId || 'other',
          factory: equipment.factory || (factories[0] || 'โรงงานอยุธยา'),
          kw: equipment.kw || '',
          capacity: equipment.capacity || '',
          efficiency: equipment.efficiency || '',
          rated: equipment.rated || ''
        });
      } else {
        setFormData({
          tag: '',
          brand: '',
          model: '',
          catId: 'compressor',
          factory: factories[0] || 'โรงงานอยุธยา',
          kw: '',
          capacity: '',
          efficiency: '',
          rated: ''
        });
      }
    }
  }, [isOpen, equipment, factories.join(',')]);

  const parseNumber = (val) => {
    if (!val) return null;
    const match = String(val).match(/[-+]?[0-9]*\.?[0-9]+/);
    return match ? parseFloat(match[0]) : null;
  };

  const calculateEfficiency = (kw, capacity) => {
    const kwVal = parseNumber(kw);
    const capVal = parseNumber(capacity);
    if (kwVal && capVal && capVal !== 0) {
      return (kwVal / capVal).toFixed(3);
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(p => {
      const updatedData = { ...p, [name]: value };

      if (name === 'kw' || name === 'capacity') {
        updatedData.efficiency = calculateEfficiency(
          name === 'kw' ? value : p.kw,
          name === 'capacity' ? value : p.capacity
        );
      }

      return updatedData;
    });
  };

  const handleCatalogSelect = (e) => {
    const idx = e.target.value;
    if (idx === '') return;
    const model = CATALOG_MODELS[formData.catId]?.[idx];
    if (model) {
      setFormData(prev => {
        const next = {
          ...prev,
          brand: model.brand || '',
          model: model.model || '',
          kw: model.kw !== undefined ? model.kw.toString() : '',
          capacity: model.capacity !== undefined ? model.capacity.toString() : '',
          rated: model.rated || ''
        };
        next.efficiency = calculateEfficiency(next.kw, next.capacity);
        return next;
      });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.tag.trim()) return alert('Tag name is required');

    let newEquipments;
    if (equipment) {
      // Edit
      newEquipments = data.equipments.map(eq => eq.id === equipment.id ? { ...eq, ...formData } : eq);
    } else {
      // Add
      const newEq = {
        id: 'eq_' + Date.now(),
        ...formData
      };
      newEquipments = [...data.equipments, newEq];
    }

    setData({ ...data, equipments: newEquipments });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={equipment ? t('edit_equipment') : t('add_new_equipment')} maxWidth="600px">
      <form onSubmit={handleSave} className="space-y-6">

        {/* Section 1: Identification */}
        <div className="bg-surface border border-border p-5 rounded-xl space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-accent/50 group-hover:bg-accent transition-colors"></div>
          <h4 className="text-sm font-bold text-text uppercase tracking-wider mb-2 border-b border-border pb-2 flex items-center gap-2">
            <Tag size={16} className="text-muted" /> {t('identification')}
          </h4>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">{t('equipment_tag')} <span className="text-red-500">*</span></label>
            <input required type="text" name="tag" value={formData.tag} onChange={handleChange} placeholder="e.g. CH-01" className="w-full p-2.5 bg-bg border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-mono" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t('factory')}</label>
              <select name="factory" value={formData.factory} onChange={handleChange} className="w-full p-2.5 bg-bg border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all">
                {factories.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t('category')}</label>
              <select name="catId" value={formData.catId} onChange={handleChange} className="w-full p-2.5 bg-bg border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all">
                {data.cats && data.cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Technical Specifications */}
        <div className="bg-surface border border-border p-5 rounded-xl space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50 group-hover:bg-emerald-500 transition-colors"></div>
          <h4 className="text-sm font-bold text-text uppercase tracking-wider mb-2 border-b border-border pb-2 flex items-center gap-2 pt-1">
            <Settings size={16} className="text-muted" /> {t('specifications_title')}
          </h4>

          {catalogOptions.length > 0 && (
            <div className="bg-bg/40 border border-accent/20 rounded-xl p-3.5 space-y-2 mb-4">
              <label className="block text-xs font-bold text-accent flex items-center gap-1.5">
                <span>✨ {lang === 'th' ? 'เลือกข้อมูลสำเร็จจากแคตตาล็อก' : 'Quick Fill from Catalog'}</span>
              </label>
              <select
                onChange={handleCatalogSelect}
                value=""
                className="w-full p-2.5 bg-surface border border-accent/30 text-accent font-medium rounded-lg text-xs outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all cursor-pointer"
              >
                <option value="">
                  {lang === 'th' ? '-- เลือกจากแคตตาล็อก (ข้อมูลจำเพาะจะถูกกรอกอัตโนมัติ) --' : '-- Select from Catalog (Auto-populates fields) --'}
                </option>
                {catalogOptions.map((model, idx) => (
                  <option key={idx} value={idx}>
                    {model.brand} - {model.model} ({model.rated})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-muted block leading-normal">
                {lang === 'th' 
                  ? '* ระบบจะกรอกข้อมูลยี่ห้อ รุ่น กำลังไฟ และพิกัดให้อัตโนมัติ โดยคุณยังสามารถกรอกหรือแก้ไขแต่ละช่องด้านล่างเองได้' 
                  : '* Brand, model, kW, capacity, and rated will be auto-filled. You can still manually edit them below.'}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t('brand')}</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g. Trane" className="w-full p-2.5 bg-bg border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t('model')}</label>
              <input type="text" name="model" value={formData.model} onChange={handleChange} placeholder="e.g. CVHE" className="w-full p-2.5 bg-bg border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                {lang === 'th' ? 'พิกัดขนาดระบุ (Rated)' : 'Rated Capacity (e.g. 500 TR)'}
              </label>
              <input type="text" name="rated" value={formData.rated} onChange={handleChange} placeholder="e.g. 500 TR" className="w-full p-2.5 bg-bg border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-mono" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t('elec_power')}</label>
              <div className="relative">
                <input type="text" name="kw" value={formData.kw} onChange={handleChange} placeholder="e.g. 328" className="w-full p-2.5 pl-9 bg-bg border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-mono" />
                <Zap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t('capacity_tr')}</label>
              <input type="text" name="capacity" value={formData.capacity} onChange={handleChange} placeholder="e.g. 500" className="w-full p-2.5 bg-bg border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t('efficiency_kw_tr')}</label>
              <div className="relative">
                <input
                  type="text"
                  name="efficiency"
                  value={formData.efficiency}
                  readOnly
                  placeholder="Auto Calc"
                  className="w-full p-2.5 pl-9 bg-gray-50 border border-border rounded-lg text-sm outline-none text-emerald-600 font-bold transition-all font-mono cursor-not-allowed"
                />
                <Activity size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border mt-6 gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white border border-border text-text font-medium rounded-md hover:bg-slate-50 transition-colors">
            {t('cancel')}
          </button>
          <button type="submit" className="px-6 py-2.5 bg-accent text-white font-medium rounded-md hover:bg-accentHover transition-colors">
            {equipment ? t('save_changes') : t('add_equipment')}
          </button>
        </div>

      </form>
    </ModalWrapper>
  );
}