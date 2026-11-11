import React, { useEffect, useState, useRef } from "react";
import { Container, Card, Form, Button, Alert, Spinner, Row, Col, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useClientAuth } from "../hooks/useClientAuth";
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
  .profile-wrap { position: relative; min-height: 100vh; padding: 40px 0 80px; z-index: 3; }
  .profile-card {
    background: rgba(20, 16, 14, 0.62);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 24px;
    backdrop-filter: blur(18px);
    box-shadow: 0 30px 80px rgba(0,0,0,0.55);
    overflow: hidden;
  }
  .profile-header {
    background: linear-gradient(135deg, #D63447 0%, #a82333 100%);
    color: #fff;
    padding: 32px;
    text-align: center;
  }
  .profile-avatar {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #fff;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  }
  .profile-label { color: rgba(255,255,255,0.7); }
  .profile-input {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.15);
    color: #fff;
    border-radius: 12px;
  }
  .profile-input:focus {
    background: rgba(255,255,255,0.1);
    border-color: #D63447;
    box-shadow: 0 0 0 4px rgba(214,52,71,0.25);
    color: #fff;
  }
`;

export default function Perfil() {
  const navigate = useNavigate();
  const { getProfile, updateProfile, logout, loading, error } = useClientAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", dni: "", phone: "", address: "", photo: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [removePhoto, setRemovePhoto] = useState(false);
  const fileInputRef = useRef(null);
  const [coords, setCoords] = useState(null);
  const [geoError, setGeoError] = useState("");
  const [addressTouched, setAddressTouched] = useState(false);

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  useEffect(() => {
    const token = localStorage.getItem("clientToken");
    if (!token) { navigate("/cuenta"); return; }

    let watchId = null;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setGeoError("");
        },
        (err) => setGeoError(err.message),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
      );
    } else {
      setGeoError("Geolocalización no soportada por el navegador.");
    }
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    if (!coords) return;
    if (addressTouched) return;
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lon}`)
      .then((r) => r.json())
      .then((d) => {
        if (d && d.display_name) {
          setForm((f) => ({ ...f, address: d.display_name }));
        }
      })
      .catch(() => {});
  }, [coords, addressTouched]);

  useEffect(() => {
    if (!addressTouched || !form.address) return;
    const timer = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.address)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d && d.length) {
            setCoords({ lat: parseFloat(d[0].lat), lon: parseFloat(d[0].lon) });
          }
        })
        .catch(() => {});
    }, 900);
    return () => clearTimeout(timer);
  }, [form.address, addressTouched]);

  useEffect(() => {
    const token = localStorage.getItem("clientToken");
    if (!token) { navigate("/cuenta"); return; }
    getProfile()
      .then((p) => {
        setProfile(p);
        setForm({
          name: p.name || "",
          dni: p.dni || "",
          phone: p.phone || "",
          address: p.address || "",
          photo: p.photo || "",
        });
      })
      .catch(() => navigate("/cuenta"));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("dni", form.dni);
      fd.append("phone", form.phone);
      fd.append("address", form.address);
      if (form.photoFile) fd.append("photo", form.photoFile);
      if (removePhoto) fd.append("remove_photo", "true");
      const updated = await updateProfile(fd);
      setProfile(updated);
      setForm((f) => ({ ...f, photo: updated.photo || "", photoFile: null }));
      setRemovePhoto(false);
      window.dispatchEvent(new Event("authChange"));
      setMsg("Perfil actualizado correctamente");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="danger" />
      </div>
    );
  }

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
      <div className="profile-wrap">
        <Container style={{ maxWidth: "720px", position: "relative", zIndex: 3 }}>
        <div className="profile-card">
          <div className="profile-header">
            {form.photo || profile.photo ? (
              <img
                src={form.photo ? (form.photo.startsWith("blob:") || form.photo.startsWith("http") ? form.photo : `${API_HOST}${form.photo}`) : (profile.photo.startsWith("http") ? profile.photo : `${API_HOST}${profile.photo}`)}
                alt={profile.name}
                className="profile-avatar mb-3"
              />
            ) : (
              <span
                className="profile-avatar mb-3 d-inline-flex align-items-center justify-content-center"
                style={{
                  background: "linear-gradient(135deg, #D63447, #a82333)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "2.2rem",
                  border: "4px solid #fff",
                }}
              >
                {getInitials(profile.name)}
              </span>
            )}
            <h3 className="fw-bold mb-0">{profile.name}</h3>
            <div className="opacity-75 small">{profile.email}</div>
          </div>
          <div className="p-4 p-md-5">
            {msg && <Alert variant={msg.includes("correctamente") ? "success" : "danger"}>{msg}</Alert>}
            <Form onSubmit={handleSave}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="profile-label fw-semibold">Nombres</Form.Label>
                    <Form.Control className="profile-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="profile-label fw-semibold">DNI</Form.Label>
                    <Form.Control className="profile-input" value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="profile-label fw-semibold">Teléfono</Form.Label>
                    <Form.Control className="profile-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="profile-label fw-semibold">Foto de perfil</Form.Label>
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          overflow: "hidden",
                          border: "3px solid #D63447",
                          cursor: (form.photo || profile.photo) ? "pointer" : "default",
                          background: (form.photo || profile.photo) ? "#f3f4f6" : "linear-gradient(135deg, #D63447, #a82333)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "1.4rem",
                        }}
                        onClick={() => { if (form.photo || profile.photo) setShowPhotoModal(true); }}
                      >
                        {form.photo || profile.photo ? (
                          <img
                            src={form.photo ? (form.photo.startsWith("blob:") || form.photo.startsWith("http") ? form.photo : `${API_HOST}${form.photo}`) : (profile.photo.startsWith("http") ? profile.photo : `${API_HOST}${profile.photo}`)}
                            alt="preview"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          getInitials(profile.name)
                        )}
                      </div>
                      <div className="d-flex flex-column gap-2">
                        {form.photo || profile.photo ? (
                          <>
                            <Button size="sm" variant="outline-light" onClick={() => fileInputRef.current?.click()}>
                              <i className="bi bi-pencil me-1"></i>Editar
                            </Button>
                            <Button size="sm" variant="outline-danger" onClick={async () => {
                              try {
                                const fd = new FormData();
                                fd.append("name", form.name);
                                fd.append("dni", form.dni);
                                fd.append("phone", form.phone);
                                fd.append("address", form.address);
                                fd.append("remove_photo", "true");
                                const updated = await updateProfile(fd);
                                setProfile(updated);
                                setForm((f) => ({ ...f, photo: "", photoFile: null }));
                                setRemovePhoto(false);
                                window.dispatchEvent(new Event("authChange"));
                              } catch (err) {
                                setMsg(err.message);
                              }
                            }}>
                              <i className="bi bi-trash me-1"></i>Eliminar
                            </Button>
                            <Button size="sm" variant="outline-secondary" onClick={() => setShowPhotoModal(true)}>
                              <i className="bi bi-arrows-fullscreen me-1"></i>Ver
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="danger" onClick={() => fileInputRef.current?.click()}>
                            <i className="bi bi-plus-lg me-1"></i>Agregar foto
                          </Button>
                        )}
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setForm({ ...form, photoFile: file, photo: URL.createObjectURL(file) });
                          setRemovePhoto(false);
                        }
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label className="profile-label fw-semibold">Dirección</Form.Label>
                    <Form.Control className="profile-input" as="textarea" rows={2} value={form.address} onChange={(e) => { setForm({ ...form, address: e.target.value }); setAddressTouched(true); }} />
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <div className="mt-2">
                    <div className="profile-label fw-semibold mb-2">
                      <i className="bi bi-geo-alt me-2"></i>Ubicación en tiempo real
                    </div>
                    {geoError && <div className="text-warning small mb-2">{geoError}</div>}
                    {coords ? (
                      <>
                        <div className="text-muted small mb-2">
                          Lat: {coords.lat.toFixed(6)}, Lon: {coords.lon.toFixed(6)}
                        </div>
                        <div
                          style={{
                            borderRadius: 20,
                            overflow: "hidden",
                            border: "1px solid rgba(255,255,255,0.18)",
                            boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
                            background: "#0b0b0f",
                          }}
                        >
                          <iframe
                            title="mapa"
                            width="100%"
                            height="280"
                            style={{ border: 0, filter: "contrast(1.05) saturate(1.1)" }}
                            loading="lazy"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.008},${coords.lat - 0.008},${coords.lon + 0.008},${coords.lat + 0.008}&layer=mapnik&marker=${coords.lat},${coords.lon}`}
                          ></iframe>
                        </div>
                      </>
                    ) : (
                      <div className="text-muted small">Obteniendo ubicación...</div>
                    )}
                  </div>
                </Col>
              </Row>
              <div className="d-flex gap-2 mt-4">
                <Button type="submit" variant="danger" className="rounded-pill px-4 fw-bold" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
                <Button
                  variant="outline-secondary"
                  className="rounded-pill px-4"
                  onClick={() => { logout(); localStorage.removeItem("carrito"); window.dispatchEvent(new Event("authChange")); window.dispatchEvent(new Event("cartClear")); navigate("/"); }}
                >
                  Cerrar sesión
                </Button>
              </div>
            </Form>
          </div>
        </div>

        <Modal show={showPhotoModal} onHide={() => setShowPhotoModal(false)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Foto de perfil</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <img
              src={form.photo ? (form.photo.startsWith("blob:") || form.photo.startsWith("http") ? form.photo : `${API_HOST}${form.photo}`) : (profile.photo ? (profile.photo.startsWith("http") ? profile.photo : `${API_HOST}${profile.photo}`) : "https://i.pravatar.cc/300?img=12")}
              alt="Foto de perfil"
              style={{ width: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: 16 }}
            />
          </Modal.Body>
        </Modal>
      </Container>
    </div>
    </div>
  );
}