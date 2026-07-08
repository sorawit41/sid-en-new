import React, { useContext, useState, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { FileText, ArrowRight, ArrowLeft, Check, Download, Plus, Eye, Trash2, Camera, Printer, X } from 'lucide-react';

const MAX_PHOTOS = 6;

export default function ReportSystem() {
  const { data, setData } = useContext(AppContext);
  const [view, setView] = useState('list'); // 'list', 'editor', 'preview'
  const [step, setStep] = useState(0);
  
  // Single comprehensive state for the report editor
  const [reportForm, setReportForm] = useState(getInitialForm());

  const factories = [...new Set(data.equipments.map(e => e.factory).filter(Boolean))];

  function getInitialForm() {
    return {
      id: '',
      eqId: '',
      measId: '',
      title: '', docno: '', factory: '', dept: '',
      source: 'การตรวจวัดและวิเคราะห์', meastype: 'No/Low Cost', objective: '',
      equip_main: '', equip_aux: '', date_start: '', date_end: '',
      author: '', consultant: '', approver: '',
      
      // Before
      before_date: '', before_inspector: '',
      before_kw: '', before_hrs: 8000,
      before_p1label: '', before_p1val: '',
      before_p2label: '', before_p2val: '',
      before_p3label: '', before_p3val: '',
      before_issue: '',
      before_photos: [], // {dataUrl, caption}
      
      // After
      after_date: '', after_inspector: '',
      after_kw: '', after_hrs: 8000,
      after_p1label: '', after_p1val: '',
      after_p2label: '', after_p2val: '',
      after_p3label: '', after_p3val: '',
      after_action: '', after_result: '',
      after_photos: [], // {dataUrl, caption}
      
      custom_params: [],

      // Summary
      save_kwh: '', save_baht: '', invest: '', payback: '',
      conclusion: '', recommend: ''
    };
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportForm(prev => {
      const next = { ...prev, [name]: value };
      
      // Auto-calc savings if kw/hrs change
      if (['before_kw', 'before_hrs', 'after_kw', 'after_hrs'].includes(name)) {
        const bkw = parseFloat(next.before_kw) || 0;
        const akw = parseFloat(next.after_kw) || 0;
        const bhrs = parseFloat(next.before_hrs) || 0;
        const ahrs = parseFloat(next.after_hrs) || 0;
        if (bkw && akw && bhrs && ahrs) {
          next.save_kwh = Math.max(0, (bkw * bhrs) - (akw * ahrs)).toFixed(0);
        }
      }
      
      // Auto-calc payback
      if (['save_baht', 'invest'].includes(name) || next.save_kwh !== prev.save_kwh) {
        const sb = parseFloat(next.save_baht) || 0;
        const inv = parseFloat(next.invest) || 0;
        if (sb > 0 && inv > 0) {
          next.payback = (inv / sb).toFixed(2);
        } else {
          next.payback = '';
        }
      }
      return next;
    });
  };

  const handleEqChange = (e) => {
    const eqId = e.target.value;
    const eq = data.equipments.find(x => x.id === eqId);
    setReportForm(p => ({
      ...p,
      eqId,
      factory: eq?.factory || p.factory,
      equip_main: eq ? `${eq.tag} - ${eq.brand||''} ${eq.model||''}` : ''
    }));
  };

  const handleMeasChange = (e) => {
    const measId = e.target.value;
    const m = data.measures.find(x => x.id === measId);
    setReportForm(p => ({
      ...p,
      measId,
      save_kwh: m ? Math.round(m.kWhYear).toString() : p.save_kwh,
      save_baht: m ? Math.round(m.bahtYear).toString() : p.save_baht,
      invest: m ? m.invest.toString() : p.invest,
      payback: m ? m.payback?.toFixed(2) || '' : p.payback,
      objective: m ? m.measName : p.objective
    }));
  };

  const handlePhotoUpload = (e, section) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (reportForm[section].length >= MAX_PHOTOS) {
      alert(`อัปโหลดได้สูงสุด ${MAX_PHOTOS} รูป`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setReportForm(p => ({
        ...p,
        [section]: [...p[section], { dataUrl: ev.target.result, caption: '' }]
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = null; // reset input
  };

  const removePhoto = (index, section) => {
    setReportForm(p => ({
      ...p,
      [section]: p[section].filter((_, i) => i !== index)
    }));
  };

  const addCustomParam = () => {
    setReportForm(prev => ({
      ...prev,
      custom_params: [...(prev.custom_params || []), { label: '', beforeVal: '', afterVal: '' }]
    }));
  };

  const removeCustomParam = (index) => {
    setReportForm(prev => ({
      ...prev,
      custom_params: (prev.custom_params || []).filter((_, i) => i !== index)
    }));
  };

  const handleCustomParamChange = (index, field, val) => {
    setReportForm(prev => {
      const nextList = [...(prev.custom_params || [])];
      nextList[index] = { ...nextList[index], [field]: val };
      return {
        ...prev,
        custom_params: nextList
      };
    });
  };

  const saveReport = () => {
    const newReport = {
      ...reportForm,
      id: reportForm.id || 'rpt_' + Date.now(),
      updatedAt: new Date().toISOString(),
      createdAt: reportForm.id ? reportForm.createdAt : new Date().toISOString()
    };
    
    const existingIdx = data.reports.findIndex(r => r.id === newReport.id);
    let newReports = [...data.reports];
    
    if (existingIdx >= 0) {
      newReports[existingIdx] = newReport;
    } else {
      newReports.push(newReport);
    }
    
    setData({ ...data, reports: newReports });
    alert('บันทึกรายงานสำเร็จ');
    setView('list');
  };

  const deleteReport = (id) => {
    if (confirm('คุณต้องการลบรายงานนี้หรือไม่?')) {
      setData({ ...data, reports: data.reports.filter(r => r.id !== id) });
    }
  };

  const openNewReport = () => {
    setReportForm(getInitialForm());
    setStep(0);
    setView('editor');
  };

  const editReport = (rpt) => {
    const custom_params = rpt.custom_params || [
      ...(rpt.before_p1label ? [{ label: rpt.before_p1label, beforeVal: rpt.before_p1val, afterVal: rpt.after_p1val }] : []),
      ...(rpt.before_p2label ? [{ label: rpt.before_p2label, beforeVal: rpt.before_p2val, afterVal: rpt.after_p2val }] : []),
      ...(rpt.before_p3label ? [{ label: rpt.before_p3label, beforeVal: rpt.before_p3val, afterVal: rpt.after_p3val }] : [])
    ];
    setReportForm({
      ...rpt,
      custom_params
    });
    setStep(0);
    setView('editor');
  };

  const previewReport = (rpt = null) => {
    if (rpt) setReportForm(rpt);
    setView('preview');
  };

  // ---------------- LIST VIEW ---------------- //
  if (view === 'list') {
    return (
      <div className="animate-fade-in max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-2xl font-bold text-text">📄 รายงานผลการอนุรักษ์พลังงาน (M&V Report)</h2>
            <p className="text-sm text-muted mt-1">สร้างรายงานเปรียบเทียบสภาพก่อน-หลังปรับปรุง พร้อมพิมพ์หรือ Export</p>
          </div>
          <button onClick={openNewReport} className="px-5 py-2.5 bg-accent text-white font-medium rounded-md hover:bg-accentHover transition-colors flex items-center gap-2 shadow-sm">
            <Plus size={16} /> สร้างรายงานใหม่
          </button>
        </div>

        {data.reports.length === 0 ? (
          <div className="p-12 text-center text-muted bg-surface border border-border border-dashed rounded-xl">
            <FileText size={48} className="mx-auto mb-4 opacity-30" />
            <p>ยังไม่มีรายงาน — กด "สร้างรายงานใหม่"</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.reports.map(rpt => (
              <div key={rpt.id} className="bg-surface border border-border rounded-xl p-5 flex flex-wrap items-center gap-4 hover:border-border2 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <h3 className="font-bold text-text text-base">{rpt.title || 'รายงานไม่มีชื่อ'}</h3>
                  <div className="text-xs text-muted mt-1 flex flex-wrap gap-3">
                    <span>🏭 {rpt.factory || 'ไม่ระบุโรงงาน'}</span>
                    <span>อัปเดต: {new Date(rpt.updatedAt).toLocaleDateString('th-TH')}</span>
                    {rpt.docno && <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600">Doc: {rpt.docno}</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => previewReport(rpt)} className="p-2 border border-border rounded-md text-slate-600 hover:text-accent hover:border-accent hover:bg-accent/5 transition-colors">
                    <Eye size={18} />
                  </button>
                  <button onClick={() => editReport(rpt)} className="px-4 py-2 bg-white border border-border rounded-md text-sm font-medium hover:bg-slate-50 transition-colors">
                    แก้ไข
                  </button>
                  <button onClick={() => deleteReport(rpt.id)} className="p-2 border border-border rounded-md text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---------------- PREVIEW VIEW ---------------- //
  if (view === 'preview') {
    return <ReportPreview rpt={reportForm} onClose={() => setView('list')} onEdit={() => setView('editor')} />;
  }

  // ---------------- EDITOR VIEW ---------------- //
  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold text-text">{reportForm.id ? 'แก้ไขรายงาน' : 'สร้างรายงานใหม่'}</h2>
          <p className="text-sm text-muted mt-1">กรอกข้อมูลให้ครบทั้ง 4 ส่วน</p>
        </div>
        <button onClick={() => setView('list')} className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-slate-50 transition-colors">
          <ArrowLeft size={16} className="inline mr-1" /> กลับหน้ารวม
        </button>
      </div>

      {/* Steps Header */}
      <div className="flex bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        {['ข้อมูลเบื้องต้น', 'ก่อนปรับปรุง', 'หลังปรับปรุง', 'สรุปผล'].map((lbl, i) => (
          <button 
            key={i} 
            onClick={() => setStep(i)}
            className={`flex-1 py-3 px-2 flex flex-col items-center gap-1 border-r border-border last:border-0 transition-colors ${step === i ? 'bg-accent/10 text-accent' : (step > i ? 'text-emerald-600' : 'text-muted hover:bg-slate-50')}`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === i ? 'bg-accent text-white' : (step > i ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500')}`}>
              {step > i ? <Check size={12} /> : i + 1}
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-center">{lbl}</span>
          </button>
        ))}
      </div>

      {/* STEP 0: Info */}
      {step === 0 && (
        <div className="space-y-4 animate-slide-up">
          <Section title="🔩 เลือกเครื่องจักรและมาตรการ">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">เครื่องจักร / อุปกรณ์ *</label>
                <select name="eqId" value={reportForm.eqId} onChange={handleEqChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent">
                  <option value="">— เลือกอุปกรณ์ —</option>
                  {data.equipments.map(e => <option key={e.id} value={e.id}>{e.tag} - {e.factory}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">มาตรการ (ถ้ามีการคำนวณไว้แล้ว)</label>
                <select name="measId" value={reportForm.measId} onChange={handleMeasChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent">
                  <option value="">— เลือกมาตรการ —</option>
                  {data.measures.filter(m => !reportForm.eqId || m.eqId === reportForm.eqId).map(m => (
                    <option key={m.id} value={m.id}>{m.measName} ({Math.round(m.kWhYear).toLocaleString()} kWh)</option>
                  ))}
                </select>
              </div>
            </div>
          </Section>

          <Section title="📋 ข้อมูลทั่วไป">
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-muted mb-1">ชื่อรายงาน / หัวข้อ</label><input type="text" name="title" value={reportForm.title} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" placeholder="เช่น รายงานปรับปรุงประสิทธิภาพ CH-01" /></div>
              <div><label className="block text-xs font-medium text-muted mb-1">เลขที่รายงาน</label><input type="text" name="docno" value={reportForm.docno} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" placeholder="เช่น RPT-2025-001" /></div>
              <div><label className="block text-xs font-medium text-muted mb-1">ชื่อโรงงาน / บริษัท</label><input type="text" name="factory" value={reportForm.factory} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" placeholder="auto จากอุปกรณ์" /></div>
              <div><label className="block text-xs font-medium text-muted mb-1">แผนก / อาคาร</label><input type="text" name="dept" value={reportForm.dept} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" /></div>
            </div>
          </Section>

          <Section title="💡 ที่มาและวัตถุประสงค์">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">ที่มาของมาตรการ</label>
                <select name="source" value={reportForm.source} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent">
                  <option value="การตรวจวัดและวิเคราะห์">การตรวจวัดและวิเคราะห์</option>
                  <option value="ข้อเสนอแนะจากที่ปรึกษา">ข้อเสนอแนะจากที่ปรึกษา</option>
                  <option value="ผลการ Energy Audit">ผลการ Energy Audit</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">ประเภทมาตรการ</label>
                <select name="meastype" value={reportForm.meastype} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent">
                  <option value="No/Low Cost">No/Low Cost</option>
                  <option value="Medium Cost">Medium Cost</option>
                  <option value="High Cost / Capital Investment">High Cost / Capital Investment</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-muted mb-1">วัตถุประสงค์ / เป้าหมาย</label>
                <textarea name="objective" value={reportForm.objective} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent min-h-[80px]" placeholder="บรรยายวัตถุประสงค์..."></textarea>
              </div>
            </div>
          </Section>

          <Section title="🛠️ อุปกรณ์ที่เกี่ยวข้อง">
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-muted mb-1">อุปกรณ์หลักที่ปรับปรุง</label><input type="text" name="equip_main" value={reportForm.equip_main} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" /></div>
              <div><label className="block text-xs font-medium text-muted mb-1">อุปกรณ์เสริม/ที่เกี่ยวข้อง</label><input type="text" name="equip_aux" value={reportForm.equip_aux} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" /></div>
              <div><label className="block text-xs font-medium text-muted mb-1">วันที่เริ่มดำเนินการ</label><input type="date" name="date_start" value={reportForm.date_start} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" /></div>
              <div><label className="block text-xs font-medium text-muted mb-1">วันที่ดำเนินการแล้วเสร็จ</label><input type="date" name="date_end" value={reportForm.date_end} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" /></div>
            </div>
          </Section>

          <Section title="👤 ผู้รับผิดชอบ">
            <div className="grid md:grid-cols-3 gap-4">
              <div><label className="block text-xs font-medium text-muted mb-1">ผู้จัดทำรายงาน</label><input type="text" name="author" value={reportForm.author} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" /></div>
              <div><label className="block text-xs font-medium text-muted mb-1">ที่ปรึกษา / ผู้ตรวจสอบ</label><input type="text" name="consultant" value={reportForm.consultant} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" /></div>
              <div><label className="block text-xs font-medium text-muted mb-1">ผู้อนุมัติ</label><input type="text" name="approver" value={reportForm.approver} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" /></div>
            </div>
          </Section>
          
          <div className="flex justify-end pt-4"><button onClick={() => setStep(1)} className="px-6 py-2.5 bg-accent text-white font-medium rounded-md hover:bg-accentHover transition-colors flex items-center gap-2">ถัดไป <ArrowRight size={16} /></button></div>
        </div>
      )}

      {/* STEP 1: Before */}
      {step === 1 && (
        <div className="space-y-4 animate-slide-up">
          <Section title="📊 ข้อมูลการวัดก่อนปรับปรุง">
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-muted mb-1">วันที่ตรวจวัด</label><input type="date" name="before_date" value={reportForm.before_date} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" /></div>
              <div><label className="block text-xs font-medium text-muted mb-1">ผู้ตรวจวัด</label><input type="text" name="before_inspector" value={reportForm.before_inspector} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" /></div>
              <div><label className="block text-xs font-medium text-muted mb-1">กำลังไฟฟ้าที่วัดได้ (kW)</label><input type="number" name="before_kw" value={reportForm.before_kw} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" /></div>
              <div><label className="block text-xs font-medium text-muted mb-1">ชั่วโมงทำงาน/ปี</label><input type="number" name="before_hrs" value={reportForm.before_hrs} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" /></div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between items-center border-b border-border pb-2 mb-3">
                <h4 className="text-xs font-bold text-text">พารามิเตอร์อื่นๆ (เช่น COP, อุณหภูมิ, แรงดัน)</h4>
                <button 
                  type="button" 
                  onClick={addCustomParam}
                  className="text-xs font-semibold text-accent hover:underline bg-transparent border-none cursor-pointer p-0"
                >
                  + เพิ่มพารามิเตอร์
                </button>
              </div>
              <div className="space-y-3">
                {(reportForm.custom_params || []).map((p, idx) => (
                  <div key={idx} className="flex gap-2 items-center animate-fade-in">
                    <input 
                      type="text" 
                      placeholder="ชื่อพารามิเตอร์" 
                      value={p.label} 
                      onChange={(e) => handleCustomParamChange(idx, 'label', e.target.value)} 
                      className="w-1/2 p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" 
                    />
                    <input 
                      type="text" 
                      placeholder="ค่าก่อนปรับปรุง" 
                      value={p.beforeVal} 
                      onChange={(e) => handleCustomParamChange(idx, 'beforeVal', e.target.value)} 
                      className="w-5/12 p-2.5 bg-bg border border-border rounded-md text-sm font-mono outline-none focus:border-accent" 
                    />
                    <button 
                      type="button" 
                      onClick={() => removeCustomParam(idx)} 
                      className="w-1/12 p-2 bg-transparent text-red-500 hover:text-red-700 border-none cursor-pointer flex items-center justify-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {(!reportForm.custom_params || reportForm.custom_params.length === 0) && (
                  <p className="text-xs text-muted italic text-center py-2">ไม่มีพารามิเตอร์อื่นๆ ที่บันทึกไว้</p>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-xs font-medium text-muted mb-1">ปัญหา / สภาพที่พบก่อนปรับปรุง</label>
              <textarea name="before_issue" value={reportForm.before_issue} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent min-h-[80px]" placeholder="บรรยายสภาพที่พบ..."></textarea>
            </div>
          </Section>

          <Section title="📷 รูปภาพก่อนปรับปรุง">
            <PhotoUploader section="before_photos" photos={reportForm.before_photos} onUpload={handlePhotoUpload} onRemove={removePhoto} />
          </Section>

          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(0)} className="px-5 py-2.5 bg-white border border-border rounded-md hover:bg-slate-50 flex items-center gap-2"><ArrowLeft size={16} /> กลับ</button>
            <button onClick={() => setStep(2)} className="px-6 py-2.5 bg-accent text-white font-medium rounded-md hover:bg-accentHover flex items-center gap-2">ถัดไป <ArrowRight size={16} /></button>
          </div>
        </div>
      )}

      {/* STEP 2: After */}
      {step === 2 && (
        <div className="space-y-4 animate-slide-up">
          <Section title="✅ ข้อมูลการวัดหลังปรับปรุง">
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-muted mb-1">วันที่ตรวจวัด</label><input type="date" name="after_date" value={reportForm.after_date} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" /></div>
              <div><label className="block text-xs font-medium text-muted mb-1">ผู้ตรวจวัด</label><input type="text" name="after_inspector" value={reportForm.after_inspector} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" /></div>
              <div><label className="block text-xs font-medium text-muted mb-1">กำลังไฟฟ้าที่วัดได้ (kW)</label><input type="number" name="after_kw" value={reportForm.after_kw} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" /></div>
              <div><label className="block text-xs font-medium text-muted mb-1">ชั่วโมงทำงาน/ปี</label><input type="number" name="after_hrs" value={reportForm.after_hrs} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent" /></div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-xs font-bold border-b border-border pb-2 mb-3">พารามิเตอร์อื่นๆ (ค่าหลังปรับปรุง)</h4>
              <div className="space-y-3">
                {(reportForm.custom_params || []).map((p, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      readOnly 
                      value={p.label || 'พารามิเตอร์ไม่มีชื่อ'} 
                      className="w-1/2 p-2.5 bg-slate-50 border border-border rounded-md text-sm text-muted outline-none cursor-not-allowed" 
                    />
                    <input 
                      type="text" 
                      placeholder="ค่าหลังปรับปรุง" 
                      value={p.afterVal} 
                      onChange={(e) => handleCustomParamChange(idx, 'afterVal', e.target.value)} 
                      className="w-1/2 p-2.5 bg-bg border border-border rounded-md text-sm font-mono outline-none focus:border-accent" 
                    />
                  </div>
                ))}
                {(!reportForm.custom_params || reportForm.custom_params.length === 0) && (
                  <p className="text-xs text-muted italic text-center py-2">ไม่มีพารามิเตอร์อื่นๆ ที่ต้องกรอก</p>
                )}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">สิ่งที่ดำเนินการปรับปรุง</label>
                <textarea name="after_action" value={reportForm.after_action} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent min-h-[80px]" placeholder="บรรยายการทำงาน..."></textarea>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">ผลการปรับปรุง / ข้อสังเกต</label>
                <textarea name="after_result" value={reportForm.after_result} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent min-h-[80px]" placeholder="บรรยายผล..."></textarea>
              </div>
            </div>
          </Section>

          <Section title="📷 รูปภาพหลังปรับปรุง">
            <PhotoUploader section="after_photos" photos={reportForm.after_photos} onUpload={handlePhotoUpload} onRemove={removePhoto} />
          </Section>

          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(1)} className="px-5 py-2.5 bg-white border border-border rounded-md hover:bg-slate-50 flex items-center gap-2"><ArrowLeft size={16} /> กลับ</button>
            <button onClick={() => setStep(3)} className="px-6 py-2.5 bg-accent text-white font-medium rounded-md hover:bg-accentHover flex items-center gap-2">ถัดไป <ArrowRight size={16} /></button>
          </div>
        </div>
      )}

      {/* STEP 3: Summary */}
      {step === 3 && (
        <div className="space-y-4 animate-slide-up">
          <Section title="⚡ ผลการประหยัดพลังงาน">
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-emerald-600 mb-1">พลังงานที่ประหยัดได้จริง (kWh/ปี)</label><input type="number" name="save_kwh" value={reportForm.save_kwh} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-emerald-500 font-bold text-emerald-700" /></div>
              <div><label className="block text-xs font-medium text-emerald-600 mb-1">ค่าไฟที่ประหยัดได้ (บาท/ปี)</label><input type="number" name="save_baht" value={reportForm.save_baht} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-emerald-500 font-bold text-emerald-700" /></div>
              <div><label className="block text-xs font-medium text-accent mb-1">ค่าลงทุนรวม (บาท)</label><input type="number" name="invest" value={reportForm.invest} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent font-bold text-accent" /></div>
              <div><label className="block text-xs font-medium text-amber-600 mb-1">ระยะเวลาคืนทุน (ปี)</label><input type="number" name="payback" value={reportForm.payback} readOnly className="w-full p-2.5 bg-slate-50 border border-border rounded-md text-sm outline-none font-bold text-amber-700" placeholder="คำนวณอัตโนมัติ" /></div>
            </div>
          </Section>

          <Section title="📝 หมายเหตุและข้อเสนอแนะ">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">บทสรุป</label>
                <textarea name="conclusion" value={reportForm.conclusion} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent min-h-[100px]" placeholder="สรุปผลการดำเนินงาน..."></textarea>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">ข้อเสนอแนะเพิ่มเติม</label>
                <textarea name="recommend" value={reportForm.recommend} onChange={handleInputChange} className="w-full p-2.5 bg-bg border border-border rounded-md text-sm outline-none focus:border-accent min-h-[100px]" placeholder="ข้อเสนอแนะสำหรับการดำเนินการต่อ..."></textarea>
              </div>
            </div>
          </Section>

          <div className="flex justify-between pt-8 border-t border-border mt-8">
            <button onClick={() => setStep(2)} className="px-5 py-2.5 bg-white border border-border rounded-md hover:bg-slate-50 flex items-center gap-2"><ArrowLeft size={16} /> กลับ</button>
            <div className="flex gap-3">
              <button onClick={() => previewReport()} className="px-6 py-2.5 bg-white border border-accent text-accent font-medium rounded-md hover:bg-accent/5 flex items-center gap-2">
                <Eye size={16} /> ดูตัวอย่างรายงาน
              </button>
              <button onClick={saveReport} className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 flex items-center gap-2 shadow-sm">
                <Check size={16} /> บันทึกรายงาน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- SUB-COMPONENTS ---------------- //

function Section({ title, children }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-bold text-accent uppercase tracking-wider mb-4 flex items-center gap-2">
        <div className="w-1 h-3 bg-accent rounded-full" /> {title}
      </h3>
      {children}
    </div>
  );
}

function PhotoUploader({ section, photos, onUpload, onRemove }) {
  return (
    <div>
      <p className="text-xs text-muted mb-3">อัปโหลดรูปภาพได้สูงสุด {MAX_PHOTOS} รูป (แนะนำสัดส่วน 4:3)</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((p, i) => (
          <div key={i} className="relative aspect-4/3 rounded-lg border border-border overflow-hidden bg-bg group">
            <img src={p.dataUrl} alt="uploaded" className="w-full h-full object-cover" />
            <button onClick={() => onRemove(i, section)} className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">
              <X size={14} />
            </button>
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <label className="relative aspect-4/3 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors group">
            <input type="file" accept="image/*" onChange={(e) => onUpload(e, section)} className="hidden" />
            <Camera size={24} className="text-slate-400 group-hover:text-accent mb-2" />
            <span className="text-xs text-muted group-hover:text-accent">เพิ่มรูปภาพ</span>
          </label>
        )}
      </div>
    </div>
  );
}

// ---------------- PREVIEW COMPONENT ---------------- //

function ReportPreview({ rpt, onClose, onEdit }) {
  const handlePrint = () => {
    window.print();
  };

  const dtStart = rpt.date_start ? new Date(rpt.date_start).toLocaleDateString('th-TH') : '-';
  const dtEnd = rpt.date_end ? new Date(rpt.date_end).toLocaleDateString('th-TH') : '-';

  return (
    <div className="fixed inset-0 bg-slate-900/90 z-[100] flex flex-col items-center overflow-y-auto p-4 sm:p-8 animate-fade-in print:bg-white print:p-0 print:block">
      
      {/* Toolbar (hidden in print) */}
      <div className="w-full max-w-4xl bg-surface border border-border rounded-xl p-3 flex items-center justify-between mb-6 shadow-lg shrink-0 print:hidden">
        <div className="flex items-center gap-2 px-2">
          <FileText size={20} className="text-accent" />
          <span className="font-bold text-text">ตัวอย่างรายงานก่อนพิมพ์</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-accentHover">
            <Printer size={16} /> พิมพ์ / บันทึกเป็น PDF
          </button>
          <button onClick={onEdit} className="px-4 py-2 bg-white border border-border text-text rounded-lg text-sm font-medium hover:bg-slate-50">
            แก้ไขข้อมูล
          </button>
          <button onClick={onClose} className="p-2 border border-border rounded-lg text-muted hover:text-text hover:bg-slate-50 ml-2">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* A4 Sheet */}
      <div className="bg-white w-full max-w-[210mm] min-h-[297mm] p-[10mm] sm:p-[15mm] shadow-2xl shrink-0 print:shadow-none print:m-0 print:p-0 text-slate-800">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-accent pb-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center text-white text-2xl shrink-0 font-bold">
              ⚡
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 mb-1">{rpt.title || 'รายงานการปรับปรุงประสิทธิภาพเครื่องจักร'}</h1>
              <p className="text-sm text-slate-500">ENGINSPECT Energy Audit Report</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500 space-y-1">
            <div><strong>โรงงาน:</strong> {rpt.factory || '-'}</div>
            <div><strong>เลขที่:</strong> {rpt.docno || '-'}</div>
            <div><strong>วันที่พิมพ์:</strong> {new Date().toLocaleDateString('th-TH')}</div>
          </div>
        </div>

        {/* Section: Info */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs mb-8">
          <div className="border-b border-slate-100 py-1"><span className="text-slate-500 uppercase font-medium inline-block w-24">อุปกรณ์</span> <strong className="text-slate-800">{rpt.equip_main || '-'}</strong></div>
          <div className="border-b border-slate-100 py-1"><span className="text-slate-500 uppercase font-medium inline-block w-24">แผนก/อาคาร</span> <strong className="text-slate-800">{rpt.dept || '-'}</strong></div>
          <div className="border-b border-slate-100 py-1"><span className="text-slate-500 uppercase font-medium inline-block w-24">ที่มา</span> <strong className="text-slate-800">{rpt.source || '-'}</strong></div>
          <div className="border-b border-slate-100 py-1"><span className="text-slate-500 uppercase font-medium inline-block w-24">ประเภทมาตรการ</span> <strong className="text-slate-800">{rpt.meastype || '-'}</strong></div>
          <div className="border-b border-slate-100 py-1 col-span-2"><span className="text-slate-500 uppercase font-medium inline-block w-24 align-top">วัตถุประสงค์</span> <span className="text-slate-800 inline-block w-[calc(100%-6rem)] whitespace-pre-wrap">{rpt.objective || '-'}</span></div>
        </div>

        {/* Section: Comparison Data */}
        <h2 className="text-sm font-bold text-white bg-slate-800 px-4 py-1.5 rounded-t-lg mb-0 inline-block">ตารางเปรียบเทียบ ก่อน-หลัง ปรับปรุง</h2>
        <div className="w-full h-1 bg-slate-800 mb-4 rounded-r-full"></div>
        
        <table className="w-full text-xs text-left mb-8 border border-slate-200">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-2 w-1/3">รายการ</th>
              <th className="p-2 w-1/3 text-red-700 border-l border-slate-200">ก่อนปรับปรุง ({rpt.before_date ? new Date(rpt.before_date).toLocaleDateString('th-TH') : '-'})</th>
              <th className="p-2 w-1/3 text-emerald-700 border-l border-slate-200">หลังปรับปรุง ({rpt.after_date ? new Date(rpt.after_date).toLocaleDateString('th-TH') : '-'})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr><td className="p-2 text-slate-500">กำลังไฟฟ้าที่วัดได้ (kW)</td><td className="p-2 font-mono border-l border-slate-100">{rpt.before_kw || '-'}</td><td className="p-2 font-mono border-l border-slate-100">{rpt.after_kw || '-'}</td></tr>
            <tr><td className="p-2 text-slate-500">ชั่วโมงทำงาน (ชม./ปี)</td><td className="p-2 font-mono border-l border-slate-100">{rpt.before_hrs || '-'}</td><td className="p-2 font-mono border-l border-slate-100">{rpt.after_hrs || '-'}</td></tr>
            {(rpt.custom_params || [
              ...(rpt.before_p1label ? [{ label: rpt.before_p1label, beforeVal: rpt.before_p1val, afterVal: rpt.after_p1val }] : []),
              ...(rpt.before_p2label ? [{ label: rpt.before_p2label, beforeVal: rpt.before_p2val, afterVal: rpt.after_p2val }] : []),
              ...(rpt.before_p3label ? [{ label: rpt.before_p3label, beforeVal: rpt.before_p3val, afterVal: rpt.after_p3val }] : [])
            ]).map((p, idx) => (
              <tr key={idx}>
                <td className="p-2 text-slate-500">{p.label || 'พารามิเตอร์'}</td>
                <td className="p-2 font-mono border-l border-slate-100">{p.beforeVal || '-'}</td>
                <td className="p-2 font-mono border-l border-slate-100">{p.afterVal || '-'}</td>
              </tr>
            ))}
            <tr>
              <td className="p-2 text-slate-500 align-top">หมายเหตุ / สภาพ</td>
              <td className="p-2 text-slate-700 border-l border-slate-100 whitespace-pre-wrap">{rpt.before_issue || '-'}</td>
              <td className="p-2 text-slate-700 border-l border-slate-100 whitespace-pre-wrap">{rpt.after_action || '-'}\n{rpt.after_result || '-'}</td>
            </tr>
          </tbody>
        </table>

        {/* Section: Photos */}
        {(rpt.before_photos.length > 0 || rpt.after_photos.length > 0) && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-white bg-slate-800 px-4 py-1.5 rounded-t-lg mb-0 inline-block">ภาพประกอบ</h2>
            <div className="w-full h-1 bg-slate-800 mb-4 rounded-r-full"></div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs font-bold text-red-700 mb-2 border-b border-red-100 pb-1">รูปภาพก่อนปรับปรุง</div>
                <div className="grid grid-cols-2 gap-2">
                  {rpt.before_photos.slice(0, 4).map((p, i) => (
                    <img key={i} src={p.dataUrl} className="w-full aspect-4/3 object-cover rounded border border-slate-200" alt="Before" />
                  ))}
                  {rpt.before_photos.length === 0 && <div className="col-span-2 text-xs text-slate-400 text-center py-8 border border-dashed rounded">ไม่มีรูปภาพ</div>}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-700 mb-2 border-b border-emerald-100 pb-1">รูปภาพหลังปรับปรุง</div>
                <div className="grid grid-cols-2 gap-2">
                  {rpt.after_photos.slice(0, 4).map((p, i) => (
                    <img key={i} src={p.dataUrl} className="w-full aspect-4/3 object-cover rounded border border-slate-200" alt="After" />
                  ))}
                  {rpt.after_photos.length === 0 && <div className="col-span-2 text-xs text-slate-400 text-center py-8 border border-dashed rounded">ไม่มีรูปภาพ</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section: Savings Summary */}
        <h2 className="text-sm font-bold text-white bg-slate-800 px-4 py-1.5 rounded-t-lg mb-0 inline-block">สรุปผลการประหยัดพลังงาน</h2>
        <div className="w-full h-1 bg-slate-800 mb-4 rounded-r-full"></div>
        
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-emerald-50 border-t-2 border-emerald-500 rounded p-3 text-center">
            <div className="text-[10px] text-emerald-700 uppercase mb-1">พลังงานไฟฟ้าที่ประหยัดได้</div>
            <div className="text-xl font-bold font-mono text-emerald-600">{Number(rpt.save_kwh||0).toLocaleString()}</div>
            <div className="text-[10px] text-emerald-700">kWh/ปี</div>
          </div>
          <div className="bg-emerald-50 border-t-2 border-emerald-500 rounded p-3 text-center">
            <div className="text-[10px] text-emerald-700 uppercase mb-1">คิดเป็นเงิน</div>
            <div className="text-xl font-bold font-mono text-emerald-600">{Number(rpt.save_baht||0).toLocaleString()}</div>
            <div className="text-[10px] text-emerald-700">บาท/ปี</div>
          </div>
          <div className="bg-sky-50 border-t-2 border-sky-500 rounded p-3 text-center">
            <div className="text-[10px] text-sky-700 uppercase mb-1">เงินลงทุน</div>
            <div className="text-xl font-bold font-mono text-sky-600">{Number(rpt.invest||0).toLocaleString()}</div>
            <div className="text-[10px] text-sky-700">บาท</div>
          </div>
          <div className="bg-amber-50 border-t-2 border-amber-500 rounded p-3 text-center">
            <div className="text-[10px] text-amber-700 uppercase mb-1">ระยะเวลาคืนทุน</div>
            <div className="text-xl font-bold font-mono text-amber-600">{rpt.payback || '-'}</div>
            <div className="text-[10px] text-amber-700">ปี</div>
          </div>
        </div>

        <div className="text-xs text-slate-700 mb-12">
          <p className="mb-2"><strong>สรุปผลการดำเนินงาน:</strong> {rpt.conclusion || '-'}</p>
          <p><strong>ข้อเสนอแนะเพิ่มเติม:</strong> {rpt.recommend || '-'}</p>
        </div>

        {/* Section: Signatures */}
        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-200 mt-auto">
          <div className="text-center">
            <div className="border-b border-slate-400 h-10 mb-2 w-3/4 mx-auto"></div>
            <div className="text-[10px] text-slate-500">ผู้จัดทำรายงาน / ตรวจวัด</div>
            <div className="text-xs font-bold mt-1">{rpt.author || '-'}</div>
          </div>
          <div className="text-center">
            <div className="border-b border-slate-400 h-10 mb-2 w-3/4 mx-auto"></div>
            <div className="text-[10px] text-slate-500">ที่ปรึกษาพลังงาน</div>
            <div className="text-xs font-bold mt-1">{rpt.consultant || '-'}</div>
          </div>
          <div className="text-center">
            <div className="border-b border-slate-400 h-10 mb-2 w-3/4 mx-auto"></div>
            <div className="text-[10px] text-slate-500">ผู้อนุมัติ / ตัวแทนโรงงาน</div>
            <div className="text-xs font-bold mt-1">{rpt.approver || '-'}</div>
          </div>
        </div>

      </div>
    </div>
  );
}
