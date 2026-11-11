import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Button } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";

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
    background:
      repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px);
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
    animation: cardIn 0.7s ease both;
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(24px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .login-title {
    background: linear-gradient(135deg, #fff 0%, #ffd27d 60%, #ff7a18 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    font-weight: 800;
    letter-spacing: -0.5px;
  }
  .login-input {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.15);
    color: #fff;
    border-radius: 12px;
    padding: 12px 14px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }
  .login-input::placeholder { color: rgba(255,255,255,0.45); }
  .login-input:focus {
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
  .login-btn:active { transform: scale(0.98); }
  @media (max-width: 576px) {
    .login-card { margin: 0 12px; }
  }
`;

export default function Login() {
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const [cargandoLocal, setCargandoLocal] = useState(false);
  const { loginAdmin, cargando } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = usernameRef.current?.value || "";
    const password = passwordRef.current?.value || "";

    if (!username.trim() || !password.trim()) {
      toast.warn("Por favor complete todos los campos");
      return;
    }

    setCargandoLocal(true);
    try {
      const response = await loginAdmin({ username, password });
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("access_token", response.data.access_token);
      toast.success("Login exitoso");
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err.message || "Error al iniciar sesión");
    } finally {
      setCargandoLocal(false);
    }
  };

  const embers = Array.from({ length: 18 });

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

      <Container style={{ maxWidth: "440px", position: "relative", zIndex: 3 }}>
        <Card className="login-card p-4 p-md-5 text-center border-0">
          <div className="mb-3">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: 72,
                height: 72,
                background: "linear-gradient(135deg, #D63447, #ff7a18)",
                boxShadow: "0 8px 24px rgba(214,52,71,0.45)",
              }}
            >
              <i className="bi bi-fire text-white fs-2"></i>
            </div>
            <h2 className="login-title mb-1">Panel Administrativo</h2>
            <p className="text-white-50 small mb-4">
              Ingresa tus credenciales para acceder al sistema.
            </p>
            <p className="text-white-50 small mb-4">
              Demo: <strong className="text-white">admin@demo.com</strong> / <strong className="text-white">admin123</strong>
            </p>
          </div>

          <Form onSubmit={handleSubmit} className="text-start">
            <Form.Group className="mb-3">
              <Form.Label className="text-white-50 small">Usuario</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej. admin@demo.com"
                ref={usernameRef}
                required
                className="login-input shadow-none"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="text-white-50 small">Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                ref={passwordRef}
                required
                className="login-input shadow-none"
              />
            </Form.Group>

            <Button
              type="submit"
              className="login-btn w-100 text-white"
              disabled={cargando || cargandoLocal}
            >
              {cargando || cargandoLocal ? "Verificando..." : "Iniciar Sesión"}
            </Button>
          </Form>
        </Card>
      </Container>
    </div>
  );
}