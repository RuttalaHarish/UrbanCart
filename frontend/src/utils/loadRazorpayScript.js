/**
 * UrbanCart — Razorpay SDK Loader Utility
 *
 * Dynamically injects the Razorpay Checkout script into the DOM.
 * Returns a promise that resolves true on success, false on failure,
 * or immediately resolves true if the SDK is already present on window.
 */

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Check if the Razorpay object is already loaded globally
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    // Create a new script element for loading Razorpay JS SDK
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    // Resolve true when the script loads successfully
    script.onload = () => {
      resolve(true);
    };

    // Resolve false when the script loading fails
    script.onerror = () => {
      resolve(false);
    };

    // Append script to document body to trigger loading
    document.body.appendChild(script);
  });
};
