import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { CART_ENDPOINTS } from '../constants';
import { sampleProducts } from '../data/sampleProducts';
import { useAuth } from './AuthContext';

/* ─────────────────────────────────────────
   Context creation
───────────────────────────────────────── */
const CartContext = createContext(null);

/* Helper function to filter out invalid or unpopulated products */
const normalizeCartItems = (rawItems) => {
  if (!Array.isArray(rawItems)) return [];
  return rawItems.filter(
    (item) => item && item.product !== null && item.product !== undefined
  );
};

/* ─────────────────────────────────────────
   Provider
───────────────────────────────────────── */
export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ── Derived: total number of units across all valid items ── */
  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity ?? 0), 0);

  /* ─────────────────────────────────────
     fetchCart
     GET /api/cart → response.data.data.items[]
  ───────────────────────────────────── */
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(CART_ENDPOINTS.GET);
      if (response.data?.data) {
        const rawItems = response.data.data.items || [];
        const validItems = normalizeCartItems(rawItems);
        setCartItems(validItems);
        return;
      }
    } catch (err) {
      console.warn('[CartContext] Backend cart offline, reading local storage:', err);
    } finally {
      setLoading(false);
    }

    // Local storage fallback for live demo
    try {
      const stored = localStorage.getItem('urbancart_local_cart');
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
    } catch {
      setCartItems([]);
    }
  }, [isAuthenticated]);

  /* ─────────────────────────────────────
     addToCart
     POST /api/cart  { productId, quantity }
  ───────────────────────────────────── */
  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.info('Please login to add items to cart');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return;
    }
    try {
      const response = await api.post(CART_ENDPOINTS.ADD, { productId, quantity });
      if (response.data?.data) {
        const rawItems = response.data.data.items || [];
        const validItems = normalizeCartItems(rawItems);
        setCartItems(validItems);
        return;
      }
    } catch (err) {
      console.warn('Backend cart offline, updating locally:', err);
    }

    // Local cart fallback
    const match = sampleProducts.find((p) => p._id === productId);
    setCartItems((prev) => {
      const existing = prev.find((item) => (item.product?._id || item.product) === productId);
      let updated;
      if (existing) {
        updated = prev.map((item) =>
          (item.product?._id || item.product) === productId
            ? { ...item, quantity: (item.quantity || 1) + quantity }
            : item
        );
      } else {
        const newProduct = match || { _id: productId, name: 'Product Item', price: 999 };
        updated = [...prev, { _id: 'cart-item-' + Date.now(), product: newProduct, quantity }];
      }
      localStorage.setItem('urbancart_local_cart', JSON.stringify(updated));
      return updated;
    });
  }, [isAuthenticated]);

  /* ─────────────────────────────────────
     removeFromCart
     DELETE /api/cart/:productId
  ───────────────────────────────────── */
  const removeFromCart = useCallback(async (productId) => {
    try {
      const response = await api.delete(CART_ENDPOINTS.REMOVE(productId));
      if (response.data?.data) {
        const rawItems = response.data.data.items || [];
        const validItems = normalizeCartItems(rawItems);
        setCartItems(validItems);
        return;
      }
    } catch (err) {
      console.warn('Backend cart offline, removing locally:', err);
    }

    setCartItems((prev) => {
      const updated = prev.filter((item) => (item.product?._id || item.product) !== productId);
      localStorage.setItem('urbancart_local_cart', JSON.stringify(updated));
      return updated;
    });
  }, []);

  /* ─────────────────────────────────────
     updateQuantity
     PUT /api/cart/:productId  { quantity }
  ───────────────────────────────────── */
  const updateQuantity = useCallback(async (productId, quantity) => {
    try {
      const response = await api.put(CART_ENDPOINTS.UPDATE(productId), { quantity });
      if (response.data?.data) {
        const rawItems = response.data.data.items || [];
        const validItems = normalizeCartItems(rawItems);
        setCartItems(validItems);
        return;
      }
    } catch (err) {
      console.warn('Backend cart offline, updating quantity locally:', err);
    }

    setCartItems((prev) => {
      const updated = prev.map((item) =>
        (item.product?._id || item.product) === productId
          ? { ...item, quantity }
          : item
      );
      localStorage.setItem('urbancart_local_cart', JSON.stringify(updated));
      return updated;
    });
  }, []);

  /* ─────────────────────────────────────
     clearCart
  ───────────────────────────────────── */
  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('urbancart_local_cart');
  }, []);

  /* ─────────────────────────────────────
     Sync with auth state changes
     Fetch when user logs in; clear when
     user logs out.
  ───────────────────────────────────── */
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated, fetchCart]);

  /* ─────────────────────────────────────
     Context value
  ───────────────────────────────────── */
  const value = {
    cartItems,
    cartCount,
    loading,
    fetchCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/* ─────────────────────────────────────────
   useCart hook
───────────────────────────────────────── */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
