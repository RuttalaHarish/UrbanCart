import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';
import ProductDetails from '../pages/ProductDetails';
import Cart from '../pages/Cart';
import Wishlist from '../pages/Wishlist';
import Shop from '../pages/Shop';
import Categories from '../pages/Categories';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Checkout from '../pages/Checkout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import MyOrders from '../pages/MyOrders';
import OrderDetails from '../pages/OrderDetails';
import AdminDashboard from '../pages/AdminDashboard';
import AdminOrders from '../pages/AdminOrders';
import AdminOrderDetails from '../pages/AdminOrderDetails';
import AdminProducts from '../pages/AdminProducts';
import AdminAddProduct from '../pages/AdminAddProduct';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth pages — NO MainLayout */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Pages WITH MainLayout (Navbar + Footer) */}
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* Protected Routes (authenticated users) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
        </Route>

        {/* Admin Routes (admin role only) */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetails />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/products/add" element={<AdminAddProduct />} />
          <Route path="/admin/products/:id/edit" element={<AdminAddProduct />} />
        </Route>

        {/* 404 inside layout */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;


