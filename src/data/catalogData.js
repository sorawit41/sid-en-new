export const RECOMMENDATIONS = {
  chiller: [
    { id: 'rec_ch_1', brand: 'Daikin', model: 'Magnitude WZH', spec: '0.48 kW/TR (COP 7.3)', costEst: 4500000, efficiency: 0.48, desc: 'Magnetic bearing oil-free centrifugal chiller, maximum part-load efficiency.', energyType: 'elec', image: '/catalog/rec_ch_1.png' },
    { id: 'rec_ch_2', brand: 'York', model: 'YMC2 Centrifugal', spec: '0.49 kW/TR (COP 7.2)', costEst: 4200000, efficiency: 0.49, desc: 'Magnetic bearing centrifugal chiller with integrated VSD.', energyType: 'elec', image: '/catalog/rec_ch_2.png' },
    { id: 'rec_ch_3', brand: 'Carrier', model: '19DV AquaEdge', spec: '0.52 kW/TR (COP 6.8)', costEst: 3800000, efficiency: 0.52, desc: 'Centrifugal chiller using low-GWP R-1233zd(E) refrigerant.', energyType: 'elec', image: '/catalog/rec_ch_3.png' },
    { id: 'rec_ch_4', brand: 'Trane', model: 'CVHE CenTraVac', spec: '0.55 kW/TR (COP 6.4)', costEst: 3500000, efficiency: 0.55, desc: 'High-efficiency multi-stage water-cooled centrifugal chiller.', energyType: 'elec', image: '/catalog/rec_ch_4.png' }
  ],
  compressor: [
    { id: 'rec_cp_1', brand: 'Atlas Copco', model: 'GA 75 VSD+', spec: 'Specific Energy: 5.6 kW/(m³/min)', costEst: 1200000, desc: 'Permanent magnet motor variable speed drive oil-injected rotary screw compressor.', efficiency: 5.6, energyType: 'elec', image: '/catalog/rec_cp_1.png' },
    { id: 'rec_cp_2', brand: 'Ingersoll Rand', model: 'Nirvana VSD', spec: 'Specific Energy: 5.8 kW/(m³/min)', costEst: 1100000, desc: 'VSD rotary screw air compressor with high-efficiency hybrid PM motor.', efficiency: 5.8, energyType: 'elec', image: '/catalog/rec_cp_2.png' },
    { id: 'rec_cp_3', brand: 'Sullair', model: 'LS 90 VSD', spec: 'Specific Energy: 6.1 kW/(m³/min)', costEst: 950000, desc: 'Rotary screw air compressor with electronic spiral valve part-load control.', efficiency: 6.1, energyType: 'elec', image: '/catalog/rec_cp_3.png' }
  ],
  pump: [
    { id: 'rec_pm_1', brand: 'Grundfos', model: 'CR 45 VSD', spec: 'Pump Eff: 84%, VSD Equipped', costEst: 320000, desc: 'Vertical multistage centrifugal pump with integrated variable frequency drive.', efficiency: 0.84, energyType: 'elec', image: '/catalog/rec_pm_1.png' },
    { id: 'rec_pm_2', brand: 'Ebara', model: '3M End Suction', spec: 'Pump Eff: 81%', costEst: 180000, desc: 'Stainless steel end suction centrifugal water pump with high-efficiency motor.', efficiency: 0.81, energyType: 'elec', image: '/catalog/rec_pm_2.png' },
    { id: 'rec_pm_3', brand: 'Lowara', model: 'e-NSC Series', spec: 'Pump Eff: 82%', costEst: 200000, desc: 'High-efficiency space-saving end-suction centrifugal pump.', efficiency: 0.82, energyType: 'elec', image: '/catalog/rec_pm_3.png' }
  ],
  boiler: [
    { id: 'rec_bl_1', brand: 'Miura', model: 'LX-200 Once-Through', spec: 'Thermal Eff: 87%', costEst: 2800000, desc: 'Once-through steam boiler, fast steam generation, compact vertical layout.', efficiency: 0.87, energyType: 'heat', image: '/catalog/rec_bl_1.png' },
    { id: 'rec_bl_2', brand: 'Cleaver-Brooks', model: 'CBE Firetube', spec: 'Thermal Eff: 85%', costEst: 2400000, desc: 'High-efficiency firetube steam boiler with low-NOx burner integration.', efficiency: 0.85, energyType: 'heat', image: '/catalog/rec_bl_2.png' },
    { id: 'rec_bl_3', brand: 'Fulton', model: 'FB-F Tubeless', spec: 'Thermal Eff: 83%', costEst: 1900000, desc: 'Vertical tubeless steam boiler, space-saving design, robust construction.', efficiency: 0.83, energyType: 'heat', image: '/catalog/rec_bl_3.png' }
  ],
  cooling: [
    { id: 'rec_ct_1', brand: 'Marley', model: 'NC 8410', spec: 'Crossflow, Low Fan Power', costEst: 650000, desc: 'Induced draft crossflow cooling tower, maximum performance density.', efficiency: 1.0, energyType: 'elec', image: '/catalog/rec_ct_1.png' },
    { id: 'rec_ct_2', brand: 'Liang Chi', model: 'LBC Counterflow', spec: 'Counterflow, FRP Casing', costEst: 420000, desc: 'Induced draft counterflow bottle-type cooling tower, high durability.', efficiency: 1.0, energyType: 'elec', image: '/catalog/rec_ct_2.png' }
  ],
  electrical: [
    { id: 'rec_el_1', brand: 'ABB', model: 'EcoDry Ultra', spec: 'Ultra Low Losses (Amorphous)', costEst: 1500000, desc: 'Amorphous core distribution transformer, up to 70% reduction in no-load losses.', efficiency: 0.99, energyType: 'elec', image: '/catalog/rec_el_1.png' }
  ]
};
