import React from 'react';

export function FactoryInfo({ data, onChange }) {
  return (
    <div className="card" style={{ animationDelay: '.05s' }}>
      <div className="ctitle">🏭 ข้อมูลโรงงาน</div>
      <div className="field">
        <label>ชื่อโรงงาน / บริษัท</label>
        <input type="text" name="factoryName" value={data.factoryName} onChange={onChange} className="input-base" placeholder="เช่น บริษัท เอบีซี จำกัด" />
      </div>
      <div className="field">
        <label>แผนก / อาคาร</label>
        <input type="text" name="factoryDept" value={data.factoryDept} onChange={onChange} className="input-base" placeholder="เช่น แผนก HVAC / อาคาร A" />
      </div>
      <div className="field">
        <label>ที่อยู่</label>
        <textarea name="factoryAddr" value={data.factoryAddr} onChange={onChange} className="input-base" rows="2" placeholder="เลขที่ ถนน ตำบล อำเภอ จังหวัด"></textarea>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="field">
          <label>ผู้ตรวจสอบ</label>
          <input type="text" name="factoryContact" value={data.factoryContact} onChange={onChange} className="input-base" placeholder="ชื่อ-นามสกุล" />
        </div>
        <div className="field">
          <label>วันที่ตรวจสอบ</label>
          <input type="text" name="inspectDate" value={data.inspectDate} onChange={onChange} className="input-base" placeholder="วว/ดด/ปปปป" />
        </div>
      </div>
    </div>
  );
}

export function EquipmentInfo({ data, onChange }) {
  return (
    <div className="card" style={{ animationDelay: '.1s' }}>
      <div className="ctitle">❄️ ข้อมูลทั่วไปของ Chiller</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="field">
          <label>Tag / ชื่ออุปกรณ์</label>
          <input type="text" name="eqName" value={data.eqName} onChange={onChange} className="input-base" placeholder="เช่น CH-01" />
        </div>
        <div className="field">
          <label>ยี่ห้อ / Brand</label>
          <input type="text" name="eqBrand" value={data.eqBrand} onChange={onChange} className="input-base" placeholder="เช่น Carrier, Trane" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="field">
          <label>รุ่น / Model</label>
          <input type="text" name="eqModel" value={data.eqModel} onChange={onChange} className="input-base" placeholder="เช่น 19XR" />
        </div>
        <div className="field">
          <label>Serial No.</label>
          <input type="text" name="eqSerial" value={data.eqSerial} onChange={onChange} className="input-base" placeholder="S/N" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="field">
          <label>ประเภท Chiller</label>
          <select name="chillerType" value={data.chillerType} onChange={onChange} className="input-base font-mono text-sm">
            <option>Centrifugal</option>
            <option>Screw (Helical Rotary)</option>
            <option>Scroll</option>
            <option>Reciprocating</option>
            <option>Absorption</option>
          </select>
        </div>
        <div className="field">
          <label>ปีที่ติดตั้ง</label>
          <input type="text" name="eqYear" value={data.eqYear} onChange={onChange} className="input-base" placeholder="เช่น 2015" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="field">
          <label>พิกัดทำความเย็น<span className="hint">TR (rated)</span></label>
          <input type="text" name="eqRatedTon" value={data.eqRatedTon} onChange={onChange} className="input-base" placeholder="เช่น 500" />
        </div>
        <div className="field">
          <label>กำลังไฟฟ้าพิกัด<span className="hint">kW</span></label>
          <input type="text" name="eqRatedPower" value={data.eqRatedPower} onChange={onChange} className="input-base" placeholder="เช่น 400" />
        </div>
      </div>
      <div className="field mb-0">
        <label>หมายเหตุ</label>
        <textarea name="eqRemark" value={data.eqRemark} onChange={onChange} className="input-base" rows="2" placeholder="สภาพ / ประวัติซ่อมบำรุง ฯลฯ"></textarea>
      </div>
    </div>
  );
}

export function WaterSide({ data, onChange }) {
  const isAirCooled = data.coolingType === 'air';

  return (
    <div className="card" style={{ animationDelay: '.15s' }}>
      <div className="ctitle">💧 ฝั่ง Chilled Water (CHW)</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="field">
          <label>อุณหภูมิน้ำเย็นออก T_CHWS<span className="hint">°F</span></label>
          <input type="number" name="tchws" value={data.tchws || ''} onChange={onChange} className="input-base input-mono" step=".1" />
        </div>
        <div className="field">
          <label>อุณหภูมิน้ำเย็นกลับ T_CHWR<span className="hint">°F</span></label>
          <input type="number" name="tchwr" value={data.tchwr || ''} onChange={onChange} className="input-base input-mono" step=".1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="field">
          <label>อัตราการไหล CHW<span className="hint">L/s</span></label>
          <input type="number" name="qchw" value={data.qchw || ''} onChange={onChange} className="input-base input-mono" step=".1" min="0" />
        </div>
        <div className="field">
          <label>ความจุความร้อนจำเพาะ Cp<span className="hint">kJ/kg·K</span></label>
          <input type="number" name="cpWater" value={data.cpWater || ''} onChange={onChange} className="input-base input-mono" step=".001" />
        </div>
      </div>
      <div className="field">
        <label>ความหนาแน่นน้ำ ρ<span className="hint">kg/L</span></label>
        <input type="number" name="rhoWater" value={data.rhoWater || ''} onChange={onChange} className="input-base input-mono" step=".001" />
      </div>
      
      <div className="divider"></div>
      
      <div className="field">
        <label>ระบบระบายความร้อน</label>
        <select name="coolingType" value={data.coolingType || 'water'} onChange={onChange} className="input-base font-mono text-sm">
          <option value="water">ระบายความร้อนด้วยน้ำ (Water Cooled)</option>
          <option value="air">ระบายความร้อนด้วยอากาศ (Air Cooled)</option>
        </select>
      </div>

      {!isAirCooled ? (
        <>
          <div className="ctitle mb-3">🌡 ฝั่ง Condenser Water (CW)</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="field">
              <label>อุณหภูมิน้ำระบายความร้อนเข้า T_CWS<span className="hint">°F</span></label>
              <input type="number" name="tcws" value={data.tcws || ''} onChange={onChange} className="input-base input-mono" step=".1" />
            </div>
            <div className="field">
              <label>อุณหภูมิน้ำระบายความร้อนออก T_CWR<span className="hint">°F</span></label>
              <input type="number" name="tcwr" value={data.tcwr || ''} onChange={onChange} className="input-base input-mono" step=".1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="field">
              <label>อัตราการไหล CW<span className="hint">L/s</span></label>
              <input type="number" name="qcw" value={data.qcw || ''} onChange={onChange} className="input-base input-mono" step=".1" min="0" />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="ctitle mb-3">🌡 อุณหภูมิอากาศ (Dry Bulb)</div>
          <div className="field">
            <label>อุณหภูมิอากาศเข้า T_DB<span className="hint">°F</span></label>
            <input type="number" name="tdb" value={data.tdb || ''} onChange={onChange} className="input-base input-mono" step=".1" />
          </div>
        </>
      )}
    </div>
  );
}

export function PowerOptions({ data, onChange, onCalculate, onReset }) {
  return (
    <div className="card" style={{ animationDelay: '.2s' }}>
      <div className="ctitle">⚡ กำลังไฟฟ้าและตัวเลือก</div>
      <div className="field">
        <label>กำลังไฟฟ้าที่วัดได้ P_input<span className="hint">kW</span></label>
        <input type="number" name="pInput" value={data.pInput || ''} onChange={onChange} className="input-base input-mono" step=".5" min="0" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="field">
          <label>โหลดปัจจุบัน<span className="hint">%</span></label>
          <input type="number" name="loadPct" value={data.loadPct || ''} onChange={onChange} className="input-base input-mono" min="1" max="100" step="1" />
        </div>
        <div className="field">
          <label>สารทำความเย็น</label>
          <select name="refrigerant" value={data.refrigerant || ''} onChange={onChange} className="input-base font-mono text-sm">
            <option>R-134a</option>
            <option>R-123</option>
            <option>R-410A</option>
            <option>R-1234ze</option>
            <option>R-32</option>
            <option>NH₃ (R-717)</option>
            <option>อื่นๆ</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2.5 mt-4">
        <button className="col-span-2 bg-gradient-to-br from-accent to-[#007aaa] border-none rounded-[11px] p-[13px] text-[#001e35] font-sans text-[15px] font-bold cursor-pointer transition-all duration-200 hover:opacity-90 active:scale-95" onClick={onCalculate}>
          ❄ คำนวณ
        </button>
        <button className="col-span-2 bg-transparent border border-border rounded-[11px] p-[9px] text-muted font-sans text-[13px] cursor-pointer transition-colors duration-200 hover:border-muted hover:text-text" onClick={onReset}>
          ↺ รีเซ็ต
        </button>
      </div>
    </div>
  );
}
