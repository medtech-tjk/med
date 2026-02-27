"""
Полный набор фильтров для всех категорий товаров медицинского оборудования.
Согласно документу "Сайт медлига каталог.docx"
Slug ключи соответствуют slug подкатегорий в базе данных.
Английская версия для интернационализации.
"""

CATEGORY_SPECS = {
    # ===== ULTRASOUND DIAGNOSTICS =====
    'uzi-devices': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Type', 'options': ['Portable', 'Stationary', 'Tablet']},
        {'key': 'Class', 'options': ['Entry', 'Medium', 'High', 'Expert', 'Premium']},
        {'key': 'Application Area', 'options': ['Abdominal', 'Obstetrics', 'Angiology', 'Pediatrics', 'Urology', 'General Imaging', 'Cardiology', 'Gynecology', 'Veterinary', 'Mammology', 'Pregnancy', 'Liver Studies']},
        {'key': 'Number of Probe Connectors', 'options': ['1', '2', '3', '4', '5', '1(3-optional)', '3 (4-optional)']},
        {'key': 'Segment', 'options': ['Public', 'Private']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'uzi-probes': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Probe Type', 'options': ['Monocrystalline', 'Linear', 'Convex', 'Microconvex', 'Phased Array', 'Intracavitary', 'Pencil', 'Transesophageal', 'Doppler', '3D', 'Transrectal', 'Transvaginal']},
        {'key': 'Application Area', 'options': ['Abdominal', 'Angiology', 'Pregnancy', 'Gynecology and Obstetrics', 'Cardiology', 'Laparoscopy', 'Small Organs and Superficial Structures', 'Neurology', 'Neurosonography', 'Pediatrics', 'Musculoskeletal System', 'Transcranial Studies', 'Urology', 'Surgery (Intraoperative)']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'uzi-carts': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'uzi-printers': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'densitometers': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],

    # ===== FLEXIBLE ENDOSCOPY =====
    'video-endoscopy': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Image Size', 'options': ['4K', 'HD', 'Full HD']},
        {'key': 'Light Source', 'options': ['Built-in', 'Separate Unit']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'endoscope-cabinets': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Number of Endoscopes', 'options': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'endoscope-washers': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'endo-insufflators': [
        {'key': 'Brand', 'type': 'input', 'options': []},
    ],
    'endo-aspirators': [
        {'key': 'Brand', 'type': 'input', 'options': []},
    ],
    'endo-pumps': [
        {'key': 'Brand', 'type': 'input', 'options': []},
    ],
    'water-containers': [
        {'key': 'Brand', 'type': 'input', 'options': []},
    ],
    'leak-testers': [
        {'key': 'Brand', 'type': 'input', 'options': []},
    ],
    'examination-tables': [
        {'key': 'Brand', 'type': 'input', 'options': []},
    ],
    'video-processors': [
        {'key': 'Brand', 'type': 'input', 'options': []},
    ],
    'light-sources': [
        {'key': 'Brand', 'type': 'input', 'options': []},
    ],
    'endoscopy-monitors': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Diagonal', 'options': ['19', '21', '23.8', '24', '27', '32']},
        {'key': 'Resolution', 'options': ['HD', 'Full HD', '4K']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'endoscopes': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Endoscope Type', 'options': ['Fiberscope', 'Video Endoscope']},
        {'key': 'Distal End Diameter', 'options': ['1 mm', '2 mm', '3 mm', '4 mm', '5 mm', '6 mm']},
        {'key': 'Instrument Channel Diameter', 'options': ['2.6 mm', '2.7 mm']},
        {'key': 'Depth of Field', 'options': ['1-50 mm', '2-100 mm', '2-50 mm', '3-100 mm', '3-200 mm', '3-50 mm']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'endo-carts': [
        {'key': 'Brand', 'type': 'input', 'options': []},
    ],

    # ===== RIGID ENDOSCOPY =====
    'endoscopy-racks': [
        {'key': 'Purpose', 'options': ['Abdominal Surgery', 'Arthroscopy', 'Gynecology', 'Dermatology', 'ENT Surgery', 'General Surgery', 'Otolaryngology', 'Proctology', 'Rhinoscopy', 'Urology', 'Endoscopic Gynecology', 'Endoscopic Urology']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'rigid-video-processors': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'endoscope-illuminators': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'rigid-monitors': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'electrosurgical-blocks': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'rigid-insufflators': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'rigid-aspirators': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'surgery-pumps': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'mobile-carts': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],

    # ===== RADIOLOGY =====
    'xray': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Receiver Type', 'options': ['Digital', 'Analog']},
        {'key': 'Number of Workstations', 'options': ['1', '2', '3']},
        {'key': 'Emitter Mounting', 'options': ['Floor', 'Ceiling', 'Floor-Ceiling', 'U-arm']},
        {'key': 'Remote Controlled', 'options': ['Yes', 'No']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'ward-xray': [
        {'key': 'Brand', 'type': 'input', 'options': []},
    ],
    'portable-xray': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'c-arm': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Receiver Type', 'options': ['Analog', 'Dynamic Detector', 'URI', 'Digital']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'mammographs': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Receiver Type', 'options': ['Analog', 'Dynamic Detector']},
        {'key': 'Compression Type', 'options': ['Motorized', 'Manual']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'fluorographs': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Digital Receiver Type', 'options': ['Flat Panel Detector', 'CCD-based Receiver']},
        {'key': 'Stand Design', 'options': ['Without X-ray Protective Cabin', 'With X-ray Protective Cabin']},
        {'key': 'Working Field Size (cm)', 'options': ['39x39', '40x40', '41x41', '42.3x42.3', '42.77x42.7', '42x42', '43x43', '44x44']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'angiographs': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'C-arm Mounting Type', 'options': ['Floor', 'Ceiling']},
        {'key': 'Angiography Type', 'options': ['Biplane', 'Single Plane']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'ct-scanners': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Number of Physical Slices', 'options': ['10', '16', '24', '32', '40', '64', '80', '128', '256', '320', '2x128', '2x144', '2x192']},
        {'key': 'Maximum Number of Slices', 'options': ['16', '32', '64', '128', '160', '256', '320', '384', '512', '640', '2x144', '2x384', '2x576']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'nuclear-medicine': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Receiver Type', 'options': ['Analog', 'Dynamic Detector', 'URI', 'Digital']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'xray-densitometers': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Densitometer Type', 'options': ['X-ray']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],

    # ===== ANESTHESIOLOGY AND RESUSCITATION =====
    'ventilators': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Drive', 'options': ['Manual', 'Pneumatic', 'Turbine', 'Hybrid']},
        {'key': 'Device Type', 'options': ['Portable', 'Stationary', 'Transport']},
        {'key': 'Patients', 'options': ['Infants', 'Neonates', 'Adults', 'Children']},
        {'key': 'Ventilation Mode', 'options': ['Invasive', 'Non-invasive', 'Non-invasive (optional)']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'anesthesia-machines': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Class', 'options': ['Entry', 'Medium', 'High', 'Expert', 'Premium']},
        {'key': 'Drive Type', 'options': ['Pneumatic', 'Electric']},
        {'key': 'Circuit', 'options': ['Closed', 'Semi-open/Semi-closed']},
        {'key': 'Rotameters', 'options': ['Mechanical', 'Mechanical Rotameters with Graphic Chart', 'Electronic']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'sedation': [
        {'key': 'Brand', 'type': 'input', 'options': []},
    ],
    'patient-monitors': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Screen', 'options': ['2.5', '3.5', '5', '5.5', '6', '6.1', '6.2', '7', '9', '10.1', '12', '12.1', '12.6', '15', '15.6', '18.5', '19', '22']},
        {'key': 'Monitor Type', 'options': ['Compact', 'Portable', 'Stationary', 'Transport']},
        {'key': 'Monitor Form Factor', 'options': ['Modular', 'All-in-One']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'infusion-pumps': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Equipment Type', 'options': ['Infusion Stand', 'Volumetric Stand', 'Infusion Station', 'Syringe Pump']},
        {'key': 'Number of Infusion Modes', 'options': ['1', '2', '3', '4', '5', '6', '9', '10', '11', '12']},
        {'key': 'Syringe Volume (ml)', 'options': ['1', '2', '2/3', '3', '5', '5/6', '10', '10/12', '20', '30', '30/35', '50', '50/60', '60']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'defibrillators': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Line', 'options': ['BeneHeart D', 'BeneHeart C']},
        {'key': 'Energy Range (J)', 'options': ['1-360', '10-360', '360', '5-200', '5-30', '50-200']},
        {'key': 'Defibrillation Type', 'options': ['Automatic', 'Semi-automatic', 'Manual']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'oxygen-concentrators': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'incubators': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],

    # ===== SURGICAL EQUIPMENT =====
    'tables': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Construction Type', 'options': ['Mobile', 'Stationary', 'Floor', 'Column']},
        {'key': 'Purpose', 'options': ['General Surgery', 'Laparoscopy', 'Orthopedics', 'Neurosurgery', 'Urology', 'Gynecology', 'Traumatology']},
        {'key': 'Radiolucent', 'options': ['Yes', 'Partial', 'No']},
        {'key': 'Radiolucent Zone', 'options': ['Head', 'Pelvic', 'Full']},
        {'key': 'Tabletop Type', 'options': ['Sectional', 'Monolithic']},
        {'key': 'Tabletop Material', 'options': ['Carbon', 'Composite', 'Metal']},
        {'key': 'Number of Sections', 'options': ['4', '5', '6', '7', '8']},
        {'key': 'Height Adjustment', 'options': ['Electric', 'Hydraulic', 'Mechanical']},
        {'key': 'C-arm Compatibility', 'options': ['Yes', 'No']},
        {'key': 'Rails', 'options': ['Yes', 'No']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'surgical-lights': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Mounting Type', 'options': ['Ceiling', 'Wall', 'Mobile']},
        {'key': 'Number of Domes', 'options': ['1', '2', '3']},
        {'key': 'Light Type', 'options': ['Main', 'Auxiliary']},
        {'key': 'Light Source', 'options': ['LED']},
        {'key': 'Color Temperature Adjustment', 'options': ['Yes', 'No']},
        {'key': 'Video Camera', 'options': ['Yes', 'No']},
        {'key': 'Control Type', 'options': ['Touch', 'Button', 'Contactless']},
        {'key': 'Sterilizable Handles', 'options': ['Yes', 'No']},
        {'key': 'Backup Power', 'options': ['Yes', 'No']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'surgical-pendants': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Type', 'options': ['Single Arm', 'Double Arm', 'Multi-arm']},
        {'key': 'Purpose', 'options': ['Surgical', 'Anesthesia', 'Combined']},
        {'key': 'Gas Types', 'options': ['Oxygen', 'Vacuum', 'Air', 'Nitrous Oxide']},
        {'key': 'Interfaces', 'options': ['LAN', 'HDMI', 'USB']},
        {'key': 'Brake System', 'options': ['Electromagnetic', 'Mechanical']},
        {'key': 'Monitor Compatibility', 'options': ['Yes', 'No']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'surgical-aspirators': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Type', 'options': ['Electric', 'Vacuum', 'Portable']},
        {'key': 'Number of Jars', 'options': ['1', '2']},
        {'key': 'Usage Type', 'options': ['Operating Room', 'Ward', 'Outpatient']},
        {'key': 'Filtration', 'options': ['Bacterial Filter', 'HEPA']},
        {'key': 'Power Supply', 'options': ['220V', 'Battery']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'electrosurgical': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Type', 'options': ['Monopolar', 'Bipolar', 'Combined']},
        {'key': 'Cutting Modes', 'options': ['Pure', 'Blended', 'Pulsed']},
        {'key': 'Coagulation Modes', 'options': ['Contact', 'Spray']},
        {'key': 'Automatic Tissue Control', 'options': ['Yes', 'No']},
        {'key': 'Argon Plasma Coagulation', 'options': ['Yes', 'No']},
        {'key': 'Control Type', 'options': ['Button', 'Foot Pedal']},
        {'key': 'Purpose', 'options': ['General Surgery', 'Laparoscopy', 'Gynecology', 'Urology']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'surgical-microscopes': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Type', 'options': ['Floor', 'Ceiling', 'Wall']},
        {'key': 'Purpose', 'options': ['Neurosurgery', 'ENT', 'Ophthalmology', 'Dentistry']},
        {'key': 'Optics Type', 'options': ['Apochromatic']},
        {'key': 'Illumination', 'options': ['Xenon', 'LED']},
        {'key': 'Balance System', 'options': ['Yes', 'No']},
        {'key': 'Built-in Video Camera', 'options': ['Yes', 'No']},
        {'key': 'Image Recording', 'options': ['Yes', 'No']},
        {'key': 'Control', 'options': ['Manual', 'Foot']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'surgical-cameras': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Resolution', 'options': ['HD', 'Full HD', '4K']},
        {'key': 'Sensor Type', 'options': ['CMOS']},
        {'key': 'Mounting', 'options': ['Integrated', 'External']},
        {'key': 'Autofocus', 'options': ['Yes', 'No']},
        {'key': 'Interfaces', 'options': ['HDMI', 'SDI', 'LAN']},
        {'key': 'Video Recording', 'options': ['Yes', 'No']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'ultrasonic-surgery': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Type', 'options': ['Ultrasonic Scalpel']},
        {'key': 'Instrument Type', 'options': ['Disposable', 'Reusable']},
        {'key': 'Purpose', 'options': ['General Surgery', 'Laparoscopy', 'Gynecology']},
        {'key': 'Temperature Control', 'options': ['Yes', 'No']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'surgical-insufflators': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Gas Type', 'options': ['CO₂']},
        {'key': 'Modes', 'options': ['Standard', 'High Flow']},
        {'key': 'Gas Heating', 'options': ['Yes', 'No']},
        {'key': 'Automatic Overpressure Protection', 'options': ['Yes', 'No']},
        {'key': 'Control Type', 'options': ['Touch']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'surgical-lasers': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Laser Type', 'options': ['Diode', 'CO₂', 'Nd:YAG']},
        {'key': 'Modes', 'options': ['Continuous', 'Pulsed']},
        {'key': 'Purpose', 'options': ['Surgery', 'ENT', 'Gynecology', 'Dermatology']},
        {'key': 'Delivery Type', 'options': ['Fiber', 'Manipulator']},
        {'key': 'Cooling', 'options': ['Air', 'Liquid']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'dressing-tables': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Type', 'options': ['Stationary', 'Mobile']},
        {'key': 'Surface Material', 'options': ['Stainless Steel', 'Composite']},
        {'key': 'Height Adjustment', 'options': ['Yes', 'No']},
        {'key': 'Drawers', 'options': ['Yes', 'No']},
        {'key': 'Wheels with Brakes', 'options': ['Yes', 'No']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'surgical-navigation': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Purpose', 'options': ['Neurosurgery', 'Orthopedics', 'ENT']},
        {'key': 'Navigation Type', 'options': ['Optical', 'Electromagnetic']},
        {'key': 'CT/MRI Compatibility', 'options': ['Yes', 'No']},
        {'key': 'Microscope Integration', 'options': ['Yes', 'No']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'smoke-evacuators': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Filter Type', 'options': ['HEPA', 'ULPA', 'Carbon']},
        {'key': 'Application Type', 'options': ['Operating Room', 'Laser Surgery']},
        {'key': 'Automatic Start', 'options': ['Yes', 'No']},
        {'key': 'Mounting Type', 'options': ['Mobile']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'table-accessories': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Accessory Type', 'options': ['Headrest', 'Limb Holder', 'Straps', 'Armrests']},
        {'key': 'Radiolucent', 'options': ['Yes', 'No']},
        {'key': 'Sterilizable', 'options': ['Yes', 'No']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],

    # ===== ENT EQUIPMENT =====
    'lor-combines': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Design Type', 'options': ['Stationary', 'Mobile']},
        {'key': 'Configuration', 'options': ['Basic', 'Extended']},
        {'key': 'Purpose', 'options': ['Diagnostic', 'Therapeutic']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'lor-chairs': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Type', 'options': ['Diagnostic', 'Procedural']},
        {'key': 'Drive', 'options': ['Electric', 'Hydraulic', 'Mechanical']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'lor-video': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Resolution', 'options': ['HD', 'Full HD', '4K']},
        {'key': 'Type', 'options': ['Modular', 'All-in-One']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'lor-endoscopes': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'lor-accessories': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'echosinuscopes': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'headlights': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'lor-massagers': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'lor-ultrasound': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'sterilization-cases': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'ir-emitters': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'lor-nebulizers': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'lor-microscopes': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'lor-ehvch': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'lor-aspirators': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'lor-irrigators': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'laryngostroboscopes': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'lor-smoke-evacuators': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'vestibular-systems': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],

    # ===== MRI =====
    'mri-machines': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Device Type', 'options': ['Closed', 'Open']},
        {'key': 'Magnetic Field Strength (T)', 'options': ['0.2', '0.35', '0.4', '0.5', '1.0', '1.5', '3.0']},
        {'key': 'Magnet Type', 'options': ['Permanent', 'Superconducting']},
        {'key': 'Purpose', 'options': ['Clinical', 'Diagnostic']},
        {'key': 'Segment', 'options': ['Public', 'Private']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'mri-coils': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Coil Type', 'options': ['Head', 'Neck', 'Spine', 'Knee', 'Abdominal', 'Cardiac', 'Universal']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'mri-accessories': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],

    # ===== GYNECOLOGY =====
    'chairs': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Drive Type', 'options': ['Electric', 'Hydraulic', 'Mechanical', 'Gas Springs', 'Pneumatic', 'Electromechanical']},
        {'key': 'Number of Drives', 'options': ['1', '2', '3', '4']},
        {'key': 'Adjustment Method', 'options': ['Foot Pedal', 'Control Panel', 'Manual']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'colposcopes': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Type', 'options': ['Digital', 'Binocular']},
        {'key': 'Stand Type', 'options': ['Console', 'Floor/Mobile', 'Straight', 'Cart']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'fetal-monitors': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Number of Fetuses', 'options': ['1', '2']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'gyn-aspirators': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'gyn-ehvch': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'gyn-lights': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'gyn-ultrasound': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'gyn-lasers': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'gyn-combines': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'obstetric-beds': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'gyn-tables': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],

    # ===== REHABILITATION =====
    'mechanotherapy': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Rehabilitation Type', 'options': ['Passive', 'Active', 'Mixed']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'verticalizers': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'patient-lifts': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'kinesiotherapy': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'exoskeletons': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'vr-rehab': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'spine-traction': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'body-correction': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],

    # ===== PHYSIOTHERAPY =====
    'uvt': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'magnetotherapy': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'laser-therapy': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'pressotherapy': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'microwave-therapy': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'electrotherapy': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'ultrasound-therapy': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'diathermy': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],

    # ===== FUNCTIONAL DIAGNOSTICS =====
    'ecg': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Number of Channels', 'options': ['3', '6', '12']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'pulse-oximeters': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'spirometers': [
        {'key': 'Brand', 'type': 'input', 'options': []},
    ],

    # ===== LABORATORY DIAGNOSTICS =====
    'biochemistry-analyzers': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Type', 'options': ['Automatic', 'Semi-automatic']},
        {'key': 'Throughput per Hour', 'options': ['10-100', '100-500', '500-1000', '1000-5000', '5000-10000']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'hematology-analyzers': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Operation Mode', 'options': ['Closed Tube', 'Open Tube']},
        {'key': 'Leukocyte Differentiation', 'options': ['3 Subpopulations', '5 Subpopulations']},
        {'key': 'Throughput per Hour', 'options': ['30-60', '60-100', '100-200', '200-400', '400-800']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'coagulometers': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'immunochemistry-analyzers': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Type', 'options': ['Automatic', 'Semi-automatic', 'Express']},
        {'key': 'Throughput per Hour', 'options': ['20-50', '50-100', '100-200', '200-500']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'blood-gas-analyzers': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Throughput per Hour', 'options': ['20-50', '50-100', '100-200', '200-300']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'urine-analyzers': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'glucose-analyzers': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'vein-finders': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'lab-microscopes': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'cytology-equipment': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],

    # ===== DENTISTRY =====
    'dental-chairs': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Type', 'options': ['Therapeutic', 'Surgical']},
        {'key': 'Drive', 'options': ['Electric', 'Hydraulic', 'Mechanical']},
        {'key': 'Backrest Adjustment', 'options': ['Yes', 'No']},
        {'key': 'Headrest Adjustment', 'options': ['Yes', 'No']},
        {'key': 'Design', 'options': ['Stationary']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'dental-lights': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'endomotors': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'scalers': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'dental-microscopes': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'dental-accessories': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Type', 'options': ['Tips', 'Attachments', 'Holders']},
        {'key': 'Purpose', 'options': ['Dentistry']},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],

    # ===== OPHTHALMOLOGY =====
    'ophthalmology-units': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'slit-lamps': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'fundus-cameras': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'tonometers': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'ophthalmic-lamps': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],
    'ophthalmic-accessories': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ],

    # ===== Default Filters =====
    'default': [
        {'key': 'Brand', 'type': 'input', 'options': []},
        {'key': 'Country', 'options': ['Germany', 'Italy', 'China', 'Russia', 'USA', 'South Korea', 'Japan']},
    ]
}


def get_specs_for_category(slug: str) -> list:
    """Get list of filters/specifications for category by its slug"""
    return CATEGORY_SPECS.get(slug, CATEGORY_SPECS['default'])