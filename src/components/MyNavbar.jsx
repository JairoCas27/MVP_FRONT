import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, Offcanvas } from "react-bootstrap";
import { toast } from "react-toastify";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Logo from "../assets/logo.png";
import { API_HOST } from "../services/api";

function MyNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [overHero, setOverHero] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [clientUser, setClientUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("clientUser") || "null"); } catch { return null; }
  });
  const [showProfile, setShowProfile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setShowProfile(false);
    setExpanded(false);
  }, [location.pathname]);

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const refreshClient = () => {
    const token = localStorage.getItem("clientToken");
    if (token) {
      fetch(`${API_HOST}/api/auth/client/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => { if (d.status === "success") { setClientUser(d.data); localStorage.setItem("clientUser", JSON.stringify(d.data)); } })
        .catch(() => {});
    } else {
      setClientUser(null);
    }
  };

  useEffect(() => {
    refreshClient();
    window.addEventListener("authChange", refreshClient);
    return () => window.removeEventListener("authChange", refreshClient);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
      setOverHero(window.scrollY < window.innerHeight * 0.85);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navbarStyle = {
    transition: "all 0.35s ease",
    backgroundColor: overHero ? "rgba(20, 16, 14, 0.45)" : (scrolled ? "#1c1917" : "#231f1c"),
    boxShadow: overHero ? "none" : "0 4px 20px rgba(0, 0, 0, 0.4)",
    borderBottom: "none",
    backdropFilter: "blur(8px)",
  };

  const responsiveStyles = `
    @media (max-width: 991px) {
      .navbar-collapse {
        background: rgba(18, 15, 15, 0.98);
        backdrop-filter: blur(12px);
        border-radius: 16px;
        margin-top: 12px;
        padding: 16px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      }
      .navbar-nav .nav-link {
        padding: 12px 16px !important;
        border-radius: 10px;
        margin-bottom: 4px;
        font-size: 1rem !important;
      }
      .navbar-nav .btn {
        width: 100%;
        margin-top: 8px;
      }
    }
  `;

  const baseLinkStyle = {
    color: "#f5f5f5",
    fontWeight: "500",
    fontSize: "1.25rem",
    padding: "10px 18px",
    borderRadius: "4px",
    transition: "all 0.2s ease",
  };

  const getLinkStyle = (name) => {
    if (hoveredLink === name) {
      return {
        ...baseLinkStyle,
        color: "#ffffff",
        backgroundColor: "#D63447",
      };
    }
    return baseLinkStyle;
  };

  return (
    <>
      <style>{responsiveStyles}</style>
      <Navbar
      expand="lg"
      fixed="top"
      style={navbarStyle}
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
      className="py-3"
    >
      <Container>
        <Navbar.Brand
          className="d-flex align-items-center p-0 m-0"
          as={Link}
          to="/"
          onClick={() => setExpanded(false)}
        >
          <img
            src={Logo}
            alt="Logo La Fogata"
            style={{
              height: "72px",
              width: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0 2px 10px rgba(214, 52, 71, 0.3))"
            }}
            className="d-inline-block align-top"
          />
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          className="border-0 shadow-none"
          style={{ filter: "invert(1) grayscale(100%) brightness(200%)" }}
        />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-lg-center gap-2 gap-lg-3 mt-3 mt-lg-0">
            <Nav.Link
              as={Link}
              to="/"
              style={getLinkStyle("Inicio")}
              onClick={() => setExpanded(false)}
              onMouseEnter={() => setHoveredLink("Inicio")}
              onMouseLeave={() => setHoveredLink(null)}
            >
              Inicio
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/menu"
              style={getLinkStyle("Menu")}
              onClick={() => setExpanded(false)}
              onMouseEnter={() => setHoveredLink("Menu")}
              onMouseLeave={() => setHoveredLink(null)}
            >
              Menú
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/tracking"
              style={getLinkStyle("Tracking")}
              onClick={() => setExpanded(false)}
              onMouseEnter={() => setHoveredLink("Tracking")}
              onMouseLeave={() => setHoveredLink(null)}
            >
              Seguir Pedido
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/feedback"
              style={getLinkStyle("Feedback")}
              onClick={() => setExpanded(false)}
              onMouseEnter={() => setHoveredLink("Feedback")}
              onMouseLeave={() => setHoveredLink(null)}
            >
              Opiniones
            </Nav.Link>

            {clientUser ? (
              <>
                <button
                  onClick={() => setShowProfile(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 999,
                    padding: "6px 14px 6px 6px",
                    color: "#f5f5f5",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {clientUser.photo ? (
                    <img
                      src={clientUser.photo ? (clientUser.photo.startsWith("http") ? clientUser.photo : `${API_HOST}${clientUser.photo}`) : "https://i.pravatar.cc/40"}
                      alt={clientUser.name}
                      style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "2px solid #D63447" }}
                    />
                  ) : (
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #D63447, #a82333)",
                        color: "#fff",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        border: "2px solid #D63447",
                      }}
                    >
                      {getInitials(clientUser.name)}
                    </span>
                  )}
                  <span className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                    Bienvenido, {clientUser.name?.split(" ")[0]}
                  </span>
                </button>

                <Offcanvas show={showProfile} onHide={() => setShowProfile(false)} placement="end" style={{ width: "360px" }}>
                  <Offcanvas.Header closeButton className="border-bottom">
                    <Offcanvas.Title className="fw-bold">Mi Perfil</Offcanvas.Title>
                  </Offcanvas.Header>
                  <Offcanvas.Body>
                    <div className="text-center mb-4">
                      {clientUser.photo ? (
                        <img
                          src={clientUser.photo ? (clientUser.photo.startsWith("http") ? clientUser.photo : `${API_HOST}${clientUser.photo}`) : "https://i.pravatar.cc/150?img=12"}
                          alt={clientUser.name}
                          style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: "3px solid #D63447" }}
                        />
                      ) : (
                        <span
                          style={{
                            width: 90,
                            height: 90,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #D63447, #a82333)",
                            color: "#fff",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "1.6rem",
                            border: "3px solid #D63447",
                          }}
                        >
                          {getInitials(clientUser.name)}
                        </span>
                      )}
                      <h5 className="fw-bold mt-3 mb-0">{clientUser.name}</h5>
                      <div className="text-muted small">{clientUser.email}</div>
                    </div>

                    <div className="d-grid gap-2">
                      <Link
                        to="/perfil"
                        className="btn btn-outline-danger rounded-pill"
                        onClick={() => setShowProfile(false)}
                      >
                        <i className="bi bi-person me-2"></i>Ver perfil
                      </Link>
                      <Link
                        to="/tracking"
                        className="btn btn-outline-secondary rounded-pill"
                        onClick={() => setShowProfile(false)}
                      >
                        <i className="bi bi-receipt me-2"></i>Mis pedidos
                      </Link>
                      <button
                        className="btn btn-danger rounded-pill"
                        onClick={() => {
                          localStorage.removeItem("clientToken");
                          localStorage.removeItem("clientUser");
                          localStorage.removeItem("carrito");
                          setClientUser(null);
                          setShowProfile(false);
                          window.dispatchEvent(new Event("authChange"));
                          window.dispatchEvent(new Event("cartClear"));
                          window.location.href = "/";
                        }}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>Cerrar sesión
                      </button>
                    </div>
                  </Offcanvas.Body>
                </Offcanvas>
              </>
            ) : (
              <Nav.Link
                as={Link}
                to="/cuenta"
                style={getLinkStyle("Cuenta")}
                onClick={() => setExpanded(false)}
                onMouseEnter={() => setHoveredLink("Cuenta")}
                onMouseLeave={() => setHoveredLink(null)}
              >
                Mi Cuenta
              </Nav.Link>
            )}

            <Button
              variant="danger"
              className="rounded-pill px-4 fw-bold ms-lg-2"
              style={{ backgroundColor: "#D63447", border: "none" }}
              onClick={() => {
                setExpanded(false);
                const token = localStorage.getItem("clientToken");
                if (!token) {
                  toast.warn("Debes iniciar sesión para proceder al pago.");
                  setTimeout(() => { window.location.href = "/cuenta"; }, 1600);
                  return;
                }
                window.location.href = "/checkout";
              }}
            >
              Pedir ahora
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    </>
  );
}

export default MyNavbar;