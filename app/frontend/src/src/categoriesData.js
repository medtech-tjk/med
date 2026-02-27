// Полная структура категорий медицинского оборудования
// На основе структуры Medliga.ru

export const mainCategories = [
  {
    id: 'ultrasound',
    name: 'Ультразвуковая диагностика',
    slug: 'ultrasound-diagnostics',
    description: 'Ультразвуковая диагностика — один из самых информативных и безопасных методов исследования. Мы предлагаем широкий выбор УЗИ-аппаратов различных классов от ведущих мировых производителей.',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=400&fit=crop',
    subcategories: [
      { 
        id: 'uzi-devices', 
        name: 'УЗИ аппараты', 
        slug: 'uzi-devices',
        image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=400&fit=crop',
        subSubcategories: [
          { id: 'mindray', name: 'УЗИ аппараты Mindray', slug: 'mindray' },
          { id: 'samsung', name: 'УЗИ аппараты Samsung', slug: 'samsung' },
          { id: 'canon', name: 'УЗИ аппараты Canon', slug: 'canon' },
          { id: 'ge', name: 'УЗИ аппараты GE', slug: 'ge' },
          { id: 'philips', name: 'УЗИ аппараты Philips', slug: 'philips' },
          { id: 'fujifilm', name: 'УЗИ аппараты Fujifilm', slug: 'fujifilm' }
        ]
      },
      { 
        id: 'uzi-probes', 
        name: 'УЗИ датчики', 
        slug: 'uzi-probes',
        image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&h=400&fit=crop',
        subSubcategories: [
          { id: 'linear', name: 'Линейные', slug: 'linear' },
          { id: 'convex', name: 'Конвексные', slug: 'convex' },
          { id: 'phased-array', name: 'Секторные фазированные', slug: 'phased-array' },
          { id: 'microconvex', name: 'Микроконвексные', slug: 'microconvex' },
          { id: 'intracavity', name: 'Внутриполостные', slug: 'intracavity' },
          { id: 'transesophageal', name: 'Чреспищеводные', slug: 'transesophageal' },
          { id: 'pencil', name: 'Карандашные', slug: 'pencil' },
          { id: 'mindray-probes', name: 'Датчики УЗИ Mindray', slug: 'mindray-probes' },
          { id: 'samsung-probes', name: 'Датчики УЗИ Samsung', slug: 'samsung-probes' },
          { id: 'canon-probes', name: 'Датчики УЗИ Canon', slug: 'canon-probes' }
        ]
      },
      { id: 'uzi-carts', name: 'Тележки для УЗИ', slug: 'uzi-carts', image: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=600&h=400&fit=crop' },
      { id: 'uzi-printers', name: 'Принтеры для УЗИ', slug: 'uzi-printers', image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=400&fit=crop' },
      { id: 'ultrasound-densitometers', name: 'Ультразвуковые денситометры', slug: 'ultrasound-densitometers', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop' }
    ]
  },
  {
    id: 'flexible-endoscopy',
    name: 'Гибкая эндоскопия',
    slug: 'flexible-endoscopy',
    description: 'Современное оборудование для гибкой эндоскопии высокого разрешения.',
    image: 'https://images.unsplash.com/photo-1581093458791-9d42e975b86f?w=600&h=400&fit=crop',
    subcategories: [
      { id: 'video-endoscopy-systems', name: 'Видеоэндоскопические системы', slug: 'video-endoscopy-systems' },
      { id: 'endoscope-cabinets', name: 'Шкафы для эндоскопов', slug: 'endoscope-cabinets' },
      { id: 'endoscope-washers', name: 'Мойки для эндоскопов', slug: 'endoscope-washers' },
      { id: 'endoscopic-insufflators', name: 'Инсуффляторы эндоскопические', slug: 'endoscopic-insufflators' },
      { id: 'endoscopic-aspirators', name: 'Аспираторы-ирригаторы эндоскопические', slug: 'endoscopic-aspirators' },
      { id: 'endoscopic-irrigation-pumps', name: 'Эндоскопические ирригационные помпы', slug: 'endoscopic-irrigation-pumps' },
      { id: 'water-containers', name: 'Емкости для воды гибких эндоскопов', slug: 'water-containers' },
      { id: 'leak-testers', name: 'Течеискатели и тестеры герметичности', slug: 'leak-testers' },
      { id: 'examination-tables', name: 'Эндоскопические смотровые столы', slug: 'examination-tables' },
      { id: 'video-processors', name: 'Видеопроцессоры эндоскопические', slug: 'video-processors' },
      { id: 'light-sources', name: 'Источники света', slug: 'light-sources' },
      { id: 'endoscopic-monitors', name: 'Мониторы эндоскопические', slug: 'endoscopic-monitors' },
      { id: 'endoscopes', name: 'Эндоскопы (гастроскопы, колоноскопы и др.)', slug: 'endoscopes' },
      { id: 'endoscopic-carts', name: 'Тележки эндоскопические', slug: 'endoscopic-carts' }
    ]
  },
  {
    id: 'rigid-endoscopy',
    name: 'Жесткая эндоскопия',
    slug: 'rigid-endoscopy',
    description: 'Профессиональное оборудование для жесткой эндоскопии.',
    image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&h=400&fit=crop',
    subcategories: [
      { id: 'endoscopic-stands', name: 'Эндоскопические стойки', slug: 'endoscopic-stands' },
      { id: 'video-processors-rigid', name: 'Видеопроцессоры для жесткой эндоскопии', slug: 'video-processors-rigid' },
      { id: 'endoscopic-illuminators', name: 'Осветители эндоскопические', slug: 'endoscopic-illuminators' },
      { id: 'monitors-rigid', name: 'Мониторы', slug: 'monitors-rigid' },
      { id: 'electrosurgical-units', name: 'Электрохирургические блоки для эндоскопии', slug: 'electrosurgical-units' },
      { id: 'insufflators-rigid', name: 'Инсуффляторы', slug: 'insufflators-rigid' },
      { id: 'aspirators-rigid', name: 'Аспираторы-ирригаторы', slug: 'aspirators-rigid' },
      { id: 'pumps-rigid', name: 'Помпы для эндоскопических операций', slug: 'pumps-rigid' },
      { id: 'mobile-carts-rigid', name: 'Мобильные тележки', slug: 'mobile-carts-rigid' }
    ]
  },
  {
    id: 'radiology',
    name: 'Лучевая диагностика',
    slug: 'radiology',
    description: 'Рентгеновское и радиологическое оборудование для точной диагностики.',
    image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=600&h=400&fit=crop',
    subcategories: [
      { id: 'x-ray-machines', name: 'Рентгеновские аппараты', slug: 'x-ray-machines' },
      { id: 'bedside-xray', name: 'Палатные рентген аппараты', slug: 'bedside-xray' },
      { id: 'portable-xray', name: 'Портативные рентген аппараты', slug: 'portable-xray' },
      { id: 'c-arm-systems', name: 'Рентген аппараты типа С-дуга', slug: 'c-arm-systems' },
      { id: 'mammography', name: 'Маммографы', slug: 'mammography' },
      { id: 'fluorography', name: 'Флюорографы', slug: 'fluorography' },
      { id: 'angiography', name: 'Ангиографы', slug: 'angiography' },
      { id: 'ct-scanners', name: 'Аппараты КТ', slug: 'ct-scanners' },
      { id: 'nuclear-medicine', name: 'Ядерная медицина', slug: 'nuclear-medicine' },
      { id: 'densitometers', name: 'Денситометры', slug: 'densitometers' }
    ]
  },
  {
    id: 'anesthesiology',
    name: 'Анестезиология и реанимация',
    slug: 'anesthesiology',
    description: 'Оборудование для интенсивной терапии и реанимации.',
    image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&h=400&fit=crop',
    subcategories: [
      { id: 'ventilators', name: 'Аппараты ИВЛ', slug: 'ventilators' },
      { id: 'anesthesia-machines', name: 'Наркозно-дыхательные аппараты', slug: 'anesthesia-machines' },
      { id: 'sedation', name: 'Седация', slug: 'sedation' },
      { id: 'patient-monitors', name: 'Мониторы пациента', slug: 'patient-monitors' },
      { id: 'infusion-pumps', name: 'Инфузионные насосы', slug: 'infusion-pumps' },
      { id: 'defibrillators', name: 'Дефибрилляторы', slug: 'defibrillators' },
      { id: 'oxygen-concentrators', name: 'Концентраторы кислорода', slug: 'oxygen-concentrators' },
      { id: 'infant-incubators', name: 'Инкубаторы для новорожденных', slug: 'infant-incubators' }
    ]
  },
  {
    id: 'surgical-equipment',
    name: 'Хирургическое оборудование',
    slug: 'surgical-equipment',
    description: 'Профессиональное операционное оборудование.',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop',
    subcategories: [
      { id: 'operating-tables', name: 'Операционные столы', slug: 'operating-tables' },
      { id: 'surgical-lights', name: 'Светильники хирургические', slug: 'surgical-lights' },
      { id: 'surgical-pendants', name: 'Консоли хирургические (потолочные)', slug: 'surgical-pendants' },
      { id: 'surgical-suction', name: 'Отсасыватели хирургические', slug: 'surgical-suction' },
      { id: 'electrosurgical-devices', name: 'Аппараты электрохирургические', slug: 'electrosurgical-devices' },
      { id: 'operating-microscopes', name: 'Операционные микроскопы', slug: 'operating-microscopes' },
      { id: 'surgical-cameras', name: 'Видеокамеры для операционных светильников', slug: 'surgical-cameras' },
      { id: 'ultrasonic-surgical', name: 'Ультразвуковые хирургические аппараты', slug: 'ultrasonic-surgical' },
      { id: 'surgical-insufflators', name: 'Инсуффляторы хирургические', slug: 'surgical-insufflators' },
      { id: 'surgical-lasers', name: 'Лазеры хирургические', slug: 'surgical-lasers' },
      { id: 'dressing-tables', name: 'Перевязочные столы', slug: 'dressing-tables' },
      { id: 'surgical-navigation', name: 'Системы хирургической навигации', slug: 'surgical-navigation' },
      { id: 'smoke-evacuators', name: 'Эвакуаторы дыма', slug: 'smoke-evacuators' },
      { id: 'surgical-accessories', name: 'Аксессуары для операционных столов', slug: 'surgical-accessories' }
    ]
  },
  {
    id: 'ent-equipment',
    name: 'ЛОР-оборудование',
    slug: 'ent-equipment',
    description: 'Оборудование для оториноларингологии.',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop',
    subcategories: [
      { id: 'ent-units', name: 'ЛОР-комбайны', slug: 'ent-units' },
      { id: 'ent-chairs', name: 'ЛОР-кресла', slug: 'ent-chairs' },
      { id: 'ent-video-systems', name: 'ЛОР-видеосистемы', slug: 'ent-video-systems' },
      { id: 'ent-endoscopes', name: 'Эндоскопы для ЛОР', slug: 'ent-endoscopes' },
      { id: 'ent-additional', name: 'Дополнительное ЛОР-оборудование', slug: 'ent-additional' },
      { id: 'echosinuscopes', name: 'Эхосинускопы', slug: 'echosinuscopes' },
      { id: 'headlights', name: 'Налобные осветители', slug: 'headlights' },
      { id: 'ent-massagers', name: 'Массажеры (ЛОР)', slug: 'ent-massagers' },
      { id: 'ultrasonic-ent', name: 'УЗ ЛОР аппараты', slug: 'ultrasonic-ent' },
      { id: 'sterilization-cases', name: 'Футляры для стерилизации', slug: 'sterilization-cases' },
      { id: 'ir-emitters', name: 'ИК-излучатели', slug: 'ir-emitters' },
      { id: 'ent-nebulizers', name: 'ЛОР-небулайзеры', slug: 'ent-nebulizers' },
      { id: 'ent-microscopes', name: 'ЛОР-микроскопы', slug: 'ent-microscopes' },
      { id: 'ent-ehvch', name: 'Аппараты ЭХВЧ для ЛОР', slug: 'ent-ehvch' },
      { id: 'ent-aspirators', name: 'ЛОР-аспираторы', slug: 'ent-aspirators' },
      { id: 'ent-irrigators', name: 'ЛОР-ирригаторы', slug: 'ent-irrigators' },
      { id: 'laryngostroboscopes', name: 'Ларингостробоскопы', slug: 'laryngostroboscopes' },
      { id: 'vestibular-systems', name: 'Системы для исследования вестибулярного аппарата', slug: 'vestibular-systems' }
    ]
  },
  {
    id: 'mri',
    name: 'Магнитно-резонансная томография',
    slug: 'mri',
    description: 'МРТ оборудование и аксессуары.',
    image: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=600&h=400&fit=crop',
    subcategories: [
      { id: 'mri-scanners', name: 'Аппараты МРТ', slug: 'mri-scanners' },
      { id: 'mri-coils', name: 'Катушки для МРТ', slug: 'mri-coils' },
      { id: 'mri-printers', name: 'Термопринтеры для МРТ', slug: 'mri-printers' },
      { id: 'mri-monitors', name: 'Мониторы для рентгенологии/МРТ', slug: 'mri-monitors' },
      { id: 'mri-injectors', name: 'Инжекторы для МРТ аппаратов', slug: 'mri-injectors' },
      { id: 'mri-ups', name: 'ИБП для МРТ аппаратов', slug: 'mri-ups' },
      { id: 'mri-software', name: 'Программное обеспечение для МРТ', slug: 'mri-software' },
      { id: 'mri-storage', name: 'Серверы хранения данных для МРТ', slug: 'mri-storage' },
      { id: 'mri-patient-monitors', name: 'Мониторы пациента для МРТ', slug: 'mri-patient-monitors' }
    ]
  },
  {
    id: 'gynecology',
    name: 'Гинекологическое оборудование',
    slug: 'gynecology',
    description: 'Оборудование для гинекологии и акушерства.',
    image: 'https://images.unsplash.com/photo-1581091870621-ce42fe16e7fc?w=600&h=400&fit=crop',
    subcategories: [
      { id: 'gynecology-chairs', name: 'Гинекологические кресла', slug: 'gynecology-chairs' },
      { id: 'colposcopes', name: 'Кольпоскопы', slug: 'colposcopes' },
      { id: 'fetal-monitors', name: 'Фетальные мониторы', slug: 'fetal-monitors' },
      { id: 'gynecology-suction', name: 'Отсасыватели гинекологические', slug: 'gynecology-suction' },
      { id: 'gynecology-ehvch', name: 'Аппараты ЭХВЧ для гинекологии', slug: 'gynecology-ehvch' },
      { id: 'gynecology-lights', name: 'Гинекологические светильники', slug: 'gynecology-lights' },
      { id: 'surgical-ultrasound-gyn', name: 'Хирургические УЗ-аппараты', slug: 'surgical-ultrasound-gyn' },
      { id: 'gynecology-lasers', name: 'Лазеры для гинекологии', slug: 'gynecology-lasers' },
      { id: 'gynecology-units', name: 'Гинекологические комбайны', slug: 'gynecology-units' },
      { id: 'obstetric-beds', name: 'Акушерские кровати', slug: 'obstetric-beds' },
      { id: 'gynecology-tables', name: 'Гинекологические столы', slug: 'gynecology-tables' }
    ]
  },
  {
    id: 'rehabilitation',
    name: 'Реабилитационное оборудование',
    slug: 'rehabilitation',
    description: 'Оборудование для восстановительной медицины.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop',
    subcategories: [
      { id: 'mechanotherapy', name: 'Аппараты механотерапии', slug: 'mechanotherapy' },
      { id: 'verticalizers', name: 'Вертикализаторы', slug: 'verticalizers' },
      { id: 'patient-lifts', name: 'Подъёмники для инвалидов', slug: 'patient-lifts' },
      { id: 'kinesiotherapy', name: 'Тренажёры для кинезитерапии', slug: 'kinesiotherapy' },
      { id: 'exoskeletons', name: 'Экзоскелеты', slug: 'exoskeletons' },
      { id: 'virtual-rehab', name: 'Системы виртуальной реабилитации', slug: 'virtual-rehab' },
      { id: 'spinal-traction', name: 'Системы вытяжения позвоночника', slug: 'spinal-traction' },
      { id: 'body-correction', name: 'Аппараты коррекции фигуры', slug: 'body-correction' }
    ]
  },
  {
    id: 'physiotherapy',
    name: 'Физиотерапия',
    slug: 'physiotherapy',
    description: 'Физиотерапевтическое оборудование.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop',
    subcategories: [
      { id: 'shockwave-therapy', name: 'Аппараты УВТ (ударно-волновая терапия)', slug: 'shockwave-therapy' },
      { id: 'magnetotherapy', name: 'Аппараты для магнитотерапии', slug: 'magnetotherapy' },
      { id: 'laser-therapy', name: 'Аппараты лазерной терапии', slug: 'laser-therapy' },
      { id: 'pressotherapy', name: 'Аппараты для прессотерапии и лимфодренажа', slug: 'pressotherapy' },
      { id: 'microwave-therapy', name: 'Аппараты микроволновой терапии', slug: 'microwave-therapy' },
      { id: 'electrotherapy', name: 'Аппараты для электротерапии', slug: 'electrotherapy' },
      { id: 'ultrasound-therapy', name: 'Аппараты ультразвуковой терапии', slug: 'ultrasound-therapy' },
      { id: 'diathermy', name: 'Аппараты для диатермии', slug: 'diathermy' }
    ]
  },
  {
    id: 'functional-diagnostics',
    name: 'Функциональная диагностика',
    slug: 'functional-diagnostics',
    description: 'Оборудование для функциональной диагностики.',
    image: 'https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=600&h=400&fit=crop',
    subcategories: [
      { id: 'ecg-machines', name: 'Электрокардиографы', slug: 'ecg-machines' },
      { id: 'pulse-oximeters', name: 'Пульсоксиметры', slug: 'pulse-oximeters' },
      { id: 'spirometers', name: 'Спирометры медицинские', slug: 'spirometers' }
    ]
  },
  {
    id: 'laboratory',
    name: 'Лабораторная диагностика',
    slug: 'laboratory',
    description: 'Лабораторное диагностическое оборудование.',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=400&fit=crop',
    subcategories: [
      { id: 'biochemical-analyzers', name: 'Биохимические анализаторы', slug: 'biochemical-analyzers' },
      { id: 'hematology-analyzers', name: 'Гематологические анализаторы', slug: 'hematology-analyzers' },
      { id: 'coagulometers', name: 'Коагулометры (анализаторы гемостаза)', slug: 'coagulometers' },
      { id: 'immunochemical-analyzers', name: 'Иммунохимические анализаторы', slug: 'immunochemical-analyzers' },
      { id: 'blood-gas-analyzers', name: 'Анализаторы электролитов и газов крови', slug: 'blood-gas-analyzers' },
      { id: 'urine-analyzers', name: 'Анализаторы мочи', slug: 'urine-analyzers' },
      { id: 'glucose-analyzers', name: 'Анализаторы глюкозы, лактата и гемоглобина', slug: 'glucose-analyzers' },
      { id: 'vein-viewers', name: 'Аппараты визуализации вен', slug: 'vein-viewers' },
      { id: 'lab-microscopes', name: 'Лабораторные микроскопы', slug: 'lab-microscopes' },
      { id: 'liquid-cytology', name: 'Оборудование для жидкостной цитологии', slug: 'liquid-cytology' }
    ]
  },
  {
    id: 'dentistry',
    name: 'Стоматология',
    slug: 'dentistry',
    description: 'Стоматологическое оборудование.',
    image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=400&fit=crop',
    subcategories: [
      { id: 'dental-chairs', name: 'Стоматологические кресла', slug: 'dental-chairs' },
      { id: 'dental-lights', name: 'Стоматологические светильники', slug: 'dental-lights' },
      { id: 'endomotors', name: 'Эндомоторы', slug: 'endomotors' },
      { id: 'ultrasonic-scalers', name: 'Скалеры ультразвуковые', slug: 'ultrasonic-scalers' },
      { id: 'dental-microscopes', name: 'Стоматологические микроскопы', slug: 'dental-microscopes' },
      { id: 'dental-accessories', name: 'Аксессуары и принадлежности для стоматологии', slug: 'dental-accessories' }
    ]
  },
  {
    id: 'ophthalmology',
    name: 'Офтальмология',
    slug: 'ophthalmology',
    description: 'Офтальмологическое оборудование.',
    image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=400&fit=crop',
    subcategories: [
      { id: 'ophthalmic-units', name: 'Офтальмологические установки', slug: 'ophthalmic-units' },
      { id: 'slit-lamps', name: 'Щелевые лампы', slug: 'slit-lamps' },
      { id: 'fundus-cameras', name: 'Фундус-камеры', slug: 'fundus-cameras' },
      { id: 'tonometers', name: 'Тонометры офтальмологические', slug: 'tonometers' },
      { id: 'ophthalmic-lamps', name: 'Лампы офтальмологические', slug: 'ophthalmic-lamps' },
      { id: 'ophthalmic-accessories', name: 'Вспомогательное оборудование для офтальмологии', slug: 'ophthalmic-accessories' }
    ]
  }
];

// Фильтры для каждой категории
export const categoryFilters = {
  'uzi-devices': [
    { key: 'brand', label: 'Бренд', type: 'select', adminManaged: true },
    { key: 'deviceType', label: 'Тип', type: 'checkbox', options: ['Портативный', 'Стационарный', 'Планшет'] },
    { key: 'deviceClass', label: 'Класс', type: 'checkbox', options: ['Начальный', 'Средний', 'Высокий', 'Экспертный', 'Премиальный'] },
    { key: 'application', label: 'Область применения', type: 'checkbox', options: ['Абдоминальные исследования', 'Акушерство', 'Ангиология', 'Педиатрия', 'Урология', 'Общая визуализация', 'Кардиология', 'Гинекология', 'Ветеринария', 'Маммология'] },
    { key: 'probeConnectors', label: 'Количество разъемов для датчиков', type: 'checkbox', options: ['1', '2', '3', '4', '5'] },
    { key: 'segment', label: 'Сегмент', type: 'checkbox', options: ['Государственный', 'Частный'] },
    { key: 'country', label: 'Страна', type: 'select', adminManaged: true },
    { key: 'price', label: 'Цена', type: 'range' }
  ],
  // Добавим несколько примеров других категорий
  'operating-tables': [
    { key: 'brand', label: 'Бренд', type: 'select', adminManaged: true },
    { key: 'constructionType', label: 'Тип конструкции', type: 'checkbox', options: ['Мобильный', 'Стационарный', 'Напольный', 'Колонный'] },
    { key: 'purpose', label: 'Назначение', type: 'checkbox', options: ['Общая хирургия', 'Лапароскопия', 'Ортопедия', 'Нейрохирургия', 'Урология', 'Гинекология', 'Травматология'] },
    { key: 'xrayTransparent', label: 'Рентгенопрозрачность', type: 'checkbox', options: ['Да', 'Частично', 'Нет'] },
    { key: 'maxLoad', label: 'Максимальная нагрузка (кг)', type: 'range', min: 150, max: 500 },
    { key: 'country', label: 'Страна', type: 'select', adminManaged: true },
    { key: 'price', label: 'Цена', type: 'range' }
  ]
};
