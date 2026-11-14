import React, { useEffect, useState } from "react";
import { Container, Card, Button, Spinner, Alert, Badge, Row, Col, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_HOST } from "../services/api";

const styles = `
  .act-card {
    background: #fff; border-radius: 20px; padding: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.07);
    border: 1px solid rgba(0,0,0,0.05);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    height: 100%;
  }
  @media (max-width: 768px) {
    .act-card { padding: 16px; }
  }
  .act-card:hover { transform: translateY(-6px); box-shadow: 0 16px 36px rgba(0,0,0,0.12); }
  .act-card.urgent { border-color: #FCA5A5; box-shadow: 0 4px 12px rgba(220,38,38,0.12); }
  .act-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .act-id { font-weight: 800; font-size: 1.1rem; color: #111827; }
  .act-total { font-weight: 800; color: #D63447; font-size: 1.1rem; }
  .act-meta { font-size: 0.85rem; color: #6b7280; margin-bottom: 10px; }
  .act-items { background: #f8fafc; border-radius: 12px; padding: 10px; margin-bottom: 12px; }
  .act-item { font-size: 0.85rem; color: #374151; display: flex; justify-content: space-between; }
  .act-btn-primary {
    background: linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%);
    border: none; border-radius: 12px; padding: 10px 0; font-weight: 700;
    box-shadow: 0 6px 18px rgba(37,99,235,0.35);
  }
  .act-btn-success {
    background: linear-gradient(135deg, #16A34A 0%, #15803D 100%);
    border: none; border-radius: 12px; padding: 10px 0; font-weight: 700;
    box-shadow: 0 6px 18px rgba(22,163,74,0.35);
  }
`;

export default function RepartidorActivos() {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [coords, setCoords] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const token = localStorage.getItem("driverToken");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_HOST}/api/driver/active`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error");
      setDeliveries(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const accept = async (id) => {
    await fetch(`${API_HOST}/api/driver/deliveries/${id}/accept`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  const markDelivered = async (id) => {
    await fetch(`${API_HOST}/api/driver/deliveries/${id}/delivered`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  const getElapsed = (createdAt) => {
    try {
      const diff = (Date.now() - new Date(createdAt.replace(" ", "T")).getTime()) / 60000;
      if (diff < 1) return "ahora";
      if (diff < 60) return `${Math.floor(diff)} min`;
      return `${Math.floor(diff / 60)} h`;
    } catch { return ""; }
  };

  const isUrgent = (createdAt) => {
    try {
      const diff = (Date.now() - new Date(createdAt.replace(" ", "T")).getTime()) / 60000;
      return diff > 15;
    } catch { return false; }
  };

  const openDetail = (d) => {
    setSelected(d);
    setCoords(null);
    if (d.delivery_address) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(d.delivery_address)}`)
        .then((r) => r.json())
        .then((data) => { if (data && data.length) setCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }); })
        .catch(() => {});
    }
  };

  const filtered = deliveries.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = (d.customer_name || "").toLowerCase().includes(q) || (d.delivery_address || "").toLowerCase().includes(q) || (d.id || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "Todos" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", padding: "24px" }}>
      <style>{styles}</style>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 className="fw-bold mb-1">Pedidos Activos</h2>
            <p className="text-muted mb-0">Gestiona tus entregas en curso</p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <input
              className="form-control"
              placeholder="Buscar por cliente, dirección o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 280, borderRadius: 999 }}
            />
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: 160, borderRadius: 999 }}>
              <option value="Todos">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="PREPARANDO">Preparando</option>
              <option value="EN_CAMINO">En camino</option>
            </select>
            <Button variant="outline-secondary" size="sm" onClick={load}>
              <i className="bi bi-arrow-clockwise me-1"></i>Actualizar
            </Button>
          </div>
        </div>

        <Row className="g-3 mb-3">
          <Col xs={6} md={6}>
            <Card className="p-3 border-0 shadow-sm">
              <div className="text-muted small">Activos</div>
              <h3 className="fw-bold mb-0">{deliveries.length}</h3>
            </Card>
          </Col>
          <Col xs={6} md={6}>
            <Card className="p-3 border-0 shadow-sm">
              <div className="text-muted small">Filtrados</div>
              <h3 className="fw-bold mb-0">{filtered.length}</h3>
            </Card>
          </Col>
        </Row>
        <Row className="g-3 mb-3">
          <Col xs={12} md={6} className="mx-auto">
            <Card className="p-3 border-0 shadow-sm">
              <div className="text-muted small">Monto total</div>
              <h3 className="fw-bold mb-0 text-danger">S/ {deliveries.reduce((s, d) => s + (d.total_amount || 0), 0).toFixed(2)}</h3>
            </Card>
          </Col>
        </Row>

        {filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">No tienes pedidos activos.</div>
        ) : (
          <Row className="g-3">
            {filtered.map((d) => (
              <Col md={6} lg={4} key={d.id}>
                <div className={`act-card ${isUrgent(d.created_at) ? "urgent" : ""}`}>
                  <div className="act-header">
                    <span className="act-id">#{d.id}</span>
                    <Badge bg={d.status === "EN_CAMINO" ? "success" : "warning"} text={d.status === "EN_CAMINO" ? "light" : "dark"}>
                      {d.status === "EN_CAMINO" ? "En camino" : d.status}
                    </Badge>
                  </div>
                  <div className="act-meta">
                    <i className="bi bi-clock me-1"></i>{getElapsed(d.created_at)} · {d.payment_type}
                  </div>
                  <div className="fw-semibold mb-1">{d.customer_name}</div>
                  <div className="text-muted small mb-2">{d.customer_phone}</div>
                  <div className="text-muted small mb-2">{d.delivery_address}</div>
                  <div className="act-items">
                    {d.items.map((it, idx) => (
                      <div key={idx} className="act-item">
                        <span>{it.quantity}x {it.product_name}</span>
                        <span>S/ {it.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted small">Total</span>
                    <span className="act-total">S/ {d.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="d-flex gap-2">
                    {d.status !== "EN_CAMINO" && (
                      <Button className="act-btn-primary text-white flex-grow-1" onClick={() => accept(d.id)}>
                        <i className="bi bi-check-lg me-1"></i>Aceptar
                      </Button>
                    )}
                    {d.status === "EN_CAMINO" && (
                      <Button className="act-btn-success text-white flex-grow-1" onClick={() => markDelivered(d.id)}>
                        <i className="bi bi-check2-circle me-1"></i>Entregado
                      </Button>
                    )}
                    <Button variant="outline-secondary" className="flex-grow-1" onClick={() => navigate(`/repartidor/pedido/${d.id}`)}>
                      <i className="bi bi-eye me-1"></i>Ver detalles
                    </Button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}

        <Modal show={!!selected} onHide={() => setSelected(null)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Detalle de entrega</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selected && (
              <Row className="g-3">
                <Col md={6}>
                  <div className="mb-2"><strong>Cliente:</strong> {selected.customer_name}</div>
                  <div className="mb-2"><strong>Teléfono:</strong> {selected.customer_phone}</div>
                  <div className="mb-2"><strong>Dirección:</strong> {selected.delivery_address}</div>
                  <div className="mb-2"><strong>Pago:</strong> {selected.payment_type}</div>
                  <div className="mb-2"><strong>Total:</strong> S/ {selected.total_amount.toFixed(2)}</div>
                  <div className="mb-2"><strong>Creado:</strong> {selected.created_at}</div>
                </Col>
                <Col md={6}>
                  {coords ? (
                    <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #e5e7eb" }}>
                      <iframe title="mapa" width="100%" height="260" style={{ border: 0 }} loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.01},${coords.lat - 0.01},${coords.lon + 0.01},${coords.lat + 0.01}&layer=mapnik&marker=${coords.lat},${coords.lon}`}></iframe>
                    </div>
                  ) : (
                    <div className="text-center py-5 text-muted">Cargando mapa...</div>
                  )}
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer>
            {selected && selected.status !== "EN_CAMINO" && (
              <Button variant="primary" onClick={() => { accept(selected.id); setSelected(null); }}>Aceptar</Button>
            )}
            {selected && selected.status === "EN_CAMINO" && (
              <Button variant="success" onClick={() => { markDelivered(selected.id); setSelected(null); }}>Entregado</Button>
            )}
            <Button variant="secondary" onClick={() => setSelected(null)}>Cerrar</Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}