import React, { useState, useContext } from 'react';
import { X } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export function ModalWrapper({ isOpen, onClose, title, children, maxWidth = '500px' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/5 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-surface border border-border/80 rounded-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-modal-in overflow-hidden" 
        style={{ maxWidth }}
      >
        <div className="flex items-center justify-between p-5 border-b border-border/50 bg-card2/35 shrink-0">
          <h3 className="text-base font-bold text-text">{title}</h3>
          <button 
            className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-muted hover:text-text hover:bg-card2 transition-all active:scale-90 cursor-pointer"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-surface">
          {children}
        </div>
      </div>
    </div>
  );
}

export function EquipModal({ isOpen, onClose, initialData, onSave, categories }) {
  const { t } = useContext(AppContext);
  const [formData, setFormData] = useState(initialData || {
    tag: '', brand: '', model: '', serial: '', catId: '', factory: '', year: '', capacity: '', kw: '', area: '', desc: ''
  });

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={initialData ? t('edit_equipment') : t('add_new_equipment')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">{t('equipment_tag')} *</label>
            <input required name="tag" value={formData.tag} onChange={handleChange} className="w-full p-2.5 bg-bg/50 border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all font-mono" placeholder="e.g. CH-01" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">{t('category')} *</label>
            <select required name="catId" value={formData.catId} onChange={handleChange} className="w-full p-2.5 bg-bg/50 border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all">
              <option value="">Select Category...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">{t('brand')}</label>
            <input name="brand" value={formData.brand} onChange={handleChange} className="w-full p-2.5 bg-bg/50 border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all" placeholder="e.g. Trane" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">{t('model')}</label>
            <input name="model" value={formData.model} onChange={handleChange} className="w-full p-2.5 bg-bg/50 border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">{t('factory')} / Area</label>
            <input name="factory" value={formData.factory} onChange={handleChange} className="w-full p-2.5 bg-bg/50 border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">Installation Area</label>
            <input name="area" value={formData.area} onChange={handleChange} className="w-full p-2.5 bg-bg/50 border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all" />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-border/50">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl bg-white border border-border text-text font-semibold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors shadow-sm cursor-pointer active:scale-95">{t('cancel')}</button>
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-xs uppercase tracking-wider hover:bg-accentHover transition-all shadow-md shadow-accent/15 cursor-pointer active:scale-95 border-none">{t('save_equipment')}</button>
        </div>
      </form>
    </ModalWrapper>
  );
}

export function CatModal({ isOpen, onClose, onSave }) {
  const { t } = useContext(AppContext);
  const [formData, setFormData] = useState({ name: '', desc: '', icon: 'Settings' });

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const icons = ['Settings', 'Snowflake', 'Wind', 'Droplets', 'Flame', 'Factory', 'Zap'];

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={t('add_new_category')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">{t('category_name')} *</label>
          <input required name="name" value={formData.name} onChange={handleChange} className="w-full p-2.5 bg-bg/50 border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all" placeholder="e.g. Boiler, AHU" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">{t('description')}</label>
          <input name="desc" value={formData.desc} onChange={handleChange} className="w-full p-2.5 bg-bg/50 border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all" placeholder="Short description" />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">{t('icon')}</label>
          <select name="icon" value={formData.icon} onChange={handleChange} className="w-full p-2.5 bg-bg/50 border border-border rounded-lg text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all">
            {icons.map(ic => <option key={ic} value={ic}>{ic}</option>)}
          </select>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-border/50">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl bg-white border border-border text-text font-semibold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors shadow-sm cursor-pointer active:scale-95">{t('cancel')}</button>
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-xs uppercase tracking-wider hover:bg-accentHover transition-all shadow-md shadow-accent/15 cursor-pointer active:scale-95 border-none">{t('create_category')}</button>
        </div>
      </form>
    </ModalWrapper>
  );
}
