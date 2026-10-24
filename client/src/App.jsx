import { Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./auth/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminAuctionsPage from "./pages/AdminAuctionsPage";
import AdminBidsPage from "./pages/AdminBidsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminTransactionsPage from "./pages/AdminTransactionsPage";
import ForbiddenPage from "./pages/ForbiddenPage";
import ItemPage from "./pages/ItemPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProductsPage from "./pages/ProductsPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import SellerPage from "./pages/SellerPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/products" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ItemPage />} />

          <Route element={<ProtectedRoute roles={["buyer"]} />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route element={<ProtectedRoute roles={["seller"]} />}>
            <Route path="/seller" element={<SellerPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/auctions" element={<AdminAuctionsPage />} />
            <Route path="/admin/bids" element={<AdminBidsPage />} />
            <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
          </Route>

          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
