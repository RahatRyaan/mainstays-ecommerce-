import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import VendorLayout from './layouts/VendorLayout';
import AdminLayout from './layouts/AdminLayout';

// Customer Pages
import Home from './pages/customer/Home';
import ProductListing from './pages/customer/ProductListing';
import ProductDetail from './pages/customer/ProductDetail';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderHistory from './pages/customer/OrderHistory';
import OrderSuccess from './pages/customer/OrderSuccess';
import AccountSettings from './pages/customer/AccountSettings';
import Login from './pages/customer/Login';
import Register from './pages/customer/Register';

// Vendor Pages
import VendorOnboarding from './pages/vendor/VendorOnboarding';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProducts from './pages/vendor/VendorProducts';
import ProductForm from './pages/vendor/ProductForm';
import VendorPayouts from './pages/vendor/VendorPayouts';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import VendorManagement from './pages/admin/VendorManagement';
import UserManagement from './pages/admin/UserManagement';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import CouponManagement from './pages/admin/CouponManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<ProductListing />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success/:orderId" element={<OrderSuccess />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="settings" element={<AccountSettings />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* Vendor Routes */}
        <Route path="/vendor" element={<VendorLayout />}>
          <Route path="apply" element={<VendorOnboarding />} />
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="products" element={<VendorProducts />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="payouts" element={<VendorPayouts />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="vendors" element={<VendorManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="coupons" element={<CouponManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
