// Полное дерево каталога медицинского оборудования
export const catalogTree = [
  {
    id: 1,
    name: 'Ультразвуковая диагностика',
    slug: 'ultrasound',
    icon: '🔬',
    description: 'Ультразвуковая диагностика — один из самых информативных и безопасных методов исследования.',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=400&fit=crop',
    children: [
      {
        id: 11,
        name: 'УЗИ аппараты',
        slug: 'uzi-devices',
        image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=400&fit=crop',
        children: []
      },
      {
        id: 12,
        name: 'УЗИ датчики',
        slug: 'uzi-probes',
        image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&h=400&fit=crop',
        children: [
          { id: 121, name: 'Линейные', slug: 'linear' },
          { id: 122, name: 'Конвексные', slug: 'convex' },
          { id: 123, name: 'Секторные фазированные', slug: 'phased-array' },
          { id: 124, name: 'Микроконвексные', slug: 'microconvex' },
          { id: 125, name: 'Внутриполостные', slug: 'intracavity' },
          { id: 126, name: 'Чреспищеводные', slug: 'transesophageal' },
          { id: 127, name: 'Карандашные', slug: 'pencil' },
          { id: 128, name: 'Датчики УЗИ Mindray', slug: 'mindray-probes' },
          { id: 129, name: 'Датчики УЗИ Samsung', slug: 'samsung-probes' },
          { id: 1210, name: 'Датчики УЗИ Canon', slug: 'canon-probes' }
        ]
      },
      { id: 13, name: 'Тележки для УЗИ', slug: 'uzi-carts', image: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=600&h=400&fit=crop' },
      { id: 14, name: 'Принтеры для УЗИ', slug: 'uzi-printers', image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=400&fit=crop' },
      { id: 15, name: 'Ультразвуковые денситометры', slug: 'densitometers', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop' }
    ]
  },
  {
    id: 2,
    name: 'Гибкая эндоскопия',
    slug: 'flexible-endoscopy',
    icon: '🔍',
    description: 'Современное оборудование для гибкой эндоскопии высокого разрешения.',
    image: 'https://images.unsplash.com/photo-1581093458791-9d42e975b86f?w=600&h=400&fit=crop',
    children: [
      { id: 21, name: 'Видеоэндоскопические системы', slug: 'video-systems', image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=600&h=400&fit=crop' },
      { id: 22, name: 'Шкафы для эндоскопов', slug: 'cabinets', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop' },
      { id: 23, name: 'Мойки для эндоскопов', slug: 'washers', image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&h=400&fit=crop' },
      { id: 24, name: 'Инсуффляторы эндоскопические', slug: 'insufflators', image: 'https://images.unsplash.com/photo-1581091870621-ce42fe16e7fc?w=600&h=400&fit=crop' },
      { id: 25, name: 'Аспираторы-ирригаторы эндоскопические', slug: 'aspirators', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop' },
      { id: 26, name: 'Эндоскопические ирригационные помпы', slug: 'pumps', image: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=600&h=400&fit=crop' },
      { id: 27, name: 'Емкости для воды гибких эндоскопов', slug: 'containers', image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&h=400&fit=crop' },
      { id: 28, name: 'Течеискатели и тестеры герметичности', slug: 'testers', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=400&fit=crop' },
      { id: 29, name: 'Эндоскопические смотровые столы', slug: 'tables', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop' },
      { id: 210, name: 'Видеопроцессоры эндоскопические', slug: 'processors', image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=600&h=400&fit=crop' },
      { id: 211, name: 'Источники света', slug: 'light-sources', image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&h=400&fit=crop' },
      { id: 212, name: 'Мониторы эндоскопические', slug: 'monitors', image: 'https://images.unsplash.com/photo-1581091870621-ce42fe16e7fc?w=600&h=400&fit=crop' },
      {
        id: 213,
        name: 'Эндоскопы',
        slug: 'endoscopes',
        image: 'https://images.unsplash.com/photo-1581093458791-9d42e975b86f?w=600&h=400&fit=crop',
        children: [
          { id: 2131, name: 'Гастроскопы', slug: 'gastroscopes' },
          { id: 2132, name: 'Колоноскопы', slug: 'colonoscopes' },
          { id: 2133, name: 'Бронхоскопы', slug: 'bronchoscopes' },
          { id: 2134, name: 'Риноларингоскопы', slug: 'rhinolaryngoscopes' },
          { id: 2135, name: 'Дуоденоскопы', slug: 'duodenoscopes' },
          { id: 2136, name: 'Сигмоидоскопы', slug: 'sigmoidoscopes' },
          { id: 2137, name: 'Гистероскопы', slug: 'hysteroscopes' },
          { id: 2138, name: 'Уретроскопы', slug: 'urethroscopes' },
          { id: 2139, name: 'Холедохоскопы', slug: 'choledochoscopes' },
          { id: 21310, name: 'Цистоскопы', slug: 'cystoscopes' },
          { id: 21311, name: 'Энтероскопы', slug: 'enteroscopes' }
        ]
      },
      { id: 214, name: 'Тележки эндоскопические', slug: 'carts', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop' }
    ]
  },
  // Продолжу со всеми остальными категориями в сокращенном виде
  {
    id: 3,
    name: 'Жесткая эндоскопия',
    slug: 'rigid-endoscopy',
    icon: '🛠️',
    image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&h=400&fit=crop',
    children: [
      { id: 31, name: 'Эндоскопические стойки', slug: 'stands' },
      { id: 32, name: 'Видеопроцессоры для жесткой эндоскопии', slug: 'processors' },
      { id: 33, name: 'Осветители эндоскопические', slug: 'illuminators' },
      { id: 34, name: 'Мониторы', slug: 'monitors' },
      { id: 35, name: 'Электрохирургические блоки для эндоскопии', slug: 'electrosurgical' },
      { id: 36, name: 'Инсуффляторы', slug: 'insufflators' },
      { id: 37, name: 'Аспираторы-ирригаторы', slug: 'aspirators' },
      { id: 38, name: 'Помпы для эндоскопических операций', slug: 'pumps' },
      { id: 39, name: 'Мобильные тележки', slug: 'carts' }
    ]
  },
  {
    id: 4,
    name: 'Лучевая диагностика',
    slug: 'radiology',
    icon: '☢️',
    image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=600&h=400&fit=crop',
    children: [
      { id: 41, name: 'Рентгеновские аппараты', slug: 'xray' },
      { id: 42, name: 'Палатные рентген аппараты', slug: 'bedside-xray' },
      { id: 43, name: 'Портативные рентген аппараты', slug: 'portable-xray' },
      { id: 44, name: 'Рентген аппараты типа С-дуга', slug: 'c-arm' },
      { id: 45, name: 'Маммографы', slug: 'mammography' },
      { id: 46, name: 'Флюорографы', slug: 'fluorography' },
      { id: 47, name: 'Ангиографы', slug: 'angiography' },
      { id: 48, name: 'Аппараты КТ', slug: 'ct' },
      { id: 49, name: 'Ядерная медицина', slug: 'nuclear' },
      { id: 410, name: 'Денситометры', slug: 'densitometers' }
    ]
  },
  {
    id: 5,
    name: 'Анестезиология и реанимация',
    slug: 'anesthesiology',
    icon: '⚕️',
    image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&h=400&fit=crop',
    children: [
      { id: 51, name: 'Аппараты ИВЛ', slug: 'ventilators' },
      { id: 52, name: 'Наркозно-дыхательные аппараты', slug: 'anesthesia' },
      { id: 53, name: 'Седация', slug: 'sedation' },
      { id: 54, name: 'Мониторы пациента', slug: 'monitors' },
      { id: 55, name: 'Инфузионные насосы', slug: 'infusion-pumps' },
      { id: 56, name: 'Дефибрилляторы', slug: 'defibrillators' },
      { id: 57, name: 'Концентраторы кислорода', slug: 'oxygen' },
      { id: 58, name: 'Инкубаторы для новорожденных', slug: 'incubators' }
    ]
  },
  {
    id: 6,
    name: 'Хирургическое оборудование',
    slug: 'surgical',
    icon: '🏥',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop',
    children: [
      { id: 61, name: 'Операционные столы', slug: 'tables' },
      { id: 62, name: 'Светильники хирургические', slug: 'lights' },
      { id: 63, name: 'Консоли хирургические (потолочные)', slug: 'pendants' },
      { id: 64, name: 'Отсасыватели хирургические', slug: 'suction' },
      { id: 65, name: 'Аппараты электрохирургические', slug: 'electrosurgical' },
      { id: 66, name: 'Операционные микроскопы', slug: 'microscopes' },
      { id: 67, name: 'Видеокамеры для операционных светильников', slug: 'cameras' },
      { id: 68, name: 'Ультразвуковые хирургические аппараты', slug: 'ultrasonic' },
      { id: 69, name: 'Инсуффляторы хирургические', slug: 'insufflators' },
      { id: 610, name: 'Лазеры хирургические', slug: 'lasers' },
      { id: 611, name: 'Перевязочные столы', slug: 'dressing-tables' },
      { id: 612, name: 'Системы хирургической навигации', slug: 'navigation' },
      { id: 613, name: 'Эвакуаторы дыма', slug: 'smoke-evacuators' },
      { id: 614, name: 'Аксессуары для операционных столов', slug: 'accessories' }
    ]
  },
  {
    id: 7,
    name: 'ЛОР-оборудование',
    slug: 'ent',
    icon: '👂',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop',
    children: [
      { id: 71, name: 'ЛОР-комбайны', slug: 'units', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop' },
      { id: 72, name: 'ЛОР-кресла', slug: 'chairs', image: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=600&h=400&fit=crop' },
      { id: 73, name: 'ЛОР-видеосистемы', slug: 'video-systems', image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=600&h=400&fit=crop' },
      { id: 74, name: 'Эндоскопы для ЛОР', slug: 'endoscopes', image: 'https://images.unsplash.com/photo-1581093458791-9d42e975b86f?w=600&h=400&fit=crop' },
      { id: 75, name: 'Дополнительное ЛОР-оборудование', slug: 'additional', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop' },
      { id: 76, name: 'Эхосинускопы', slug: 'echosinuscopes', image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&h=400&fit=crop' },
      { id: 77, name: 'Налобные осветители', slug: 'headlights', image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&h=400&fit=crop' },
      { id: 78, name: 'ЛОР-микроскопы', slug: 'microscopes', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=400&fit=crop' },
      { id: 79, name: 'ЛОР-аспираторы', slug: 'aspirators', image: 'https://images.unsplash.com/photo-1581091870621-ce42fe16e7fc?w=600&h=400&fit=crop' },
      { id: 710, name: 'Ларингостробоскопы', slug: 'laryngostroboscopes', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop' }
    ]
  },
  {
    id: 8,
    name: 'Магнитно-резонансная томография',
    slug: 'mri',
    icon: '🧲',
    image: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=600&h=400&fit=crop',
    children: [
      { id: 81, name: 'Аппараты МРТ', slug: 'scanners', image: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=600&h=400&fit=crop' },
      { id: 82, name: 'Катушки для МРТ', slug: 'coils', image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=600&h=400&fit=crop' },
      { id: 83, name: 'Термопринтеры для МРТ', slug: 'printers', image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=400&fit=crop' },
      { id: 84, name: 'Мониторы для МРТ', slug: 'monitors', image: 'https://images.unsplash.com/photo-1581091870621-ce42fe16e7fc?w=600&h=400&fit=crop' },
      { id: 85, name: 'Инжекторы для МРТ', slug: 'injectors', image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&h=400&fit=crop' },
      { id: 86, name: 'ИБП для МРТ', slug: 'ups', image: 'https://images.unsplash.com/photo-1591696331111-ef9586a5b17a?w=600&h=400&fit=crop' }
    ]
  },
  {
    id: 9,
    name: 'Гинекологическое оборудование',
    slug: 'gynecology',
    icon: '👩‍⚕️',
    image: 'https://images.unsplash.com/photo-1581091870621-ce42fe16e7fc?w=600&h=400&fit=crop',
    children: [
      { id: 91, name: 'Гинекологические кресла', slug: 'chairs', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop' },
      { id: 92, name: 'Кольпоскопы', slug: 'colposcopes', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=400&fit=crop' },
      { id: 93, name: 'Фетальные мониторы', slug: 'fetal-monitors', image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=600&h=400&fit=crop' },
      { id: 94, name: 'Отсасыватели гинекологические', slug: 'suction', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop' },
      { id: 95, name: 'Гинекологические светильники', slug: 'lights', image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&h=400&fit=crop' },
      { id: 96, name: 'Лазеры для гинекологии', slug: 'lasers', image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&h=400&fit=crop' },
      { id: 97, name: 'Акушерские кровати', slug: 'beds', image: 'https://images.unsplash.com/photo-1581091870621-ce42fe16e7fc?w=600&h=400&fit=crop' }
    ]
  },
  {
    id: 10,
    name: 'Реабилитационное оборудование',
    slug: 'rehabilitation',
    icon: '♿',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop',
    children: [
      { id: 101, name: 'Аппараты механотерапии', slug: 'mechanotherapy', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop' },
      { id: 102, name: 'Вертикализаторы', slug: 'verticalizers', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop' },
      { id: 103, name: 'Подъёмники для инвалидов', slug: 'lifts', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop' },
      { id: 104, name: 'Тренажёры для кинезитерапии', slug: 'kinesiotherapy', image: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=600&h=400&fit=crop' },
      { id: 105, name: 'Экзоскелеты', slug: 'exoskeletons', image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=600&h=400&fit=crop' },
      { id: 106, name: 'Системы виртуальной реабилитации', slug: 'virtual', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop' }
    ]
  },
  {
    id: 11,
    name: 'Физиотерапия',
    slug: 'physiotherapy',
    icon: '⚡',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop',
    children: [
      { id: 111, name: 'Аппараты УВТ', slug: 'shockwave', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop' },
      { id: 112, name: 'Аппараты для магнитотерапии', slug: 'magnetotherapy', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop' },
      { id: 113, name: 'Аппараты лазерной терапии', slug: 'laser', image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&h=400&fit=crop' },
      { id: 114, name: 'Аппараты для прессотерапии', slug: 'pressotherapy', image: 'https://images.unsplash.com/photo-1581091870621-ce42fe16e7fc?w=600&h=400&fit=crop' },
      { id: 115, name: 'Аппараты для электротерапии', slug: 'electrotherapy', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop' },
      { id: 116, name: 'Аппараты ультразвуковой терапии', slug: 'ultrasound', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=400&fit=crop' }
    ]
  },
  {
    id: 12,
    name: 'Функциональная диагностика',
    slug: 'functional',
    icon: '📊',
    image: 'https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=600&h=400&fit=crop',
    children: [
      { id: 121, name: 'Электрокардиографы', slug: 'ecg', image: 'https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=600&h=400&fit=crop' },
      { id: 122, name: 'Пульсоксиметры', slug: 'pulse-oximeters', image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&h=400&fit=crop' },
      { id: 123, name: 'Спирометры медицинские', slug: 'spirometers', image: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=600&h=400&fit=crop' }
    ]
  },
  {
    id: 13,
    name: 'Лабораторная диагностика',
    slug: 'laboratory',
    icon: '🧪',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=400&fit=crop',
    children: [
      { id: 131, name: 'Биохимические анализаторы', slug: 'biochemical', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=400&fit=crop' },
      { id: 132, name: 'Гематологические анализаторы', slug: 'hematology', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop' },
      { id: 133, name: 'Коагулометры', slug: 'coagulometers', image: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=600&h=400&fit=crop' },
      { id: 134, name: 'Иммунохимические анализаторы', slug: 'immunochemical', image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=600&h=400&fit=crop' },
      { id: 135, name: 'Анализаторы газов крови', slug: 'blood-gas', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop' },
      { id: 136, name: 'Анализаторы мочи', slug: 'urine', image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&h=400&fit=crop' },
      { id: 137, name: 'Лабораторные микроскопы', slug: 'microscopes', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=400&fit=crop' }
    ]
  },
  {
    id: 14,
    name: 'Стоматология',
    slug: 'dentistry',
    icon: '🦷',
    image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=400&fit=crop',
    children: [
      { id: 141, name: 'Стоматологические кресла', slug: 'chairs', image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=400&fit=crop' },
      { id: 142, name: 'Стоматологические светильники', slug: 'lights', image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&h=400&fit=crop' },
      { id: 143, name: 'Эндомоторы', slug: 'endomotors', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop' },
      { id: 144, name: 'Скалеры ультразвуковые', slug: 'scalers', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=400&fit=crop' },
      { id: 145, name: 'Стоматологические микроскопы', slug: 'microscopes', image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=600&h=400&fit=crop' },
      { id: 146, name: 'Аксессуары для стоматологии', slug: 'accessories', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop' }
    ]
  },
  {
    id: 15,
    name: 'Офтальмология',
    slug: 'ophthalmology',
    icon: '👁️',
    image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=400&fit=crop',
    children: [
      { id: 151, name: 'Офтальмологические установки', slug: 'units', image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=400&fit=crop' },
      { id: 152, name: 'Щелевые лампы', slug: 'slit-lamps', image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&h=400&fit=crop' },
      { id: 153, name: 'Фундус-камеры', slug: 'fundus-cameras', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=400&fit=crop' },
      { id: 154, name: 'Тонометры офтальмологические', slug: 'tonometers', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop' },
      { id: 155, name: 'Лампы офтальмологические', slug: 'lamps', image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&h=400&fit=crop' },
      { id: 156, name: 'Вспомогательное оборудование', slug: 'accessories', image: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=600&h=400&fit=crop' }
    ]
  }
];
