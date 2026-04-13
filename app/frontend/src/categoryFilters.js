// Фильтры для каждой подкатегории
// Будут использоваться в админ-панели и на странице каталога

export const subcategoryFilters = {
  // УЗИ аппараты
  'uzi-devices': [
    { key: 'brand', label: 'Бренд', type: 'select', adminManaged: true },
    { key: 'deviceType', label: 'Тип устройства', type: 'checkbox', options: ['Портативный', 'Стационарный', 'Планшетный'] },
    { key: 'deviceClass', label: 'Класс устройства', type: 'checkbox', options: ['Начальный', 'Средний', 'Высокий', 'Экспертный', 'Премиальный'] },
    { key: 'application', label: 'Область применения', type: 'checkbox', options: ['Абдоминальные исследования', 'Акушерство', 'Гинекология', 'Кардиология', 'Урология', 'Педиатрия', 'Ветеринария', 'Маммология'] },
    { key: 'probeConnectors', label: 'Количество разъемов для датчиков', type: 'checkbox', options: ['1', '2', '3', '4', '5', '6'] },
    { key: 'country', label: 'Страна производства', type: 'select', adminManaged: true },
    { key: 'price', label: 'Цена', type: 'range' }
  ],

  // УЗИ датчики
  'uzi-probes': [
    { key: 'brand', label: 'Бренд', type: 'select', adminManaged: true },
    { key: 'probeType', label: 'Тип датчика', type: 'checkbox', options: ['Линейный', 'Конвексный', 'Секторный фазированный', 'Микроконвексный', 'Внутриполостной', 'Чреспищеводный', 'Карандашный'] },
    { key: 'frequency', label: 'Частота (МГц)', type: 'checkbox', options: ['2-5', '3-8', '5-10', '7-12', '10-15'] },
    { key: 'compatibility', label: 'Совместимость', type: 'select', adminManaged: true },
    { key: 'country', label: 'Страна', type: 'select', adminManaged: true },
    { key: 'price', label: 'Цена', type: 'range' }
  ],

  // Операционные столы
  'tables': [
    { key: 'brand', label: 'Бренд', type: 'select', adminManaged: true },
    { key: 'constructionType', label: 'Тип конструкции', type: 'checkbox', options: ['Мобильный', 'Стационарный', 'Напольный', 'Колонный'] },
    { key: 'purpose', label: 'Назначение', type: 'checkbox', options: ['Общая хирургия', 'Лапароскопия', 'Ортопедия', 'Нейрохирургия', 'Урология', 'Гинекология', 'Травматология'] },
    { key: 'xrayTransparent', label: 'Рентгенопрозрачность', type: 'checkbox', options: ['Да', 'Частично', 'Нет'] },
    { key: 'maxLoad', label: 'Максимальная нагрузка (кг)', type: 'checkbox', options: ['До 200', '200-300', '300-400', 'Более 400'] },
    { key: 'country', label: 'Страна', type: 'select', adminManaged: true },
    { key: 'price', label: 'Цена', type: 'range' }
  ],

  // Эндоскопы
  'endoscopes': [
    { key: 'brand', label: 'Бренд', type: 'select', adminManaged: true },
    { key: 'endoscopeType', label: 'Тип эндоскопа', type: 'checkbox', options: ['Гастроскоп', 'Колоноскоп', 'Бронхоскоп', 'Риноларингоскоп', 'Дуоденоскоп', 'Сигмоидоскоп', 'Гистероскоп', 'Уретроскоп', 'Цистоскоп'] },
    { key: 'workingLength', label: 'Рабочая длина (мм)', type: 'checkbox', options: ['До 500', '500-1000', '1000-1500', 'Более 1500'] },
    { key: 'diameter', label: 'Диаметр (мм)', type: 'checkbox', options: ['До 5', '5-8', '8-10', '10-12', 'Более 12'] },
    { key: 'channelDiameter', label: 'Диаметр канала (мм)', type: 'checkbox', options: ['1.2', '2.0', '2.8', '3.2', '3.8', '4.2'] },
    { key: 'country', label: 'Страна', type: 'select', adminManaged: true },
    { key: 'price', label: 'Цена', type: 'range' }
  ],

  // Аппараты ИВЛ
  'ventilators': [
    { key: 'brand', label: 'Бренд', type: 'select', adminManaged: true },
    { key: 'driveType', label: 'Тип привода', type: 'checkbox', options: ['Ручной', 'Турбинный', 'Пневматический'] },
    { key: 'patientCategory', label: 'Категория пациентов', type: 'checkbox', options: ['Взрослые', 'Дети', 'Новорожденные', 'Универсальный'] },
    { key: 'ventilationModes', label: 'Режимы вентиляции', type: 'checkbox', options: ['VCV', 'PCV', 'SIMV', 'ASV', 'CPAP', 'PSV', 'HFO'] },
    { key: 'ventilationType', label: 'Тип вентиляции', type: 'checkbox', options: ['Инвазивная', 'Неинвазивная', 'Комбинированная'] },
    { key: 'country', label: 'Страна', type: 'select', adminManaged: true },
    { key: 'price', label: 'Цена', type: 'range' }
  ],

  // Рентгеновские аппараты
  'xray': [
    { key: 'brand', label: 'Бренд', type: 'select', adminManaged: true },
    { key: 'xrayType', label: 'Тип аппарата', type: 'checkbox', options: ['Стационарный', 'Палатный', 'Портативный', 'С-дуга'] },
    { key: 'powerOutput', label: 'Мощность (кВт)', type: 'checkbox', options: ['До 20', '20-40', '40-60', 'Более 60'] },
    { key: 'detectorType', label: 'Тип детектора', type: 'checkbox', options: ['Цифровой', 'Аналоговый', 'CR', 'DR'] },
    { key: 'country', label: 'Страна', type: 'select', adminManaged: true },
    { key: 'price', label: 'Цена', type: 'range' }
  ],

  // Гинекологические кресла
  'chairs': [
    { key: 'brand', label: 'Бренд', type: 'select', adminManaged: true },
    { key: 'chairType', label: 'Тип кресла', type: 'checkbox', options: ['Механическое', 'Электрическое', 'Гидравлическое'] },
    { key: 'sections', label: 'Количество секций', type: 'checkbox', options: ['2', '3', '4', '5'] },
    { key: 'maxLoad', label: 'Максимальная нагрузка (кг)', type: 'checkbox', options: ['До 150', '150-200', '200-250', 'Более 250'] },
    { key: 'country', label: 'Страна', type: 'select', adminManaged: true },
    { key: 'price', label: 'Цена', type: 'range' }
  ],

  // Стандартные фильтры для остальных категорий
  'default': [
    { key: 'brand', label: 'Бренд', type: 'select', adminManaged: true },
    { key: 'country', label: 'Страна производства', type: 'select', adminManaged: true },
    { key: 'price', label: 'Цена', type: 'range' }
  ]
};

// Функция для получения фильтров по slug подкатегории
export const getFiltersForSubcategory = (subcategorySlug) => {
  return subcategoryFilters[subcategorySlug] || subcategoryFilters['default'];
};
