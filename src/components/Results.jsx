import React, { useEffect, useState } from 'react';

function effColor(v, isEER = false) {
  if (!isEER) {
    if (v < 0.60) return 'var(--good)';
    if (v < 0.80) return 'var(--mid)';
    return 'var(--bad)';
  } else {
    if (v >= 5.5) return 'var(--good)';
    if (v >= 4.0) return 'var(--mid)';
    return 'var(--bad)';
  }
}

function copBarColor(cop) {
  if (cop >= 5.5) return 'linear-gradient(90deg,#00b88a,#00e5b0)';
  if (cop >= 4.0) return 'linear-gradient(90deg,#e09000,#ffc107)';
  return 'linear-gradient(90deg,#cc0030,#ff4560)';
}

function gaugeArc(pct) {
  const r = 80, cx = 100, cy = 100;
  const a = Math.PI - (pct / 100) * Math.PI;
  const x2 = cx + r * Math.cos(a);
  const y2 = cy + r * Math.sin(a);
  const la = pct > 50 ? 1 : 0;
  return `M20,100 A${r},${r} 0 ${la},1 ${x2.toFixed(2)},${y2.toFixed(2)}`;
}

export default function Results({ res }) {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsLight(document.documentElement.classList.contains('light'));
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    setIsLight(document.documentElement.classList.contains('light'));
    return () => observer.disconnect();
  }, []);

  if (!res) {
    return (
      <div className="card col-span-full" style={{ animationDelay: '.25s' }}>
        <div className="ctitle">📊 ผลการคำนวณ</div>
        <div className="text-center text-muted py-10 px-5 text-[13px]">
          <div className="text-[40px] mb-2.5 opacity-35">❄️</div>
          <div>กรอกข้อมูลและกด <strong>คำนวณ</strong> เพื่อดูผล</div>
        </div>
      </div>
    );
  }

  const {
    coolingType, T_CHWS, T_CHWR, Q_CHW, T_CWS, T_CWR, Q_CW, P_in, tdb,
    Q_cool_kW, Q_rej_kW, TR, COP, EER, kWperTR,
    heatBalance, iplv, COP_carnot, eta_carnot,
    copPct, lbl, advTxt,
    meta, inputs, logo, images
  } = res;

  const trackColor = isLight ? '#ccdce9' : '#163049';

  const docTitle = meta.docTitle || 'รายงานการตรวจสอบประสิทธิภาพ Chiller';
  const metaParts = [
    meta.hdrCompany, 
    meta.hdrPrepBy && 'จัดทำโดย: ' + meta.hdrPrepBy, 
    meta.hdrDocNo && 'Doc: ' + meta.hdrDocNo, 
    meta.hdrRevision && 'Rev: ' + meta.hdrRevision, 
    meta.hdrDate
  ].filter(Boolean).join(' · ');

  const validImgs = images.filter(img => img.dataUrl);

  return (
    <div className="card col-span-full" style={{ animationDelay: '.25s' }}>
      <div className="ctitle">📊 ผลการคำนวณ</div>
      <div className="animate-pop-in">
        
        {/* Result Header Bar */}
        <div className="flex items-center gap-4 pb-3.5 mb-3.5 border-b border-border">
          {logo ? (
            <img src={logo} alt="logo" className="w-20 h-[58px] object-contain rounded-lg shrink-0" />
          ) : (
            <div className="w-20 h-[58px] shrink-0" />
          )}
          <div className="flex-1">
            <div className="text-base font-bold text-text">{docTitle}</div>
            {metaParts && <div className="text-xs text-muted mt-1">{metaParts}</div>}
          </div>
        </div>

        {/* Info Header */}
        <div className="bg-surface border border-border rounded-xl py-3.5 px-[18px] mb-4 grid grid-cols-2 gap-y-1.5 gap-x-5 text-xs">
          <div className="col-span-full text-[10px] font-bold text-accent tracking-[2px] uppercase border-b border-border pb-1 mb-0.5">📋 ข้อมูลประกอบ</div>
          {inputs.factoryName && <div><span className="text-muted">โรงงาน:</span> <strong>{inputs.factoryName}</strong></div>}
          {inputs.factoryDept && <div><span className="text-muted">แผนก:</span> {inputs.factoryDept}</div>}
          {inputs.factoryAddr && <div className="col-span-full"><span className="text-muted">ที่อยู่:</span> {inputs.factoryAddr.replace(/\n/g, ' ')}</div>}
          {inputs.factoryContact && <div><span className="text-muted">ผู้ตรวจสอบ:</span> {inputs.factoryContact}</div>}
          {inputs.inspectDate && <div><span className="text-muted">วันที่:</span> {inputs.inspectDate}</div>}
          
          <div className="col-span-full text-[10px] font-bold text-accent2 tracking-[2px] uppercase border-t border-border pt-1 mt-0.5">❄️ อุปกรณ์</div>
          {inputs.eqName && <div><span className="text-muted">Tag:</span> <strong>{inputs.eqName}</strong></div>}
          {inputs.chillerType && <div><span className="text-muted">ประเภท:</span> {inputs.chillerType}</div>}
          {inputs.eqBrand && <div><span className="text-muted">ยี่ห้อ:</span> {inputs.eqBrand}</div>}
          {inputs.eqModel && <div><span className="text-muted">รุ่น:</span> {inputs.eqModel}</div>}
          {inputs.eqSerial && <div><span className="text-muted">S/N:</span> {inputs.eqSerial}</div>}
          {inputs.eqYear && <div><span className="text-muted">ปีติดตั้ง:</span> {inputs.eqYear}</div>}
          {inputs.eqRatedTon && <div><span className="text-muted">พิกัด:</span> {inputs.eqRatedTon} TR</div>}
          {inputs.refrigerant && <div><span className="text-muted">สารทำความเย็น:</span> {inputs.refrigerant}</div>}
          {inputs.eqRemark && <div className="col-span-full"><span className="text-muted">หมายเหตุ:</span> {inputs.eqRemark}</div>}
        </div>

        {/* Image Strip */}
        {validImgs.length > 0 && (
          <div className="mb-1">
            <div className="text-[10px] font-bold text-accent tracking-[2px] uppercase mb-1.5">📷 รูปภาพประกอบ</div>
            <div className="flex flex-wrap gap-2.5 my-2.5">
              {validImgs.map((img, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <img src={img.dataUrl} alt={img.caption || 'รูปภาพ'} className="w-[140px] h-[105px] object-cover rounded-lg border border-border" />
                  {img.caption && <span className="text-[10px] text-muted max-w-[140px] text-center whitespace-nowrap overflow-hidden text-ellipsis">{img.caption}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Value Boxes */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-[11px] mb-[18px]">
          <div className="bg-[rgba(0,200,255,0.06)] border border-accent rounded-xl p-3.5 text-center">
            <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2">COP (ประสิทธิภาพรวม)</div>
            <div className="font-mono text-[22px] font-semibold leading-none" style={{ color: effColor(COP, true) }}>{COP.toFixed(3)}</div>
            <div className="text-[10px] text-muted mt-1">kW cooling / kW input</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3.5 text-center transition-colors">
            <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2">ความสามารถทำความเย็น</div>
            <div className="font-mono text-[22px] font-semibold leading-none text-accent">{Q_cool_kW.toFixed(2)}</div>
            <div className="text-[10px] text-muted mt-1">kW &nbsp;/&nbsp; {TR.toFixed(2)} TR</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3.5 text-center transition-colors">
            <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2">Specific Power</div>
            <div className="font-mono text-[22px] font-semibold leading-none" style={{ color: effColor(kWperTR) }}>{kWperTR.toFixed(3)}</div>
            <div className="text-[10px] text-muted mt-1">kW / TR</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3.5 text-center transition-colors">
            <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2">EER</div>
            <div className="font-mono text-[22px] font-semibold leading-none" style={{ color: effColor(COP, true) }}>{EER.toFixed(2)}</div>
            <div className="text-[10px] text-muted mt-1">BTU·h⁻¹ / W</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3.5 text-center transition-colors">
            <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2">ความร้อนที่ระบาย</div>
            <div className="font-mono text-[22px] font-semibold leading-none text-accent2">{Q_rej_kW.toFixed(2)}</div>
            <div className="text-[10px] text-muted mt-1">kW (Condenser)</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3.5 text-center transition-colors">
            <div className="text-[10px] text-muted uppercase tracking-[1px] mb-2">η เทียบ Carnot</div>
            <div className="font-mono text-[22px] font-semibold leading-none" style={{ color: eta_carnot >= 50 ? 'var(--good)' : eta_carnot >= 35 ? 'var(--mid)' : 'var(--bad)' }}>{eta_carnot.toFixed(1)}</div>
            <div className="text-[10px] text-muted mt-1">%</div>
          </div>
        </div>

        {/* COP Scale Bar */}
        <div className="my-3.5 mb-1.5">
          <div className="text-[11px] text-muted mb-1.5">COP Scale (0 – 8)</div>
          <div className="h-2.5 rounded-[5px] bg-track overflow-hidden relative">
            <div className="h-full rounded-[5px] transition-all duration-600 ease-[cubic-bezier(.4,0,.2,1)]" style={{ width: `${copPct.toFixed(1)}%`, background: copBarColor(COP) }}></div>
          </div>
          <div className="flex justify-between text-[10px] text-muted font-mono mt-1">
            <span>0</span><span>2</span><span>4</span><span>6</span><span>8+</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
          {/* Gauge */}
          <div className="flex flex-col items-center py-1 pb-2">
            <div className="text-[11px] text-muted uppercase tracking-[1px] mb-2">COP Gauge</div>
            <svg className="w-[200px] h-[112px]" viewBox="0 0 200 112">
              <defs>
                <linearGradient id="cGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ff4560"/>
                  <stop offset="50%" stopColor="#ffc107"/>
                  <stop offset="100%" stopColor="#00e5b0"/>
                </linearGradient>
              </defs>
              <path d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke={trackColor} strokeWidth="13" strokeLinecap="round"/>
              <path d={gaugeArc(copPct)} fill="none" stroke="url(#cGrad)" strokeWidth="13" strokeLinecap="round" className="transition-all duration-700"/>
              <text x="100" y="88" className="font-mono text-[26px] font-bold text-center" textAnchor="middle" fill={effColor(COP, true)}>{COP.toFixed(2)}</text>
              <text x="20" y="110" fontSize="10" fill="#4d7a99" fontFamily="Share Tech Mono,monospace">0</text>
              <text x="170" y="110" fontSize="10" fill="#4d7a99" fontFamily="Share Tech Mono,monospace">8+</text>
            </svg>
            <div className="text-xs font-bold mt-2 py-1 px-4 rounded-[20px] tracking-[0.5px]" style={{ background: lbl.bg, border: `1px solid ${lbl.bdr}`, color: lbl.clr }}>
              {lbl.text}
            </div>
          </div>

          {/* Detail Table */}
          <table className="w-full border-collapse text-[13px]">
            <tbody>
              <tr><td className="py-2 px-2.5 border-b border-border text-muted">สารทำความเย็น</td><td className="py-2 px-2.5 border-b border-border font-mono text-right">{inputs.refrigerant}</td></tr>
              <tr><td className="py-2 px-2.5 border-b border-border text-muted">T_CHWS / T_CHWR</td><td className="py-2 px-2.5 border-b border-border font-mono text-right">{T_CHWS}°F / {T_CHWR}°F</td></tr>
              {coolingType !== 'air' ? (
                <>
                  <tr><td className="py-2 px-2.5 border-b border-border text-muted">T_CWS / T_CWR</td><td className="py-2 px-2.5 border-b border-border font-mono text-right">{T_CWS}°F / {T_CWR}°F</td></tr>
                  <tr><td className="py-2 px-2.5 border-b border-border text-muted">ΔT Chilled Water</td><td className="py-2 px-2.5 border-b border-border font-mono text-right">{(T_CHWR - T_CHWS).toFixed(1)} °F</td></tr>
                  <tr><td className="py-2 px-2.5 border-b border-border text-muted">ΔT Condenser Water</td><td className="py-2 px-2.5 border-b border-border font-mono text-right">{(T_CWR - T_CWS).toFixed(1)} °F</td></tr>
                  <tr><td className="py-2 px-2.5 border-b border-border text-muted">อัตราการไหล CHW</td><td className="py-2 px-2.5 border-b border-border font-mono text-right">{Q_CHW} L/s</td></tr>
                  <tr><td className="py-2 px-2.5 border-b border-border text-muted">อัตราการไหล CW</td><td className="py-2 px-2.5 border-b border-border font-mono text-right">{Q_CW} L/s</td></tr>
                </>
              ) : (
                <>
                  <tr><td className="py-2 px-2.5 border-b border-border text-muted">อุณหภูมิอากาศ T_DB</td><td className="py-2 px-2.5 border-b border-border font-mono text-right">{tdb}°F</td></tr>
                  <tr><td className="py-2 px-2.5 border-b border-border text-muted">ΔT Chilled Water</td><td className="py-2 px-2.5 border-b border-border font-mono text-right">{(T_CHWR - T_CHWS).toFixed(1)} °F</td></tr>
                  <tr><td className="py-2 px-2.5 border-b border-border text-muted">อัตราการไหล CHW</td><td className="py-2 px-2.5 border-b border-border font-mono text-right">{Q_CHW} L/s</td></tr>
                </>
              )}
              <tr><td className="py-2 px-2.5 border-b border-border text-muted">P_input</td><td className="py-2 px-2.5 border-b border-border font-mono text-right">{P_in} kW</td></tr>
              <tr><td className="py-2 px-2.5 border-b border-border text-muted">COP_Carnot (ideal)</td><td className="py-2 px-2.5 border-b border-border font-mono text-right">{COP_carnot.toFixed(3)}</td></tr>
              <tr><td className="py-2 px-2.5 border-b border-border text-muted">T_evap (approx)</td><td className="py-2 px-2.5 border-b border-border font-mono text-right">{(T_CHWS - 9).toFixed(1)} °F</td></tr>
              <tr><td className="py-2 px-2.5 border-b border-border text-muted">T_cond (approx)</td><td className="py-2 px-2.5 border-b border-border font-mono text-right">{(coolingType !== 'air' ? T_CWR + 9 : tdb + 27).toFixed(1)} °F</td></tr>
              {coolingType !== 'air' ? (
                <tr><td className="py-2 px-2.5 border-b border-border text-muted border-none">Heat Balance Error</td><td className="py-2 px-2.5 border-b border-border font-mono text-right border-none" style={{ color: Math.abs(heatBalance) < 5 ? 'var(--good)' : 'var(--mid)' }}>{heatBalance.toFixed(2)} %</td></tr>
              ) : (
                <tr><td className="py-2 px-2.5 border-b border-border text-muted border-none">Heat Balance Error</td><td className="py-2 px-2.5 border-b border-border font-mono text-right border-none" style={{ color: 'var(--good)' }}>N/A (Air Cooled)</td></tr>
              )}
              {iplv !== null && iplv !== undefined && (
                <tr><td className="py-2 px-2.5 border-t border-border text-muted">IPLV (AHRI)</td><td className="py-2 px-2.5 border-t border-border font-mono text-right" style={{ color: effColor(iplv, true) }}>{iplv.toFixed(2)} COP</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Advice Box */}
        <div className="rounded-[10px] p-3 text-[13px] leading-[1.7] flex gap-2.5 items-start mt-3.5 border" style={{ background: lbl.bg, borderColor: lbl.bdr }}>
          <div className="text-[17px] shrink-0 mt-[1px]">💡</div>
          <div style={{ color: lbl.clr }}>{advTxt}</div>
        </div>

        {/* Formula Section */}
        <div className="mt-3.5 pt-3.5 border-t border-border text-[11px] text-muted leading-[2.2]">
          <strong className="text-accent2">สูตรที่ใช้:</strong><br/>
          {['Q_cool = ṁ·Cp·ΔT_CHW', 'TR = Q_cool / 3.517', 'COP = Q_cool / P_in', 'EER = COP × 3.412', 'kW/TR = P_in / TR', 'COP_Carnot = T_evap/(T_cond−T_evap)', 'η_Carnot = COP/COP_Carnot × 100%', 'IPLV = 1/(0.01/A+0.42/B+0.45/C+0.12/D)'].map(formula => (
            <span key={formula} className="inline-block bg-[rgba(0,229,176,0.08)] border border-[rgba(0,229,176,0.2)] rounded-md py-[2px] px-2 font-mono text-[11px] text-accent2 m-[2px]">
              {formula}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
}
