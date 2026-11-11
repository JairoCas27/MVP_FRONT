import { useState, useEffect } from "react";
import { Container, Card, Form, Button, Alert, Tabs, Tab } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useClientAuth } from "../hooks/useClientAuth";
import { useAuth } from "../hooks/useAuth";
import { API_HOST } from "../services/api";

const styles = `
  .login-scene {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
    background:
      radial-gradient(1200px 600px at 50% 120%, rgba(214,52,71,0.55) 0%, rgba(214,52,71,0.15) 35%, transparent 60%),
      radial-gradient(900px 500px at 20% 110%, rgba(255,140,0,0.45) 0%, transparent 55%),
      radial-gradient(900px 500px at 80% 110%, rgba(255,100,0,0.4) 0%, transparent 55%),
      linear-gradient(180deg, #0b0b0f 0%, #1a1010 45%, #0b0b0f 100%);
  }
  .login-scene::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px);
    pointer-events: none;
    z-index: 1;
  }
  .ember {
    position: absolute;
    bottom: -10px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: radial-gradient(circle, #ffd27d 0%, #ff7a18 40%, transparent 70%);
    box-shadow: 0 0 12px 2px rgba(255,120,0,0.6);
    animation: rise 6s linear infinite;
    opacity: 0;
    z-index: 2;
  }
  @keyframes rise {
    0% { transform: translateY(0) translateX(0); opacity: 0; }
    10% { opacity: 1; }
    80% { opacity: 0.8; }
    100% { transform: translateY(-110vh) translateX(40px); opacity: 0; }
  }
  .fire-glow {
    position: absolute;
    bottom: -80px;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 400px;
    background: radial-gradient(ellipse at center, rgba(255,120,0,0.55) 0%, rgba(214,52,71,0.35) 35%, transparent 70%);
    filter: blur(40px);
    animation: flicker 2.5s ease-in-out infinite alternate;
    z-index: 1;
  }
  @keyframes flicker {
    0% { transform: translateX(-50%) scale(1); opacity: 0.85; }
    100% { transform: translateX(-50%) scale(1.08); opacity: 1; }
  }
  .login-card {
    position: relative;
    z-index: 3;
    background: rgba(20, 16, 14, 0.62);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 24px;
    backdrop-filter: blur(18px);
    box-shadow: 0 30px 80px rgba(0,0,0,0.55), 0 0 60px rgba(214,52,71,0.18);
  }
  .login-card .form-control {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.15);
    color: #fff;
    border-radius: 12px;
    padding: 12px 14px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }
  .login-card .form-control::placeholder { color: rgba(255,255,255,0.45); }
  .login-card .form-control:focus {
    background: rgba(255,255,255,0.1);
    border-color: #D63447;
    box-shadow: 0 0 0 4px rgba(214,52,71,0.25);
    color: #fff;
  }
  .login-btn {
    background: linear-gradient(135deg, #D63447 0%, #ff7a18 100%);
    border: none;
    border-radius: 14px;
    padding: 12px 0;
    font-weight: 700;
    letter-spacing: 0.5px;
    box-shadow: 0 8px 24px rgba(214,52,71,0.45);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(214,52,71,0.55);
  }
  .login-tabs .nav {
    justify-content: center;
    gap: 8px;
  }
  .login-tabs .nav-link {
    color: rgba(255,255,255,0.6);
    border-radius: 999px;
    font-weight: 600;
    padding: 8px 20px;
    transition: all 0.2s ease;
    border: 1px solid rgba(255,255,255,0.12);
  }
  .login-tabs .nav-link:hover {
    color: #fff;
    background: rgba(255,255,255,0.08);
  }
  .login-tabs .nav-link.active {
    background: linear-gradient(135deg, #D63447 0%, #ff7a18 100%);
    color: #fff;
    border-color: transparent;
    box-shadow: 0 6px 18px rgba(214,52,71,0.4);
  }
  .login-card .form-control {
    text-align: left;
  }
`;

function Cuenta() {
  const navigate = useNavigate();
  const { register, login, loading: clientLoading, error: clientError } = useClientAuth();
  const { loginAdmin, cargando: adminLoading } = useAuth();
  const [tab, setTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [regData, setRegData] = useState({ name: "", email: "", dni: "", phone: "", address: "", password: "" });
  const [driverData, setDriverData] = useState({ username: "repartidor@demo.com", password: "repartidor123" });
  const [coords, setCoords] = useState(null);
  const [addressTouched, setAddressTouched] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError("");
    // Try admin first
    try {
      const response = await loginAdmin({ username: loginData.email, password: loginData.password });
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.removeItem("carrito");
      window.dispatchEvent(new Event("authChange"));
      window.dispatchEvent(new Event("cartClear"));
      navigate("/admin/dashboard");
      return;
    } catch (adminErr) {
      // Not admin; try driver
    }
    // Try driver
    try {
      const res = await fetch(`${API_HOST}/api/auth/driver/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginData.email, password: loginData.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error");
      localStorage.setItem("driverToken", data.data.access_token);
      localStorage.setItem("driverUser", JSON.stringify(data.data.driver));
      localStorage.removeItem("carrito");
      window.dispatchEvent(new Event("authChange"));
      window.dispatchEvent(new Event("cartClear"));
      navigate("/repartidor");
      return;
    } catch (driverErr) {
      // Not driver; try kitchen
    }
    // Try kitchen
    try {
      const res = await fetch(`${API_HOST}/api/auth/kitchen/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginData.email, password: loginData.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error");
      localStorage.setItem("kitchenToken", data.data.access_token);
      localStorage.setItem("kitchenUser", JSON.stringify(data.data.kitchen));
      localStorage.removeItem("carrito");
      window.dispatchEvent(new Event("authChange"));
      window.dispatchEvent(new Event("cartClear"));
      navigate("/cocina");
      return;
    } catch (kitchenErr) {
      // Not kitchen; try client
    }
    try {
      await login(loginData);
      localStorage.removeItem("carrito");
      window.dispatchEvent(new Event("authChange"));
      window.dispatchEvent(new Event("cartClear"));
      navigate("/");
    } catch (err) {
      setFormError("Credenciales incorrectas");
    }
  };

  const handleDriverLogin = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      const res = await fetch(`${API_HOST}/api/auth/driver/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(driverData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al iniciar sesión");
      localStorage.setItem("driverToken", data.data.access_token);
      localStorage.setItem("driverUser", JSON.stringify(data.data.driver));
      window.dispatchEvent(new Event("authChange"));
      navigate("/repartidor");
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      await register(regData);
      localStorage.removeItem("carrito");
      window.dispatchEvent(new Event("authChange"));
      window.dispatchEvent(new Event("cartClear"));
      navigate("/");
    } catch (err) {
      setFormError(err.message);
    }
  };

  const loading = clientLoading || adminLoading;
  const error = clientError;

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setCoords(c);
        if (!addressTouched) {
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${c.lat}&lon=${c.lon}`)
            .then((r) => r.json())
            .then((d) => {
              if (d && d.display_name) {
                setRegData((prev) => ({ ...prev, address: d.display_name }));
              }
            })
            .catch(() => {});
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [addressTouched]);

  useEffect(() => {
    if (!addressTouched || !regData.address) return;
    const timer = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(regData.address)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d && d.length) {
            setCoords({ lat: parseFloat(d[0].lat), lon: parseFloat(d[0].lon) });
          }
        })
        .catch(() => {});
    }, 900);
    return () => clearTimeout(timer);
  }, [regData.address, addressTouched]);

  const embers = Array.from({ length: 32 });

  // tab styles injected via styles string below

  return (
    <div className="login-scene d-flex align-items-center justify-content-center">
      <style>{styles}</style>
      <div className="fire-glow"></div>
      {embers.map((_, i) => (
        <span
          key={i}
          className="ember"
          style={{
            left: `${5 + (i * 5.3) % 90}%`,
            animationDelay: `${(i * 0.7) % 6}s`,
            animationDuration: `${5 + (i % 4)}s`,
            width: `${4 + (i % 4)}px`,
            height: `${4 + (i % 4)}px`,
          }}
        ></span>
      ))}
      <Container style={{ maxWidth: "520px", position: "relative", zIndex: 3 }}>
        <Card className="login-card p-4 p-md-5 border-0">
        <h2 className="mb-3 text-center" style={{ background: "linear-gradient(135deg, #fff 0%, #ffd27d 60%, #ff7a18 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", fontWeight: 800 }}>Mi Cuenta</h2>


        {(error || formError) && <Alert variant="danger">{error || formError}</Alert>}

        <Tabs activeKey={tab} onSelect={(k) => setTab(k)} className="login-tabs mb-3" variant="pills">
            <Tab eventKey="login" title="Iniciar Sesión">
              <Form onSubmit={handleLogin} className="text-start">
                <Form.Group className="mb-3">
                  <Form.Label className="text-white-50 small">Email</Form.Label>
                  <div className="position-relative">
                    <i className="bi bi-envelope position-absolute" style={{ left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.5)" }}></i>
                    <Form.Control
                      type="email"
                      required
                      className="login-input shadow-none"
                      style={{ paddingLeft: 42 }}
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      placeholder="tu@email.com"
                    />
                  </div>
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="text-white-50 small">Contraseña</Form.Label>
                  <div className="position-relative">
                    <i className="bi bi-lock position-absolute" style={{ left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.5)" }}></i>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      required
                      className="login-input shadow-none"
                      style={{ paddingLeft: 42, paddingRight: 42 }}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "rgba(255,255,255,0.6)",
                        cursor: "pointer",
                      }}
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </button>
                  </div>
                </Form.Group>
                <div className="d-flex justify-content-end mb-3">
                  <a href="/olvide-contrasena" className="text-white-50 small text-decoration-none">¿Olvidaste tu contraseña?</a>
                </div>
                <Button type="submit" className="w-100 login-btn" disabled={loading}>
                  {loading ? "Ingresando..." : "Ingresar"}
                </Button>

              </Form>
            </Tab>
            <Tab eventKey="register" title="Registrarse">
              <Form onSubmit={handleRegister} className="text-start">
                <Form.Group className="mb-3">
                  <Form.Label className="text-white-50 small">Nombre</Form.Label>
                  <Form.Control required value={regData.name} onChange={(e) => setRegData({ ...regData, name: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white-50 small">DNI</Form.Label>
                  <Form.Control value={regData.dni} onChange={(e) => setRegData({ ...regData, dni: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white-50 small">Email</Form.Label>
                  <Form.Control type="email" required value={regData.email} onChange={(e) => setRegData({ ...regData, email: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white-50 small">Teléfono</Form.Label>
                  <Form.Control value={regData.phone} onChange={(e) => setRegData({ ...regData, phone: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white-50 small">Dirección</Form.Label>
                  <Form.Control value={regData.address} onChange={(e) => { setRegData({ ...regData, address: e.target.value }); setAddressTouched(true); }} />
                </Form.Group>
                <div className="mb-3">
                  <div className="text-white-50 small mb-2">
                    <i className="bi bi-geo-alt me-2"></i>Ubicación en tiempo real
                  </div>
                  {coords ? (
                    <>
                      <div className="text-muted small mb-2">
                        Lat: {coords.lat.toFixed(6)}, Lon: {coords.lon.toFixed(6)}
                      </div>
                      <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.15)" }}>
                        <iframe
                          title="mapa-registro"
                          width="100%"
                          height="220"
                          style={{ border: 0 }}
                          loading="lazy"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.01},${coords.lat - 0.01},${coords.lon + 0.01},${coords.lat + 0.01}&layer=mapnik&marker=${coords.lat},${coords.lon}`}
                        ></iframe>
                      </div>
                    </>
                  ) : (
                    <div className="text-muted small">Obteniendo ubicación...</div>
                  )}
                </div>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white-50 small">Contraseña</Form.Label>
                  <div className="position-relative">
                    <i className="bi bi-lock position-absolute" style={{ left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.5)" }}></i>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      className="login-input shadow-none"
                      style={{ paddingLeft: 42, paddingRight: 42 }}
                      value={regData.password}
                      onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "rgba(255,255,255,0.6)",
                        cursor: "pointer",
                      }}
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </button>
                  </div>
                </Form.Group>
                <Button type="submit" className="w-100 login-btn" disabled={loading}>
                  {loading ? "Registrando..." : "Crear cuenta"}
                </Button>
              </Form>
            </Tab>
          </Tabs>
      </Card>
    </Container>
    </div>
  );
}

export default Cuenta;