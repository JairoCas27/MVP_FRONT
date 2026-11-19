import React, { useEffect, useState } from "react";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { API_HOST } from "../services/api";

const styles = `
  .driver-profile-scene {
    min-height: 100vh;
    background: #f8f9fa;
    padding: 40px 0 80px;
  }
  .prof-card {
    background: #ffffff;
    border: 1px solid rgba(0,0,0,0.08);
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    padding: 32px;
    max-width: 560px;
    margin: 0 auto;
  }
  .prof-label {
    color: #374151;
  }
  .prof-input {
    background: #fff;
    border: 1px solid #d1d5db;
    color: #111827;
    border-radius: 12px;
    padding: 12px 14px;
  }
  .prof-input:focus {
    background: #fff;
    border-color: #D63447;
    box-shadow: 0 0 0 4px rgba(214,52,71,0.15);
    color: #111827;
  }
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
      setForm({ name: data.data.name || "", dni: data.data.dni || "", phone: data.data.phone || "", password: "", confirmPassword: "" });
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
  if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

  return (
    <div className="driver-profile-scene">
      <style>{styles}</style>
      <Container style={{ maxWidth: 560 }}>
        <h2 className="fw-bold mb-4 text-dark text-center">Mi Perfil</h2>
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
            <Button type="submit" variant="danger" className="rounded-pill px-4 fw-bold w-100" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </Form>
        </div>
      </Container>
    </div>
  );
}