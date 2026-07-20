import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { CART_ENDPOINTS } from '../constants';
import { useAuth } from './AuthContext';

/* ─────────────────────────────────────────
   Context creation
───────────────────────────────────────── */
const CartContext = createContext(null);

/* ─────────────────────────────────────────
   Provider
───────────────────────────────────────── */
export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ── Derived: total number of units across all items ── */
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
        setCartItems(response.data.data.items || []);
      }
    } catch (err) {
      // Silently fail — individual pages handle their own error UI
      console.error('[CartContext] fetchCart error:', err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /* ─────────────────────────────────────
     addToCart
     POST /api/cart  { productId, quantity }
     Backend returns updated cart document
  ───────────────────────────────────── */
  const addToCart = useCallback(async (productId, quantity = 1) => {
    const response = await api.post(CART_ENDPOINTS.ADD, { productId, quantity });
    if (response.data?.data) {
      setCartItems(response.data.data.items || []);
    }
  }, []);

  /* ─────────────────────────────────────
     removeFromCart
     DELETE /api/cart/:productId
  ───────────────────────────────────── */
  const removeFromCart = useCallback(async (productId) => {
    const response = await api.delete(CART_ENDPOINTS.REMOVE(productId));
    if (response.data?.data) {
      setCartItems(response.data.data.items || []);
    }
  }, []);

  /* ─────────────────────────────────────
     updateQuantity
     PUT /api/cart/:productId  { quantity }
  ───────────────────────────────────── */
  const updateQuantity = useCallback(async (productId, quantity) => {
    const response = await api.put(CART_ENDPOINTS.UPDATE(productId), { quantity });
    if (response.data?.data) {
      setCartItems(response.data.data.items || []);
    }
  }, []);

  /* ─────────────────────────────────────
     clearCart
     Optimistically empties local state.
     Called after a successful order so
     the badge resets without an extra
     network round-trip.
  ───────────────────────────────────── */
  const clearCart = useCallback(() => {
    setCartItems([]);
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
