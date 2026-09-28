/* =========================================================
   BioTrack seed data — equipment, installation history,
   and stock movements from the Material Details workbook.
   ========================================================= */

const sourceRows = `Lab|Heamatology Analyser||Celtac α|52029|
Lab|Immunolagy Analyser|Bioditech|i Chroma II|IR2SC251782|
Lab|Blood Gas Analyser|Siemens healthcare diagnostics|epoc|TIHI3XR200529|
Lab|Microscope|Labomed|Opti cX|260372184|
Lab|Centrifuge|Remi|R-8C|ZMCN10923|
Lab|Blood Bank|SESS|BBR 60 ECONOMINCA|SPVT/0234/26-27|
Lab|Incubator|Apollo|Apollo Incubator||
Lab|Auto Analyser|Biosystems|BA-200|832001113|
Lab|Electrolyte Analyser|Sensacare|ST200|STAQB-5740|
Lab|Deionizer||Aqua C3||
Lab|Urine Analyser|Hti|CL50+|CL50P003478|
ER|Defibbrilator|Nihon Kohdan|Cardiolife(Tec-5631k)|30347|
ER|ECG Machine|BPL|Cardiart gen X 3i|JWJQ6E4610|
ER|Cardiac Monitor|Nihon Kohdan|Vismo PVM 4000|13893|
ER|Cardiac Monitor|Nihon Kohdan|Vismo PVM 4000|13895|
ER|Cardiac Monitor|Nihon Kohdan|Vismo PVM 4000|19363|
ER|Cardiac Monitor|Nihon Kohdan|Vismo PVM 4000|12738|
ER|Cardiac Monitor|Nihon Kohdan|Vismo PVM 4000|12737|
ER|Surgical Light|Diamond duelex|Jupiter 500|6830|
ER|Vaccum Pump|Kumar Engineering|||
ER|Stethescope|Microtone|||
ER|Syrenge Pump|Helmier|Grasby 2000|2611D1X02808|
Radiology|X-ray Controll panel|Alerio||25L0049|
Radiology|X-ray Tube|Alerio|Maestro 300i|E1239|
Radiology|X-ray Transformer|Alerio||GNR1826172|
Radiology|Mobile X-ray|Alerio|Smat8000|S8K2DX1726060|
Radiology|CT Scan Machine|GE Wipro|Revolution ACTs|20237BG4|
Radiology|DR Cassete|Fuji Flims|||
Radiology|DR Printer|Fuji Flims|DRYPIX||
Echo|ECG Machine|BPL|Cadiart gen X 12 i+|YKB5H1177|
Echo|TMT Machine|BPL|Dynateac ultra|RHJC6F1274|
Dialysis|haemo-dialyzer machine|Fersinus|4008s|6SXA6MJ0|
Dialysis|haemo-dialyzer machine|Fersinus|4008s|6SXA6MJ1|
Dialysis|haemo-dialyzer machine|Fersinus|4008s|6SXA6MJ2|
Dialysis|haemo-dialyzer machine|Fersinus|4008s|6SXA6MHZ|
Dialysis|Cardiac Monitor|BPL|Vivid vue M10|YWJA6A3146|
Dialysis|Cardiac Monitor|BPL|Vivid vue M10|YWJA6A3145|
Dialysis|Cardiac Monitor|BPL|Vivid vue M10|YWJA5M2816|
Dialysis|Cardiac Monitor|BPL|Vivid vue M10||
Dialysis|CBG Machine|G1 Aadvance|AGM-4000|EM25JB01938|
Dialysis|Weight scale|||26D02092|
ICU|Ventilator|Dragger|Savina 300|ASVM-0171|
ICU|Cardiac Monitor|Nihon Kohden|Vismo PVM4000|19364|
ICU|Cardiac Monitor|Nihon Kohden|Vismo PVM4000|19365|
ICU|Cardiac Monitor|Nihon Kohden|Vismo PVM4000|19362|
ICU|Cardiac Monitor|Nihon Kohden|Vismo PVM4000|19366|
ICU|Cardiac Monitor|Nihon Kohden|Vismo PVM4000|13895|
ICU|Defibrilator|Nihon Kohden|Cardiolife (Tec-5631k)|30348|
ICU|Manual BP apparatus|BPL|||
ICU|Stethescope|Microtone|||
ICU|Syrenge Pump|Helmier|Grassby 2000||
CSSD|Heat Sealer|Alapatt|Dingye|8611010125044230|
CSSD|EtO Machine|Alapatt||AMS0095|
CSSD|Autoclave|Alapatt||AMS0107|
Gen-Ward|ECG Machine|BPL|Cardiart gen X 3i|JWJQ6E4488|
Gen-Ward|Syrenge Pump|Helmier|Grasby 2000|2611D1X02806|
Gen-Ward|Manual BP Apparatus|BPL|||
Gen-Ward|Stethescope|Microtone|||
OT|Anesthesia Workstation|Dragger|Fabius+|ASUE-0122|
OT|Cardiac Monitor|Dragger|Vista120|VGSUL0014|
OT|Vaporiser(Sevo)|||ASWE-0309|
OT|Syrenge Pump|Helmier|Graseby 2000|2611D1X02807|
OT|Larengoscope||Fiber Optics||
OT|Larengoscope||Normal||
OT|Surgical Diathermy|Alan|Combi max|1404008|
OT|Surgical Light|Diamond|Diamond Dulex|6833|
OT|OT Table|Benq||2A7512550004|
OT|Toniquet|Diamond|Diamond Toniquet|245|
OT|C-arm Console|Medion Healthcare|Surgix FPD|26F01494|
OT|C-arm|Medion Healthcare|Surgix HQ|26F0421FPD|
OT|Vaporiser(Sevo)|||01050303EN0004|
OT|Anesthesia Workstation|Dragger|Fabius+|USJM-0234|
OT|Cardiac Monitor|Dragger|Vista120|VGSUL0036|
OT Recovery|Cardiac Monitor|BPL|Vismo|13892|
OT Recovery|Cardiac Monitor|BPL|Vismo|12736|
OT Recovery|Manual BP Apparatus|BPL|||
OT Recovery|Stethescope|Microtone|||`;

const keys = ['department', 'name', 'make', 'model', 'serial', 'assetCode'];

const initial = sourceRows.split('\n').map((line, i) =>
  Object.assign({ id: 'seed-' + i },
    Object.fromEntries(keys.map((k, j) => [k, line.split('|')[j] || '']))
  )
);

const installationSeed = `AMS0095|2026-08-25|Installation|Installed with 10 cartridges.|Prithivi|
832001113|2026-07-16|Installation|Installed. Warranty period: 1 year.|Sivaraj Ganesan|
STAQB-5740|2026-07-16|Installation|Installed. Warranty period: 1 year.|Sivaraj Ganesan|
260372184|2026-07-16|Installation|Installed. Warranty period: 1 year.|Sivaraj Ganesan|
ZMCN10923|2026-07-16|Installation|Installed. Warranty period: 1 year.|Sivaraj Ganesan|
TIHI3XR200529|2026-07-16|Installation|Installed. Warranty period: 1 year.|Sivaraj Ganesan|
IR2SC251782|2026-07-16|Installation|Installed. Warranty period: 1 year.|Sivaraj Ganesan|
CL50P003478|2026-07-16|Installation|Installed. Warranty period: 1 year.|Sivaraj Ganesan|
SPVT/0234/26-27|2026-08-14|Installation|Installed. Warranty period: 2 years.|Mani & Selvakumar|
30347|2026-08-12|Installation|Installed. Warranty period: 2 years.|Mahesh Chandran|
30348|2026-08-12|Installation|Installed. Warranty period: 2 years.|Mani & Selvakumar|
13893|2026-08-12|Installation|Installed. Warranty period: 2 years.|Mahesh Chandran|
13895|2026-08-12|Installation|Installed. Warranty period: 2 years.|Mani & Selvakumar|
19363|2026-08-12|Installation|Installed. Warranty period: 2 years.|Mahesh Chandran|
12738|2026-08-12|Installation|Installed. Warranty period: 2 years.|Mani & Selvakumar|
12737|2026-08-12|Installation|Installed. Warranty period: 2 years.|Mahesh Chandran|
19364|2026-08-12|Installation|Installed. Warranty period: 2 years.|Mani & Selvakumar|
19365|2026-08-12|Installation|Installed. Warranty period: 2 years.|Mahesh Chandran|
19362|2026-08-12|Installation|Installed. Warranty period: 2 years.|Mani & Selvakumar|
19366|2026-08-12|Installation|Installed. Warranty period: 2 years.|Mahesh Chandran|
13892|2026-08-12|Installation|Installed. Warranty period: 2 years.|Mahesh Chandran|`;

const stockSeed = `received|Infusion Pressure Bag 500ml|1|Medic India|2026-08-12|
received|Infusion Pressure Bag 1000ml|1|Medic India|2026-08-12|
received|Manual BP Apparatus|20|Medic India|2026-08-12|
received|Adult Stethescope|20|Medic India|2026-08-19|
received|Pediatric Stethescope|4|Medic India|2026-08-19|
received|500ml Pressure bag|2|Medic India|2026-08-12|
received|Pulse-oximeter|1|Medic India|2026-08-12|
received|Sucction Apparatus Portable|2|Medic India|2026-08-12|
received|M10 Cardiac Monitors|4|BPL|2026-08-13|
received|BPL Nebulizer|5|Medic India|2026-08-15|
received|Knee Hammer|9|Medic India|2026-08-24|
received|Vein Detector|1|Medic India|2026-08-15|
received|Fiber optic Laryngoscope|2|Medic India|2026-08-18|
received|Laryngoscope Adult|6|Medic India|2026-08-18|
received|POP cutting scissors|5|Medic India|2026-08-23|
received|Plaster cutting electric|1|Medic India|2026-08-23|
received|EtO Sterilizer Machine|1|Alapatt Medical System|2026-08-25|Mr. Fransisco
received|Baby Rescitator|1|Credence Global Devices|2026-08-26|Mr. Venket
received|Infant Radiant Warmer|4|Credence Global Devices|2026-08-26|Mr. Venket
received|Phototherapy|3|Credence Global Devices|2026-08-26|Mr. Venket
received|CPAP|1|Credence Global Devices|2026-08-26|Mr. Venket
received|Syringe Pump|15|M.M Systems|2026-08-07|
issued|Manual BP Apparatus|1|ICU|2026-08-12|Revathi
issued|Stethescope|1|ICU|2026-08-12|Revathi
issued|Manual BP Apparatus|1|ER|2026-08-12|
issued|Stethescope|2|ER|2026-08-12|
issued|500ml Pressure bag|1|OT- Recovery|2026-08-13|Sivaprasad
issued|Infusion Pressure Bag 1000ml|1|OT- Recovery|2026-08-13|Sivaprasad
issued|Pulse-oximeter|1|Cardiac OP|2026-08-13|Rajeshwari
issued|Sucction Apparatus Portable|1|ER|2026-08-13|Inba
issued|BPL Nebulizer|1|ER|2026-08-15|Inba
issued|Knee Hammer|4|ER|2026-08-25|Pandiyan
issued|Vein Detector|1|Lab|2026-08-25|Sudhakar
issued|POP cutting scissors|4|ICU|2026-08-24|Divya
issued|Plaster cutting electric|1|Ortho- OP|2026-08-23|Divya
issued|Infant Radiant Warmer|4|NICU|2026-08-29|Archana
issued|Phototherapy|3|NICU|2026-08-29|Archana
issued|CPAP|1|NICU|2026-08-29|Archana`;

/* Export to window so app.js and others can use them */
window.BioTrackData = {
  sourceRows, keys, initial, installationSeed, stockSeed,
  buildStock: () => stockSeed.split('\n').filter(Boolean).map((line, i) => {
    const [direction, product, quantity, party, date, note] = line.split('|');
    return { id: 'stock-' + i, direction, product, quantity: Number(quantity), party, date, note };
  }),
  buildHistory: (equipment) => installationSeed.split('\n').filter(Boolean).map((line, i) => {
    const [serial, date, type, details, provider, nextDue] = line.split('|');
    const eq = equipment.find(x => x.serial === serial);
    return eq ? { id: 'install-' + i, equipmentId: eq.id, date, type, details, provider, nextDue } : null;
  }).filter(Boolean)
};