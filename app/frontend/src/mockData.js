// Mock данные для демонстрации

// Импортируем полную структуру категорий
import { mainCategories } from './categoriesData';

// Преобразуем для обратной совместимости
export const categories = mainCategories.map((cat, index) => ({
  id: index + 1,
  name: cat.name,
  slug: cat.slug,
  image: cat.image,
  description: cat.description,
  subcategories: cat.subcategories.map((sub, subIndex) => ({
    id: (index + 1) * 10 + subIndex + 1,
    name: sub.name,
    slug: sub.slug,
    parentId: index + 1
  }))
}));

export const products = [
  // УЗИ аппараты - Начального класса
  {
    id: 101,
    name: 'УЗИ-сканер Mindray M5',
    slug: 'mindray-m5',
    categoryId: 1,
    subcategoryId: 11,
    price: 450000,
    mainImage: 'https://images.unsplash.com/photo-1581093458791-9d42e975b86f?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1581093458791-9d42e975b86f?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=600&fit=crop'
    ],
    description: 'Портативный УЗИ-сканер начального класса для универсальной диагностики',
    specs: {
      'Класс': 'Начальный',
      'Тип': 'Портативный',
      'Экран': '15" LED',
      'Количество разъёмов': '2',
      'Вес': '6 кг',
      'Производитель': 'Mindray'
    },
    brand: 'Mindray',
    stock: 5,
    isNew: true,
    isPopular: true
  },
  {
    id: 102,
    name: 'УЗИ-сканер Chison ECO 2',
    slug: 'chison-eco2',
    categoryId: 1,
    subcategoryId: 11,
    price: 380000,
    mainImage: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&h=600&fit=crop'
    ],
    description: 'Компактный и доступный УЗИ-аппарат для амбулаторной практики',
    specs: {
      'Класс': 'Начальный',
      'Тип': 'Портативный',
      'Экран': '12.1" LCD',
      'Количество разъёмов': '1',
      'Вес': '4.5 кг',
      'Производитель': 'Chison'
    },
    brand: 'Chison',
    stock: 3,
    isNew: false,
    isPopular: false
  },
  // УЗИ аппараты - Среднего класса
  {
    id: 103,
    name: 'УЗИ-сканер Mindray DC-70',
    slug: 'mindray-dc70',
    categoryId: 1,
    subcategoryId: 12,
    price: 1200000,
    mainImage: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=600&h=600&fit=crop'
    ],
    description: 'УЗИ-система среднего класса с превосходным качеством изображения',
    specs: {
      'Класс': 'Средний',
      'Тип': 'Стационарный',
      'Экран': '21.5" LED',
      'Количество разъёмов': '4',
      'Вес': '80 кг',
      'Производитель': 'Mindray'
    },
    brand: 'Mindray',
    stock: 2,
    isNew: true,
    isPopular: true
  },
  // УЗИ аппараты - Экспертного класса
  {
    id: 104,
    name: 'УЗИ-сканер GE Voluson E10',
    slug: 'ge-voluson-e10',
    categoryId: 1,
    subcategoryId: 13,
    price: 3500000,
    mainImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=600&fit=crop'
    ],
    description: 'Экспертная система для акушерства и гинекологии с 4D/5D визуализацией',
    specs: {
      'Класс': 'Экспертный',
      'Тип': 'Стационарный',
      'Экран': '23" Full HD',
      'Количество разъёмов': '6',
      'Вес': '120 кг',
      'Производитель': 'GE Healthcare'
    },
    brand: 'GE Healthcare',
    stock: 1,
    isNew: true,
    isPopular: true
  },
  // Денситометры
  {
    id: 201,
    name: 'Денситометр Hologic Discovery',
    slug: 'hologic-discovery',
    categoryId: 2,
    subcategoryId: 21,
    price: 2800000,
    mainImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=600&fit=crop'
    ],
    description: 'Осевой денситометр для диагностики остеопороза',
    specs: {
      'Тип': 'Осевой',
      'Технология': 'DXA',
      'Области сканирования': 'Поясничный отдел, бедро',
      'Время исследования': '5-10 мин',
      'Производитель': 'Hologic'
    },
    brand: 'Hologic',
    stock: 1,
    isNew: false,
    isPopular: true
  },
  {
    id: 202,
    name: 'Денситометр Osteometer DTX-200',
    slug: 'osteometer-dtx200',
    categoryId: 2,
    subcategoryId: 22,
    price: 850000,
    mainImage: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=600&h=600&fit=crop'
    ],
    description: 'Периферический денситометр для быстрого скрининга',
    specs: {
      'Тип': 'Периферический',
      'Технология': 'DXA',
      'Области сканирования': 'Предплечье',
      'Время исследования': '1-2 мин',
      'Производитель': 'Osteometer'
    },
    brand: 'Osteometer',
    stock: 3,
    isNew: false,
    isPopular: false
  },
  // ИВЛ аппараты
  {
    id: 301,
    name: 'ИВЛ аппарат Hamilton C6',
    slug: 'hamilton-c6',
    categoryId: 3,
    subcategoryId: 31,
    price: 1800000,
    mainImage: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&h=600&fit=crop'
    ],
    description: 'Универсальный аппарат ИВЛ для взрослых пациентов',
    specs: {
      'Тип привода': 'Турбинный',
      'Пациенты': 'Взрослые',
      'Режимы вентиляции': 'VCV, PCV, SIMV, ASV',
      'Дисплей': '15" сенсорный',
      'Производитель': 'Hamilton Medical'
    },
    brand: 'Hamilton Medical',
    stock: 2,
    isNew: true,
    isPopular: true
  },
  {
    id: 302,
    name: 'ИВЛ аппарат Dräger Babylog VN500',
    slug: 'drager-babylog-vn500',
    categoryId: 3,
    subcategoryId: 33,
    price: 2200000,
    mainImage: 'https://images.unsplash.com/photo-1581091870621-ce42fe16e7fc?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1581091870621-ce42fe16e7fc?w=600&h=600&fit=crop'
    ],
    description: 'Специализированный аппарат ИВЛ для новорожденных',
    specs: {
      'Тип привода': 'Турбинный',
      'Пациенты': 'Новорожденные',
      'Режимы вентиляции': 'VCV, PCV, CPAP, HFO',
      'Вес пациента': 'от 0.4 кг',
      'Производитель': 'Dräger'
    },
    brand: 'Dräger',
    stock: 1,
    isNew: true,
    isPopular: false
  },
  // Принтеры
  {
    id: 401,
    name: 'Медицинский принтер Sony UP-DR200',
    slug: 'sony-updr200',
    categoryId: 4,
    subcategoryId: 41,
    price: 180000,
    mainImage: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&h=600&fit=crop'
    ],
    description: 'Цифровой цветной принтер для медицинских изображений',
    specs: {
      'Тип печати': 'Термосублимационный',
      'Формат': 'A6',
      'Разрешение': '300 dpi',
      'Скорость печати': '11 сек/лист',
      'Производитель': 'Sony'
    },
    brand: 'Sony',
    stock: 7,
    isNew: false,
    isPopular: true
  },
  {
    id: 402,
    name: 'Медицинский принтер Mitsubishi P95DW',
    slug: 'mitsubishi-p95dw',
    categoryId: 4,
    subcategoryId: 41,
    price: 220000,
    mainImage: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=600&h=600&fit=crop'
    ],
    description: 'Высокоскоростной термопринтер для УЗИ',
    specs: {
      'Тип печати': 'Термосублимационный',
      'Формат': 'A6, A5',
      'Разрешение': '300 dpi',
      'Скорость печати': '8 сек/лист',
      'Производитель': 'Mitsubishi'
    },
    brand: 'Mitsubishi',
    stock: 4,
    isNew: false,
    isPopular: false
  },
  // Источники питания
  {
    id: 501,
    name: 'ИБП для медицинского оборудования APC Smart-UPS 3000',
    slug: 'apc-smartups-3000',
    categoryId: 5,
    subcategoryId: 51,
    price: 95000,
    mainImage: 'https://images.unsplash.com/photo-1591696331111-ef9586a5b17a?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1591696331111-ef9586a5b17a?w=600&h=600&fit=crop'
    ],
    description: 'Бесперебойный источник питания для защиты медтехники',
    specs: {
      'Мощность': '3000 ВА / 2700 Вт',
      'Время автономии': '15-30 мин',
      'Тип': 'Line-interactive',
      'Выходные разъемы': '8 x IEC',
      'Производитель': 'APC by Schneider Electric'
    },
    brand: 'APC',
    stock: 12,
    isNew: false,
    isPopular: true
  },
  {
    id: 502,
    name: 'ИБП Eaton 9PX 6000i',
    slug: 'eaton-9px-6000i',
    categoryId: 5,
    subcategoryId: 52,
    price: 280000,
    mainImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop'
    ],
    description: 'Резервный источник питания для критичного медоборудования',
    specs: {
      'Мощность': '6000 ВА / 5400 Вт',
      'Время автономии': '30-60 мин',
      'Тип': 'Online двойного преобразования',
      'Выходные разъемы': '6 x IEC',
      'Производитель': 'Eaton'
    },
    brand: 'Eaton',
    stock: 5,
    isNew: true,
    isPopular: false
  }
];

// Рекомендуемые товары для главной страницы
export const featuredProducts = [101, 103, 104, 201, 301, 401, 501, 102];

// Бренды для фильтрации
export const brands = [
  'Mindray',
  'GE Healthcare',
  'Chison',
  'Hologic',
  'Osteometer',
  'Hamilton Medical',
  'Dräger',
  'Sony',
  'Mitsubishi',
  'APC',
  'Eaton'
];

// Слайды для hero-секции (новости/акции)
export const heroSlides = [
  {
    id: 1,
    title: 'Профессиональное медицинское оборудование',
    subtitle: 'От ведущих производителей мира',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1920&h=800&fit=crop',
    ctaText: 'Перейти в каталог',
    ctaLink: '/catalog'
  },
  {
    id: 2,
    title: 'УЗИ-системы экспертного класса',
    subtitle: 'Передовые технологии диагностики',
    image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=1920&h=800&fit=crop',
    ctaText: 'Смотреть УЗИ аппараты',
    ctaLink: '/catalog/uzi-apparaty'
  },
  {
    id: 3,
    title: 'Оборудование для интенсивной терапии',
    subtitle: 'Надежность и точность в критических ситуациях',
    image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1920&h=800&fit=crop',
    ctaText: 'Смотреть ИВЛ аппараты',
    ctaLink: '/catalog/ivl-apparaty'
  }
];

// Описания категорий
export const categoryDescriptions = {
  'uzi-apparaty': 'Ультразвуковая диагностика — один из самых информативных и безопасных методов исследования. Мы предлагаем широкий выбор УЗИ-аппаратов различных классов от ведущих мировых производителей.',
  'densitometry': 'Денситометры для диагностики остеопороза и оценки минеральной плотности костной ткани. Точная и быстрая диагностика для предотвращения переломов.',
  'ivl-apparaty': 'Аппараты искусственной вентиляции легких для интенсивной терапии и реанимации. Надежное оборудование для спасения жизней.',
  'printery': 'Медицинские принтеры для печати УЗИ-снимков и другой медицинской документации. Высокое качество печати и надежность.',
  'istochniki-pitaniya': 'Источники бесперебойного питания для медицинского оборудования. Обеспечение непрерывной работы критически важного оборудования.'
};
