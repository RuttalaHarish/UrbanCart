import { useState, useEffect, useRef } from 'react';
import api from '../../../api/axios';
import { PRODUCT_ENDPOINTS } from '../../../constants';
import HeroSlide from './HeroSlide';
import { heroSlides as fallbackSlides } from './heroSlides';

// Priority category order for intelligent Hero selection
const PRIORITY_CATEGORIES = [
  'electronics',
  'fashion',
  'books',
  'sports',
  'beauty',
  'home & kitchen',
  'groceries',
];

const BACKGROUND_GRADIENTS = [
  'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
  'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
  'linear-gradient(135deg, #18181b 0%, #27272a 50%, #3f3f46 100%)',
  'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #075985 100%)',
  'linear-gradient(135deg, #4c1d95 0%, #5b21b6 50%, #6d28d9 100%)',
  'linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)',
];

const DEFAULT_PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80';

// Format prices into Indian Rupee (INR) currency format (e.g. ₹34,999)
const formatINR = (price) => {
  const num = typeof price === 'number' ? price : parseFloat(price);
  if (isNaN(num)) return price;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

function HeroSlider() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const timeoutRef = useRef(null);

  // Fetch real products from backend and map unique priority categories
  useEffect(() => {
    let isMounted = true;

    const fetchHeroProducts = async () => {
      setLoading(true);
      try {
        const response = await api.get(PRODUCT_ENDPOINTS.LIST);
        if (
          isMounted &&
          response.data &&
          Array.isArray(response.data.data) &&
          response.data.data.length > 0
        ) {
          const allProducts = response.data.data;

          // 1. Group products by lowercase category key (1 product per category)
          const categoryMap = {};
          for (const prod of allProducts) {
            const catKey = (prod.category || '').trim().toLowerCase();
            if (catKey && !categoryMap[catKey]) {
              categoryMap[catKey] = prod;
            }
          }

          // 2. Select products following the priority order (max 6 slides)
          const selectedProducts = [];
          for (const priorityCat of PRIORITY_CATEGORIES) {
            if (categoryMap[priorityCat]) {
              selectedProducts.push(categoryMap[priorityCat]);
            }
            if (selectedProducts.length >= 6) break;
          }

          // 3. Fallback fill for any remaining unique categories if < 6
          if (selectedProducts.length < 6) {
            for (const prod of allProducts) {
              const catKey = (prod.category || '').trim().toLowerCase();
              if (
                catKey &&
                !selectedProducts.some(
                  (p) => (p.category || '').trim().toLowerCase() === catKey
                )
              ) {
                selectedProducts.push(prod);
              }
              if (selectedProducts.length >= 6) break;
            }
          }

          if (selectedProducts.length > 0) {
            const mappedSlides = selectedProducts.map((product, idx) => {
              const formattedPrice = formatINR(product.price);
              const rawCat = (product.category || '').trim();
              const categoryLink = rawCat
                ? `/shop?category=${encodeURIComponent(rawCat)}`
                : '/shop';

              return {
                id: product._id,
                tag: rawCat ? rawCat.toUpperCase() : 'FEATURED CATALOG',
                offer: `SPECIAL OFFER - ${formattedPrice}`,
                title: product.name,
                description: product.description,
                image: product.images?.[0] || DEFAULT_PLACEHOLDER_IMAGE,
                ctaText: 'Shop Now',
                link: categoryLink,
                bgGradient: BACKGROUND_GRADIENTS[idx % BACKGROUND_GRADIENTS.length],
              };
            });
            setSlides(mappedSlides);
          } else {
            setSlides(fallbackSlides);
          }
        } else if (isMounted) {
          setSlides(fallbackSlides);
        }
      } catch (err) {
        console.error('Fetch hero products failed, using fallback slides:', err);
        if (isMounted) {
          setSlides(fallbackSlides);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHeroProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Automatic slide rotation (4s interval) with proper timer cleanup
  useEffect(() => {
    if (!slides || slides.length <= 1) return;

    const intervalTimer = setInterval(() => {
      setIsFading(true);
      timeoutRef.current = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
        setIsFading(false);
      }, 300);
    }, 4000);

    return () => {
      clearInterval(intervalTimer);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [slides]);

  // Loading skeleton state
  if (loading) {
    return (
      <div
        className="hero-banner-wrapper"
        style={{
          minHeight: '380px',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-xxl)',
          border: '1px solid var(--color-border)',
          opacity: 0.7,
        }}
      >
        <div style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)', fontSize: 'var(--font-size-body)' }}>
          Loading featured collection...
        </div>
      </div>
    );
  }

  const safeSlides = slides.length > 0 ? slides : fallbackSlides;
  const safeIndex = currentIndex < safeSlides.length ? currentIndex : 0;
  const currentSlide = safeSlides[safeIndex] || fallbackSlides[0];

  return (
    <div className={`hero-banner-wrapper ${isFading ? 'hero-banner-fading' : ''}`}>
      <HeroSlide slide={currentSlide} />
    </div>
  );
}

export default HeroSlider;
