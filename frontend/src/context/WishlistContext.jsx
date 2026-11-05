import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { WISHLIST_ENDPOINTS } from '../constants';
import { sampleProducts } from '../data/sampleProducts';
import { useAuth } from './AuthContext';

/* ─────────────────────────────────────────
   Context creation
───────────────────────────────────────── */
const WishlistContext = createContext(null);

/* Helper function to filter valid populated products */
const normalizeWishlistItems = (productsArray) => {
  if (!Array.isArray(productsArray)) return [];
  return productsArray.filter((product) => product !== null && product !== undefined);
};

/* ─────────────────────────────────────────
   Provider
───────────────────────────────────────── */
export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  /* Derived: List of product ObjectIds for fast lookup */
  const wishlistIds = useMemo(() => {
    return wishlistItems.map((product) => (typeof product === 'object' ? product._id : product));
  }, [wishlistItems]);

  /* Derived: Count of wishlist items */
  const wishlistCount = wishlistItems.length;

  /* ─────────────────────────────────────
     clearLocalWishlist
  ───────────────────────────────────── */
  const clearLocalWishlist = useCallback(() => {
    setWishlistItems([]);
  }, []);

  /* ─────────────────────────────────────
     refreshWishlist
     GET /api/wishlist
  ───────────────────────────────────── */
  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      clearLocalWishlist();
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(WISHLIST_ENDPOINTS.GET);
      if (response.data?.data) {
        const rawProducts = response.data.data.products || [];
        const validProducts = normalizeWishlistItems(rawProducts);
        setWishlistItems([...validProducts]);
        return;
      }
    } catch (err) {
      console.warn('[WishlistContext] Backend wishlist offline, reading local storage:', err);
    } finally {
      setLoading(false);
    }

    try {
      const stored = localStorage.getItem('urbancart_local_wishlist');
      if (stored) {
        setWishlistItems(JSON.parse(stored));
      }
    } catch {
      setWishlistItems([]);
    }
  }, [isAuthenticated, clearLocalWishlist]);

  /* ── React automatically to login / logout ── */
  useEffect(() => {
    if (isAuthenticated) {
      refreshWishlist();
    } else {
      clearLocalWishlist();
    }
  }, [isAuthenticated, refreshWishlist, clearLocalWishlist]);

  /* ─────────────────────────────────────
     addToWishlist
     POST /api/wishlist  { productId }
  ───────────────────────────────────── */
  const addToWishlist = useCallback(async (productId) => {
    if (!isAuthenticated) {
      toast.info('Please login to add items to wishlist');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return;
    }
    try {
      const response = await api.post(WISHLIST_ENDPOINTS.ADD, { productId });
      if (response.data?.data) {
        const rawProducts = response.data.data.products || [];
        const validProducts = normalizeWishlistItems(rawProducts);
        setWishlistItems([...validProducts]);
        toast.success('Added to wishlist!');
        return response.data;
      }
    } catch (err) {
      console.warn('Backend wishlist offline, saving locally:', err);
    }

    // Local fallback
    const match = sampleProducts.find((p) => p._id === productId);
    setWishlistItems((prev) => {
      const already = prev.some((p) => (p._id || p) === productId);
      if (already) {
        toast.warning('Product is already in your wishlist');
        return prev;
      }
      const itemToAdd = match || { _id: productId, name: 'Wishlist Item', price: 999 };
      const updated = [...prev, itemToAdd];
      localStorage.setItem('urbancart_local_wishlist', JSON.stringify(updated));
      toast.success('Added to wishlist!');
      return updated;
    });
  }, [isAuthenticated]);

  /* ─────────────────────────────────────
     removeFromWishlist
     DELETE /api/wishlist/:productId
  ───────────────────────────────────── */
  const removeFromWishlist = useCallback(async (productId, showToast = true) => {
    try {
      const response = await api.delete(WISHLIST_ENDPOINTS.REMOVE(productId));
      if (response.data?.data) {
        const rawProducts = response.data.data.products || [];
        const validProducts = normalizeWishlistItems(rawProducts);
        setWishlistItems([...validProducts]);
        if (showToast) toast.success('Removed from wishlist');
        return response.data;
      }
    } catch (err) {
      console.warn('Backend wishlist offline, removing locally:', err);
    }

    setWishlistItems((prev) => {
      const updated = prev.filter((p) => (p._id || p) !== productId);
      localStorage.setItem('urbancart_local_wishlist', JSON.stringify(updated));
      if (showToast) toast.success('Removed from wishlist');
      return updated;
    });
  }, []);

  /* ─────────────────────────────────────
     isWishlisted
     Check if a productId is currently in wishlist
  ───────────────────────────────────── */
  const isWishlisted = useCallback((productId) => {
    if (!productId) return false;
    return wishlistIds.some((id) => id.toString() === productId.toString());
  }, [wishlistIds]);

  /* ─────────────────────────────────────
     Context Value
  ───────────────────────────────────── */
  const value = useMemo(() => ({
    wishlistItems,
    wishlistIds,
    wishlistCount,
    loading,
    refreshWishlist,
    addToWishlist,
    removeFromWishlist,
    isWishlisted,
    clearLocalWishlist,
  }), [
    wishlistItems,
    wishlistIds,
    wishlistCount,
    loading,
    refreshWishlist,
    addToWishlist,
    removeFromWishlist,
    isWishlisted,
    clearLocalWishlist,
  ]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

/* ─────────────────────────────────────────
   Custom Hook
───────────────────────────────────────── */
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
