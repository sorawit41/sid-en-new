import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Shield, Plus, Trash2, Edit2, Save, X, Check, Factory, User, Key, AlertTriangle, DollarSign, Leaf } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin', labelTh: 'ผู้ดูแลระบบ' },
  { value: 'engineer', label: 'Engineer', labelTh: 'วิศวกร' },
];

function RoleBadge({ role }) {
  if (role === 'admin') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-500 border border-red-500/20">
      <Shield size={9} /> Admin
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-500 border border-blue-500/20">
      <User size={9} /> Engineer
    </span>
  );
}

export default function AdminPanel() {
  const { user, data, addUser, updateUser, deleteUser, setData, lang } = useContext(AppContext);
  
  // Guard: only admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const [tab, setTab] = useState('users');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saved, setSaved] = useState(false);

  const blankUser = { name: '', email: '', password: '', role: 'engineer', position: '', initials: '', assignedFactories: [] };
  const [form, setForm] = useState(blankUser);

  // Admin settings state
  const [adminSettings, setAdminSettings] = useState({
    elecRate: data.settings?.elecRate || 4.2,
    carbonTaxRate: data.settings?.carbonTaxRate || 200,
    emissionFactors: data.settings?.emissionFactors || [],
  });

  const users = data.users || [];
  const factories = data.factories || [];

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const toggleFactory = (fId) => {
    setForm(p => ({
      ...p,
      assignedFactories: p.assignedFactories.includes(fId)
        ? p.assignedFactories.filter(x => x !== fId)
        : [...p.assignedFactories, fId]
    }));
  };

  const handleAddUser = () => {
    if (!form.name || !form.email || !form.password) return;
    addUser({ ...form, initials: form.initials || form.name[0]?.toUpperCase() || 'U' });
    setForm(blankUser);
    setIsAddOpen(false);
  };

  const handleEditOpen = (u) => {
    setEditingId(u.id);
    setForm({ ...u });
  };

  const handleEditSave = () => {
    updateUser(editingId, { ...form, initials: form.initials || form.name[0]?.toUpperCase() || 'U' });
    setEditingId(null);
    setForm(blankUser);
  };

  const handleDeleteUser = (id) => {
    if (id === user.id) { alert('ไม่สามารถลบบัญชีของตัวเองได้'); return; }
    if (window.confirm('ต้องการลบผู้ใช้นี้หรือไม่?')) deleteUser(id);
  };

  const saveAdminSettings = () => {
    setData({ ...data, settings: { ...data.settings, ...adminSettings } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleEfChange = (id, field, value) => {
    setAdminSettings(p => ({
      ...p,
      emissionFactors: p.emissionFactors.map(ef => ef.id === id ? { ...ef, [field]: value } : ef)
    }));
  };

  const TABS = [
    { id: 'users', label: 'จัดการผู้ใช้', icon: User },
    { id: 'settings', label: 'ค่าตั้งต้นระบบ', icon: DollarSign },
  ];

  return (
    <div className="animate-slide-up space-y-6 pb-12 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-text flex items-center gap-2">
            <span className="w-1.5 h-4 bg-red-500 rounded-full animate-pulse" />
            <Shield size={22} className="text-red-500" />
            Admin Panel
          </h2>
          <p className="text-xs md:text-sm text-muted mt-1">จัดการผู้ใช้ สิทธิ์การเข้าถึง และค่าตั้งต้นของระบบ</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-500 border border-red-500/20 flex items-center gap-1.5">
          <Shield size={12} /> Admin Only
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface border border-border/60 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${tab === t.id ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-text hover:bg-card2'}`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* ===== USERS TAB ===== */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-text">ผู้ใช้ทั้งหมด ({users.length} คน)</h3>
            <button
              onClick={() => { setIsAddOpen(true); setForm(blankUser); setEditingId(null); }}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accentHover text-white text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer border-none"
            >
              <Plus size={14} /> เพิ่มผู้ใช้ใหม่
            </button>
          </div>

          {/* Add/Edit Form Modal */}
          {(isAddOpen || editingId) && (
            <div className="bg-surface border border-accent/30 rounded-2xl p-6 shadow-lg space-y-4">
              <h4 className="text-sm font-bold text-text flex items-center gap-2">
                {editingId ? <><Edit2 size={14} /> แก้ไขผู้ใช้</> : <><Plus size={14} /> เพิ่มผู้ใช้ใหม่</>}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'name', label: 'ชื่อ-นามสกุล', type: 'text', required: true },
                  { name: 'email', label: 'อีเมล', type: 'email', required: true },
                  { name: 'password', label: 'รหัสผ่าน', type: 'text', required: !editingId },
                  { name: 'position', label: 'ตำแหน่ง', type: 'text' },
                  { name: 'initials', label: 'ตัวย่อ (2 ตัว)', type: 'text' },
                ].map(f => (
                  <div key={f.name}>
                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">{f.label}{f.required && ' *'}</label>
                    <input
                      type={f.type}
                      name={f.name}
                      value={form[f.name]}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 bg-bg/50 border border-border rounded-lg text-xs font-medium outline-none focus:border-accent transition-all"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">สิทธิ์ (Role)</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-bg/50 border border-border rounded-lg text-xs font-medium outline-none focus:border-accent transition-all cursor-pointer"
                  >
                    {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.labelTh}</option>)}
                  </select>
                </div>
              </div>

              {/* Factory Assignment */}
              {form.role !== 'admin' && (
                <div>
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-2">
                    <Factory size={12} className="inline mr-1" />
                    โรงงานที่มีสิทธิ์เข้าถึง (ไม่เลือก = เข้าถึงทุกโรงงาน)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {factories.map(f => {
                      const sel = form.assignedFactories.includes(f.id);
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => toggleFactory(f.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${sel ? 'bg-accent text-white border-accent' : 'bg-card2 text-muted border-border hover:border-accent/40'}`}
                        >
                          {sel && <Check size={11} className="inline mr-1" />}
                          {f.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={editingId ? handleEditSave : handleAddUser}
                  className="flex items-center gap-2 px-5 py-2 bg-accent hover:bg-accentHover text-white text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer border-none"
                >
                  <Save size={13} /> {editingId ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้'}
                </button>
                <button
                  onClick={() => { setIsAddOpen(false); setEditingId(null); setForm(blankUser); }}
                  className="flex items-center gap-2 px-4 py-2 bg-card2 text-muted hover:text-text text-xs font-bold rounded-lg transition-all cursor-pointer border border-border"
                >
                  <X size={13} /> ยกเลิก
                </button>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-surface border border-border/60 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] text-muted uppercase tracking-wider bg-card2/50 border-b border-border/40">
                  <tr>
                    <th className="px-5 py-3.5 font-bold">ผู้ใช้</th>
                    <th className="px-5 py-3.5 font-bold">อีเมล / ตำแหน่ง</th>
                    <th className="px-5 py-3.5 font-bold">สิทธิ์</th>
                    <th className="px-5 py-3.5 font-bold">โรงงานที่เข้าถึงได้</th>
                    <th className="px-5 py-3.5 font-bold text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {users.map(u => (
                    <tr key={u.id} className={`hover:bg-card2/25 transition-colors ${u.id === user.id ? 'bg-accent/5' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center text-accent font-bold text-sm shrink-0">
                            {u.initials || u.name?.[0] || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-text">{u.name}</div>
                            {u.id === user.id && <span className="text-[9px] text-accent font-bold">(บัญชีของคุณ)</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-muted">{u.email}</div>
                        <div className="text-[10px] text-dim">{u.position || '—'}</div>
                      </td>
                      <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                      <td className="px-5 py-4">
                        {u.role === 'admin' ? (
                          <span className="text-[10px] text-muted italic">ทุกโรงงาน</span>
                        ) : u.assignedFactories?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {u.assignedFactories.map(fId => {
                              const fac = factories.find(f => f.id === fId);
                              return fac ? (
                                <span key={fId} className="px-1.5 py-0.5 bg-accent/10 text-accent text-[10px] font-bold rounded">{fac.name}</span>
                              ) : null;
                            })}
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted italic">ทุกโรงงาน (ไม่จำกัด)</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditOpen(u)}
                            className="p-2 text-muted hover:text-accent rounded-lg hover:bg-accent/10 transition-all cursor-pointer border-none bg-transparent"
                            title="แก้ไข"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-2 text-muted hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-all cursor-pointer border-none bg-transparent"
                            title="ลบ"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== SETTINGS TAB ===== */}
      {tab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-surface border border-border/80 rounded-2xl p-6 space-y-5 shadow-sm">
            <h4 className="text-xs font-bold text-text uppercase tracking-wider border-b border-border/50 pb-3 flex items-center gap-2">
              <DollarSign size={15} className="text-accent" /> ค่าพลังงานและการคำนวณ
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-2">อัตราค่าไฟฟ้า (บาท/kWh)</label>
                <input
                  type="number"
                  step="0.01"
                  value={adminSettings.elecRate}
                  onChange={e => setAdminSettings(p => ({ ...p, elecRate: parseFloat(e.target.value) || p.elecRate }))}
                  className="w-full px-4 py-2.5 bg-bg/50 border border-border rounded-xl text-sm font-mono font-bold outline-none focus:border-accent transition-all"
                />
                <p className="text-[10px] text-muted mt-1">ใช้คำนวณค่าประหยัดพลังงานทั้งระบบ</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-2">อัตราภาษีคาร์บอน (บาท/tCO₂e)</label>
                <input
                  type="number"
                  step="1"
                  value={adminSettings.carbonTaxRate}
                  onChange={e => setAdminSettings(p => ({ ...p, carbonTaxRate: parseFloat(e.target.value) || p.carbonTaxRate }))}
                  className="w-full px-4 py-2.5 bg-bg/50 border border-border rounded-xl text-sm font-mono font-bold outline-none focus:border-accent transition-all"
                />
              </div>
            </div>

            {/* Emission Factors */}
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-3 flex items-center gap-1">
                <Leaf size={11} /> ค่าสัมประสิทธิ์การปล่อยคาร์บอน (Emission Factors)
              </label>
              <div className="space-y-2">
                {adminSettings.emissionFactors.map(ef => (
                  <div key={ef.id} className="grid grid-cols-4 gap-3 items-center bg-card2/50 border border-border/40 rounded-xl p-3">
                    <div>
                      <div className="text-[9px] text-muted font-bold uppercase mb-1">ชื่อ</div>
                      <input
                        value={ef.name}
                        onChange={e => handleEfChange(ef.id, 'name', e.target.value)}
                        className="w-full px-2 py-1 bg-bg/50 border border-border rounded-lg text-xs font-medium outline-none focus:border-accent transition-all"
                      />
                    </div>
                    <div>
                      <div className="text-[9px] text-muted font-bold uppercase mb-1">หน่วย</div>
                      <input
                        value={ef.unit}
                        onChange={e => handleEfChange(ef.id, 'unit', e.target.value)}
                        className="w-full px-2 py-1 bg-bg/50 border border-border rounded-lg text-xs font-medium outline-none focus:border-accent transition-all"
                      />
                    </div>
                    <div>
                      <div className="text-[9px] text-muted font-bold uppercase mb-1">ค่า (kgCO₂e)</div>
                      <input
                        type="number"
                        step="0.0001"
                        value={ef.value}
                        onChange={e => handleEfChange(ef.id, 'value', parseFloat(e.target.value))}
                        className="w-full px-2 py-1 bg-bg/50 border border-border rounded-lg text-xs font-mono font-bold outline-none focus:border-accent transition-all"
                      />
                    </div>
                    <div>
                      <div className="text-[9px] text-muted font-bold uppercase mb-1">แหล่งอ้างอิง</div>
                      <input
                        value={ef.source}
                        onChange={e => handleEfChange(ef.id, 'source', e.target.value)}
                        className="w-full px-2 py-1 bg-bg/50 border border-border rounded-lg text-xs font-medium outline-none focus:border-accent transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={saveAdminSettings}
                className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accentHover text-white text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer border-none shadow-sm"
              >
                <Save size={14} /> บันทึกการตั้งค่า
              </button>
              {saved && (
                <span className="text-xs text-green-500 font-bold flex items-center gap-1 animate-fade-in">
                  <Check size={14} /> บันทึกสำเร็จ!
                </span>
              )}
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium leading-relaxed">
              การเปลี่ยนค่าเหล่านี้จะมีผลต่อการคำนวณทั้งระบบทันที กรุณาตรวจสอบก่อนบันทึก
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
