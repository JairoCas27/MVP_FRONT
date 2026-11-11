import { useState, useEffect } from "react";
import { Container, Card, Table, Button, Modal, Form, Alert, Spinner, Badge, Row, Col } from "react-bootstrap";
import { API_HOST } from "../../services/api";
import { ProductCard } from "../../components/ProductCard";

const styles = `
  .prod-thumb {
    width: 56px; height: 56px; border-radius: 12px; object-fit: cover;
    border: 1px solid #e5e7eb; background: #f3f4f6;
  }
  .prod-table thead th {
    background: #f8fafc; border-bottom: 1px solid #e5e7eb;
    font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; color: #64748B;
  }
  .prod-table tbody tr:hover { background: #fafafa; }
  .prod-desc {
    max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
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

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", includes: "", price: "", image: "", is_active: true });
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_HOST}/api/admin/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al cargar productos");
      setProducts(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", includes: "", price: "", image: "", is_active: true });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || "",
      includes: p.includes || "",
      price: p.price,
      image: p.image || "",
      is_active: p.is_active,
    });
    setShowModal(true);
  };

  const save = async () => {
    try {
      const url = editing ? `${API_HOST}/api/admin/products/${editing.id}` : `${API_HOST}/api/admin/products`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al guardar");
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggle = async (p) => {
    try {
      await fetch(`${API_HOST}/api/admin/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: !p.is_active }),
      });
      fetchProducts();
    } catch (e) {}
  };

  const remove = async (p) => {
    if (!window.confirm(`¿Desactivar ${p.name}?`)) return;
    try {
      await fetch(`${API_HOST}/api/admin/products/${p.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (e) {}
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container fluid>
      <style>{styles}</style>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Productos</h2>
          <p className="text-muted mb-0">Gestión del catálogo</p>
        </div>
        <div className="d-flex gap-2">
          <Form.Control
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 260, borderRadius: 999 }}
          />
          <Button style={{ background: "linear-gradient(135deg, #D63447, #a82333)", border: "none" }} className="rounded-pill px-4" onClick={openCreate}>
            <i className="bi bi-plus-lg me-2"></i>Nuevo producto
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <Table responsive hover className="prod-table mb-0 align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Estado</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products
              .filter((p) => (p.name || "").toLowerCase().includes(search.toLowerCase()) || (p.description || "").toLowerCase().includes(search.toLowerCase()))
              .map((p) => (
              <tr key={p.id}>
                <td className="fw-bold text-muted">#{p.id}</td>
                <td>
                  <img src={p.image} alt={p.name} className="prod-thumb" />
                </td>
                <td className="fw-semibold">{p.name}</td>
                <td className="prod-desc text-muted small">{p.description || "—"}</td>
                <td className="fw-bold text-danger">S/ {p.price.toFixed(2)}</td>
                <td>
                  <button
                    onClick={() => toggle(p)}
                    style={{
                      border: "none",
                      background: p.is_active
                        ? "linear-gradient(135deg, #16A34A, #15803D)"
                        : "linear-gradient(135deg, #9CA3AF, #6B7280)",
                      color: "#fff",
                      padding: "6px 14px",
                      borderRadius: 999,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: p.is_active ? "0 4px 12px rgba(22,163,74,0.35)" : "0 4px 12px rgba(107,114,128,0.25)",
                      transition: "all 0.2s ease",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <i className={`bi ${p.is_active ? "bi-check-circle-fill" : "bi-pause-circle-fill"}`}></i>
                    {p.is_active ? "Activo" : "Inactivo"}
                  </button>
                </td>
                <td className="text-end">
                  <div className="d-inline-flex gap-2">
                    <button className="action-btn" title="Ver detalles" onClick={() => { setPreviewProduct(p); setShowPreview(true); }}>
                      <i className="bi bi-eye"></i>
                    </button>
                    <button className="action-btn" title="Editar" onClick={() => openEdit(p)}>
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="action-btn danger" title="Desactivar" onClick={() => remove(p)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Editar producto" : "Nuevo producto"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Nombre</Form.Label>
                <Form.Control value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Precio</Form.Label>
                <Form.Control type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Descripción</Form.Label>
                <Form.Control as="textarea" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Incluye</Form.Label>
                <Form.Control as="textarea" rows={2} value={form.includes} onChange={(e) => setForm({ ...form, includes: e.target.value })} />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Imagen (URL)</Form.Label>
                <Form.Control value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Check type="switch" label="Activo" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button style={{ background: "linear-gradient(135deg, #D63447, #a82333)", border: "none" }} onClick={save}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showPreview} onHide={() => setShowPreview(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Vista previa del producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {previewProduct && (
            <div style={{ maxWidth: 320, margin: "0 auto" }}>
              <ProductCard
                producto={{
                  id: previewProduct.id,
                  nombre: previewProduct.name,
                  descripcion: previewProduct.description,
                  precio: previewProduct.price,
                  imagen: previewProduct.image,
                }}
                onAgregar={() => {}}
              />
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}