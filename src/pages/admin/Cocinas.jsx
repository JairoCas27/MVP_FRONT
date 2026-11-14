import { useState, useEffect } from "react";
import { Container, Card, Table, Button, Modal, Form, Alert, Spinner, Badge, Row, Col } from "react-bootstrap";
import { API_HOST } from "../../services/api";

const styles = `
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

export default function Cocinas() {
  const [kitchens, setKitchens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const token = localStorage.getItem("token");

  const fetchKitchens = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_HOST}/api/admin/kitchens`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al cargar cocinas");
      setKitchens(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKitchens(); }, []);

  const save = async () => {
    try {
      const res = await fetch(`${API_HOST}/api/admin/kitchens`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al crear");
      setShowModal(false);
      setForm({ name: "", username: "", password: "" });
      fetchKitchens();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleStatus = async (k) => {
    try {
      await fetch(`${API_HOST}/api/admin/kitchens/${k.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: !k.is_active }),
      });
      fetchKitchens();
    } catch (e) {}
  };

  const remove = async (k) => {
    if (!window.confirm("¿Eliminar cocina?")) return;
    try {
      await fetch(`${API_HOST}/api/admin/kitchens/${k.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchKitchens();
      setShowDetail(false);
    } catch (e) {}
  };

  // Need backend PUT endpoint for kitchens; add if missing. For now toggle calls PUT which may not exist.
  // We'll implement toggle via a simple state update fallback if endpoint missing.

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  const filtered = kitchens.filter((k) =>
    (k.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (k.username || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container fluid>
      <style>{styles}</style>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Cocinas</h2>
          <p className="text-muted mb-0">Gestión de personal de cocina</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <Form.Control
            placeholder="Buscar cocina..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 260, borderRadius: 999 }}
          />
          <Button style={{ background: "linear-gradient(135deg, #D63447, #a82333)", border: "none" }} className="rounded-pill px-4" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-lg me-2"></i>Nueva cocina
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
              <th>Estado</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((k) => (
              <tr key={k.id}>
                <td className="fw-bold text-muted">#{k.id}</td>
                <td>
                  <span style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, #D63447, #a82333)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem", border: "2px solid #D63447" }}>
                    {k.name ? k.name.trim().split(/\s+/).map((p) => p.charAt(0)).slice(0, 2).join("").toUpperCase() : "U"}
                  </span>
                </td>
                <td className="fw-semibold">{k.name}</td>
                <td>{k.username}</td>
                <td>
                  <button
                    className="status-pill-btn"
                    style={{
                      background: k.is_active !== false ? "linear-gradient(135deg, #16A34A, #15803D)" : "linear-gradient(135deg, #9CA3AF, #6B7280)",
                      color: "#fff",
                      boxShadow: k.is_active !== false ? "0 4px 12px rgba(22,163,74,0.35)" : "0 4px 12px rgba(107,114,128,0.25)",
                    }}
                    onClick={() => toggleStatus(k)}
                  >
                    <i className={`bi ${k.is_active !== false ? "bi-check-circle-fill" : "bi-pause-circle-fill"}`}></i>
                    {k.is_active !== false ? "Activo" : "Inactivo"}
                  </button>
                </td>
                <td className="text-end">
                  <div className="d-inline-flex gap-2">
                    <button className="action-btn" title="Ver detalles" onClick={() => setSelected(k)}>
                      <i className="bi bi-eye"></i>
                    </button>
                    <button className="action-btn danger" title="Eliminar" onClick={() => remove(k)}>
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
          <Modal.Title>Nueva cocina</Modal.Title>
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={save}>Crear</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={!!selected} onHide={() => setSelected(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Detalle de cocina</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <div>
              <div className="mb-2"><strong>Nombre:</strong> {selected.name}</div>
              <div className="mb-2"><strong>Usuario:</strong> {selected.username}</div>
              <div className="mb-2"><strong>Estado:</strong> {selected.is_active ? "Activo" : "Inactivo"}</div>
              <div className="mb-2"><strong>Registrado:</strong> {selected.created_at}</div>
              <div className="d-flex gap-2 mt-3">
                <Button variant="outline-danger" className="rounded-pill" onClick={() => remove(selected)}>
                  <i className="bi bi-trash me-2"></i>Eliminar cuenta
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}