import React, { useState } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  .login-input {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.15);
    color: #fff;
    border-radius: 12px;
    padding: 12px 14px;
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
    box-shadow: 0 8px 24px rgba(214,52,71,0.45);
  }
`;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const emailParam = params.get("email") || "";
  const [email, setEmail] = useState(emailParam);
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`${API_HOST}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error");
      setMessage("Contraseña actualizada. Redirigiendo...");
      setTimeout(() => navigate("/cuenta"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const embers = Array.from({ length: 18 });

  return (
    <div className="login-scene d-flex align-items-center justify-content-center">
      <style>{styles}</style>
      <div className="fire-glow"></div>
      {embers.map((_, i) => (
        <span key={i} className="ember" style={{ left: `${5 + (i * 5.3) % 90}%`, animationDelay: `${(i * 0.7) % 6}s`, animationDuration: `${5 + (i % 4)}s`, width: `${4 + (i % 4)}px`, height: `${4 + (i % 4)}px` }}></span>
      ))}
      <Container style={{ maxWidth: "460px", position: "relative", zIndex: 3 }}>
        <Card className="login-card p-4 p-md-5 border-0">
          <h3 className="fw-bold mb-3 text-center" style={{ background: "linear-gradient(135deg, #fff 0%, #ffd27d 60%, #ff7a18 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            Restablecer contraseña
          </h3>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={submit}>
            <Form.Group className="mb-3">
              <Form.Label className="text-white-50 small">Email</Form.Label>
              <Form.Control type="email" required className="login-input shadow-none" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="text-white-50 small">Código de validación</Form.Label>
              <Form.Control required className="login-input shadow-none" value={token} onChange={(e) => setToken(e.target.value)} placeholder="6 dígitos" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="text-white-50 small">Nueva contraseña</Form.Label>
              <Form.Control type="password" required minLength={6} className="login-input shadow-none" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="text-white-50 small">Confirmar contraseña</Form.Label>
              <Form.Control type="password" required minLength={6} className="login-input shadow-none" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </Form.Group>
            <Button type="submit" className="w-100 login-btn text-white" disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar contraseña"}
            </Button>
          </Form>
        </Card>
      </Container>
    </div>
  );
}