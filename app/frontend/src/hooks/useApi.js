import { useState, useEffect } from 'react';

const API_URL = '';

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
  const [total, setTotal] = useState(0);
  const [facets, setFacets] = useState({ brands: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setError(null);
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Build query params
        const params = new URLSearchParams({ page: '1', page_size: '100' });
        if (filters.category_id) params.append('category_id', filters.category_id);
        if (filters.subcategory_id) params.append('subcategory_id', filters.subcategory_id);
        if (filters.third_level_id) params.append('third_level_id', filters.third_level_id);
        if (filters.search) params.append('search', filters.search);
        if (filters.brand) params.append('brand', filters.brand);
        if (filters.in_stock !== undefined) params.append('in_stock', filters.in_stock);

        const firstResponse = await fetch(`${API_URL}/api/products/page?${params.toString()}`, {signal:controller.signal});
        if (!firstResponse.ok) throw new Error(`Products API returned ${firstResponse.status}`);
        const first = await firstResponse.json();
        const pages = Array.from({length: Math.max(0, first.pages - 1)}, (_, index) => index + 2);
        const remaining = [];
        for (let offset = 0; offset < pages.length; offset += 4) {
          const batch = await Promise.all(pages.slice(offset, offset + 4).map(async page => {
            const pageParams = new URLSearchParams(params); pageParams.set('page', String(page));
            const response = await fetch(`${API_URL}/api/products/page?${pageParams.toString()}`, {signal:controller.signal});
            if (!response.ok) throw new Error(`Products API returned ${response.status}`);
            return response.json();
          }));
          remaining.push(...batch);
          if (controller.signal.aborted) return;
        }
        const data = [first, ...remaining].flatMap(result => result.items || []);
        const transformed = data.map(product => ({
          ...product,
          main_image: product.main_image ? getImageUrl(product.main_image) : null,
          images: (product.images || []).map(img => getImageUrl(img))
        }));
        if (!controller.signal.aborted) {
          setProducts(transformed); setTotal(first.total || 0); setFacets(first.facets || {brands:[]});
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Error fetching products:', err);
        setError('Ошибка загрузки товаров');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [filters.category_id, filters.subcategory_id, filters.third_level_id, filters.search, filters.brand, filters.in_stock]);

  return { products, loading, error, total, facets };
};

/** Fetch one Mongo-filtered page while facets and total count cover its full scope. */
export const useProductsPage = (filters = {}) => {
  const [products,setProducts]=useState([]);
  const [total,setTotal]=useState(0);
  const [pages,setPages]=useState(0);
  const [facets,setFacets]=useState({brands:[],category_ids:[]});
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const filterKey=JSON.stringify(filters);
  useEffect(()=>{
    const controller=new AbortController();
    const params=new URLSearchParams();
    for(const key of ['category_id','subcategory_id','third_level_id','search','brand','min_price','max_price','in_stock','sort','page','page_size','language']){
      const value=filters[key];if(value!==undefined&&value!==null&&value!=='')params.set(key,String(value));
    }
    for(const value of filters.brands||[])params.append('brands',value);
    if(filters.spec_filters&&Object.keys(filters.spec_filters).length)params.set('spec_filters',JSON.stringify(filters.spec_filters));
    setLoading(true);setError(null);
    fetch(`${API_URL}/api/products/page?${params}`,{signal:controller.signal})
      .then(async response=>{if(!response.ok)throw new Error(`Products API returned ${response.status}`);return response.json();})
      .then(data=>{
        if(controller.signal.aborted)return;
        setProducts((data.items||[]).map(product=>({...product,main_image:product.main_image?getImageUrl(product.main_image):null,images:(product.images||[]).map(getImageUrl)})));
        setTotal(data.total||0);setPages(data.pages||0);setFacets(data.facets||{brands:[],category_ids:[]});
      })
      .catch(err=>{if(controller.signal.aborted)return;setProducts([]);setTotal(0);setPages(0);setError('Ошибка загрузки товаров');})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return()=>controller.abort();
  // filterKey stabilizes object and array dependencies while tracking every filter value.
  },[filterKey]);
  return {products,total,pages,facets,loading,error};
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
    const controller = new AbortController();
    setSpecs([]);
    const fetchSpecs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/categories/specs/${subcategorySlug}?lang=${language}`,{signal:controller.signal});

        if (response.ok) {
          const data = await response.json();
          if (!controller.signal.aborted) setSpecs(data.specs || []);
        } else {
          setSpecs([]);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Error fetching specs:', err);
        setSpecs([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchSpecs();
    return () => controller.abort();
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
  // Cloudinary URLs or any absolute URLs — return as-is
  if (imagePath.startsWith('http')) return imagePath;
  // Local paths — prepend backend URL
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
