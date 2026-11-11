import { useState, useEffect } from "react";
import { Container, Card, Table, Button, Modal, Form, Alert, Spinner, Badge } from "react-bootstrap";
import { API_HOST } from "../../services/api";

export default function Cocinas() {
  const [kitchens, setKitchens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
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

  const remove = async (id) => {
    if (!window.confirm("¿Eliminar cocina?")) return;
    await fetch(`${API_HOST}/api/admin/kitchens/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    fetchKitchens();
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Cocinas</h2>
          <p className="text-muted mb-0">Gestión de personal de cocina</p>
        </div>
        <Button style={{ background: "linear-gradient(135deg, #D63447, #a82333)", border: "none" }} className="rounded-pill px-4" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg me-2"></i>Nueva cocina
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Table responsive hover className="mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Estado</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {kitchens.map((k) => (
              <tr key={k.id}>
                <td className="fw-bold text-muted">#{k.id}</td>
                <td className="fw-semibold">{k.name}</td>
                <td>{k.username}</td>
                <td><Badge bg={k.is_active ? "success" : "secondary"}>{k.is_active ? "Activo" : "Inactivo"}</Badge></td>
                <td className="text-end">
                  <Button size="sm" variant="outline-danger" onClick={() => remove(k.id)}>
                    <i className="bi bi-trash"></i>
                  </Button>
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
    </Container>
  );
}