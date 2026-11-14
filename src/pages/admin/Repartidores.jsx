import { useState, useEffect } from "react";
import { Container, Card, Table, Button, Modal, Form, Alert, Spinner, Badge, Row, Col } from "react-bootstrap";
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

export default function Repartidores() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState(null);
  const [coords, setCoords] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", username: "", password: "", dni: "", phone: "", address: "", photo: "" });
  const token = localStorage.getItem("token");

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_HOST}/api/admin/drivers`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al cargar repartidores");
      setDrivers(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrivers(); }, []);

  const save = async () => {
    try {
      const res = await fetch(`${API_HOST}/api/admin/drivers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al crear");
      setShowModal(false);
      setForm({ name: "", username: "", password: "", dni: "", phone: "", address: "", photo: "" });
      fetchDrivers();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleStatus = async (d) => {
    try {
      await fetch(`${API_HOST}/api/admin/drivers/${d.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: !d.is_active }),
      });
      fetchDrivers();
    } catch (e) {}
  };

  const remove = async (d) => {
    if (!window.confirm(`¿Eliminar a ${d.name}?`)) return;
    try {
      await fetch(`${API_HOST}/api/admin/drivers/${d.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDrivers();
      setShowDetail(false);
    } catch (e) {}
  };

  const openDetail = (d) => {
    setSelected(d);
    setShowDetail(true);
    setCoords(null);
    if (d.address) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(d.address)}`)
        .then((r) => r.json())
        .then((data) => { if (data && data.length) setCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }); })
        .catch(() => {});
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  const filtered = drivers.filter((d) =>
    (d.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.username || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.dni || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.phone || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container fluid>
      <style>{styles}</style>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Repartidores</h2>
          <p className="text-muted mb-0">Gestión de personal de delivery</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <Form.Control
            placeholder="Buscar repartidor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 260, borderRadius: 999 }}
          />
          <Button style={{ background: "linear-gradient(135deg, #D63447, #a82333)", border: "none" }} className="rounded-pill px-4" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-lg me-2"></i>Nuevo repartidor
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <Table responsive hover className="mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Foto</th>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id}>
                <td className="fw-bold text-muted">#{d.id}</td>
                <td>
                  <span style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, #D63447, #a82333)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", border: "2px solid #D63447" }}>
                    {d.name ? d.name.trim().split(/\s+/).map((p) => p.charAt(0)).slice(0, 2).join("").toUpperCase() : "U"}
                  </span>
                </td>
                <td className="fw-semibold">{d.name}</td>
                <td>{d.username}</td>
                <td>{d.dni || "—"}</td>
                <td>{d.phone || "—"}</td>
                <td>
                  <button
                    className="status-pill-btn"
                    style={{
                      background: d.is_active !== false ? "linear-gradient(135deg, #16A34A, #15803D)" : "linear-gradient(135deg, #9CA3AF, #6B7280)",
                      color: "#fff",
                      boxShadow: d.is_active !== false ? "0 4px 12px rgba(22,163,74,0.35)" : "0 4px 12px rgba(107,114,128,0.25)",
                    }}
                    onClick={() => toggleStatus(d)}
                  >
                    <i className={`bi ${d.is_active !== false ? "bi-check-circle-fill" : "bi-pause-circle-fill"}`}></i>
                    {d.is_active !== false ? "Activo" : "Inactivo"}
                  </button>
                </td>
                <td className="text-end">
                  <div className="d-inline-flex gap-2">
                    <button className="action-btn" title="Ver detalles" onClick={() => openDetail(d)}>
                      <i className="bi bi-eye"></i>
                    </button>
                    <button className="action-btn danger" title="Eliminar" onClick={() => remove(d)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo repartidor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Usuario</Form.Label>
            <Form.Control value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>DNI</Form.Label>
            <Form.Control value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Dirección</Form.Label>
            <Form.Control value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Foto (URL)</Form.Label>
            <Form.Control value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={save}>Crear</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDetail} onHide={() => setShowDetail(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalle del repartidor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <Row className="g-3">
              <Col md={4} className="text-center">
                {selected.photo ? (
                  <img src={selected.photo.startsWith("http") ? selected.photo : `${API_HOST}${selected.photo}`} alt={selected.name} style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: "3px solid #D63447" }} />
                ) : (
                  <span style={{ width: 120, height: 120, borderRadius: "50%", background: "linear-gradient(135deg, #D63447, #a82333)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "2rem", border: "3px solid #D63447" }}>
                    {selected.name ? selected.name.trim().split(/\s+/).map((p) => p.charAt(0)).slice(0, 2).join("").toUpperCase() : "U"}
                  </span>
                )}
                <h5 className="fw-bold mt-3 mb-0">{selected.name}</h5>
                <div className="text-muted small">{selected.username}</div>
                <div className="mt-2">
                  <span className="status-pill-btn" style={{ background: selected.is_active !== false ? "linear-gradient(135deg, #16A34A, #15803D)" : "linear-gradient(135deg, #9CA3AF, #6B7280)", color: "#fff", padding: "4px 12px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 700 }}>
                    {selected.is_active !== false ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </Col>
              <Col md={8}>
                <div className="mb-2"><strong>DNI:</strong> {selected.dni || "—"}</div>
                <div className="mb-2"><strong>Teléfono:</strong> {selected.phone || "—"}</div>
                <div className="mb-3"><strong>Registrado:</strong> {selected.created_at}</div>
                {selected.address && (
                  <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #e5e7eb" }}>
                    <iframe
                      title="mapa-repartidor"
                      width="100%"
                      height="220"
                      style={{ border: 0 }}
                      loading="lazy"
                      src={`https://www.openstreetmap.org/search?query=${encodeURIComponent(selected.address)}`}
                    ></iframe>
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
    </Container>
  );
}