import React, { useEffect, useState } from "react";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
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
  .login-scene { position: fixed; inset: 0; z-index: 0; }
  .prof-wrap { position: relative; z-index: 1; min-height: 100vh; padding: 24px; }
  .prof-card {
    background: rgba(20, 16, 14, 0.72);
    border: none;
    border-radius: 24px;
    backdrop-filter: blur(18px);
    box-shadow: 0 30px 80px rgba(0,0,0,0.55);
    padding: 32px;
    max-width: 560px;
    margin: 0 auto;
  }
  .prof-label { color: rgba(255,255,255,0.7); }
  .prof-input {
    background: rgba(255,255,255,0.06);
    border: none;
    color: #fff;
    border-radius: 12px;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.12);
  }
  .prof-input:focus {
    background: rgba(255,255,255,0.1);
    border: none;
    box-shadow: 0 0 0 2px rgba(214,52,71,0.6);
    color: #fff;
  }
  .prof-input:focus {
    background: rgba(255,255,255,0.1);
    border-color: #D63447;
    box-shadow: 0 0 0 4px rgba(214,52,71,0.25);
    color: #fff;
  }
  .prof-input::placeholder { color: rgba(255,255,255,0.45); }
`;

export default function RepartidorPerfil() {
  const token = localStorage.getItem("driverToken");
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", dni: "", phone: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_HOST}/api/auth/driver/me`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error");
        setProfile(data.data);
        setForm({ name: data.data.name || "", dni: data.data.dni || "", phone: data.data.phone || "", password: "", confirmPassword: "" });
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    if (form.password && form.password !== form.confirmPassword) {
      setMsg("Las contraseñas no coinciden");
      setSaving(false);
      return;
    }
    try {
      const res = await fetch(`${API_HOST}/api/auth/driver/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error");
      setProfile(data.data);
      setForm({ name: data.data.name || "", dni: data.data.dni || "", phone: data.data.phone || "", password: "" });
      // update stored driver user
      const stored = JSON.parse(localStorage.getItem("driverUser") || "null");
      if (stored) {
        stored.name = data.data.name;
        stored.phone = data.data.phone;
        localStorage.setItem("driverUser", JSON.stringify(stored));
      }
      setMsg("Perfil actualizado correctamente");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  const embers = Array.from({ length: 24 });

  return (
    <div className="login-scene">
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
      <div className="prof-wrap">
        <div style={{ position: "relative", zIndex: 3 }}>
          <h2 className="fw-bold mb-3 text-white">Mi Perfil</h2>
          <div className="prof-card">
        {msg && <Alert variant={msg.includes("correctamente") ? "success" : "danger"}>{msg}</Alert>}
        <Form onSubmit={handleSave}>
          <Form.Group className="mb-3">
            <Form.Label className="prof-label fw-semibold">Nombre completo</Form.Label>
            <Form.Control className="prof-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="prof-label fw-semibold">DNI</Form.Label>
            <Form.Control className="prof-input" value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="prof-label fw-semibold">Usuario</Form.Label>
            <Form.Control className="prof-input" value={profile?.username || ""} disabled />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="prof-label fw-semibold">Teléfono</Form.Label>
            <Form.Control className="prof-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="prof-label fw-semibold">Nueva contraseña (opcional)</Form.Label>
            <Form.Control className="prof-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Dejar vacío para no cambiar" />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label className="prof-label fw-semibold">Confirmar contraseña</Form.Label>
            <Form.Control className="prof-input" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Repite la contraseña" />
          </Form.Group>
          <Button type="submit" variant="danger" className="rounded-pill px-4 fw-bold" disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </Form>
      </div>
    </div>
    </div>
    </div>
  );
}