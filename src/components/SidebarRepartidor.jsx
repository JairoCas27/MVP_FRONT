import { NavLink, useNavigate } from "react-router-dom";
import { FiHome, FiTruck, FiClock, FiUser, FiLogOut, FiChevronLeft, FiChevronRight, FiList } from "react-icons/fi";
import logo from "../assets/logo.png";

const styles = `
  .sb {
    background: linear-gradient(180deg, #1a1210 0%, #2b1f1a 100%);
    border-right: 1px solid rgba(255,255,255,0.06);
  }
  .sb-section {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: rgba(255,255,255,0.35);
    font-weight: 700;
    padding: 14px 20px 6px;
  }
  .sb-link {
    display: flex;
    align-items: center;
    padding: 11px 16px;
    margin: 4px 10px;
    border-radius: 12px;
    color: rgba(255,255,255,0.75);
    text-decoration: none;
    transition: all 0.2s ease;
    font-weight: 500;
    font-size: 0.95rem;
    position: relative;
    overflow: hidden;
  }
  .sb-link:hover {
    background: rgba(214,52,71,0.15);
    color: #fff;
    transform: translateX(3px);
  }
  .sb-link.active {
    background: linear-gradient(135deg, #D63447 0%, #a82333 100%);
    color: #fff;
    box-shadow: 0 6px 18px rgba(214,52,71,0.35);
  }
  .sb-link.active::before {
    content: '';
    position: absolute;
    left: 0; top: 50%; transform: translateY(-50%);
    width: 3px; height: 60%;
    background: #fff; border-radius: 0 4px 4px 0;
  }
  .sb-icon {
    width: 34px; height: 34px; border-radius: 10px;
    display: inline-flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.06);
    margin-right: 12px;
    transition: all 0.2s ease;
  }
  .sb-link:hover .sb-icon { background: rgba(214,52,71,0.25); }
  .sb-link.active .sb-icon { background: rgba(255,255,255,0.2); }
  .sb-user {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    padding: 12px;
    margin: 0 10px 12px;
  }
  .sb-avatar {
    width: 40px; height: 40px; border-radius: 12px;
    background: linear-gradient(135deg, #D63447, #a82333);
    color: #fff; display: inline-flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 0.9rem;
    box-shadow: 0 4px 12px rgba(214,52,71,0.3);
  }
`;

export default function SidebarRepartidor({ isOpen, setIsOpen, isMobile }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("driverToken");
    localStorage.removeItem("driverUser");
    window.dispatchEvent(new Event("authChange"));
    window.location.href = "/cuenta";
  };

  const driverUser = (() => { try { return JSON.parse(localStorage.getItem("driverUser") || "null"); } catch { return null; } })();

  const menuGroups = [
    {
      label: "Principal",
      items: [
        { title: "Dashboard", icon: <FiHome size={18} />, path: "/repartidor" },
        { title: "Mi Perfil", icon: <FiUser size={18} />, path: "/repartidor/perfil" },
      ],
    },
    {
      label: "Entregas",
      items: [
        { title: "Disponibles", icon: <FiList size={18} />, path: "/repartidor/disponibles" },
        { title: "Pedidos Activos", icon: <FiTruck size={18} />, path: "/repartidor/activos" },
        { title: "Historial", icon: <FiClock size={18} />, path: "/repartidor/historial" },
      ],
    },
  ];

  const getInitials = (name) => {
    if (!name) return "R";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="sb" style={{ width: isMobile ? (isOpen ? "260px" : "0px") : (isOpen ? "260px" : "80px"), overflow: isMobile && !isOpen ? "hidden" : "visible", height: "100vh", position: "fixed", left: 0, top: 0, transition: "width 0.3s ease", display: "flex", flexDirection: "column", zIndex: 1000 }}>
      <style>{styles}</style>

      <div style={{ padding: isOpen ? "1.5rem 1.25rem" : "1.5rem 0.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", minHeight: "110px", background: "rgba(0,0,0,0.15)" }}>
        <img src={logo} alt="Logo" style={{ width: isOpen ? "130px" : "46px", height: "auto", objectFit: "contain", transition: "all 0.3s ease", filter: "drop-shadow(0 2px 12px rgba(214,52,71,0.4))" }} />
        {isOpen && <p style={{ margin: "0.75rem 0 0 0", fontSize: "0.85rem", color: "#FF6B6B", fontWeight: 700, textAlign: "center", letterSpacing: "0.5px" }}>Panel Repartidor</p>}
      </div>

      <nav style={{ flex: 1, padding: "0.5rem 0", overflowY: "auto" }}>
        {menuGroups.map((group, gi) => (
          <div key={gi}>
            {isOpen && <div className="sb-section">{group.label}</div>}
            {group.items.map((item, index) => (
              <NavLink key={index} to={item.path} end={item.path === "/repartidor"} className={({ isActive }) => `sb-link${isActive ? " active" : ""}`}>
                <span className="sb-icon">{item.icon}</span>
                {isOpen && <span>{item.title}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sb-user">
        {isOpen ? (
          <>
            <div className="d-flex align-items-center gap-2 mb-3">
              {driverUser?.photo ? (
                <img src={driverUser.photo.startsWith("http") ? driverUser.photo : `https://lafogatapolleria.vercel.app${driverUser.photo}`} alt={driverUser.name} style={{ width: 40, height: 40, borderRadius: 12, objectFit: "cover", border: "2px solid #D63447" }} />
              ) : (
                <div className="sb-avatar">{getInitials(driverUser?.name)}</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "#f0f0f0", fontSize: "0.9rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{driverUser?.name || "Repartidor"}</div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.75rem" }}>{driverUser?.username || ""}</div>
              </div>
            </div>
            <button onClick={handleLogout} style={{ width: "100%", padding: "0.65rem", background: "linear-gradient(135deg, #D63447 0%, #a82333 100%)", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "0.2s", boxShadow: "0 4px 12px rgba(214,52,71,0.3)" }} onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>
              <FiLogOut size={16} /> Cerrar Sesión
            </button>
          </>
        ) : (
          <button onClick={handleLogout} style={{ width: "100%", padding: "0.65rem", background: "linear-gradient(135deg, #D63447 0%, #a82333 100%)", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FiLogOut size={18} />
          </button>
        )}
      </div>

      <button onClick={() => setIsOpen(!isOpen)} style={{ padding: "0.85rem", backgroundColor: "rgba(0,0,0,0.2)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease", borderTop: "1px solid rgba(255,255,255,0.06)", fontWeight: 600 }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(214,52,71,0.2)"; e.currentTarget.style.color = "#fff"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
        {isOpen ? <FiChevronLeft size={18} /> : <FiChevronRight size={18} />}
      </button>
    </div>
  );
}