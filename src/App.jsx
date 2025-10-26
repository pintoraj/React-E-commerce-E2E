import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider, useAuth } from "./user-authentication/context/AuthContext";
import { CartProvider } from "./user-authentication/context/CartContext";
import { WishlistProvider } from "./user-authentication/context/WishlistContext";
import { ProductProvider } from "./user-authentication/context/ProductContext";

import MainLayout from "./layouts/MainLayout";

import ShopAllPage from "./product-management/components/ShopAll";
import HomePage from "./product-management/components/HomePage";

import Login from "./user-authentication/pages/Login/Login";
import Register from "./user-authentication/pages/Register/Register";
import User from "./user-authentication/pages/User/User";
import Profile from "./user-authentication/pages/Profile/Profile";
import Cart from "./user-authentication/pages/Cart/Cart";
import Wishlist from "./user-authentication/pages/Wishlist/Wishlist";

import AdminDashboard from "./AdminModule/AdminDashboard.jsx";
import AdminProducts from "./AdminModule/Adminproducts.jsx";
import AdminOrders from "./AdminModule/AdminOrders.jsx";
import AdminUsers from "./AdminModule/AdminUsers.jsx";

import Checkout from "./order-management/checkout";
import Payment from "./order-management/payment";
import OrderConfirmation from "./order-management/OrderConfirmation";
import Orders from "./order-management/orders";
import TrackPackage from "./order-management/TrackPackage";
import OrderDetails from "./order-management/OrderDetails";

import ProtectedRoute from "./user-authentication/components/ProtectedRoute";

function AdminRedirectGuard({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  const isAdmin = user?.isAdmin === true;
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdmin && !isAdminRoute) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <AdminRedirectGuard>
                <Toaster position="bottom-right" />
                <Routes>
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopAllPage />} />

                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/user/:username" element={<User />} />

                    <Route
                      path="/cart"
                      element={
                        <ProtectedRoute>
                          <Cart />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/wishlist"
                      element={
                        <ProtectedRoute>
                          <Wishlist />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile/:username"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute>
                          <Orders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/track-package/:orderId"
                      element={
                        <ProtectedRoute>
                          <TrackPackage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/order-details"
                      element={
                        <ProtectedRoute>
                          <OrderDetails />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/checkout"
                      element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/payment"
                      element={
                        <ProtectedRoute>
                          <Payment />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/order-confirmation"
                      element={
                        <ProtectedRoute>
                          <OrderConfirmation />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="*" element={<HomePage />} />
                  </Route>

                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/products"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminProducts />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminUsers />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/admin-home" element={<Navigate to="/admin" replace />} />
                </Routes>
              </AdminRedirectGuard>
            </Router>
          </WishlistProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
