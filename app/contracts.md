# API Contracts и План Backend Интеграции

## Текущее состояние
- Frontend работает с mock-данными из `mockData.js` и `categoriesData.js`
- Backend API создан с маршрутами для категорий, товаров, заказов, новостей
- Необходимо интегрировать frontend с backend

## 1. API Endpoints

### Категории
- `GET /api/categories` - Получить все категории с подкатегориями
- `GET /api/categories/{id}` - Получить одну категорию
- `POST /api/categories` - Создать категорию (Admin)
- `PUT /api/categories/{id}` - Обновить категорию (Admin)
- `DELETE /api/categories/{id}` - Удалить категорию (Admin)

### Товары
- `GET /api/products` - Получить товары с фильтрацией
  - Query параметры: category_id, subcategory_id, search, brand, min_price, max_price, limit, skip
- `GET /api/products/count` - Количество товаров
- `GET /api/products/brands` - Список брендов
- `GET /api/products/{id}` - Получить товар по ID
- `GET /api/products/slug/{slug}` - Получить товар по slug
- `POST /api/products` - Создать товар (Admin)
- `PUT /api/products/{id}` - Обновить товар (Admin)
- `DELETE /api/products/{id}` - Удалить товар (Admin)

### Заказы
- `POST /api/orders` - Создать заказ
- `GET /api/orders` - Получить все заказы (Admin)
- `GET /api/orders/{id}` - Получить заказ
- `PUT /api/orders/{id}/status` - Обновить статус заказа (Admin)

### Рекомендуемые товары
- `GET /api/featured` - Получить рекомендуемые товары
- `POST /api/featured` - Добавить в рекомендуемые (Admin)
- `DELETE /api/featured/{id}` - Удалить из рекомендуемых (Admin)
- `PUT /api/featured/{id}/order` - Изменить порядок (Admin)

### Новости/Слайды
- `GET /api/news` - Получить слайды
- `POST /api/news` - Создать слайд (Admin)
- `PUT /api/news/{id}` - Обновить слайд (Admin)
- `DELETE /api/news/{id}` - Удалить слайд (Admin)

### Загрузка файлов
- `POST /api/upload/image` - Загрузить изображение (Admin)
- `DELETE /api/upload/image/{filename}` - Удалить изображение (Admin)

## 2. Модели данных

### Category
```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string",
  "image": "string (URL)",
  "description": "string",
  "order": "int",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Subcategory
```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string",
  "parent_id": "string (category id)",
  "order": "int",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Product
```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string",
  "category_id": "string",
  "subcategory_id": "string",
  "price": "float",
  "main_image": "string (URL)",
  "images": ["string (URLs)"],
  "description": "string",
  "specs": {"key": "value"},
  "brand": "string",
  "stock": "int",
  "is_new": "boolean",
  "is_popular": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Order
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "phone": "string",
  "organization": "string",
  "message": "string",
  "items": [{"product_id": "string", "quantity": "int"}],
  "total": "float",
  "status": "string",
  "created_at": "datetime"
}
```

## 3. Mock данные для замены

### В mockData.js:
- `categories` → API call to `/api/categories`
- `products` → API call to `/api/products`
- `heroSlides` → API call to `/api/news`
- `featuredProducts` → API call to `/api/featured`

## 4. Frontend интеграция

### Файлы для обновления:
1. `src/pages/Home.jsx` - загрузка слайдов, рекомендуемых товаров, категорий
2. `src/pages/Catalog.jsx` - загрузка товаров с фильтрацией
3. `src/pages/ProductDetail.jsx` - загрузка деталей товара
4. `src/pages/Cart.jsx` - отправка заказа
5. `src/components/Header.jsx` - загрузка категорий для навигации

### API helper создать:
```javascript
// src/api/index.js
const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

export const getCategories = () => fetch(`${API_URL}/categories`).then(r => r.json());
export const getProducts = (filters) => fetch(`${API_URL}/products?${new URLSearchParams(filters)}`).then(r => r.json());
// ... и т.д.
```

## 5. Админ-панель (новая страница)

### Маршруты:
- `/admin` - Дашборд
- `/admin/categories` - Управление категориями
- `/admin/products` - Управление товарами
- `/admin/orders` - Управление заказами
- `/admin/news` - Управление слайдами
- `/admin/featured` - Управление рекомендуемыми

### Аутентификация:
- Использовать admin token из файла `/app/backend/admin_token.txt`
- Token: `ADMIN_TOKEN_2024_MEDEQUIP_STORE_SECURE_KEY_d8f7a9b3c5e1`
- Хранить в localStorage после входа
- Передавать в header: `X-Admin-Token`

## 6. Следующие шаги

1. ✅ Backend API создан
2. ✅ Frontend с mock-данными работает
3. ⏭️ Создать API helper и интегрировать frontend с backend
4. ⏭️ Создать админ-панель
5. ⏭️ Загрузить начальные данные в базу (15 категорий, товары)
6. ⏭️ Тестирование
