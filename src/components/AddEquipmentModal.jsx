import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Settings, Tag, Zap, Activity, ArrowLeft, Check, MessageSquare, Trash2, Plus } from 'lucide-react';

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

export default function AddEquipmentModal({ isOpen, onClose, equipment, defaultFactory }) {
  const { data, setData, t, lang, user } = useContext(AppContext);
  const factories = (data.factories || []).map(f => f.name);

  const [formData, setFormData] = useState({
    tag: '',
    brand: '',
    model: '',
    catId: 'compressor',
    factory: defaultFactory || (factories[0] || 'โรงงานอยุธยา'),
    dept: '',
    year: new Date().getFullYear().toString(),
    kw: '',
    capacity: '',
    efficiency: '',
    rated: '',
    opHoursYear: 8000,
    loadFactor: 0.8,
    comments: []
  });

  const [newComment, setNewComment] = useState('');

  const catalogOptions = CATALOG_MODELS[formData?.catId] || [];

  useEffect(() => {
    if (isOpen) {
      if (equipment && equipment.id) {
        setFormData({
          tag: equipment.tag || '',
          brand: equipment.brand || '',
          model: equipment.model || '',
          catId: equipment.catId || 'other',
          factory: equipment.factory || defaultFactory || (factories[0] || 'โรงงานอยุธยา'),
          dept: equipment.dept || '',
          year: equipment.year || new Date().getFullYear().toString(),
          kw: equipment.kw || '',
          capacity: equipment.capacity || '',
          efficiency: equipment.efficiency || '',
          rated: equipment.rated || '',
          opHoursYear: equipment.opHoursYear || 8000,
          loadFactor: equipment.loadFactor || 0.8,
          comments: equipment.comments || []
        });
      } else {
        setFormData({
          tag: '',
          brand: '',
          model: '',
          catId: 'compressor',
          factory: equipment?.factory || defaultFactory || (factories[0] || 'โรงงานอยุธยา'),
          dept: '',
          year: new Date().getFullYear().toString(),
          kw: '',
          capacity: '',
          efficiency: '',
          rated: '',
          opHoursYear: 8000,
          loadFactor: 0.8,
          comments: []
        });
      }
    }
  }, [isOpen, equipment, defaultFactory, factories.join(',')]);

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

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const commentObj = {
      id: Date.now().toString(),
      text: newComment.trim(),
      date: new Date().toISOString()
    };
    setFormData(prev => ({
      ...prev,
      comments: [commentObj, ...prev.comments]
    }));
    setNewComment('');
  };

  const handleRemoveComment = (id) => {
    setFormData(prev => ({
      ...prev,
      comments: prev.comments.filter(c => c.id !== id)
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.tag.trim()) return alert(lang === 'th' ? 'กรุณาระบุ Tag อุปกรณ์' : 'Tag name is required');

    // Auto-commit any text left in the comment box
    let finalComments = formData.comments || [];
    if (newComment.trim()) {
      const commentObj = {
        id: Date.now().toString(),
        text: newComment.trim(),
        date: new Date().toISOString()
      };
      finalComments = [commentObj, ...finalComments];
    }

    const kw = parseNumber(formData.kw) || 0;
    const hours = parseNumber(formData.opHoursYear) || 8000;
    const lf = parseNumber(formData.loadFactor) || 0.8;
    const electricityRate = data?.settings?.electricityRate !== undefined ? parseFloat(data.settings.electricityRate) : 4.2;
    const emissionFactor = data?.settings?.emissionFactors?.find(ef => ef.id === 'ef_elec')?.value || 0.5562;
    
    const energyUseYear = kw * lf * hours;
    const costYear = energyUseYear * electricityRate;
    const co2Year = energyUseYear * emissionFactor;

    const finalData = {
      ...formData,
      comments: finalComments,
      energyUseYear,
      costYear,
      co2Year
    };

    let newEquipments;
    if (equipment && equipment.id) {
      // Edit
      newEquipments = data.equipments.map(eq => eq.id === equipment.id ? { 
        ...eq, 
        ...finalData,
        updatedBy: user?.name || 'Unknown',
        updatedAt: new Date().toISOString()
      } : eq);
    } else {
      // Add
      const newEq = {
        id: 'eq_' + Date.now(),
        createdBy: user?.name || 'Unknown',
        createdAt: new Date().toISOString(),
        ...finalData
      };
      newEquipments = [...data.equipments, newEq];
    }

    setData({ ...data, equipments: newEquipments });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6 pb-20">
      <form onSubmit={handleSave} className="space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-text">
              {equipment && equipment.id ? (lang === 'th' ? '✏️ แก้ไขข้อมูลอุปกรณ์' : t('edit_equipment')) : (lang === 'th' ? '➕ เพิ่มอุปกรณ์ใหม่' : t('add_new_equipment'))}
            </h2>
            <p className="text-sm text-muted mt-1">
              {lang === 'th' ? 'กรอกข้อมูลรายละเอียดของเครื่องจักร/อุปกรณ์ให้ครบถ้วน' : 'Fill in the equipment details below'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-1.5 bg-surface text-text cursor-pointer">
            <ArrowLeft size={16} /> {t('cancel')}
          </button>
        </div>

        {/* Section 1: Identification */}
        <div className="bg-surface border border-border p-6 rounded-xl space-y-4 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-accent/50 group-hover:bg-accent transition-colors"></div>
          <h4 className="text-sm font-bold text-text uppercase tracking-wider mb-2 border-b border-border pb-2 flex items-center gap-2">
            <Tag size={16} className="text-muted" /> {t('identification')}
          </h4>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">{t('equipment_tag')} <span className="text-red-500">*</span></label>
            <input 
              required 
              type="text" 
              name="tag" 
              value={formData.tag} 
              onChange={handleChange} 
              disabled={!!(equipment && equipment.id)}
              placeholder="e.g. CH-01" 
              className={`w-full p-2.5 bg-bg border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-mono ${equipment && equipment.id ? 'opacity-70 cursor-not-allowed bg-slate-50' : ''}`} 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t('factory')}</label>
              {equipment && equipment.id ? (
                <input 
                  type="text"
                  value={formData.factory}
                  disabled
                  className="w-full p-2.5 bg-slate-50 border border-border rounded-lg text-sm outline-none opacity-70 cursor-not-allowed"
                />
              ) : (
                <select 
                  name="factory" 
                  value={formData.factory} 
                  onChange={handleChange} 
                  className="w-full p-2.5 bg-bg border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                >
                  {factories.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t('category')}</label>
              {equipment && equipment.id ? (
                <input 
                  type="text"
                  value={data.cats?.find(c => c.id === formData.catId)?.name || formData.catId}
                  disabled
                  className="w-full p-2.5 bg-slate-50 border border-border rounded-lg text-sm outline-none opacity-70 cursor-not-allowed"
                />
              ) : (
                <select name="catId" value={formData.catId} onChange={handleChange} className="w-full p-2.5 bg-bg border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all">
                  {data.cats && data.cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
            </div>
          </div>

          {/* Dept and Install Year row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{lang === 'th' ? 'แผนก / ตำแหน่งติดตั้ง' : 'Department / Location'}</label>
              <input 
                type="text" 
                name="dept" 
                value={formData.dept} 
                onChange={handleChange} 
                disabled={!!(equipment && equipment.id)}
                placeholder={lang === 'th' ? 'เช่น ห้องคอมเพรสเซอร์' : 'e.g. Compressor Room'} 
                className={`w-full p-2.5 bg-bg border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all ${equipment && equipment.id ? 'opacity-70 cursor-not-allowed bg-slate-50' : ''}`} 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                {lang === 'th' ? 'ปีที่ติดตั้ง (ใช้คำนวณอายุ)' : 'Year of Installation (for age calc)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  disabled={!!(equipment && equipment.id)}
                  placeholder={new Date().getFullYear().toString()}
                  min="1990"
                  max={new Date().getFullYear()}
                  className={`w-full p-2.5 bg-bg border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-mono ${equipment && equipment.id ? 'opacity-70 cursor-not-allowed bg-slate-50' : ''}`}
                />
                {formData.year && (
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold text-accent">
                    {lang === 'th' ? `อายุ ${new Date().getFullYear() - parseInt(formData.year)} ปี` : `${new Date().getFullYear() - parseInt(formData.year)} yrs old`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Technical Specifications */}
        <div className="bg-surface border border-border p-6 rounded-xl space-y-4 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50 group-hover:bg-emerald-500 transition-colors"></div>
          <h4 className="text-sm font-bold text-text uppercase tracking-wider mb-2 border-b border-border pb-2 flex items-center gap-2 pt-1">
            <Settings size={16} className="text-muted" /> {t('specifications_title')}
          </h4>

          {catalogOptions.length > 0 && (!equipment || !equipment.id) && (
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
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} disabled={!!(equipment && equipment.id)} placeholder="e.g. Trane" className={`w-full p-2.5 bg-bg border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all ${equipment && equipment.id ? 'opacity-70 cursor-not-allowed bg-slate-50' : ''}`} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{t('model')}</label>
              <input type="text" name="model" value={formData.model} onChange={handleChange} disabled={!!(equipment && equipment.id)} placeholder="e.g. CVHE" className={`w-full p-2.5 bg-bg border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all ${equipment && equipment.id ? 'opacity-70 cursor-not-allowed bg-slate-50' : ''}`} />
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
                  onChange={handleChange}
                  placeholder="Auto Calc or Manual"
                  className="w-full p-2.5 pl-9 bg-bg border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent text-emerald-600 font-bold transition-all font-mono"
                />
                <Activity size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{lang === 'th' ? 'ชั่วโมงการทำงาน (ชม./ปี)' : 'Operating Hours (hrs/yr)'}</label>
              <input type="number" name="opHoursYear" value={formData.opHoursYear} onChange={handleChange} placeholder="e.g. 8000" className="w-full p-2.5 bg-bg border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">{lang === 'th' ? 'ภาระการทำงานเฉลี่ย (Load Factor)' : 'Average Load Factor (0-1)'}</label>
              <input type="number" step="0.01" min="0" max="1" name="loadFactor" value={formData.loadFactor} onChange={handleChange} placeholder="e.g. 0.8" className="w-full p-2.5 bg-bg border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-mono" />
            </div>
          </div>
        </div>

        {/* Section 3: Inspection History & Comments */}
        <div className="bg-surface border border-border p-6 rounded-xl space-y-4 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50 group-hover:bg-blue-500 transition-colors"></div>
          <h4 className="text-sm font-bold text-text uppercase tracking-wider mb-2 border-b border-border pb-2 flex items-center gap-2 pt-1">
            <MessageSquare size={16} className="text-muted" /> {lang === 'th' ? 'ประวัติการตรวจดู / สรุปปัญหา' : 'Inspection History & Comments'}
          </h4>

          <div className="flex gap-2 mb-4">
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={lang === 'th' ? 'เพิ่มข้อความอธิบายปัญหา, ประวัติการซ่อมบำรุง หรือข้อสังเกต...' : 'Add a note, maintenance history, or observation...'}
              className="w-full p-3 bg-bg border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none h-[80px]"
            />
            <button 
              type="button"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-accent text-white font-medium rounded-lg hover:bg-accentHover transition-colors flex flex-col items-center justify-center gap-1 shrink-0 w-[80px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={20} />
              <span className="text-xs">{t('add')}</span>
            </button>
          </div>

          {formData.comments && formData.comments.length > 0 ? (
            <div className="space-y-3 mt-4">
              {formData.comments.map((comment) => (
                <div key={comment.id} className="p-3 bg-bg border border-border rounded-lg relative group/item">
                  <div className="flex justify-between items-start gap-4 mb-1">
                    <span className="text-[10px] font-bold text-muted">
                      {new Date(comment.date).toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveComment(comment.id)}
                      className="text-red-400 hover:text-red-600 opacity-0 group-hover/item:opacity-100 transition-opacity p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-sm text-text whitespace-pre-line">{comment.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted text-center py-6 bg-bg/50 border border-dashed border-border rounded-lg">
              {lang === 'th' ? 'ยังไม่มีประวัติหรือคอมเมนต์' : 'No history or comments yet.'}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-surface border border-border text-text font-medium rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
            {t('cancel')}
          </button>
          <button type="submit" className="px-6 py-2.5 bg-accent text-white font-medium rounded-xl hover:bg-accentHover transition-colors flex items-center gap-2 shadow-sm cursor-pointer">
            <Check size={16} /> {equipment && equipment.id ? (lang === 'th' ? 'บันทึกการเปลี่ยนแปลง' : t('save_changes')) : (lang === 'th' ? 'บันทึกอุปกรณ์' : t('add_equipment'))}
          </button>
        </div>

      </form>
    </div>
  );
}