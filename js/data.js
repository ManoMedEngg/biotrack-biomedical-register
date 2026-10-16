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

const stockSheetSeed = `3|JK Biomed|||Centrifuge|1|
4|JK Biomed|||Immunology Analyser|1|
5|JK Biomed|||Blood gas analyser|1|
6|JK Biomed|||Microscope|1|
7|JK Biomed|||Incubator|1|
8|JK Biomed|||Electrolyte Analyser|1|
9|JK Biomed|||Fully Auto Biochemistry Analyser|1|
10|JK Biomed|||Urine Analyser|1|12-08-2026
11|Sri Easwari Scientific Solution|||Blood Bank refridgerator|1|
12||||O2 Flow Sensor|5|
13|MM Medicals|Mr. Surendhar|9840090635|Defibrillator|2|
14|MM Medicals|Mr. Surendhar|9840090635|Syringe Pump|5|
15|Medic India|Mr. Rahul|9047989273|Manual BP Apparatus|20|12-08-2026
16|Medic India|Mr. Rahul|9047989273|Adult Stethescope|8|12-08-2026
17|Medic India|Mr. Rahul|9047989273|Pediotric Stethescope|1|12-08-2026
19|Medic India|Mr. Rahul|9047989273|Finguretip Oximeter|1|12-08-2026
20|Medic India|Mr. Rahul|9047989273|X-ray lobby|3|12-08-2026
21|Medic India|Mr. Rahul|9047989273|Sucction Apparatus Portable|1|12-08-2026
22|Medic India|Mr. Rahul|9047989273|Pediotric Laryngoscope|3|01-09-2026
23|BET Medicals|||OT Table||12-08-2026
24|BET Medicals|||OT Lights|1|12-08-2026
25|Dragger|Mr. Chakrabani|9600073456|Anasthesia work station with Monitor|2|12-08-2026
26|Medic India|Mr. Rahul|9047989273|1000ml Pressure bag|1|13-08-2026
26|Medic India|Mr. Rahul|9047989273|500ml Pressure bag|3|13-08-2026
27|Medic India|Mr. Rahul|9047989273|M10 Cardiac Monitors|4|13-08-2026
28|Medic India|Mr. Rahul|9047989273|ECG Machine|1|13-08-2026
29|Medic India|Mr. Rahul|9047989273|Weight Scale Digital|2|15-08-2026
30|Medic India|Mr. Rahul|9047989273|BPL Nebulizer|5|15-08-2026
31|Medic India|Mr. Rahul|9047989273|Knee Hammer|4|15-08-2026
32|Medic India|Mr. Rahul|9047989273|Vein Detector|1|15-08-2026
33|Medic India|Mr. Rahul|9047989273|Fiber optic Laryngoscope|2|18-08-2026
34|Medic India|Mr. Rahul|9047989273|Adult Laryngoscope|6|18-08-2026
35|MM Medicals|Mr. Surendhar|9840090635|Monitor Trolly|2|19-08-2026
36|MM Medicals|Mr. Surendhar|9840090635|Monitor Wall mount stand|5|19-08-2026
37|Medic India|Mr. Rahul|9047989273|Adult Stethescope|12|19-08-2026
38|Medic India|Mr. Rahul|9047989273|Pediotric Stethescope|3|19-08-2026
39|Medic India|Mr. Rahul|9047989273|Weight Scale Digital|2|23-08-2026
40|Medic India|Mr. Rahul|9047989273|POP cutting scissors|5|23-08-2026
41|Medic India|Mr. Rahul|9047989273|Plaster cutting electric|1|23-08-2026
42|Medic India|Mr. Rahul|9047989273|plaster preger cutter|1|23-08-2026
43|Medic India|Mr. Rahul|9047989273|Knee Hammer|5|24-08-2026
44|Alapatt Medical System|Mr. Fransisco(MD)|9746639542|EtO Sterilizer Machine|1|25-08-2026
45|Credence Global Devices and Solutions|Mr. Venket|8939103040|Baby Rescitator|1|26-08-2026
46|Credence Global Devices and Solutions|Mr. Venket|8939103040|Infant Radiant Warmer|4|26-08-2026
47|Credence Global Devices and Solutions|Mr. Venket|8939103040|Phototherapy|3|26-08-2026
48|Credence Global Devices and Solutions|Mr. Venket|8939103040|Bottom Surface Phototheraphy|1|26-08-2026
49|Credence Global Devices and Solutions|Mr. Venket|8939103040|Infant Bassient|6|26-08-2026
50|Credence Global Devices and Solutions|Mr. Venket|8939103040|CPAP|1|26-08-2026
51|MM Medicals|Mr. Surendhar|9840090635|Patient Warmmer with Blanket|1|29-08-2026
52|Pain Care Systems|Mr. Senthil Kumar|8870444955|Vectrodyne IFT|1|29-08-2026
53|Pain Care Systems|Mr. Senthil Kumar|8870444955|Ultrasound Diathermy|1|29-08-2026
54|Pain Care Systems|Mr. Senthil Kumar|8870444955|Muscel Stimulator|1|29-08-2026
55|Pain Care Systems|Mr. Senthil Kumar|8870444955|Traction Machine|1|29-08-2026
56|Pain Care Systems|Mr. Senthil Kumar|8870444955|Continous passive motion|1|29-08-2026
57|MM Medicals|Mr. Surendhar|9840090635|Cardiac Monitor PVM4761|4|07-08-2026
58|MM Medicals|Mr. Surendhar|9840090635|Cardiac Monitor PVM4763|2|07-08-2026
59|MM Medicals|Mr. Surendhar|9840090635|Standard Accessories|6|07-08-2026
60|MM Medicals|Mr. Surendhar|9840090635|Cardiac Monitor BSM series|1|07-08-2026
61|MM Medicals|Mr. Surendhar|9840090635|Standard Accessories|1|07-08-2026
62|MM Medicals|Mr. Surendhar|9840090635|Mainstream CO2 sensor kit|2|07-08-2026
63|MM Medicals|Mr. Surendhar|9840090635|Syringe Pump|15|07-08-2026
64|Medic India|Mr. Rahul|9047989273|Adult Laryngoscope|3|07-08-2026
65|MM Medicals|Mr. Surendhar|9840090635|Patient Warmmer with Blanket|2|09-08-2026
66|Peacock Hospital|||Mobile IV Stand|4|10-09-2026
67|Peacock Hospital|||Sucction Apparatus Portable|1|10-09-2026
68|Medic India|Mr. Rahul|904789273|X-ray lobby|5|24-09-2026
69|Medic India|Mr. Rahul|9047989273|Mccoy Blade size-3|2|25-09-2026
70|Medic India|Mr. Rahul|9047989273|Mccoy Blade size-4|2|25-09-2026
71|Medic India|Mr. Rahul|9047989273|Skin Stapler remover|2|25-09-2026
72|Medic India|Mr. Rahul|9047989273|Suture remover|2|25-09-2026
73|Peacock Hospital|||Room Humidifier|5|27-09-2026
74|Peacock Hospital|||Fridge temperature unit|5|27-09-2026
75|MM Medicals|Mr. Surendhar|9840090635|Cardiac Monitor PVM4763|1|03-10-2026
76|MM Medicals|Mr. Surendhar|9840090635|Mainstream CO2 sensor kit|2|03-10-2026`;

/* Export to window so app.js and others can use them */
window.BioTrackData = {
  sourceRows, keys, initial, installationSeed, stockSeed, stockSheetSeed,
  buildStock: () => stockSeed.split('\n').filter(Boolean).map((line, i) => {
    const [direction, product, quantity, party, date, note] = line.split('|');
    return { id: 'stock-' + i, direction, product, quantity: Number(quantity), party, date, note };
  }),
  buildSheetStock: () => stockSheetSeed.split('\n').filter(Boolean).map((line, index) => {
    const [row, party, contactPerson, contactNumber, product, quantity, date] = line.split('|');
    const [, day, month, year] = (date || '').match(/^(\d{2})-(\d{2})-(\d{4})$/) || [];
    return {
      id: `sheet-stock-${row}-${index + 1}`,
      direction: 'received',
      product,
      quantity: quantity ? Number(quantity) : 0,
      party,
      contactPerson,
      contactNumber,
      date: date ? `${year}-${month}-${day}` : '',
      note: quantity ? '' : 'Quantity not recorded in source sheet'
    };
  }),
  buildHistory: (equipment) => installationSeed.split('\n').filter(Boolean).map((line, i) => {
    const [serial, date, type, details, provider, nextDue] = line.split('|');
    const eq = equipment.find(x => x.serial === serial);
    return eq ? { id: 'install-' + i, equipmentId: eq.id, date, type, details, provider, nextDue } : null;
  }).filter(Boolean)
};