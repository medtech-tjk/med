import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, X, AlertCircle, Upload, Loader2, FileText, Trash2 } from 'lucide-react';

const AdminProductForm = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!productId;
  const fileInputRef = useRef(null);
  const additionalFileInputRef = useRef(null);
  const documentInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [categorySpecs, setCategorySpecs] = useState([]);

  const [form, setForm] = useState({
    name: '',
    name_en: '',
    slug: '',
    sku: '',
    category_id: '',
    subcategory_id: '',
    third_level_id: '',
    price: 0,
    old_price: 0,
    main_image: '',
    images: [],
    description: '',
    description_en: '',
    specs: {},
    spec_groups: [],
    spec_groups_en: [],
    documents: [],
    brand: '',
    video_url: '',
    in_stock: true,
    is_new: false,
    is_popular: false
  });

  // Specs based on category
  const [specValues, setSpecValues] = useState({});

  // Группы характеристик с заголовками
  const [specGroups, setSpecGroups] = useState([
    { title: 'Основные характеристики', items: [{ key: '', value: '' }] }
  ]);

  // Английские группы характеристик
  const [specGroupsEn, setSpecGroupsEn] = useState([
    { title: 'Main Specifications', items: [{ key: '', value: '' }] }
  ]);

  const token = localStorage.getItem('adminToken');
  const API_URL = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/+$/, '');

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchProduct();
    }
  }, [productId]);

  // Fetch category specs when subcategory changes
  useEffect(() => {
    if (selectedSubcategory?.slug) {
      fetchCategorySpecs(selectedSubcategory.slug);
    } else {
      setCategorySpecs([]);
    }
  }, [selectedSubcategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categories/`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories');
    }
  };

  const fetchCategorySpecs = async (slug) => {
    try {
      const response = await fetch(`${API_URL}/api/categories/specs/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setCategorySpecs(data.specs || []);

        // Initialize spec values
        const initialValues = {};
        (data.specs || []).forEach(spec => {
          initialValues[spec.key] = specValues[spec.key] || '';
        });
        setSpecValues(prev => ({ ...prev, ...initialValues }));
      }
    } catch (err) {
      console.error('Error fetching category specs');
      setCategorySpecs([]);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setForm({
          ...data,
          name_en: data.name_en || '',
          old_price: data.old_price || 0,
          images: data.images || [],
          description_en: data.description_en || '',
          specs: data.specs || {},
          spec_groups: data.spec_groups || [],
          spec_groups_en: data.spec_groups_en || [],
          documents: data.documents || [],
          in_stock: data.in_stock !== false
        });

        // Parse specs
        if (data.specs) {
          setSpecValues(data.specs);
        }

        // Parse spec groups
        if (data.spec_groups && data.spec_groups.length > 0) {
          setSpecGroups(data.spec_groups.map(group => ({
            title: group.title,
            items: Object.entries(group.items || {}).map(([key, value]) => ({ key, value }))
          })));
        }

        // Parse English spec groups
        if (data.spec_groups_en && data.spec_groups_en.length > 0) {
          setSpecGroupsEn(data.spec_groups_en.map(group => ({
            title: group.title,
            items: Object.entries(group.items || {}).map(([key, value]) => ({ key, value }))
          })));
        }
      } else {
        setError('Товар не найден');
      }
    } catch (err) {
      setError('Ошибка загрузки товара');
    } finally {
      setLoading(false);
    }
  };

  // Set category and subcategory after categories are loaded (for editing)
  useEffect(() => {
    if (categories.length > 0 && form.category_id) {
      const cat = categories.find(c => c.id === form.category_id);
      if (cat) {
        setSelectedCategory(cat);
        if (form.subcategory_id && cat.subcategories) {
          const subcat = cat.subcategories.find(s => s.id === form.subcategory_id);
          setSelectedSubcategory(subcat);
        }
      }
    }
  }, [categories, form.category_id, form.subcategory_id]);

  const generateSlug = (name) => {
    const translitMap = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
      'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
      'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
      'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
      ' ': '-'
    };
    return name.toLowerCase().split('').map(char => translitMap[char] || char).join('').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
  };

  const generateSku = () => {
    const prefix = selectedCategory?.slug?.substring(0, 3).toUpperCase() || 'PRD';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${random}`;
  };

  const handleNameChange = (name) => {
    setForm({
      ...form,
      name,
      slug: generateSlug(name),
      sku: form.sku || generateSku()
    });
  };

  const handleCategoryChange = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setForm({ ...form, category_id: categoryId, subcategory_id: '', third_level_id: '' });
    setSpecValues({});
    setCategorySpecs([]);
  };

  const handleSubcategoryChange = (subcategoryId) => {
    const subcategory = selectedCategory?.subcategories?.find(s => s.id === subcategoryId);
    setSelectedSubcategory(subcategory);
    setForm({ ...form, subcategory_id: subcategoryId, third_level_id: '' });
  };

  const handleThirdLevelChange = (thirdLevelId) => {
    setForm({ ...form, third_level_id: thirdLevelId });
  };

  // Get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  // Image upload
  const handleImageUpload = async (file, isMain = true) => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/api/upload/`, {
        method: 'POST',
        headers: { 'X-Admin-Token': token },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (isMain) {
          setForm({ ...form, main_image: data.url });
        } else {
          setForm({ ...form, images: [...form.images, data.url] });
        }
      } else {
        setError('Ошибка загрузки изображения');
      }
    } catch (err) {
      setError('Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };

  // Document upload
  const handleDocumentUpload = async (file) => {
    if (!file) return;

    setUploadingDoc(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/api/upload/document`, {
        method: 'POST',
        headers: { 'X-Admin-Token': token },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const docName = file.name.replace('.pdf', '') || 'Документ';
        setForm({
          ...form,
          documents: [...form.documents, {
            name: docName,
            url: data.url,
            type: 'pdf'
          }]
        });
      } else {
        setError('Ошибка загрузки документа');
      }
    } catch (err) {
      setError('Ошибка загрузки документа');
    } finally {
      setUploadingDoc(false);
    }
  };

  const removeImage = (index) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  };

  const removeDocument = (index) => {
    setForm({ ...form, documents: form.documents.filter((_, i) => i !== index) });
  };

  const updateDocumentName = (index, name) => {
    const updated = [...form.documents];
    updated[index] = { ...updated[index], name };
    setForm({ ...form, documents: updated });
  };

  // Spec Groups management
  const addSpecGroup = () => {
    setSpecGroups([...specGroups, { title: '', items: [{ key: '', value: '' }] }]);
  };

  const removeSpecGroup = (index) => {
    setSpecGroups(specGroups.filter((_, i) => i !== index));
  };

  const updateSpecGroupTitle = (index, title) => {
    const updated = [...specGroups];
    updated[index].title = title;
    setSpecGroups(updated);
  };

  const addSpecToGroup = (groupIndex) => {
    const updated = [...specGroups];
    updated[groupIndex].items.push({ key: '', value: '' });
    setSpecGroups(updated);
  };

  const removeSpecFromGroup = (groupIndex, itemIndex) => {
    const updated = [...specGroups];
    updated[groupIndex].items = updated[groupIndex].items.filter((_, i) => i !== itemIndex);
    setSpecGroups(updated);
  };

  const updateSpecInGroup = (groupIndex, itemIndex, field, value) => {
    const updated = [...specGroups];
    updated[groupIndex].items[itemIndex][field] = value;
    setSpecGroups(updated);
  };

  // English Spec Groups management
  const addSpecGroupEn = () => {
    setSpecGroupsEn([...specGroupsEn, { title: '', items: [{ key: '', value: '' }] }]);
  };

  const removeSpecGroupEn = (index) => {
    setSpecGroupsEn(specGroupsEn.filter((_, i) => i !== index));
  };

  const updateSpecGroupTitleEn = (index, title) => {
    const updated = [...specGroupsEn];
    updated[index].title = title;
    setSpecGroupsEn(updated);
  };

  const addSpecToGroupEn = (groupIndex) => {
    const updated = [...specGroupsEn];
    updated[groupIndex].items.push({ key: '', value: '' });
    setSpecGroupsEn(updated);
  };

  const removeSpecFromGroupEn = (groupIndex, itemIndex) => {
    const updated = [...specGroupsEn];
    updated[groupIndex].items = updated[groupIndex].items.filter((_, i) => i !== itemIndex);
    setSpecGroupsEn(updated);
  };

  const updateSpecInGroupEn = (groupIndex, itemIndex, field, value) => {
    const updated = [...specGroupsEn];
    updated[groupIndex].items[itemIndex][field] = value;
    setSpecGroupsEn(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Convert spec groups to proper format
    const formattedSpecGroups = specGroups
      .filter(group => group.title)
      .map(group => ({
        title: group.title,
        items: group.items
          .filter(item => item.key && item.value)
          .reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
          }, {})
      }))
      .filter(group => Object.keys(group.items).length > 0);

    // Convert English spec groups to proper format
    const formattedSpecGroupsEn = specGroupsEn
      .filter(group => group.title)
      .map(group => ({
        title: group.title,
        items: group.items
          .filter(item => item.key && item.value)
          .reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
          }, {})
      }))
      .filter(group => Object.keys(group.items).length > 0);

    const productData = {
      ...form,
      specs: specValues,
      spec_groups: formattedSpecGroups,
      spec_groups_en: formattedSpecGroupsEn,
      sku: form.sku || generateSku()
    };

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing
        ? `${API_URL}/api/products/${productId}`
        : `${API_URL}/api/products/`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': token
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        navigate('/admin/products');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || 'Ошибка сохранения');
      }
    } catch (err) {
      setError('Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <button
        onClick={() => navigate('/admin/products')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Назад к товарам
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {isEditing ? 'Редактирование товара' : 'Новый товар'}
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
          <AlertCircle size={18} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X size={18} /></button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Основная информация</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name (English)</label>
              <input
                type="text"
                value={form.name_en}
                onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Product name in English"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Артикул (SKU)</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="Автоматически"
                className="w-full px-4 py-2 border rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Категория *</label>
              <select
                value={form.category_id}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Выберите категорию</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Подкатегория</label>
              <select
                value={form.subcategory_id}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={!selectedCategory}
              >
                <option value="">Выберите подкатегорию</option>
                {selectedCategory?.subcategories?.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
            {selectedSubcategory?.children && selectedSubcategory.children.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип (3 уровень)</label>
                <select
                  value={form.third_level_id}
                  onChange={(e) => handleThirdLevelChange(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите тип</option>
                  {selectedSubcategory.children.map(child => (
                    <option key={child.id} value={child.id}>{child.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Бренд</label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка на видео (YouTube/Vimeo)</label>
              <input
                type="url"
                value={form.video_url || ''}
                onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-gray-500 mt-1">Поддерживаются YouTube и Vimeo ссылки</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Цена (TJS) *</label>
              <input
                type="number"
                value={form.price || ''}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Старая цена (TJS)</label>
              <input
                type="number"
                value={form.old_price || ''}
                onChange={(e) => setForm({ ...form, old_price: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Для скидки"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Наличие *</label>
              <select
                value={form.in_stock ? 'in_stock' : 'on_request'}
                onChange={(e) => setForm({ ...form, in_stock: e.target.value === 'in_stock' })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="in_stock">Есть в наличии</option>
                <option value="on_request">По заявке</option>
              </select>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_new}
                  onChange={(e) => setForm({ ...form, is_new: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Новинка</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_popular}
                  onChange={(e) => setForm({ ...form, is_popular: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Популярное</span>
              </label>
            </div>
          </div>
        </div>

        {/* Images - Upload */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Изображения</h2>
          <div className="space-y-4">
            {/* Main Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Главное изображение</label>
              <div className="flex gap-4 items-start">
                {form.main_image ? (
                  <div className="relative">
                    <img src={getImageUrl(form.main_image)} alt="Main" className="w-32 h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, main_image: '' })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    {uploading ? (
                      <Loader2 className="animate-spin text-blue-500" size={24} />
                    ) : (
                      <>
                        <Upload className="text-gray-400 mb-2" size={24} />
                        <span className="text-xs text-gray-500">Загрузить</span>
                      </>
                    )}
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleImageUpload(e.target.files[0], true)}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* Additional Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Дополнительные изображения</label>
              <div className="flex flex-wrap gap-4">
                {form.images.map((img, index) => (
                  <div key={index} className="relative">
                    <img src={getImageUrl(img)} alt="" className="w-24 h-24 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <div
                  onClick={() => additionalFileInputRef.current?.click()}
                  className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="animate-spin text-blue-500" size={20} />
                  ) : (
                    <Plus className="text-gray-400" size={24} />
                  )}
                </div>
                <input
                  type="file"
                  ref={additionalFileInputRef}
                  onChange={(e) => handleImageUpload(e.target.files[0], false)}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Documents / PDF */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Документация (PDF)</h2>
              <p className="text-sm text-gray-500">Инструкции, сертификаты, технические описания</p>
            </div>
            <button
              type="button"
              onClick={() => documentInputRef.current?.click()}
              disabled={uploadingDoc}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {uploadingDoc ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Upload size={18} />
              )}
              Загрузить PDF
            </button>
            <input
              type="file"
              ref={documentInputRef}
              onChange={(e) => handleDocumentUpload(e.target.files[0])}
              accept=".pdf"
              className="hidden"
            />
          </div>

          {form.documents.length > 0 ? (
            <div className="space-y-3">
              {form.documents.map((doc, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="text-red-500 flex-shrink-0" size={24} />
                  <input
                    type="text"
                    value={doc.name}
                    onChange={(e) => updateDocumentName(index, e.target.value)}
                    className="flex-1 px-3 py-1.5 border rounded-lg text-sm"
                    placeholder="Название документа"
                  />
                  <a
                    href={getImageUrl(doc.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Открыть
                  </a>
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="mx-auto mb-2 text-gray-300" size={48} />
              <p>Документы не загружены</p>
              <p className="text-sm">Загрузите PDF файлы для отображения на странице товара</p>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Описание</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Описание (Русский)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[150px]"
                placeholder="Полное описание товара..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (English)</label>
              <textarea
                value={form.description_en}
                onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[150px]"
                placeholder="Full product description in English..."
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Поддерживается HTML разметка</p>
        </div>

        {/* Category-specific Specifications */}
        {categorySpecs.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Фильтруемые характеристики "{selectedSubcategory?.name}"
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Эти характеристики используются для фильтрации товаров в каталоге
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {categorySpecs.map((spec) => (
                <div key={spec.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{spec.key}</label>
                  {spec.type === 'input' ? (
                    <div className="relative">
                      <input
                        type="text"
                        value={specValues[spec.key] || ''}
                        onChange={(e) => setSpecValues({ ...specValues, [spec.key]: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={`Введите ${spec.key.toLowerCase()}`}
                        list={`${spec.key}-options`}
                      />
                      {spec.options && spec.options.length > 0 && (
                        <datalist id={`${spec.key}-options`}>
                          {spec.options.map(opt => (
                            <option key={opt} value={opt} />
                          ))}
                        </datalist>
                      )}
                    </div>
                  ) : (
                    <select
                      value={specValues[spec.key] || ''}
                      onChange={(e) => setSpecValues({ ...specValues, [spec.key]: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Выберите значение</option>
                      {spec.options && spec.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specification Groups with Titles */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Группы характеристик</h2>
              <p className="text-sm text-gray-500">Добавьте характеристики с заголовками (напр. "Основные характеристики", "Технические данные")</p>
            </div>
            <button
              type="button"
              onClick={addSpecGroup}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <Plus size={18} />
              Добавить группу
            </button>
          </div>

          <div className="space-y-6">
            {specGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="text"
                    value={group.title}
                    onChange={(e) => updateSpecGroupTitle(groupIndex, e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg font-semibold focus:ring-2 focus:ring-blue-500"
                    placeholder="Заголовок группы (напр. Основные характеристики)"
                  />
                  {specGroups.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSpecGroup(groupIndex)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {group.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.key}
                        onChange={(e) => updateSpecInGroup(groupIndex, itemIndex, 'key', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        placeholder="Название (напр. Вес)"
                      />
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) => updateSpecInGroup(groupIndex, itemIndex, 'value', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        placeholder="Значение (напр. 5 кг)"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecFromGroup(groupIndex, itemIndex)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addSpecToGroup(groupIndex)}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={16} />
                  Добавить характеристику
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* English Specification Groups */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Specification Groups (English)</h2>
              <p className="text-sm text-gray-500">Add specifications in English for international visitors</p>
            </div>
            <button
              type="button"
              onClick={addSpecGroupEn}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <Plus size={18} />
              Add Group
            </button>
          </div>

          <div className="space-y-6">
            {specGroupsEn.map((group, groupIndex) => (
              <div key={groupIndex} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="text"
                    value={group.title}
                    onChange={(e) => updateSpecGroupTitleEn(groupIndex, e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg font-semibold focus:ring-2 focus:ring-blue-500"
                    placeholder="Group title (e.g. Main Specifications)"
                  />
                  {specGroupsEn.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSpecGroupEn(groupIndex)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {group.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.key}
                        onChange={(e) => updateSpecInGroupEn(groupIndex, itemIndex, 'key', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        placeholder="Name (e.g. Weight)"
                      />
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) => updateSpecInGroupEn(groupIndex, itemIndex, 'value', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        placeholder="Value (e.g. 5 kg)"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecFromGroupEn(groupIndex, itemIndex)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addSpecToGroupEn(groupIndex)}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={16} />
                  Add specification
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="flex-1 py-3 px-6 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
