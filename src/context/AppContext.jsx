import React, { createContext, useState, useEffect, useCallback } from 'react';

const DEFAULT_CATS = [
  {id:'chiller',   name:'Chiller',       desc:'ระบบทำน้ำเย็น Centrifugal, Screw, Scroll', icon:'Snowflake'},
  {id:'compressor',name:'Compressor',    desc:'เครื่องอัดอากาศ Air Compressor',            icon:'Wind'},
  {id:'pump',      name:'Pump',          desc:'ปั๊มน้ำ Centrifugal Pump',                   icon:'Droplets'},
  {id:'boiler',    name:'Boiler',        desc:'หม้อไอน้ำ Steam Boiler',                     icon:'Flame'},
  {id:'cooling',   name:'Cooling Tower', desc:'หอหล่อเย็น Cooling Tower',                   icon:'Factory'},
  {id:'electrical',name:'Electrical',    desc:'ระบบไฟฟ้า Motor, Transformer',              icon:'Zap'},
];

const DEFAULT_FACTORIES = [];

const DEFAULT_SETTINGS = {
  theme: 'System Default',
  language: 'English (US)',
  carbonTaxRate: 200,
  elecRate: 4.2,
  emailAlerts: true,
  lineNotify: false,
  emissionFactors: [
    { id: 'ef_elec', name: 'Electricity (Grid mix)', unit: 'kWh', value: 0.5562, source: 'TGO 2024' },
    { id: 'ef_water', name: 'Tap Water', unit: 'm3', value: 0.7836, source: 'TGO 2024' }
  ],
  unitMaster: [
    { id: 'um_1', name: 'Temperature', units: [
      { symbol: '°F', label: 'Fahrenheit', toBase: 'x', fromBase: 'x' },
      { symbol: '°C', label: 'Celsius', toBase: '(x-32)*5/9', fromBase: 'x*9/5+32' }
    ], defaultUnit: '°F' },
    { id: 'um_2', name: 'Flow Rate', units: [
      { symbol: 'GPM', label: 'Gallons per Minute', toBase: 'x', fromBase: 'x' },
      { symbol: 'm³/hr', label: 'Cubic Meters per Hour', toBase: 'x*0.2271', fromBase: 'x/0.2271' }
    ], defaultUnit: 'GPM' },
    { id: 'um_3', name: 'Pressure', units: [
      { symbol: 'bar', label: 'Bar', toBase: 'x', fromBase: 'x' },
      { symbol: 'psi', label: 'PSI', toBase: 'x*14.5038', fromBase: 'x/14.5038' },
      { symbol: 'kPa', label: 'Kilopascal', toBase: 'x*100', fromBase: 'x/100' }
    ], defaultUnit: 'bar' },
    { id: 'um_4', name: 'Power', units: [
      { symbol: 'kW', label: 'Kilowatt', toBase: 'x', fromBase: 'x' },
      { symbol: 'HP', label: 'Horsepower', toBase: 'x*0.7457', fromBase: 'x/0.7457' }
    ], defaultUnit: 'kW' }
  ]
};

const DEFAULT_USERS = [
  { id: 'usr_admin', name: 'Admin User', email: 'admin@enginspect.com', password: 'admin1234', role: 'admin', initials: 'AD', position: 'System Administrator', assignedFactories: [] }
];

// Measure type constants
export const MEASURE_TYPES = [
  { id: 'housekeeping', label: 'Housekeeping', labelTh: 'Housekeeping (ไม่ลงทุน)', color: 'green', desc: 'No investment required – cleaning, adjustment, settings' },
  { id: 'minor', label: 'Minor Improvement', labelTh: 'Minor (ปรับเล็กน้อย)', color: 'amber', desc: 'Small investment – VSD, controls, minor modifications' },
  { id: 'major', label: 'Major Investment', labelTh: 'Major (เปลี่ยนอุปกรณ์ใหญ่)', color: 'red', desc: 'Large capital investment – replace equipment, new systems' },
];

const DEFAULT_DATA = {
  settings: DEFAULT_SETTINGS,
  users: DEFAULT_USERS,
  cats: DEFAULT_CATS,
  factories: DEFAULT_FACTORIES,
  equipments: [],
  inspections: [],
  measures: [],
  reports: []
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
    dashboard_title: "Energy Overview",
    dashboard_subtitle: "Real-time energy consumption and savings",
    dashboard_desc: "Industrial Energy Management System",
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
    stat_savings: "Energy Savings",
    stat_co2: "CO2 Reduction",
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
    dashboard_title: "สรุปศักยภาพการประหยัดพลังงาน",
    dashboard_subtitle: "ภาพรวมโอกาสและผลประหยัดที่ค้นพบจากทุกสาขา",
    dashboard_desc: "ระบบบริหารจัดการพลังงานอุตสาหกรรม",
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
    stat_savings: "พลังงานที่ลดได้",
    stat_co2: "ลดการปล่อย CO2",
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
  const [currentFactoryId, setCurrentFactoryId] = useState(null);

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
    const savedFactory = sessionStorage.getItem('ei_factory');
    if (savedFactory) setCurrentFactoryId(savedFactory);
    
    setIsLoaded(true);
  }, []);

  // Auto-select first assigned factory for non-admin users
  useEffect(() => {
    if (!user || !data.factories) return;
    const accessibleFactories = getAccessibleFactories(data.factories, user);
    if (!currentFactoryId && accessibleFactories.length > 0) {
      setCurrentFactoryId(accessibleFactories[0].id);
    }
  }, [user, data.factories]);

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

  // Helper: get factories accessible to a user
  const getAccessibleFactories = useCallback((factories, u) => {
    if (!u) return [];
    if (u.role === 'admin') return factories || [];
    const assigned = u.assignedFactories || [];
    if (assigned.length === 0) return factories || []; // unassigned = all
    return (factories || []).filter(f => assigned.includes(f.id));
  }, []);

  const setCurrentFactory = (factoryId) => {
    setCurrentFactoryId(factoryId);
    if (factoryId) sessionStorage.setItem('ei_factory', factoryId);
    else sessionStorage.removeItem('ei_factory');
  };

  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem('ei_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setCurrentFactoryId(null);
    sessionStorage.removeItem('ei_user');
    sessionStorage.removeItem('ei_factory');
  };

  // User management (admin only)
  const addUser = (userData) => {
    const newUser = { ...userData, id: 'usr_' + Date.now() };
    saveData({ ...data, users: [...(data.users || DEFAULT_USERS), newUser] });
  };

  const updateUser = (id, userData) => {
    saveData({
      ...data,
      users: (data.users || DEFAULT_USERS).map(u => u.id === id ? { ...u, ...userData } : u)
    });
  };

  const deleteUser = (id) => {
    saveData({
      ...data,
      users: (data.users || DEFAULT_USERS).filter(u => u.id !== id)
    });
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

  const currentFactory = (data.factories || []).find(f => f.id === currentFactoryId) || null;
  const accessibleFactories = getAccessibleFactories(data.factories, user);
  const isAdmin = user?.role === 'admin';

  return (
    <AppContext.Provider value={{
      data, setData: saveData,
      user, login, logout,
      addEquipment, updateEquipment, deleteEquipment,
      addFactory,
      resetDatabase,
      lang, setLang, t,
      currentFactory, currentFactoryId, setCurrentFactory,
      accessibleFactories,
      isAdmin,
      addUser, updateUser, deleteUser,
      getAccessibleFactories,
      DEFAULT_USERS
    }}>
      {children}
    </AppContext.Provider>
  );
};
