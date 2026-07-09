import React, { useContext, useState } from 'react';
import { Sliders, Bell, Database, Save, Check, Leaf, Plus, Trash2, DollarSign } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export default function SystemSettings() {
  const { data, setData, resetDatabase, t } = useContext(AppContext);
  const [sysSettings, setSysSettings] = useState(data.settings || {
    theme: 'System Default',
    language: 'English (US)',
    carbonTaxRate: 200,
    emailAlerts: true,
    lineNotify: false,
    emissionFactors: data.settings?.emissionFactors || []
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleResetDb = () => {
    if (window.confirm(t('reset_db_confirm'))) {
      resetDatabase();
      alert(t('db_reset_done'));
      window.location.reload();
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSysSettings(p => ({
      ...p,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEfChange = (id, field, value) => {
    setSysSettings(p => ({
      ...p,
      emissionFactors: p.emissionFactors.map(ef => 
        ef.id === id ? { ...ef, [field]: value } : ef
      )
    }));
  };

  const addEf = () => {
    setSysSettings(p => ({
      ...p,
      emissionFactors: [
        ...p.emissionFactors,
        { id: 'ef_' + Date.now(), name: 'New Factor', unit: 'unit', value: 0, source: 'Custom' }
      ]
    }));
  };

  const removeEf = (id) => {
    if (confirm('Are you sure you want to remove this emission factor?')) {
      setSysSettings(p => ({
        ...p,
        emissionFactors: p.emissionFactors.filter(ef => ef.id !== id)
      }));
    }
  };

  const handleSave = () => {
    setData({ ...data, settings: sysSettings });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };
  return (
    <div className="animate-slide-up space-y-6 pb-12 select-none">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-text flex items-center gap-2">
          <span className="w-1.5 h-4 bg-accent rounded-full animate-pulse" /> {t('system_settings')}
        </h2>
        <p className="text-xs md:text-sm text-muted mt-1">{t('system_desc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* General Preferences */}
        <div className="bg-surface border border-border/80 rounded-2xl p-6 space-y-6 shadow-sm">
          <h4 className="text-xs font-bold text-text uppercase tracking-wider border-b border-border/50 pb-3 flex items-center gap-2">
            <Sliders size={15} className="text-accent" /> {t('general_preferences')}
          </h4>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-text">{t('default_theme')}</div>
                <div className="text-[11px] text-muted font-medium mt-0.5">{t('theme')} {t('preferences')}</div>
              </div>
              <select name="theme" value={sysSettings.theme} onChange={handleChange} className="p-2.5 bg-bg/50 border border-border rounded-xl text-xs font-bold outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all cursor-pointer min-w-[140px]">
                <option value="System Default">System Default</option>
                <option value="Light Mode">Light Mode</option>
                <option value="Dark Mode">Dark Mode</option>
                <option value="Corporate Mode">Corporate (Navy) Mode</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/50">
              <div>
                <div className="text-xs font-bold text-text">{t('language')}</div>
                <div className="text-[11px] text-muted font-medium mt-0.5">{t('language_desc')}</div>
              </div>
              <select name="language" value={sysSettings.language} onChange={handleChange} className="p-2.5 bg-bg/50 border border-border rounded-xl text-xs font-bold outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all cursor-pointer min-w-[140px]">
                <option value="English (US)">English (US)</option>
                <option value="Thai (TH)">Thai (TH)</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/50">
              <div>
                <div className="text-xs font-bold text-text">{t('carbon_tax_rate') || 'Carbon Tax Rate'}</div>
                <div className="text-[11px] text-muted font-medium mt-0.5">{t('carbon_tax_desc') || 'Used to calculate financial savings from emission reduction.'}</div>
              </div>
              <div className="relative">
                <input type="number" name="carbonTaxRate" value={sysSettings.carbonTaxRate} onChange={handleChange} step="1" className="w-28 p-2.5 pr-8 bg-bg/50 border border-border rounded-xl text-xs font-bold outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all font-mono text-right" />
                <span className="absolute right-3 top-3 text-[10px] font-bold text-muted pointer-events-none">฿</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Connections */}
        <div className="bg-surface border border-border/80 rounded-2xl p-6 space-y-6 shadow-sm">
          <h4 className="text-xs font-bold text-text uppercase tracking-wider border-b border-border/50 pb-3 flex items-center gap-2">
            <Bell size={15} className="text-accent" /> {t('notification_digests')}
          </h4>
          
          <div className="space-y-4">
            <label className="flex items-start gap-3.5 cursor-pointer group">
              <input type="checkbox" name="emailAlerts" checked={sysSettings.emailAlerts} onChange={handleChange} className="w-4 h-4 text-accent rounded-lg border-border focus:ring-accent/20 cursor-pointer mt-0.5" />
              <div>
                <div className="text-xs font-bold text-text group-hover:text-accent transition-colors">{t('email_summaries')}</div>
                <div className="text-[10px] text-muted font-semibold mt-0.5">{t('email_summaries_desc')}</div>
              </div>
            </label>
            
            <label className="flex items-start gap-3.5 cursor-pointer group pt-2">
              <input type="checkbox" name="lineNotify" checked={sysSettings.lineNotify} onChange={handleChange} className="w-4 h-4 text-accent rounded-lg border-border focus:ring-accent/20 cursor-pointer mt-0.5" />
              <div>
                <div className="text-xs font-bold text-text group-hover:text-accent transition-colors">{t('line_alerts')}</div>
                <div className="text-[10px] text-muted font-semibold mt-0.5">{t('line_alerts_desc')}</div>
              </div>
            </label>
          </div>

          <h4 className="text-xs font-bold text-text uppercase tracking-wider border-b border-border/50 pb-3 pt-4 flex items-center gap-2">
            <Database size={15} className="text-accent" /> {t('db_connection')}
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-text">{t('sync_status')}</div>
                <div className="text-[11px] text-muted font-medium mt-0.5">{t('last_synced')}</div>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-[10px] font-bold rounded-lg uppercase tracking-wider">{t('connected')}</span>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">{t('api_endpoint')}</label>
              <div className="flex gap-2">
                <input type="text" defaultValue="https://api.enginspect.com/v3" disabled className="flex-1 p-2.5 bg-card2/80 border border-border rounded-xl text-xs text-muted/80 font-mono select-none" />
                <button className="px-4 py-2 bg-card2/80 hover:bg-card2 text-text font-bold text-xs uppercase tracking-wider rounded-xl border border-border/40 transition-all active:scale-95 cursor-pointer">
                  {t('test')}
                </button>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-text">{t('reset_db')}</div>
                  <div className="text-[10px] text-muted font-medium mt-0.5">{t('loading_mock_desc')}</div>
                </div>
                <button 
                  type="button" 
                  onClick={handleResetDb} 
                  className="px-4 py-2 bg-bad/10 hover:bg-bad/20 text-bad font-bold text-xs uppercase tracking-wider rounded-xl border border-bad/30 hover:border-bad/40 transition-all active:scale-95 cursor-pointer"
                >
                  {t('reset_db')}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        
      </div>

      {/* Master Emission Factors Table */}
      <div className="bg-surface border border-border/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-2">
              <Leaf size={15} className="text-good" /> Master Emission Factors
            </h4>
            <p className="text-[11px] text-muted mt-1">Manage conversion factors for different energy sources and utilities.</p>
          </div>
          <button onClick={addEf} className="px-3 py-1.5 bg-accent hover:bg-accentHover text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all border-none cursor-pointer flex items-center gap-1 active:scale-95">
            <Plus size={12} /> Add Factor
          </button>
        </div>
        
        <div className="overflow-x-auto border border-border/50 rounded-xl">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="bg-card2/50 text-[10px] uppercase tracking-wider text-muted font-bold border-b border-border/50">
              <tr>
                <th className="px-4 py-3">Energy Source / Product</th>
                <th className="px-4 py-3">Factor Value</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Reference (Source)</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {sysSettings.emissionFactors?.map((ef) => (
                <tr key={ef.id} className="hover:bg-bg/30 transition-colors">
                  <td className="px-4 py-2">
                    <input type="text" value={ef.name} onChange={(e) => handleEfChange(ef.id, 'name', e.target.value)} className="w-full p-1.5 bg-transparent border border-transparent hover:border-border/60 focus:bg-bg focus:border-accent rounded text-xs font-bold text-text outline-none transition-all" />
                  </td>
                  <td className="px-4 py-2">
                    <input type="number" value={ef.value} onChange={(e) => handleEfChange(ef.id, 'value', parseFloat(e.target.value))} step="0.0001" className="w-24 p-1.5 bg-transparent border border-transparent hover:border-border/60 focus:bg-bg focus:border-accent rounded text-xs font-mono font-bold text-text outline-none transition-all" />
                  </td>
                  <td className="px-4 py-2">
                    <input type="text" value={ef.unit} onChange={(e) => handleEfChange(ef.id, 'unit', e.target.value)} className="w-20 p-1.5 bg-transparent border border-transparent hover:border-border/60 focus:bg-bg focus:border-accent rounded text-xs font-medium text-muted outline-none transition-all" />
                  </td>
                  <td className="px-4 py-2">
                    <input type="text" value={ef.source} onChange={(e) => handleEfChange(ef.id, 'source', e.target.value)} className="w-full p-1.5 bg-transparent border border-transparent hover:border-border/60 focus:bg-bg focus:border-accent rounded text-xs font-medium text-muted outline-none transition-all" />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => removeEf(ef.id)} disabled={ef.id === 'ef_elec'} className="p-1.5 text-muted hover:text-bad rounded hover:bg-bad/10 transition-colors border-none bg-transparent cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end items-center gap-4 pt-4">
        {isSaved && (
          <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 animate-fade-in">
            <Check size={14} /> {t('config_saved')}
          </span>
        )}
        <button onClick={handleSave} className="px-6 py-2.5 bg-accent hover:bg-accentHover text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-accent/15 flex items-center gap-2 active:scale-95 cursor-pointer border-none">
          <Save size={14} /> {t('save_configurations')}
        </button>
      </div>

    </div>
  );
}
