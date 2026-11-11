import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import ScrollToTop from "./components/ScrollTop";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import RepartidorLayout from "./layouts/RepartidorLayout";
import CocinaLayout from "./layouts/CocinaLayout";

import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Checkout from "./pages/Checkout";
import Tracking from "./pages/Tracking";
import Feedback from "./pages/Feedback";
import Login from "./pages/Login";
import Cuenta from "./pages/Cuenta";
import Perfil from "./pages/Perfil";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Repartidor from "./pages/Repartidor";
import RepartidorDisponibles from "./pages/RepartidorDisponibles";
import RepartidorActivos from "./pages/RepartidorActivos";
import RepartidorPedido from "./pages/RepartidorPedido";
import RepartidorHistorial from "./pages/RepartidorHistorial";
import RepartidorPerfil from "./pages/RepartidorPerfil";
import Cocina from "./pages/Cocina";
import CocinaPedidos from "./pages/CocinaPedidos";
import CocinaListos from "./pages/CocinaListos";
import CocinaPedidoDetail from "./pages/CocinaPedidoDetail";
import CocinaHistorial from "./pages/CocinaHistorial";

import Dashboard from "./pages/admin/Dashboard";
import AdminPerfil from "./pages/admin/AdminPerfil";
import Pedidos from "./pages/admin/Pedidos";
import Revenue from "./pages/admin/Revenue";
import Ingresos from "./pages/admin/Ingresos";
import FeedbacksList from "./pages/admin/FeedbacksList";
import Products from "./pages/admin/Products";
import Usuarios from "./pages/admin/Usuarios";
import Deliveries from "./pages/admin/Deliveries";
import Repartidores from "./pages/admin/Repartidores";
import Cocinas from "./pages/admin/Cocinas";

function App() {
  const [carrito, setCarrito] = useState(() => {
    return JSON.parse(localStorage.getItem("carrito") || "[]");
  });

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  return (
    <Router>
      <ScrollToTop />

      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home carrito={carrito} setCarrito={setCarrito} />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout carrito={carrito} setCarrito={setCarrito} />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/tracking/:orderId" element={<Tracking />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/login" element={<Cuenta />} />
          <Route path="/cuenta" element={<Cuenta />} />
          <Route path="/olvide-contrasena" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>

        <Route path="/admin/login" element={<Cuenta />} />
        <Route path="/repartidor" element={<RepartidorLayout />}>
          <Route index element={<Repartidor />} />
          <Route path="disponibles" element={<RepartidorDisponibles />} />
          <Route path="activos" element={<RepartidorActivos />} />
          <Route path="pedido/:id" element={<RepartidorPedido />} />
          <Route path="historial" element={<RepartidorHistorial />} />
          <Route path="perfil" element={<RepartidorPerfil />} />
        </Route>

        <Route path="/cocina" element={<CocinaLayout />}>
          <Route index element={<Cocina />} />
          <Route path="pedidos" element={<CocinaPedidos />} />
          <Route path="listos" element={<CocinaListos />} />
          <Route path="pedido/:id" element={<CocinaPedidoDetail />} />
          <Route path="historial" element={<CocinaHistorial />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route
            index
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="perfil" element={<AdminPerfil />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="products" element={<Products />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="deliveries" element={<Deliveries />} />
          <Route path="repartidores" element={<Repartidores />} />
          <Route path="cocinas" element={<Cocinas />} />
          <Route path="ingresos" element={<Ingresos />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="feedbacks" element={<FeedbacksList />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
      />
    </Router>
  );
}

export default App;