import React, { createContext, useState, useEffect } from 'react';

const DEFAULT_CATS = [
  {id:'chiller',   name:'Chiller',       desc:'ระบบทำน้ำเย็น Centrifugal, Screw, Scroll', icon:'Snowflake'},
  {id:'compressor',name:'Compressor',    desc:'เครื่องอัดอากาศ Air Compressor',            icon:'Wind'},
  {id:'pump',      name:'Pump',          desc:'ปั๊มน้ำ Centrifugal Pump',                   icon:'Droplets'},
  {id:'boiler',    name:'Boiler',        desc:'หม้อไอน้ำ Steam Boiler',                     icon:'Flame'},
  {id:'cooling',   name:'Cooling Tower', desc:'หอหล่อเย็น Cooling Tower',                   icon:'Factory'},
  {id:'electrical',name:'Electrical',    desc:'ระบบไฟฟ้า Motor, Transformer',              icon:'Zap'},
];

const DEFAULT_FACTORIES = [
  { id: 'f_1', name: 'โรงงานอยุธยา', location: 'อยุธยา', desc: 'โรงงานผลิตหลักและประกอบชิ้นส่วนอิเล็กทรอนิกส์' },
  { id: 'f_2', name: 'โรงงานชลบุรี', location: 'ชลบุรี', desc: 'โรงงานผลิตชิ้นส่วนยานยนต์และคลังสินค้าโลจิสติกส์' },
  { id: 'f_3', name: 'โรงงานระยอง', location: 'ระยอง', desc: 'โรงงานผลิตเคมีภัณฑ์และโพลีเมอร์ประสิทธิภาพสูง' },
  { id: 'f_4', name: 'โรงงานสมุทรปราการ', location: 'สมุทรปราการ', desc: 'ศูนย์บรรจุภัณฑ์และการกระจายสินค้าอาหารสำเร็จรูป' }
];

const DEFAULT_SETTINGS = {
  theme: 'System Default',
  language: 'English (US)',
  carbonTaxRate: 200,
  emailAlerts: true,
  lineNotify: false,
  emissionFactors: [
    { id: 'ef_elec', name: 'Electricity (Grid mix)', unit: 'kWh', value: 0.5562, source: 'TGO 2024' },
    { id: 'ef_water', name: 'Tap Water', unit: 'm3', value: 0.7836, source: 'TGO 2024' }
  ]
};

const DEFAULT_DATA = {
  settings: DEFAULT_SETTINGS,
  cats: DEFAULT_CATS,
  factories: DEFAULT_FACTORIES,
  equipments: [
    { id: 'eq_1', catId: 'chiller', tag: 'CH-01', factory: 'โรงงานอยุธยา', dept: 'อาคารผลิต 1', brand: 'Trane', model: 'CVGF', rated: '500 TR', year: '2015', kw: '320', capacity: '500', efficiency: '0.640', opHoursYear: 6500, loadFactor: 0.75, energyUseYear: 1560000, costYear: 6552000, co2Year: 780000 },
    { id: 'eq_2', catId: 'compressor', tag: 'AC-02', factory: 'โรงงานอยุธยา', dept: 'อาคารผลิต 1', brand: 'Atlas Copco', model: 'GA75', rated: '75 kW', year: '2018', kw: '75', capacity: '', efficiency: '', opHoursYear: 7200, loadFactor: 0.8, energyUseYear: 432000, costYear: 1814400, co2Year: 216000 },
    { id: 'eq_3', catId: 'chiller', tag: 'CH-02', factory: 'โรงงานชลบุรี', dept: 'Utility', brand: 'Carrier', model: '19XR', rated: '800 TR', year: '2020', kw: '530', capacity: '800', efficiency: '0.663', opHoursYear: 8000, loadFactor: 0.7, energyUseYear: 2968000, costYear: 12465600, co2Year: 1484000 },
    { id: 'eq_4', catId: 'boiler', tag: 'BL-01', factory: 'โรงงานชลบุรี', dept: 'Utility', brand: 'Cleaver-Brooks', model: 'CBE', rated: '10 Ton/hr', year: '2012', kw: '18', capacity: '', efficiency: '', opHoursYear: 8000, loadFactor: 0.85, energyUseYear: 122400, costYear: 514080, co2Year: 61200 },
    { id: 'eq_5', catId: 'pump', tag: 'PM-01', factory: 'โรงงานอยุธยา', dept: 'ระบบน้ำหล่อเย็น', brand: 'Ebara', model: '3M40', rated: '15 kW', year: '2017', kw: '15', capacity: '', efficiency: '', opHoursYear: 8760, loadFactor: 0.9, energyUseYear: 118260, costYear: 496692, co2Year: 59130 },
    { id: 'eq_6', catId: 'cooling', tag: 'CT-01', factory: 'โรงงานอยุธยา', dept: 'Utility', brand: 'Marley', model: 'NC8407', rated: '1500 GPM', year: '2016', kw: '22', capacity: '', efficiency: '', opHoursYear: 8760, loadFactor: 0.75, energyUseYear: 144540, costYear: 607068, co2Year: 72270 },
    { id: 'eq_7', catId: 'compressor', tag: 'AC-01', factory: 'โรงงานชลบุรี', dept: 'Utility', brand: 'Ingersoll Rand', model: 'RS90', rated: '90 kW', year: '2019', kw: '90', capacity: '', efficiency: '', opHoursYear: 8000, loadFactor: 0.8, energyUseYear: 576000, costYear: 2419200, co2Year: 288000 },
    { id: 'eq_8', catId: 'pump', tag: 'PM-02', factory: 'โรงงานชลบุรี', dept: 'น้ำดี', brand: 'Grundfos', model: 'CR45', rated: '22 kW', year: '2021', kw: '22', capacity: '', efficiency: '', opHoursYear: 6000, loadFactor: 0.85, energyUseYear: 112200, costYear: 471240, co2Year: 56100 },
    { id: 'eq_9', catId: 'chiller', tag: 'CH-03', factory: 'โรงงานระยอง', dept: 'ไลน์เคมี 2', brand: 'York', model: 'YK', rated: '600 TR', year: '2018', kw: '390', capacity: '600', efficiency: '0.650', opHoursYear: 8000, loadFactor: 0.65, energyUseYear: 2028000, costYear: 8517600, co2Year: 1014000 },
    { id: 'eq_10', catId: 'compressor', tag: 'AC-03', factory: 'โรงงานระยอง', dept: 'Utility', brand: 'Sullair', model: 'LS20', rated: '110 kW', year: '2020', kw: '110', capacity: '', efficiency: '', opHoursYear: 8000, loadFactor: 0.8, energyUseYear: 704000, costYear: 2956800, co2Year: 352000 },
    { id: 'eq_11', catId: 'boiler', tag: 'BL-02', factory: 'โรงงานระยอง', dept: 'กระบวนการผลิต', brand: 'Fulton', model: 'FB-F', rated: '5 Ton/hr', year: '2015', kw: '11', capacity: '', efficiency: '', opHoursYear: 8760, loadFactor: 0.9, energyUseYear: 86724, costYear: 364240, co2Year: 43362 },
    { id: 'eq_12', catId: 'cooling', tag: 'CT-02', factory: 'โรงงานระยอง', dept: 'Utility', brand: 'Liang Chi', model: 'LBC-300', rated: '900 GPM', year: '2019', kw: '15', capacity: '', efficiency: '', opHoursYear: 8760, loadFactor: 0.8, energyUseYear: 105120, costYear: 441504, co2Year: 52560 },
    { id: 'eq_13', catId: 'chiller', tag: 'CH-04', factory: 'โรงงานสมุทรปราการ', dept: 'ห้องเย็น A', brand: 'Daikin', model: 'HT', rated: '400 TR', year: '2021', kw: '260', capacity: '400', efficiency: '0.650', opHoursYear: 8760, loadFactor: 0.6, energyUseYear: 1366560, costYear: 5739552, co2Year: 683280 },
    { id: 'eq_14', catId: 'compressor', tag: 'AC-04', factory: 'โรงงานสมุทรปราการ', dept: 'บรรจุภัณฑ์', brand: 'Hitachi', model: 'OSP-55', rated: '55 kW', year: '2022', kw: '55', capacity: '', efficiency: '', opHoursYear: 6000, loadFactor: 0.75, energyUseYear: 247500, costYear: 1039500, co2Year: 123750 },
    { id: 'eq_15', catId: 'pump', tag: 'PM-03', factory: 'โรงงานสมุทรปราการ', dept: 'Utility', brand: 'Lowara', model: 'e-NSC', rated: '30 kW', year: '2020', kw: '30', capacity: '', efficiency: '', opHoursYear: 8000, loadFactor: 0.85, energyUseYear: 204000, costYear: 856800, co2Year: 102000 },
    { id: 'eq_16', catId: 'electrical', tag: 'TR-01', factory: 'โรงงานสมุทรปราการ', dept: 'Substation 1', brand: 'ABB', model: 'Transformer', rated: '2000 kVA', year: '2014', kw: '45', capacity: '', efficiency: '', opHoursYear: 8760, loadFactor: 0.95, energyUseYear: 374490, costYear: 1572858, co2Year: 187245 }
  ],
  inspections: [
    { id: 'ins_1', eqId: 'eq_1', catId: 'chiller', date: '2025-11-15T08:00:00Z', summary: 'พบการอุดตันที่ Condenser Tube ทำให้ COP ต่ำกว่าเกณฑ์มาตรฐาน 12%' },
    { id: 'ins_2', eqId: 'eq_2', catId: 'compressor', date: '2025-12-02T10:30:00Z', summary: 'เครื่องทำงานปกติ แต่พบการรั่วไหลของลมอัดในระบบท่อส่งจ่ายประมาณ 18%' },
    { id: 'ins_3', eqId: 'eq_3', catId: 'chiller', date: '2026-01-20T09:15:00Z', summary: 'ประสิทธิภาพของคอมเพรสเซอร์ดีเยี่ยม แต่แนะนำให้ติดตั้งระบายน้ำทิ้งอัตโนมัติ' },
    { id: 'ins_4', eqId: 'eq_4', catId: 'boiler', date: '2026-02-10T14:00:00Z', summary: 'พบค่าออกซิเจนส่วนเกินในไอเสียสูงผิดปกติ 6.5% ควรปรับอัตราส่วนเชื้อเพลิง' },
    { id: 'ins_5', eqId: 'eq_5', catId: 'pump', date: '2026-02-15T11:00:00Z', summary: 'พบกระแสไฟฟ้าและอุณหภูมิขดลวดปกติ แต่ตลับลูกปืนมอเตอร์มีเสียงดังผิดปกติ' },
    { id: 'ins_6', eqId: 'eq_6', catId: 'cooling', date: '2025-12-20T09:00:00Z', summary: 'ครีบกระจายน้ำชำรุดบางส่วนและมีตะไคร่น้ำเกาะหนาแน่น ส่งผลให้อุณหภูมิน้ำเข้าคูลลิ่งสูงกว่าเกณฑ์' },
    { id: 'ins_7', eqId: 'eq_7', catId: 'compressor', date: '2026-03-01T15:00:00Z', summary: 'แผ่นกรองอากาศเข้าอุดตันสูง ส่งผลให้กำลังดูดลดลงและกินกำลังไฟเพิ่มขึ้น 5%' },
    { id: 'ins_8', eqId: 'eq_9', catId: 'chiller', date: '2026-03-10T08:30:00Z', summary: 'อุณหภูมิน้ำเย็นจ่าย (CHW Temp) ไม่คงที่เนื่องจากวาล์วควบคุมน้ำบายพาสค้าง' },
    { id: 'ins_9', eqId: 'eq_10', catId: 'compressor', date: '2026-03-15T10:00:00Z', summary: 'ตรวจพบความดันตกคร่อมตัวกรองน้ำมันสูงเกินขีดจำกัด ควรเปลี่ยนถ่ายไส้กรอง' },
    { id: 'ins_10', eqId: 'eq_11', catId: 'boiler', date: '2026-04-05T13:30:00Z', summary: 'ผิวแลกเปลี่ยนความร้อนฝั่งน้ำมีตะกรันเกาะหนาประมาณ 1.5 มม. แนะนำให้ทำเคมีล้างตระกรัน' },
    { id: 'ins_11', eqId: 'eq_13', catId: 'chiller', date: '2026-04-12T14:15:00Z', summary: 'พบค่าสัมประสิทธิ์สมรรถนะ (COP) ลดลงจาก 5.4 เหลือ 4.8 แนะนำตรวจสอบระดับสารทำความเย็น' },
    { id: 'ins_12', eqId: 'eq_15', catId: 'pump', date: '2026-04-20T10:45:00Z', summary: 'มีจุดรั่วซึมบริเวณประเก็นกันรั่ว (Gland Packing) ของปั๊มน้ำทำให้น้ำสูญเสียเล็กน้อย' }
  ],
  measures: [
    { id: 'meas_1', eqId: 'eq_1', eqTag: 'CH-01', catId: 'chiller', factory: 'โรงงานอยุธยา', measName: 'ล้างทำความสะอาดคอนเดนเซอร์ทิวบ์', measIcon: '🧹', pct: 12, kWhYear: 156000, bahtYear: 624000, invest: 25000, payback: 0.04, energyType: 'elec', date: '2025-11-15', energyUseBefore: 1560000, energyUseAfter: 1404000, costBefore: 6552000, costAfter: 5928000, co2Before: 780000, co2After: 702000 },
    { id: 'meas_2', eqId: 'eq_2', eqTag: 'AC-02', catId: 'compressor', factory: 'โรงงานอยุธยา', measName: 'อุดรอยรั่วท่อลมและท่อจ่ายลมอัดหลัก', measIcon: '🔧', pct: 18, kWhYear: 95000, bahtYear: 380000, invest: 45000, payback: 0.12, energyType: 'elec', date: '2025-12-02', energyUseBefore: 432000, energyUseAfter: 337000, costBefore: 1814400, costAfter: 1434400, co2Before: 216000, co2After: 168500 },
    { id: 'meas_3', eqId: 'eq_4', eqTag: 'BL-01', catId: 'boiler', factory: 'โรงงานชลบุรี', measName: 'ติดตั้งเครื่องประหยัดความร้อน (Economizer)', measIcon: '🔥', pct: 6, kWhYear: 310000, bahtYear: 1085000, invest: 1200000, payback: 1.11, energyType: 'heat', date: '2026-02-10', energyUseBefore: 5166666, energyUseAfter: 4856666, costBefore: 18083333, costAfter: 16998333, co2Before: 1200000, co2After: 1100000 },
    { id: 'meas_4', eqId: 'eq_3', eqTag: 'CH-02', catId: 'chiller', factory: 'โรงงานชลบุรี', measName: 'ติดตั้งอินเวอร์เตอร์ (VSD) สำหรับปั๊มน้ำเย็น', measIcon: '⚡', pct: 15, kWhYear: 245000, bahtYear: 980000, invest: 850000, payback: 0.87, energyType: 'elec', date: '2026-01-20', energyUseBefore: 2968000, energyUseAfter: 2723000, costBefore: 12465600, costAfter: 11485600, co2Before: 1484000, co2After: 1361500 },
    { id: 'meas_5', eqId: 'eq_6', eqTag: 'CT-01', catId: 'cooling', factory: 'โรงงานอยุธยา', measName: 'ล้างทำความสะอาดและเปลี่ยนตะแกรงกระจายลมคูลลิ่ง', measIcon: '💧', pct: 8, kWhYear: 35000, bahtYear: 140000, invest: 80000, payback: 0.57, energyType: 'elec', date: '2025-12-20', energyUseBefore: 144540, energyUseAfter: 109540, costBefore: 607068, costAfter: 467068, co2Before: 72270, co2After: 54770 },
    { id: 'meas_6', eqId: 'eq_10', eqTag: 'AC-03', catId: 'compressor', factory: 'โรงงานระยอง', measName: 'ลดระดับความดันจ่ายลมอัดของเครื่องอัดลมลง 0.5 bar', measIcon: '📉', pct: 4, kWhYear: 58000, bahtYear: 232000, invest: 10000, payback: 0.04, energyType: 'elec', date: '2026-03-15', energyUseBefore: 704000, energyUseAfter: 646000, costBefore: 2956800, costAfter: 2724800, co2Before: 352000, co2After: 323000 },
    { id: 'meas_7', eqId: 'eq_11', eqTag: 'BL-02', catId: 'boiler', factory: 'โรงงานระยอง', measName: 'ล้างตะกรันในหม้อไอน้ำเพื่อเพิ่มการส่งผ่านความร้อน', measIcon: '🧪', pct: 5, kWhYear: 142000, bahtYear: 497000, invest: 150000, payback: 0.30, energyType: 'heat', date: '2026-04-05', energyUseBefore: 2840000, energyUseAfter: 2698000, costBefore: 9940000, costAfter: 9443000, co2Before: 568000, co2After: 539600 },
    { id: 'meas_8', eqId: 'eq_13', eqTag: 'CH-04', catId: 'chiller', factory: 'โรงงานสมุทรปราการ', measName: 'เปลี่ยนมาใช้สารทำความเย็นที่เป็นมิตรต่อสิ่งแวดล้อม', measIcon: '🌿', pct: 7, kWhYear: 108000, bahtYear: 432000, invest: 350000, payback: 0.81, energyType: 'elec', date: '2026-04-12', energyUseBefore: 1366560, energyUseAfter: 1258560, costBefore: 5739552, costAfter: 5307552, co2Before: 683280, co2After: 629280 }
  ],
  reports: [
    { id: 'rpt_1', eqId: 'eq_1', title: 'รายงานผลการตรวจวัดและล้างตะกรันคอนเดนเซอร์เครื่องทำน้ำเย็น CH-01', docno: 'EA-2025-001', factory: 'โรงงานอยุธยา', dept: 'อาคารผลิต 1', source: 'การตรวจวัดและวิเคราะห์ประสิทธิภาพ', meastype: 'No/Low Cost', objective: 'เพื่อปรับปรุงอัตราการถ่ายเทความร้อนและลดกำลังไฟฟ้าของคอมเพรสเซอร์', equip_main: 'CH-01 - Trane CVGF', before_kw: 320, before_hrs: 6500, after_kw: 296, after_hrs: 6500, save_kwh: 156000, save_baht: 624000, invest: 25000, payback: 0.04, conclusion: 'จากการเข้าตรวจสอบประสิทธิภาพพบว่าการแลกเปลี่ยนความร้อนเพิ่มขึ้นและสามารถประหยัดกำลังไฟได้ 24 kW ระยะคืนทุนเพียง 0.04 ปี แนะนำให้ดำเนินล้างปีละ 1 ครั้ง', updatedAt: '2025-11-20T10:00:00Z', before_photos: [], after_photos: [] },
    { id: 'rpt_2', eqId: 'eq_2', title: 'รายงานความคืบหน้าการสำรวจและซ่อมรอยรั่วท่อลมอัดโรงงานอยุธยา AC-02', docno: 'EA-2025-002', factory: 'โรงงานอยุธยา', dept: 'อาคารผลิต 1', source: 'การตรวจจับคลื่นความถี่สูง (Ultrasonic Leak Detection)', meastype: 'Medium Cost', objective: 'เพื่อตรวจวัดปริมาณการรั่วไหลสะสมและซ่อมบำรุงจุดต่อท่อลมที่มีรอยรั่ว', equip_main: 'AC-02 - Atlas Copco GA75', before_kw: 75, before_hrs: 7200, after_kw: 61.8, after_hrs: 7200, save_kwh: 95000, save_baht: 380000, invest: 45000, payback: 0.12, conclusion: 'ตรวจพบจุดรั่วไหลทั้งสิ้น 34 จุด ดำเนินการซ่อมบำรุงแล้วเสร็จ 30 จุด ทำให้ลดปริมาณการสูญเสียกำลังลมอัดลงได้อย่างมีนัยสำคัญ', updatedAt: '2025-12-05T12:00:00Z', before_photos: [], after_photos: [] },
    { id: 'rpt_3', eqId: 'eq_4', title: 'รายงานการประเมินศักยภาพการติดตั้ง Economizer สำหรับหม้อไอน้ำ BL-01', docno: 'EA-2026-003', factory: 'โรงงานชลบุรี', dept: 'Utility', source: 'วิศวกรรมการจำลองกระบวนการความร้อน', meastype: 'High Cost Investment', objective: 'เพื่อกู้คืนความร้อนทิ้งจากไอเสียของหม้อไอน้ำกลับมาอุ่นน้ำป้อนเข้าเพื่อประหยัดเชื้อเพลิงก๊าซธรรมชาติ', equip_main: 'BL-01 - Cleaver-Brooks CBE', before_kw: 18, before_hrs: 8000, after_kw: 16.9, after_hrs: 8000, save_kwh: 310000, save_baht: 1085000, invest: 1200000, payback: 1.11, conclusion: 'การติดตั้ง Economizer จะเพิ่มประสิทธิภาพการผลิตของระบบทำความร้อน 5-6% ลดค่าใช้จ่ายพลังงานความร้อนได้ปีละกว่า 1 ล้านบาท คืนทุนในเวลาประมาณ 1 ปีเศษ', updatedAt: '2026-02-15T16:00:00Z', before_photos: [], after_photos: [] }
  ]
};

const TRANSLATIONS = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    energy_summary: "Energy Summary",
    reports: "Reports",
    equipments: "Equipments",
    inspections: "Inspections",
    account_settings: "Account Settings",
    system_settings: "System Settings",
    logout: "Logout",
    theme: "Theme",
    theme_light: "Light Mode",
    theme_dark: "Dark Mode",
    database: "Database",
    upgrade: "Upgrade Planning",
    preferences: "Preferences",
    main: "Main",
    
    // Login
    welcome_title: "ENGINSPECT",
    welcome_sub: "Sign in to the Energy Audit System",
    demo_access: "Quick Demo Access (Click to autofill):",
    email: "Email address",
    password: "Password",
    signin: "Sign in",
    invalid_login: "Invalid email or password.",
    
    // Dashboard
    hello: "Hello",
    overview_for: "Overview for",
    factories_overview: "Factories Overview",
    recent_inspections: "Recent Inspections",
    view_all: "View all",
    stat_equipments: "Equipments",
    stat_inspections: "Inspections",
    stat_measures: "Measures",
    stat_potential: "Potential (MWh)",
    stat_factories: "Factories",
    savings_mwh: "Savings (MWh)",
    categories_present: "Categories present:",
    no_factories: "No factories found. Please add equipment first.",
    no_inspections: "No inspection records found.",
    date: "Date",
    equipment: "Equipment",
    factory: "Factory",
    category: "Category",
    summary: "Summary",
    actions: "Actions",
    add_factory: "Add Factory",
    factory_name: "Factory Name",
    location: "Location",
    
    // Replacement Catalog
    catalog: "Replacement Catalog",
    catalog_title: "Equipment Upgrade Catalog",
    catalog_desc: "Browse high-efficiency industrial equipment recommendations. Select an active equipment from your registry to simulate the potential energy reduction and payback period.",
    recommended_model: "Recommended Replacement",
    current_equipment: "Current Machine",
    select_to_compare: "Select a registry machine to compare...",
    upgrade_simulator: "Upgrade & Payback Simulator",
    annual_savings: "Annual Energy Savings",
    payback_years: "Payback Period",
    add_to_measures: "Add to Active Measures",
    add_measure_success: "Upgrade project saved successfully as an Energy Conservation Measure!",
    est_cost: "Est. Investment Cost",
    efficiency_target: "Efficiency Target",
    current_spec: "Current Specifications",
    spec: "Specifications",
    
    // Factory Overview Header
    factory_summary_title: "Factory Performance Dashboard",
    total_machines_label: "Active Equipments",
    inspections_performed_label: "Audits / Measurements",
    last_audit_date_label: "Last Measurement Date",
    ghg_reduction_potential_label: "Carbon Savings Potential",
    
    // Energy Summary
    elec_savings: "Elec Savings",
    heat_savings: "Heat Savings",
    ghg_reduction: "GHG Reduction",
    cost_savings: "Cost Savings",
    total_measures: "Total Measures",
    avg_payback: "Avg Payback",
    years: "Years",
    filter_by: "Filter By",
    all_factories: "All Factories",
    all_categories: "All Categories",
    all_years: "All Years",
    all_measures: "All Measure Types",
    upgrades_only: "Upgrades/Replacements Only",
    maintenance_only: "Maintenance/Optimization Only",
    savings_by_measure: "Savings by Measure Type",
    savings_by_factory: "Energy Savings by Factory",
    total_savings: "Total Savings Share",
    energy_proportion: "Energy Proportion & GHG",
    ratio: "Ratio",
    electricity: "Electricity",
    heat: "Heat",
    total_ghg_savings: "Total GHG savings",
    all_energy_measures: "All Energy Conservation Measures",
    measure_name: "Measure Name",
    save_pct: "Save %",
    kwh_yr: "kWh/yr",
    thb_yr: "THB/yr",
    payback: "Payback",
    no_measures: "No measures recorded.",
    
    // Equipment Registry
    equipment_registry: "Equipment Registry",
    manage_equipments: "Manage and audit registered industrial factory equipments.",
    clear_filter: "Clear Filter",
    add_equipment: "Add Equipment",
    search_placeholder: "Search by tag, brand, factory...",
    specifications: "specifications",
    no_brand_info: "No brand/model specifications",
    no_equipments: "No equipment found.",
    audit_calculation: "Audit calculation",
    edit_specification: "Edit specification",
    delete_equipment: "Delete equipment",
    all_types: "All Equipment Types",
    units: "units",
    
    // History
    inspections_history: "Inspections History",
    log_inspections: "Log of all recorded equipment inspections.",
    search_records: "Search records...",
    all_records: "All records",
    view_details: "View details",
    delete_inspection: "Delete inspection",
    
    // Account Settings
    account_desc: "Manage your personal engineer profile information and security credentials.",
    personal_info: "Personal Information",
    full_name: "Full Name",
    role_position: "Role / Position",
    save_changes: "Save Changes",
    profile_updated: "Profile updated!",
    security_credentials: "Security Credentials",
    current_password: "Current Password",
    new_password: "New Password",
    confirm_password: "Confirm Password",
    update_password: "Update Password",
    change_avatar: "Change Avatar",
    
    // System Settings
    system_desc: "Configure global application variables, audit settings, and API integrations.",
    general_preferences: "General Preferences",
    default_theme: "Default Theme",
    language: "Language",
    language_desc: "Primary language for audit worksheets.",
    emission_factor: "Emission Factor (kgCO₂e/kWh)",
    emission_desc: "Used for all carbon offset calculations.",
    carbon_tax_rate: "Carbon Tax Rate (THB/tCO₂e)",
    carbon_tax_desc: "Used to calculate financial savings from emission reduction.",
    notification_digests: "Notification Digests",
    email_summaries: "Email Summaries",
    email_summaries_desc: "Receive weekly energy savings summaries.",
    line_alerts: "Line Alert Integrations",
    line_alerts_desc: "Push real-time alert logs to Line group chat.",
    db_connection: "Cloud Database Connection",
    sync_status: "Sync Status",
    connected: "Connected",
    last_synced: "Last synced: 10 mins ago",
    api_endpoint: "API Endpoint URI",
    test: "Test",
    save_configurations: "Save Configurations",
    config_saved: "System configurations successfully updated",
    
    // Database reset
    reset_db: "Reset to Demo Data",
    reset_db_confirm: "Are you sure you want to reset all data to default mock database? Your current changes will be overwritten.",
    db_reset_done: "Database reset complete!",
    loading_mock_desc: "Overwrites current localStorage with rich industrial demo data.",
    
    // Modals & Forms
    identification: "Identification",
    equipment_tag: "Equipment Tag",
    specifications_title: "Specifications",
    brand: "Brand",
    model: "Model",
    elec_power: "Electrical Power (kW)",
    capacity_tr: "Capacity (TR)",
    efficiency_kw_tr: "Efficiency (kW/TR)",
    cancel: "Cancel",
    save_equipment: "Save Equipment",
    create_category: "Create Category",
    category_name: "Category Name",
    description: "Description",
    icon: "Icon",
    edit_equipment: "Edit Equipment",
    add_new_equipment: "Add New Equipment",
    add_new_category: "Add New Category",
    
    // Calculator Modals
    parameters: "Parameters",
    results: "Results",
    measures: "Measures",
    save: "Save",
    chiller_water: "Chilled Water (CHW)",
    water_properties: "Water Properties (Advanced)",
    condenser_water: "Condenser Water (CW)",
    cooling_type: "Cooling Type",
    water_cooled: "Water Cooled",
    air_cooled: "Air Cooled",
    dry_bulb_temp: "Dry Bulb Temperature",
    power_load: "Power & Load",
    iplv_nplv: "IPLV / NPLV (kW/TR)",
    calculate: "Calculate",
    cop_desc: "COP (Coefficient of Performance)",
    cooling_capacity: "Cooling Capacity",
    capacity: "Capacity",
    specific_power: "Specific Power",
    heat_rejection: "Heat Rejection",
    carnot_efficiency: "Carnot Efficiency",
    chiller_recommend: "Recommended Replacements",
    chiller_recommend_desc: "Click a model to automatically calculate potential energy reduction based on your current kW/TR.",
    energy_reduction: "Energy Reduction (%)",
    operating_hours: "Operating Hours (hr/yr)",
    electricity_rate: "Electricity Rate (THB/kWh)",
    investment_cost: "Investment Cost (THB)",
    estimated_savings: "Estimated Energy Savings",
    carbon_reduction: "Carbon Reduction",
    save_measure: "Save Measure",
    select_measure: "Select Energy Saving Measure",
    potential_assessment: "Potential Assessment",
    compressor_calculator: "Air Compressor Calculator",
    general_calculator: "General Calculator",
    calculated_flow: "Calculated Free Air Delivery (FAD)",
    specific_energy: "Specific Energy Requirement (SER)",
    isentropic_eff: "Isentropic Efficiency",
    inlet_pressure: "Inlet Pressure",
    inlet_temp: "Inlet Temp",
    discharge_pressure: "Discharge Pressure",
    measured_flow: "Measured FAD Flow",
    motor_power: "Measured Motor Power",
    vsd_option: "Has Variable Speed Drive (VSD)?",
    yes: "Yes",
    no: "No",
    compressor_recommend: "Recommended Compressed Air Measures",
    general_inputs: "General Inputs",
    current_power: "Current Power (kW)",
    current_efficiency: "Current Efficiency (%)",
    target_efficiency: "Target Efficiency (%)",
    general_recommend: "Select General Saving Measure"
  },
  th: {
    // Navigation
    dashboard: "แดชบอร์ด",
    energy_summary: "สรุปพลังงาน",
    reports: "รายงาน",
    equipments: "ฐานข้อมูลอุปกรณ์",
    inspections: "ประวัติการตรวจวัด",
    account_settings: "ตั้งค่าบัญชี",
    system_settings: "ตั้งค่าระบบ",
    logout: "ออกจากระบบ",
    theme: "ธีม",
    theme_light: "โหมดสว่าง",
    theme_dark: "โหมดมืด",
    database: "ฐานข้อมูล",
    upgrade: "การอัปเกรดเครื่องจักร",
    preferences: "ความชอบ",
    main: "หลัก",
    
    // Login
    welcome_title: "ENGINSPECT",
    welcome_sub: "ลงชื่อเข้าใช้ระบบตรวจสอบพลังงาน",
    demo_access: "การเข้าถึงตัวสาธิตด่วน (คลิกเพื่อกรอกอัตโนมัติ):",
    email: "ที่อยู่อีเมล",
    password: "รหัสผ่าน",
    signin: "ลงชื่อเข้าใช้",
    invalid_login: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    
    // Dashboard
    hello: "สวัสดี",
    overview_for: "ภาพรวมสำหรับ",
    factories_overview: "ภาพรวมโรงงาน",
    recent_inspections: "การตรวจวัดล่าสุด",
    view_all: "ดูทั้งหมด",
    stat_equipments: "อุปกรณ์ทั้งหมด",
    stat_inspections: "ตรวจวัดแล้ว",
    stat_measures: "มาตรการรวม",
    stat_potential: "ศักยภาพประหยัด (MWh)",
    stat_factories: "จำนวนโรงงาน",
    savings_mwh: "ผลประหยัด (MWh)",
    categories_present: "ประเภทเครื่องจักร:",
    no_factories: "ไม่พบข้อมูลโรงงาน กรุณาเพิ่มอุปกรณ์ก่อน",
    no_inspections: "ไม่พบประวัติการตรวจวัดอุปกรณ์",
    date: "วันที่ตรวจวัด",
    equipment: "อุปกรณ์",
    factory: "โรงงาน",
    category: "ประเภท",
    summary: "สรุปปัญหา",
    actions: "การจัดการ",
    add_factory: "เพิ่มโรงงาน",
    factory_name: "ชื่อโรงงาน",
    location: "ที่ตั้ง",
    
    // Replacement Catalog
    catalog: "รุ่นแนะนำเปลี่ยนใหม่",
    catalog_title: "แคตตาล็อกอุปกรณ์ประสิทธิภาพสูงแนะนำ",
    catalog_desc: "เลือกดูเครื่องจักรและอุปกรณ์อุตสาหกรรมรุ่นประหยัดพลังงานประสิทธิภาพสูง สำหรับเปลี่ยนทดแทนเครื่องเก่า พร้อมระบบคำนวณจำลองจุดคุ้มทุนในการอัปเกรด",
    recommended_model: "รุ่นที่แนะนำ",
    current_equipment: "เครื่องจักรปัจจุบัน",
    select_to_compare: "เลือกเครื่องจักรเพื่อคำนวณผลประหยัด...",
    upgrade_simulator: "เครื่องมือจำลองผลประหยัดและจุดคืนทุน",
    annual_savings: "ผลประหยัดพลังงานรายปี",
    payback_years: "ระยะเวลาคืนทุน",
    add_to_measures: "บันทึกเข้ารายการมาตรการ",
    add_measure_success: "บันทึกมาตรการอัปเกรดเครื่องจักรเข้าฐานข้อมูลสำเร็จแล้ว!",
    est_cost: "ประมาณการงบลงทุน",
    efficiency_target: "ประสิทธิภาพเป้าหมาย",
    current_spec: "ข้อมูลจำเพาะปัจจุบัน",
    spec: "ข้อมูลจำเพาะ",
    
    // Factory Overview Header
    factory_summary_title: "สรุปภาพรวมข้อมูลและประสิทธิภาพโรงงาน",
    total_machines_label: "เครื่องจักรทั้งหมด",
    inspections_performed_label: "จำนวนที่ตรวจวัดแล้ว",
    last_audit_date_label: "ตรวจวัดล่าสุดเมื่อ",
    ghg_reduction_potential_label: "ปริมาณคาร์บอนที่ประหยัดได้",
    
    // Energy Summary
    elec_savings: "ประหยัดไฟฟ้า",
    heat_savings: "ประหยัดความร้อน",
    ghg_reduction: "ลดก๊าซเรือนกระจก",
    cost_savings: "ประหยัดค่าใช้จ่าย",
    total_measures: "จำนวนมาตรการ",
    avg_payback: "ระยะคืนทุนเฉลี่ย",
    years: "ปี",
    filter_by: "กรองข้อมูลตาม",
    all_factories: "โรงงานทั้งหมด",
    all_categories: "ทุกประเภทอุปกรณ์",
    all_years: "ทุกปี",
    all_measures: "มาตรการทั้งหมด",
    upgrades_only: "เฉพาะการอัปเกรด/เปลี่ยนรุ่น",
    maintenance_only: "เฉพาะการปรับปรุง/บำรุงรักษา",
    savings_by_measure: "สัดส่วนผลประหยัดไฟฟ้าตามมาตรการ",
    savings_by_factory: "สรุปผลประหยัดพลังงานแยกตามโรงงาน",
    total_savings: "สัดส่วนผลประหยัดรวม",
    energy_proportion: "สัดส่วนพลังงาน & คาร์บอนไดออกไซด์",
    ratio: "สัดส่วน",
    electricity: "พลังงานไฟฟ้า",
    heat: "พลังงานความร้อน",
    total_ghg_savings: "คาร์บอนที่ลดได้จริง",
    all_energy_measures: "รายการมาตรการอนุรักษ์พลังงานทั้งหมด",
    measure_name: "ชื่อมาตรการ",
    save_pct: "สัดส่วนที่ประหยัด %",
    kwh_yr: "kWh/ปี",
    thb_yr: "บาท/ปี",
    payback: "ระยะคืนทุน",
    no_measures: "ไม่มีประวัติมาตรการอนุรักษ์พลังงาน",
    
    // Equipment Registry
    equipment_registry: "ทะเบียนอุปกรณ์",
    manage_equipments: "จัดการและตรวจสอบทะเบียนเครื่องจักรโรงงานทั้งหมด",
    clear_filter: "ล้างตัวกรอง",
    add_equipment: "เพิ่มเครื่องจักรใหม่",
    search_placeholder: "ค้นหาด้วยรหัส, แบรนด์, โรงงาน...",
    specifications: "ข้อมูลจำเพาะ",
    no_brand_info: "ไม่มีข้อมูลแบรนด์/รุ่นเครื่องจักร",
    no_equipments: "ไม่พบข้อมูลเครื่องจักร",
    audit_calculation: "คำนวณประสิทธิภาพ",
    edit_specification: "แก้ไขข้อมูลจำเพาะ",
    delete_equipment: "ลบเครื่องจักร",
    all_types: "เครื่องจักรทั้งหมด",
    units: "เครื่อง",
    
    // History
    inspections_history: "ประวัติการตรวจวัด",
    log_inspections: "บันทึกผลการเข้าตรวจวัดและวิเคราะห์ประสิทธิภาพเครื่องจักร",
    search_records: "ค้นหาข้อมูลตรวจวัด...",
    all_records: "ข้อมูลทั้งหมด",
    view_details: "ดูรายละเอียดรายงาน",
    delete_inspection: "ลบประวัติการตรวจ",
    
    // Account Settings
    account_desc: "จัดการข้อมูลส่วนตัววิศวกรผู้จัดทำ และการเข้าสู่ระบบ",
    personal_info: "ข้อมูลส่วนบุคคล",
    full_name: "ชื่อ-นามสกุล",
    role_position: "ตำแหน่งวิศวกร",
    save_changes: "บันทึกข้อมูล",
    profile_updated: "อัปเดตข้อมูลสำเร็จ!",
    security_credentials: "รหัสผ่านและความปลอดภัย",
    current_password: "รหัสผ่านปัจจุบัน",
    new_password: "รหัสผ่านใหม่",
    confirm_password: "ยืนยันรหัสผ่านใหม่",
    update_password: "อัปเดตรหัสผ่าน",
    change_avatar: "เปลี่ยนรูปโปรไฟล์",
    
    // System Settings
    system_desc: "ตั้งค่าตัวแปรกลางที่ใช้ในระบบ คำนวณคาร์บอนเครดิต และ API",
    general_preferences: "การตั้งค่าทั่วไปของระบบ",
    default_theme: "ธีมเริ่มต้น",
    language: "การเปลี่ยนภาษา",
    language_desc: "ภาษาหลักที่ใช้สำหรับรายงานและหน้าต่างคำนวณ",
    emission_factor: "ค่าสัมประสิทธิ์การปล่อยคาร์บอน (kgCO₂e/kWh)",
    emission_desc: "ใช้สำหรับการคำนวณการลดก๊าซเรือนกระจกทั้งหมด",
    carbon_tax_rate: "อัตราภาษีคาร์บอน (บาท/tCO₂e)",
    carbon_tax_desc: "ใช้คำนวณมูลค่าที่ประหยัดได้จากการลดการปล่อยคาร์บอน",
    notification_digests: "การแจ้งเตือนและการส่งข้อมูล",
    email_summaries: "สรุปข้อมูลทางอีเมล",
    email_summaries_desc: "รับรายงานสรุปความคืบหน้ารายสัปดาห์",
    line_alerts: "แจ้งเตือนผ่าน Line",
    line_alerts_desc: "ส่งข้อมูลความผิดปกติเครื่องจักรไปยังไลน์กลุ่ม",
    db_connection: "การเชื่อมต่อฐานข้อมูลระบบคลาวด์",
    sync_status: "สถานะการซิงก์ข้อมูล",
    connected: "เชื่อมต่อสำเร็จ",
    last_synced: "ซิงก์ล่าสุด: 10 นาทีที่แล้ว",
    api_endpoint: "API Endpoint เชื่อมต่อภายนอก",
    test: "ทดสอบเชื่อมต่อ",
    save_configurations: "บันทึกการตั้งค่าระบบ",
    config_saved: "บันทึกการตั้งค่าระบบสำเร็จแล้ว",
    
    // Database reset
    reset_db: "รีเซ็ตเป็นข้อมูลจำลอง",
    reset_db_confirm: "คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตข้อมูลทั้งหมดเป็นข้อมูลจำลองเริ่มต้น? การตั้งค่าและข้อมูลปัจจุบันทั้งหมดจะถูกเขียนทับ",
    db_reset_done: "รีเซ็ตฐานข้อมูลเป็นข้อมูลจำลองเรียบร้อยแล้ว!",
    loading_mock_desc: "เขียนทับข้อมูลปัจจุบันด้วยข้อมูลโรงงานและอุปกรณ์ตัวอย่างระดับพรีเมียม",
    
    // Modals & Forms
    identification: "ข้อมูลทั่วไปเครื่องจักร",
    equipment_tag: "รหัสเครื่องจักร (Tag)",
    specifications_title: "ข้อมูลจำเพาะเครื่องจักร",
    brand: "ยี่ห้อ (Brand)",
    model: "รุ่น (Model)",
    elec_power: "กำลังไฟฟ้าขับเคลื่อน (kW)",
    capacity_tr: "ขีดความสามารถการทำความเย็น (TR)",
    efficiency_kw_tr: "ประสิทธิภาพเครื่องจักร (kW/TR)",
    cancel: "ยกเลิก",
    save_equipment: "บันทึกเครื่องจักร",
    create_category: "สร้างหมวดหมู่ใหม่",
    category_name: "ชื่อหมวดหมู่",
    description: "คำอธิบาย",
    icon: "ไอคอน",
    edit_equipment: "แก้ไขข้อมูลเครื่องจักร",
    add_new_equipment: "เพิ่มเครื่องจักรใหม่",
    add_new_category: "เพิ่มหมวดหมู่เครื่องจักรใหม่",
    
    // Calculator Modals
    parameters: "ป้อนข้อมูลวัด",
    results: "ผลวิเคราะห์",
    measures: "เลือกมาตรการ",
    save: "ประเมินผล",
    chiller_water: "น้ำเย็นฝั่งจ่าย (Chilled Water)",
    water_properties: "คุณสมบัติน้ำ (ขั้นสูง)",
    condenser_water: "น้ำระบายความร้อน (Condenser Water)",
    cooling_type: "ระบบระบายความร้อน",
    water_cooled: "ระบายความร้อนด้วยน้ำ (Water Cooled)",
    air_cooled: "ระบายความร้อนด้วยอากาศ (Air Cooled)",
    dry_bulb_temp: "อุณหภูมิอากาศ (Dry Bulb)",
    power_load: "กำลังไฟฟ้าและภาระงาน",
    iplv_nplv: "ค่า IPLV / NPLV (kW/TR)",
    calculate: "คำนวณผล",
    cop_desc: "ประสิทธิภาพของเครื่องทำน้ำเย็น (COP)",
    cooling_capacity: "ขนาดทำความเย็นที่วัดได้จริง",
    capacity: "ความสามารถการทำความเย็น",
    specific_power: "ดัชนีการใช้พลังงานจำเพาะ",
    heat_rejection: "พลังงานฝั่งระบายความร้อน",
    carnot_efficiency: "ประสิทธิภาพเทียบกับคาร์โนต์",
    chiller_recommend: "คำแนะนำรุ่น Chiller ประสิทธิภาพสูงทดแทน",
    chiller_recommend_desc: "คลิกรุ่นที่แนะนำเพื่อนำค่าไปคำนวณผลประหยัดพลังงานเมื่อเปลี่ยนเครื่องเทียบกับปัจจุบัน",
    energy_reduction: "สัดส่วนพลังงานที่ลดลง (%)",
    operating_hours: "ชั่วโมงทำงานต่อปี (ชม./ปี)",
    electricity_rate: "อัตราค่าไฟฟ้าเฉลี่ย (บาท/หน่วย)",
    investment_cost: "งบลงทุนมาตรการ (บาท)",
    estimated_savings: "ผลประหยัดพลังงานคาดการณ์",
    carbon_reduction: "ปริมาณก๊าซเรือนกระจกที่ลดลง",
    save_measure: "บันทึกมาตรการ",
    select_measure: "เลือกมาตรการประหยัดพลังงาน",
    potential_assessment: "การประเมินศักยภาพผลประหยัด",
    compressor_calculator: "คำนวณเครื่องอัดลม (Air Compressor)",
    general_calculator: "คำนวณเครื่องจักรอเนกประสงค์",
    calculated_flow: "อัตราการจ่ายลมวัดได้จริง (FAD)",
    specific_energy: "ค่าดัชนีพลังงานลมอัดจำเพาะ (SER)",
    isentropic_eff: "ประสิทธิภาพเชิงไอเซนโทรปิก",
    inlet_pressure: "แรงดันขาเข้าลมดิบ",
    inlet_temp: "อุณหภูมิอากาศเข้า",
    discharge_pressure: "แรงดันจ่ายลมผลิต",
    measured_flow: "ปริมาณลมจ่ายวัดจริง (FAD)",
    motor_power: "กำลังไฟฟ้ามอเตอร์วัดจริง",
    vsd_option: "ติดตั้งระบบปรับรอบมอเตอร์ VSD หรือไม่?",
    yes: "ติดตั้ง VSD",
    no: "ไม่มี VSD (Fixed Speed)",
    compressor_recommend: "ข้อเสนอแนะมาตรการลมอัด",
    general_inputs: "พารามิเตอร์ตรวจวัดภาระงาน",
    current_power: "กำลังไฟฟ้าปัจจุบัน (kW)",
    current_efficiency: "ประสิทธิภาพทำงานปัจจุบัน (%)",
    target_efficiency: "ประสิทธิภาพเป้าหมายหลังจากปรับปรุง (%)",
    general_recommend: "เลือกมาตรการประหยัดอเนกประสงค์"
  }
};

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [data, setData] = useState(DEFAULT_DATA);
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const savedData = localStorage.getItem('ei_data4_min');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (!parsed.cats[0]?.icon || parsed.cats[0].icon.includes('❄️')) {
          parsed.cats = DEFAULT_CATS;
        }
        if (!parsed.factories) {
          parsed.factories = DEFAULT_FACTORIES;
        }
        // Auto migrate small old databases to new premium default dataset
        if (parsed.equipments && parsed.equipments.length <= 4 && parsed.factories && parsed.factories.length <= 2) {
          setData(DEFAULT_DATA);
          localStorage.setItem('ei_data4_min', JSON.stringify(DEFAULT_DATA));
        } else {
          // Migrate old settings to new emissionFactors array
          if (parsed.settings && parsed.settings.emissionFactor !== undefined && !parsed.settings.emissionFactors) {
            parsed.settings.emissionFactors = [
              { id: 'ef_elec', name: 'Electricity (Grid mix)', unit: 'kWh', value: parsed.settings.emissionFactor, source: 'Custom/Legacy' },
              { id: 'ef_water', name: 'Tap Water', unit: 'm3', value: 0.7836, source: 'TGO 2024' }
            ];
            delete parsed.settings.emissionFactor;
          } else if (!parsed.settings) {
            parsed.settings = DEFAULT_SETTINGS;
          }
          setData(parsed);
        }
      } catch (e) {
        console.error("Failed to parse ei_data4_min", e);
      }
    } else {
      const oldData = localStorage.getItem('ei_data3');
      if (oldData) {
        try {
          const parsed = JSON.parse(oldData);
          parsed.cats = DEFAULT_CATS;
          parsed.factories = DEFAULT_FACTORIES;
          setData(parsed);
        } catch(e) {}
      }
    }
    
    const savedUser = sessionStorage.getItem('ei_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse ei_user", e);
      }
    }
    
    setIsLoaded(true);
  }, []);

  // Sync lang selection with system settings changes
  useEffect(() => {
    if (data?.settings?.language) {
      setLang(data.settings.language === 'Thai (TH)' ? 'th' : 'en');
    }
  }, [data?.settings?.language]);

  const saveData = (newData) => {
    setData(newData);
    localStorage.setItem('ei_data4_min', JSON.stringify(newData));
  };

  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem('ei_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('ei_user');
  };

  const addEquipment = (eq) => {
    const newEq = { ...eq, id: 'eq_' + Date.now(), createdAt: new Date().toISOString(), createdBy: user?.name };
    saveData({ ...data, equipments: [...data.equipments, newEq] });
  };

  const updateEquipment = (id, eqData) => {
    saveData({
      ...data,
      equipments: data.equipments.map(e => e.id === id ? { ...e, ...eqData, updatedAt: new Date().toISOString() } : e)
    });
  };

  const deleteEquipment = (id) => {
    saveData({
      ...data,
      equipments: data.equipments.filter(e => e.id !== id),
      inspections: data.inspections.filter(i => i.eqId !== id),
      measures: data.measures.filter(m => m.eqId !== id)
    });
  };

  const addFactory = (fact) => {
    const newFact = {
      ...fact,
      id: 'f_' + Date.now()
    };
    saveData({
      ...data,
      factories: [...(data.factories || DEFAULT_FACTORIES), newFact]
    });
  };

  const resetDatabase = () => {
    saveData(DEFAULT_DATA);
  };

  const t = (key) => {
    const translation = TRANSLATIONS[lang]?.[key];
    if (translation === undefined) {
      return key;
    }
    return translation;
  };

  if (!isLoaded) return null;

  return (
    <AppContext.Provider value={{
      data, setData: saveData,
      user, login, logout,
      addEquipment, updateEquipment, deleteEquipment,
      addFactory,
      resetDatabase,
      lang, setLang, t
    }}>
      {children}
    </AppContext.Provider>
  );
};
