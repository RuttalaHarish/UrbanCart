/*
 * UrbanCart — API Endpoint Constants
 */

export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
};

export const USER_ENDPOINTS = {
  PROFILE: '/users/profile',
};

export const PRODUCT_ENDPOINTS = {
  LIST: '/products',
  CREATE: '/products',
  DETAILS: (id) => `/products/${id}`,
  UPDATE: (id) => `/products/${id}`,
  DELETE: (id) => `/products/${id}`,
};

export const CATEGORY_ENDPOINTS = {
  LIST: '/categories',
};

export const CART_ENDPOINTS = {
  GET: '/cart',
  ADD: '/cart',
  REMOVE: (productId) => `/cart/${productId}`,
  UPDATE: (productId) => `/cart/${productId}`,
};

export const WISHLIST_ENDPOINTS = {
  GET: '/wishlist',
  ADD: '/wishlist',
  REMOVE: (productId) => `/wishlist/${productId}`,
};

export const ORDER_ENDPOINTS = {
  LIST: '/orders',
  CREATE: '/orders',
  ALL: '/orders/all',
  DETAILS: (id) => `/orders/${id}`,
  UPDATE_STATUS: (id) => `/orders/${id}/status`,
  CANCEL: (id) => `/orders/${id}/cancel`,
  DELETE: (id) => `/orders/${id}`,
  DASHBOARD_STATS: '/orders/dashboard/stats',
  RAZORPAY_CREATE: '/orders/razorpay',
  RAZORPAY_VERIFY: '/orders/verify',
};

export const PAYMENT_ENDPOINTS = {
  CREATE_ORDER: '/orders/razorpay',
  VERIFY: '/orders/verify',
};