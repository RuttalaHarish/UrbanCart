import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { WISHLIST_ENDPOINTS } from '../constants';
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
      }
    } catch (err) {
      console.error('[WishlistContext] fetch error:', err);
    } finally {
      setLoading(false);
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
      console.error('[WishlistContext] addToWishlist error:', err);
      const msg = err.response?.data?.message || 'Failed to add to wishlist';
      if (msg.toLowerCase().includes('already in wishlist')) {
        toast.warning(msg);
      } else {
        toast.error(msg);
      }
      throw err;
    }
  }, []);

  /* ─────────────────────────────────────
     removeFromWishlist
     DELETE /api/wishlist/:productId
  ───────────────────────────────────── */
  const removeFromWishlist = useCallback(async (productId) => {
    try {
      const response = await api.delete(WISHLIST_ENDPOINTS.REMOVE(productId));
      if (response.data?.data) {
        const rawProducts = response.data.data.products || [];
        const validProducts = normalizeWishlistItems(rawProducts);
        setWishlistItems([...validProducts]);
        toast.success('Removed from wishlist');
        return response.data;
      }
    } catch (err) {
      console.error('[WishlistContext] removeFromWishlist error:', err);
      const msg = err.response?.data?.message || 'Failed to remove from wishlist';
      toast.error(msg);
      throw err;
    }
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
