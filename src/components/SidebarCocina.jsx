import { NavLink, useNavigate } from "react-router-dom";
import { FiHome, FiList, FiCheckCircle, FiClock, FiUser, FiLogOut, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import logo from "../assets/logo.png";

export default function SidebarCocina({ isOpen, setIsOpen, isMobile }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("kitchenToken");
    localStorage.removeItem("kitchenUser");
    window.dispatchEvent(new Event("authChange"));
    window.location.href = "/cuenta";
  };
  const kitchenUser = (() => { try { return JSON.parse(localStorage.getItem("kitchenUser") || "null"); } catch { return null; } })();
  const menuItems = [
    { title: "Dashboard", icon: <FiHome size={20} />, path: "/cocina" },
    { title: "Pedidos", icon: <FiList size={20} />, path: "/cocina/pedidos" },
    { title: "Pedidos Listos", icon: <FiCheckCircle size={20} />, path: "/cocina/listos" },
    { title: "Historial", icon: <FiClock size={20} />, path: "/cocina/historial" },
  ];
  return (
    <div style={{ width: isMobile ? (isOpen ? "240px" : "0px") : (isOpen ? "240px" : "80px"), overflow: isMobile && !isOpen ? "hidden" : "visible", height: "100vh", backgroundColor: "#181515", position: "fixed", left: 0, top: 0, transition: "width 0.3s ease", display: "flex", flexDirection: "column", boxShadow: "2px 0 15px rgba(0,0,0,0.4)", zIndex: 1000, borderRight: "1px solid #333" }}>
      <div style={{ padding: isOpen ? "1.5rem 1rem" : "1.5rem 0.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #333", minHeight: "100px", backgroundColor: "#121212" }}>
        <img src={logo} alt="Logo" style={{ width: isOpen ? "120px" : "45px", height: "auto", objectFit: "contain", transition: "all 0.3s ease", filter: "drop-shadow(0 2px 10px rgba(255, 77, 77, 0.3))" }} />
        {isOpen && <p style={{ margin: "0.75rem 0 0 0", fontSize: "0.9rem", color: "#FF4D4D", fontWeight: 600, textAlign: "center" }}>Panel Cocina</p>}
      </div>
      <nav style={{ flex: 1, padding: "1rem 0", overflowY: "auto" }}>
        {menuItems.map((item, index) => (
          <NavLink key={index} to={item.path} end={item.path === "/cocina"} style={({ isActive }) => ({ display: "flex", alignItems: "center", padding: isOpen ? "0.875rem 1.25rem" : "0.875rem 0", justifyContent: isOpen ? "flex-start" : "center", color: isActive ? "#ffffff" : "#b0b0b0", backgroundColor: isActive ? "#FF4D4D" : "transparent", textDecoration: "none", transition: "all 0.2s ease", borderLeft: isActive ? "4px solid #ffffff" : "4px solid transparent", marginBottom: "0.25rem" })}>
            <span style={{ display: "flex", alignItems: "center" }}>{item.icon}</span>
            {isOpen && <span style={{ marginLeft: "1rem", fontSize: "0.95rem", fontWeight: 500 }}>{item.title}</span>}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: isOpen ? "1.25rem 1rem" : "1.0rem 0.5rem", borderTop: "1px solid #333", backgroundColor: "#121212", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: isOpen ? "flex-start" : "center", gap: "0.75rem", width: "100%", padding: isOpen ? "0.5rem 0.75rem" : "0.5rem 0", backgroundColor: isOpen ? "#181515" : "transparent", borderRadius: "6px" }}>
          <span style={{ color: "#FF4D4D", display: "flex", alignItems: "center", justifyContent: "center" }}><FiUser size={18} /></span>
          {isOpen && <span style={{ color: "#f0f0f0", fontSize: "0.9rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, textAlign: "left" }}>{kitchenUser?.name || "Cocina"}</span>}
        </div>
        {isOpen && (
          <button onClick={handleLogout} style={{ width: "100%", padding: "0.75rem", backgroundColor: "#FF4D4D", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "0.2s" }}>
            <FiLogOut size={18} /> Cerrar Sesión
          </button>
        )}
      </div>
      <button onClick={() => setIsOpen(!isOpen)} style={{ padding: "1rem", backgroundColor: "#1e1b1b", border: "none", color: "#f0f0f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease", borderTop: "1px solid #333", fontWeight: 600 }}>
        {isOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
      </button>
    </div>
  );
}