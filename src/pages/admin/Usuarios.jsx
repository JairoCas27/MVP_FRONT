import { useState, useEffect } from "react";
import { Container, Card, Table, Spinner, Alert, Badge, Modal, Button, Row, Col, Form } from "react-bootstrap";
import { API_HOST } from "../../services/api";

const styles = `
  .usr-thumb {
    width: 42px; height: 42px; border-radius: 50%; object-fit: cover;
    border: 2px solid #D63447; background: #f3f4f6;
  }
  .usr-initials {
    width: 42px; height: 42px; border-radius: 50%;
    background: linear-gradient(135deg, #D63447, #a82333);
    color: #fff; display: inline-flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 0.8rem; border: 2px solid #D63447;
  }
  .status-pill-btn {
    border: none; padding: 6px 14px; border-radius: 999px;
    font-size: 0.75rem; font-weight: 700; cursor: pointer;
    display: inline-flex; align-items: center; gap: 6px;
    transition: all 0.2s ease;
  }
  .action-btn {
    width: 34px; height: 34px; border-radius: 10px;
    display: inline-flex; align-items: center; justify-content: center;
    border: 1px solid #e5e7eb; background: #fff; color: #374151;
    transition: all 0.15s ease;
  }
  .action-btn:hover { background: #f3f4f6; }
  .action-btn.danger:hover { background: #fee2e2; color: #dc2626; border-color: #fecaca; }
`;

export default function Usuarios() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [coords, setCoords] = useState(null);
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("token");

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_HOST}/api/admin/clients`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al cargar usuarios");
      setClients(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const toggleStatus = async (c) => {
    try {
      await fetch(`${API_HOST}/api/admin/clients/${c.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: !c.is_active }),
      });
      fetchClients();
    } catch (e) {}
  };

  const remove = async (c) => {
    if (!window.confirm(`¿Eliminar a ${c.name}?`)) return;
    try {
      await fetch(`${API_HOST}/api/admin/clients/${c.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchClients();
      setShowDetail(false);
    } catch (e) {}
  };

  const openDetail = (c) => {
    setSelected(c);
    setShowDetail(true);
    setCoords(null);
    if (c.address) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(c.address)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d && d.length) {
            setCoords({ lat: parseFloat(d[0].lat), lon: parseFloat(d[0].lon) });
          }
        })
        .catch(() => {});
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container fluid>
      <style>{styles}</style>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Usuarios Registrados</h2>
          <p className="text-muted mb-0">Clientes con cuenta en la plataforma</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <Form.Control
            placeholder="Buscar usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 260, borderRadius: 999 }}
          />
          <Badge bg="danger" className="fs-6 px-3 py-2">{clients.length} usuarios</Badge>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <Table responsive hover className="mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Foto</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Estado</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients
              .filter((c) =>
                (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
                (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
                (c.dni || "").toLowerCase().includes(search.toLowerCase()) ||
                (c.phone || "").toLowerCase().includes(search.toLowerCase())
              )
              .map((c) => (
              <tr key={c.id}>
                <td className="fw-bold text-muted">#{c.id}</td>
                <td>
                  {c.photo ? (
                    <img src={c.photo.startsWith("http") ? c.photo : `${API_HOST}${c.photo}`} alt={c.name} className="usr-thumb" />
                  ) : (
                    <span className="usr-initials">
                      {c.name ? c.name.trim().split(/\s+/).map((p) => p.charAt(0)).slice(0, 2).join("").toUpperCase() : "U"}
                    </span>
                  )}
                </td>
                <td className="fw-semibold">{c.name}</td>
                <td>{c.email}</td>
                <td>{c.dni || "—"}</td>
                <td>{c.phone || "—"}</td>
                <td title={c.address || ""} style={{ maxWidth: 160, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {c.address || "—"}
                </td>
                <td>
                  <button
                    className="status-pill-btn"
                    style={{
                      background: c.is_active !== false ? "linear-gradient(135deg, #16A34A, #15803D)" : "linear-gradient(135deg, #9CA3AF, #6B7280)",
                      color: "#fff",
                      boxShadow: c.is_active !== false ? "0 4px 12px rgba(22,163,74,0.35)" : "0 4px 12px rgba(107,114,128,0.25)",
                    }}
                    onClick={() => toggleStatus(c)}
                  >
                    <i className={`bi ${c.is_active !== false ? "bi-check-circle-fill" : "bi-pause-circle-fill"}`}></i>
                    {c.is_active !== false ? "Activo" : "Inactivo"}
                  </button>
                </td>
                <td className="text-end">
                  <div className="d-inline-flex gap-2">
                    <button className="action-btn" title="Ver detalles" onClick={() => openDetail(c)}>
                      <i className="bi bi-eye"></i>
                    </button>
                    <button className="action-btn danger" title="Eliminar" onClick={() => remove(c)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal show={showDetail} onHide={() => setShowDetail(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalle del usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <Row className="g-3">
              <Col md={4} className="text-center">
                {selected.photo ? (
                  <img
                    src={selected.photo.startsWith("http") ? selected.photo : `${API_HOST}${selected.photo}`}
                    alt={selected.name}
                    style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: "3px solid #D63447", cursor: "pointer" }}
                    onClick={() => setShowPhoto(true)}
                  />
                ) : (
                  <span style={{ width: 120, height: 120, borderRadius: "50%", background: "linear-gradient(135deg, #D63447, #a82333)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "2rem", border: "3px solid #D63447" }}>
                    {selected.name ? selected.name.trim().split(/\s+/).map((p) => p.charAt(0)).slice(0, 2).join("").toUpperCase() : "U"}
                  </span>
                )}
                <h5 className="fw-bold mt-3 mb-0">{selected.name}</h5>
                <div className="text-muted small">{selected.email}</div>
                <div className="mt-2">
                  <span className="status-pill-btn" style={{ background: selected.is_active !== false ? "linear-gradient(135deg, #16A34A, #15803D)" : "linear-gradient(135deg, #9CA3AF, #6B7280)", color: "#fff", padding: "4px 12px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 700 }}>
                    {selected.is_active !== false ? "Activo" : "Inactivo"}
                  </span>
                </div>
                {selected.photo && (
                  <Button size="sm" variant="outline-secondary" className="mt-2 rounded-pill" onClick={() => setShowPhoto(true)}>
                    <i className="bi bi-arrows-fullscreen me-1"></i>Ver foto grande
                  </Button>
                )}
              </Col>
              <Col md={8}>
                <div className="mb-2"><strong>DNI:</strong> {selected.dni || "—"}</div>
                <div className="mb-2"><strong>Teléfono:</strong> {selected.phone || "—"}</div>
                <div className="mb-2"><strong>Dirección:</strong> {selected.address || "—"}</div>
                <div className="mb-3"><strong>Registrado:</strong> {selected.created_at}</div>
                {selected.address && (
                  <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #e5e7eb" }}>
                    {coords ? (
                      <iframe
                        title="mapa-usuario"
                        width="100%"
                        height="220"
                        style={{ border: 0 }}
                        loading="lazy"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.01},${coords.lat - 0.01},${coords.lon + 0.01},${coords.lat + 0.01}&layer=mapnik&marker=${coords.lat},${coords.lon}`}
                      ></iframe>
                    ) : (
                      <div className="text-center py-4 text-muted small">Cargando mapa...</div>
                    )}
                  </div>
                )}
                <div className="d-flex gap-2 mt-3">
                  <Button variant="outline-danger" className="rounded-pill" onClick={() => remove(selected)}>
                    <i className="bi bi-trash me-2"></i>Eliminar cuenta
                  </Button>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showPhoto} onHide={() => setShowPhoto(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Foto de perfil</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selected?.photo && (
            <img
              src={selected.photo.startsWith("http") ? selected.photo : `${API_HOST}${selected.photo}`}
              alt={selected.name}
              style={{ width: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: 16 }}
            />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}