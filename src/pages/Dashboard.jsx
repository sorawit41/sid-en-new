import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import {
  ChevronDownIcon,
  ClipboardIcon,
  ClockIcon,
  CoinIconSolid,
  CompressorIcon,
  EyeIcon,
  FlameIcon,
  LeafIconSolid,
  LightningIcon,
  SnowflakeIcon,
  TrashIcon,
} from '../components/icons';

function StatCard({ accentBar, accentIcon, icon, label, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative bg-white rounded-2xl p-5 pt-4 shadow-sm text-left hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden"
    >
      <span className={`absolute top-0 left-0 right-0 h-1.5 ${accentBar}`}></span>
      <span className={`absolute -bottom-3 -right-3 pointer-events-none opacity-[0.13] ${accentIcon}`}>{icon}</span>
      <div className="relative min-w-0">
        <p className="text-sm text-gray-500 leading-tight mb-2 break-words">{label}</p>
        <p className="text-2xl font-extrabold text-[#0F2854]">{value}</p>
      </div>
    </button>
  );
}

function QuickStat({ icon, label, value, onClick, rounded }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 p-5 text-left hover:bg-[#F7F8F0] transition-colors ${rounded}`}
    >
      <div className="w-11 h-11 rounded-xl bg-[#F7F8F0] flex items-center justify-center shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 leading-tight break-words">{label}</p>
        <p className="text-lg font-bold text-[#0F2854] mt-0.5">{value}</p>
      </div>
    </button>
  );
}

function FilterSelect({ label, options }) {
  return (
    <div className="relative">
      <select
        defaultValue=""
        className="appearance-none bg-white rounded-full pl-3.5 pr-8 py-2 text-sm font-medium text-gray-600 shadow-sm border border-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4988C4]"
      >
        <option value="" disabled hidden>
          {label}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

const BAR_DATA = [
  { label: 'ม.ค.', value: 35 },
  { label: 'ก.พ.', value: 65 },
  { label: 'มี.ค.', value: 100 },
  { label: 'เม.ย.', value: 50 },
  { label: 'พ.ค.', value: 30 },
  { label: 'มิ.ย.', value: 60 },
];

const Y_TICKS = [100, 75, 50, 25, 0];

function BarChart() {
  const [grown, setGrown] = useState(false);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setGrown(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div>
      <div className="flex gap-3">
        <div className="relative h-28 lg:h-40 w-8 shrink-0">
          {Y_TICKS.map((t) => (
            <span
              key={t}
              className="absolute right-0 -translate-y-1/2 text-[10px] text-gray-400"
              style={{ top: `${100 - t}%` }}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="relative flex-1 h-28 lg:h-40">
          <div className="absolute inset-0 pointer-events-none">
            {Y_TICKS.map((t) => (
              <div
                key={t}
                className="absolute left-0 right-0 border-t border-dashed border-gray-100"
                style={{ top: `${100 - t}%` }}
              ></div>
            ))}
          </div>
          <div className="relative flex items-end justify-between h-full gap-2.5">
            {BAR_DATA.map(({ label, value }, i) => (
              <div
                key={label}
                className="relative flex-1 h-full flex items-end"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
              >
                {hovered === i && (
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0F2854] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap z-10">
                    {value}%
                  </span>
                )}
                <div
                  className={`w-full rounded-t-md transition-all duration-700 ease-out ${
                    hovered === i ? 'bg-[#1C4D8D]' : i === 2 ? 'bg-[#0F2854]' : 'bg-[#BDE8F5]'
                  }`}
                  style={{ height: `${grown ? value : 0}%`, transitionDelay: `${i * 60}ms` }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-between gap-2.5 mt-2 pl-11">
        {BAR_DATA.map(({ label }) => (
          <span key={label} className="flex-1 text-center text-xs text-gray-400">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

const DONUT_SEGMENTS = [
  { label: 'เปลี่ยนเครื่องทำน้ำเย็นประสิทธิภาพสูง', percent: 45, color: '#0F2854' },
  {
    label: (
      <>
        เพิ่มประสิทธิภาพการระบายความร้อน
        <br className="lg:hidden" />
        เครื่องทำน้ำเย็น
      </>
    ),
    percent: 35,
    color: '#4988C4',
  },
  { label: 'ล้าง Condenser', percent: 20, color: '#BDE8F5' },
];

function DonutChart() {
  const [grown, setGrown] = useState(false);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const t = setTimeout(() => setGrown(true), 150);
    return () => clearTimeout(t);
  }, []);

  let cumulative = 0;

  return (
    <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8 lg:gap-10">
      <div className="relative shrink-0 w-32 h-32 lg:w-40 lg:h-40">
        <svg viewBox="0 0 112 112" className="-rotate-90 w-full h-full">
          <circle cx="56" cy="56" r={radius} fill="none" stroke="#F0F2F7" strokeWidth="14" />
          {DONUT_SEGMENTS.map((seg, i) => {
            const dash = ((grown ? seg.percent : 0) / 100) * circumference;
            const offset = -((cumulative / 100) * circumference);
            cumulative += seg.percent;
            return (
              <circle
                key={i}
                cx="56"
                cy="56"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="14"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={offset}
                className="transition-all duration-700 ease-out"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl lg:text-3xl font-extrabold text-[#0F2854]">{DONUT_SEGMENTS.length}</span>
          <span className="text-xs text-gray-400">มาตรการ</span>
        </div>
      </div>
      <div className="flex flex-col gap-3.5 lg:gap-5 w-full max-w-sm">
        {DONUT_SEGMENTS.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-sm lg:text-base">
            <span className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }}></span>
            <span className="text-gray-600 min-w-0 break-words">{seg.label}</span>
            <span className="font-bold text-[#0F2854] ml-auto shrink-0">{seg.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const MOCK_MEASURES = [
  'เปลี่ยนเครื่องทำน้ำเย็นประสิทธิภาพสูง',
  (
    <>
      เพิ่มประสิทธิภาพการระบายความร้อน
      <br className="lg:hidden" />
      เครื่องทำน้ำเย็น
    </>
  ),
  'ล้าง Condenser',
];

const STATUS_COLOR = {
  danger: 'bg-red-500',
  warning: 'bg-amber-500',
};

const EQUIPMENT_ALERTS = [
  { name: 'CH-01', issue: 'ประสิทธิภาพต่ำกว่าเกณฑ์', status: 'danger' },
  { name: 'CH-02', issue: 'ควรตรวจสอบเร็วๆนี้', status: 'warning' },
];

const CATEGORY_STYLE = {
  Chiller: { badge: 'bg-sky-50 text-sky-600', icon: SnowflakeIcon },
  Compressor: { badge: 'bg-violet-50 text-violet-600', icon: CompressorIcon },
};

const RECENT_MEASUREMENTS = [
  { date: '19 มิ.ย. 2569', name: 'CH-01', category: 'Chiller', summary: 'COP: 2.243' },
  { date: '18 มิ.ย. 2569', name: 'CH-02', category: 'Chiller', summary: 'COP: 3.10' },
  { date: '17 มิ.ย. 2569', name: 'AC-01', category: 'Compressor', summary: 'ประสิทธิภาพ: 92%' },
];

function Filters() {
  return (
    <>
      <FilterSelect label="โรงงาน" options={['โรงงาน A', 'โรงงาน B', 'โรงงาน C']} />
      <FilterSelect
        label="เดือน"
        options={['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']}
      />
      <FilterSelect label="ปี" options={['2567', '2568', '2569']} />
    </>
  );
}

function Dashboard() {
  const navigate = useNavigate();

  return (
    <AppLayout
      title={
        <>
          <span className="flex lg:hidden items-center gap-2.5">
            <span className="w-1.5 h-6 rounded-full bg-[#4988C4]"></span>
            Dashboard
          </span>
          <span className="hidden lg:flex flex-col gap-2">
            <span className="inline-flex items-center gap-3">
              <span className="w-2 h-8 rounded-full bg-[#4988C4]"></span>
              Dashboard
            </span>
            <span className="text-base font-medium text-blue-100/80 pl-5">ภาพรวมข้อมูลพลังงานและมาตรการประหยัดทั้งหมด</span>
          </span>
        </>
      }
      actions={<Filters />}
    >
      <div className="flex lg:hidden items-center justify-center gap-3 flex-wrap mb-6">
        <div className="flex gap-2 flex-wrap justify-center">
          <Filters />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          accentBar="bg-yellow-400"
          accentIcon="text-yellow-500"
          icon={<LightningIcon className="w-20 h-20" />}
          label="ไฟฟ้าที่ประหยัดได้"
          value={
            <>
              00.00
              <br className="lg:hidden" /> MWh/ปี
            </>
          }
          onClick={() => navigate('/reports')}
        />
        <StatCard
          accentBar="bg-orange-400"
          accentIcon="text-orange-500"
          icon={<FlameIcon className="w-20 h-20" />}
          label="ความร้อนที่ลดได้"
          value={
            <>
              00.00
              <br className="lg:hidden" /> GJ/ปี
            </>
          }
          onClick={() => navigate('/reports')}
        />
        <StatCard
          accentBar="bg-green-400"
          accentIcon="text-green-500"
          icon={<LeafIconSolid className="w-20 h-20" />}
          label="GHG ที่ลดได้"
          value={
            <>
              00.00
              <br className="lg:hidden" /> tCO2e/ปี
            </>
          }
          onClick={() => navigate('/reports')}
        />
        <StatCard
          accentBar="bg-amber-400"
          accentIcon="text-amber-500"
          icon={<CoinIconSolid className="w-20 h-20" />}
          label="ค่าใช้จ่ายที่ลดได้"
          value={
            <>
              00.00
              <br className="lg:hidden" /> ล้านบาท/ปี
            </>
          }
          onClick={() => navigate('/reports')}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm grid grid-cols-2 divide-x divide-gray-100 overflow-hidden mb-6">
        <QuickStat
          icon={<ClipboardIcon className="w-5 h-5 text-[#0F2854]" />}
          label="มาตรการที่ดำเนินการ"
          value="03 รายการ"
          onClick={() => navigate('/equipment')}
          rounded="rounded-l-2xl"
        />
        <QuickStat
          icon={<ClockIcon className="w-5 h-5 text-[#0F2854]" />}
          label="ระยะคืนทุนเฉลี่ย"
          value="00.0 ปี"
          onClick={() => navigate('/history')}
          rounded="rounded-r-2xl"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-base font-bold text-[#0F2854] mb-5">พลังงานที่ประหยัดได้รายเดือน</p>
          <BarChart />
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col">
          <p className="text-base font-bold text-[#0F2854] mb-5">สัดส่วนพลังงานแยกตามมาตรการ: GHG</p>
          <DonutChart />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <p className="text-base font-bold text-[#0F2854] mb-3">รายละเอียดมาตรการที่ดำเนินการ</p>
        <div className="divide-y divide-gray-100">
          {MOCK_MEASURES.map((measure, i) => (
            <button
              key={i}
              type="button"
              onClick={() => navigate('/equipment')}
              className="w-full flex items-center justify-between gap-3 text-left px-3 py-3.5 rounded-lg hover:bg-[#F7F8F0] transition-colors"
            >
              <span className="text-sm font-medium text-gray-700 min-w-0 break-words">{measure}</span>
              <ChevronDownIcon className="w-4 h-4 text-gray-400 -rotate-90 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-base font-bold text-[#0F2854]">อุปกรณ์ที่ต้องดำเนินการ</p>
          <span className="text-sm font-bold text-red-500">{EQUIPMENT_ALERTS.length} รายการ</span>
        </div>
        <div className="divide-y divide-gray-100">
          {EQUIPMENT_ALERTS.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => navigate('/equipment')}
              className="w-full flex items-center gap-3 text-left px-1 py-3 rounded-lg hover:bg-[#F7F8F0] transition-colors"
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_COLOR[item.status]}`}></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#0F2854]">{item.name}</p>
                <p className="text-xs text-gray-500 break-words">{item.issue}</p>
              </div>
              <ChevronDownIcon className="w-4 h-4 text-gray-400 -rotate-90 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm mt-6">
        <p className="text-base font-bold text-[#0F2854] mb-3">การตรวจวัดล่าสุด</p>

        {/* Desktop: table */}
        <table className="hidden lg:table w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
              <th className="py-2.5 px-3 font-medium">วันที่</th>
              <th className="py-2.5 px-3 font-medium">อุปกรณ์</th>
              <th className="py-2.5 px-3 font-medium">หมวด</th>
              <th className="py-2.5 px-3 font-medium">ผลสรุป</th>
              <th className="py-2.5 px-3 font-medium text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {RECENT_MEASUREMENTS.map((item, i) => {
              const cat = CATEGORY_STYLE[item.category];
              const CatIcon = cat.icon;
              return (
                <tr key={i} className="hover:bg-[#F7F8F0] transition-colors">
                  <td className="py-3 px-3 text-gray-500">{item.date}</td>
                  <td className="py-3 px-3 font-bold text-[#0F2854]">{item.name}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cat.badge}`}>
                      <CatIcon className="w-3.5 h-3.5" />
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-gray-700">{item.summary}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => navigate('/history')}
                        className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-red-50 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Mobile: card list */}
        <div className="lg:hidden divide-y divide-gray-100">
          {RECENT_MEASUREMENTS.map((item, i) => {
            const cat = CATEGORY_STYLE[item.category];
            const CatIcon = cat.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={() => navigate('/history')}
                className="w-full text-left px-1 py-3 rounded-lg hover:bg-[#F7F8F0] transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-sm font-bold text-[#0F2854]">{item.name}</span>
                  <span className="text-xs text-gray-400">{item.date}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cat.badge}`}>
                    <CatIcon className="w-3.5 h-3.5" />
                    {item.category}
                  </span>
                  <span className="text-sm font-medium text-gray-700">{item.summary}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}

export default Dashboard;
