import { useState, useEffect } from 'react';

const API_URL = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/+$/, '');

/**
 * Hook for fetching categories from API
 * Returns categories in the same structure as fullCatalogTree.js
 */
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/categories/`);
        if (response.ok) {
          const data = await response.json();
          // Transform API data to match frontend structure
          const transformed = data.map(category => ({
            id: category.id,
            name: category.name,
            name_en: category.name_en || '',
            slug: category.slug,
            image: category.image ? getImageUrl(category.image) : null,
            description: category.description || '',
            description_en: category.description_en || '',
            children: (category.subcategories || []).map(sub => ({
              id: sub.id,
              name: sub.name,
              name_en: sub.name_en || '',
              slug: sub.slug,
              image: sub.image ? getImageUrl(sub.image) : null,
              description: sub.description || '',
              description_en: sub.description_en || '',
              children: (sub.children || []).map(child => ({
                id: child.id,
                name: child.name,
                name_en: child.name_en || '',
                slug: child.slug,
                image: child.image ? getImageUrl(child.image) : null,
                description: child.description || '',
                description_en: child.description_en || ''
              }))
            }))
          }));
          setCategories(transformed);
        } else {
          setError('Ошибка загрузки категорий');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Ошибка загрузки категорий');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};

/**
 * Hook for fetching products from API
 */
export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Build query params
        const params = new URLSearchParams();
        if (filters.category_id) params.append('category_id', filters.category_id);
        if (filters.subcategory_id) params.append('subcategory_id', filters.subcategory_id);
        if (filters.third_level_id) params.append('third_level_id', filters.third_level_id);
        if (filters.search) {
          params.append('search', filters.search);
          params.append('fuzzy', 'true'); // Enable fuzzy search for typo tolerance
        }
        if (filters.brand) params.append('brand', filters.brand);
        if (filters.in_stock !== undefined) params.append('in_stock', filters.in_stock);

        const url = `${API_URL}/api/products/?${params.toString()}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          // Transform product images
          const transformed = data.map(product => ({
            ...product,
            main_image: product.main_image ? getImageUrl(product.main_image) : null,
            images: (product.images || []).map(img => getImageUrl(img))
          }));
          setProducts(transformed);
        } else {
          setError('Ошибка загрузки товаров');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Ошибка загрузки товаров');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters.category_id, filters.subcategory_id, filters.third_level_id, filters.search, filters.brand, filters.in_stock]);

  return { products, loading, error };
};

/**
 * Hook for fetching a single product
 */
export const useProduct = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/products/${productId}`);

        if (response.ok) {
          const data = await response.json();
          // Transform product images
          const transformed = {
            ...data,
            main_image: data.main_image ? getImageUrl(data.main_image) : null,
            images: (data.images || []).map(img => getImageUrl(img))
          };
          setProduct(transformed);
        } else {
          setError('Товар не найден');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Ошибка загрузки товара');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return { product, loading, error };
};

/**
 * Hook for fetching category specs (filters)
 */
export const useCategorySpecs = (subcategorySlug, language = 'ru') => {
  const [specs, setSpecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!subcategorySlug) {
      setSpecs([]);
      setLoading(false);
      return;
    }

    const fetchSpecs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/categories/specs/${subcategorySlug}?lang=${language}`);

        if (response.ok) {
          const data = await response.json();
          setSpecs(data.specs || []);
        } else {
          setSpecs([]);
        }
      } catch (err) {
        console.error('Error fetching specs:', err);
        setSpecs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecs();
  }, [subcategorySlug, language]);

  return { specs, loading, error };
};

/**
 * Hook for fetching homepage slides
 */
export const useSlides = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/slides/`);

        if (response.ok) {
          const data = await response.json();
          const transformed = data.map(slide => ({
            ...slide,
            image: slide.image ? getImageUrl(slide.image) : null,
            image_desktop: slide.image_desktop ? getImageUrl(slide.image_desktop) : (slide.image ? getImageUrl(slide.image) : null),
            image_mobile: slide.image_mobile ? getImageUrl(slide.image_mobile) : null,
            image_tablet: slide.image_tablet ? getImageUrl(slide.image_tablet) : null
          }));
          setSlides(transformed);
        } else {
          setSlides([]);
        }
      } catch (err) {
        console.error('Error fetching slides:', err);
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  return { slides, loading, error };
};

/**
 * Hook for fetching featured products
 */
export const useFeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/featured/`);

        if (response.ok) {
          const data = await response.json();
          const transformed = data.map(product => ({
            ...product,
            main_image: product.main_image ? getImageUrl(product.main_image) : null,
            images: (product.images || []).map(img => getImageUrl(img))
          }));
          setProducts(transformed);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return { products, loading, error };
};

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_URL}${imagePath}`;
};

// Submit order
export const submitOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_URL}/api/orders/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Ошибка отправки заявки');
    }
  } catch (err) {
    console.error('Error submitting order:', err);
    throw err;
  }
};
