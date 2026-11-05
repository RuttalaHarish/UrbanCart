import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import ScrollToTop from '../components/common/ScrollToTop';
import AppRoutes from './AppRoutes';
import AuthGate from './AuthGate';

function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <AuthGate>
          <CartProvider>
            <WishlistProvider>
              <AppRoutes />
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
              />
            </WishlistProvider>
          </CartProvider>
        </AuthGate>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppRouter;
