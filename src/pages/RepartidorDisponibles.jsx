import React, { useEffect, useState } from "react";
import { Container, Card, Button, Spinner, Alert, Badge, Row, Col } from "react-bootstrap";
import { API_HOST } from "../services/api";

const styles = `
  .disp-card {
    background: #fff; border-radius: 20px; padding: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.07);
    border: 1px solid rgba(0,0,0,0.05);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    height: 100%;
  }
  @media (max-width: 768px) {
    .disp-card { padding: 16px; }
  }
  .disp-card:hover { transform: translateY(-6px); box-shadow: 0 16px 36px rgba(0,0,0,0.12); }
  .disp-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
  }
  .disp-id { font-weight: 800; font-size: 1.1rem; color: #111827; }
  .disp-total { font-weight: 800; color: #D63447; font-size: 1.1rem; }
  .disp-meta { font-size: 0.85rem; color: #6b7280; margin-bottom: 10px; }
  .disp-items { background: #f8fafc; border-radius: 12px; padding: 10px; margin-bottom: 12px; }
  .disp-item { font-size: 0.85rem; color: #374151; display: flex; justify-content: space-between; }
  .disp-btn {
    background: linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%);
    border: none; border-radius: 12px; padding: 10px 0; font-weight: 700;
    box-shadow: 0 6px 18px rgba(37,99,235,0.35);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .disp-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(37,99,235,0.45); }
  .search-box .form-control { border-radius: 999px; padding: 10px 18px; border: 1px solid #e5e7eb; }
`;

export default function RepartidorDisponibles() {
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const token = localStorage.getItem("driverToken");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_HOST}/api/driver/available`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error");
      setAvailable(data.data);
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

  const getElapsed = (createdAt) => {
    try {
      const diff = (Date.now() - new Date(createdAt.replace(" ", "T")).getTime()) / 60000;
      if (diff < 1) return "ahora";
      if (diff < 60) return `${Math.floor(diff)} min`;
      return `${Math.floor(diff / 60)} h`;
    } catch { return ""; }
  };

  const filtered = available.filter((d) => {
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
            <h2 className="fw-bold mb-1">Pedidos Disponibles</h2>
            <p className="text-muted mb-0">Acepta un pedido para comenzar la entrega</p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <input
              className="form-control search-box"
              placeholder="Buscar por cliente, dirección o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 280, borderRadius: 999 }}
            />
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: 160, borderRadius: 999 }}>
              <option value="Todos">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="PREPARANDO">Preparando</option>
              <option value="LISTO_PARA_RECOJO">Listo</option>
            </select>
            <Button variant="outline-secondary" size="sm" onClick={load}>
              <i className="bi bi-arrow-clockwise me-1"></i>Actualizar
            </Button>
          </div>
        </div>

        <Row className="g-3 mb-3">
          <Col xs={6} md={6}>
            <Card className="p-3 border-0 shadow-sm">
              <div className="text-muted small">Disponibles</div>
              <h3 className="fw-bold mb-0">{available.length}</h3>
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
              <div className="text-muted small">Monto total disponible</div>
              <h3 className="fw-bold mb-0 text-danger">S/ {available.reduce((s, d) => s + (d.total_amount || 0), 0).toFixed(2)}</h3>
            </Card>
          </Col>
        </Row>

        {filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">No hay pedidos disponibles.</div>
        ) : (
          <Row className="g-3">
            {filtered.map((d) => (
              <Col md={6} lg={4} key={d.id}>
                <div className="disp-card" style={(() => {
                  try {
                    const diff = (Date.now() - new Date(d.created_at.replace(" ", "T")).getTime()) / 60000;
                    return diff > 15 ? { borderColor: "#FCA5A5", boxShadow: "0 4px 12px rgba(220,38,38,0.12)" } : {};
                  } catch { return {}; }
                })()}>
                  <div className="disp-header">
                    <span className="disp-id">#{d.id}</span>
                    <Badge bg="warning" text="dark">{d.status}</Badge>
                  </div>
                  <div className="text-muted small mb-2">
                    <i className="bi bi-clock me-1"></i>{getElapsed(d.created_at)}
                  </div>
                  <div className="disp-meta">
                    <i className="bi bi-person me-1"></i>{d.customer_name} · <i className="bi bi-telephone ms-2 me-1"></i>{d.customer_phone}
                  </div>
                  <div className="disp-meta">
                    <i className="bi bi-geo-alt me-1"></i>{d.delivery_address}
                  </div>
                  <div className="disp-items">
                    {d.items.map((it, idx) => (
                      <div key={idx} className="disp-item">
                        <span>{it.quantity}x {it.product_name}</span>
                        <span>S/ {it.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted small">Pago: {d.payment_type}</span>
                    <span className="disp-total">S/ {d.total_amount.toFixed(2)}</span>
                  </div>
                  <Button className="disp-btn w-100 text-white" onClick={() => accept(d.id)}>
                    <i className="bi bi-check-lg me-1"></i>Aceptar pedido
                  </Button>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}