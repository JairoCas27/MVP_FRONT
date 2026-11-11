import React, { useEffect, useState } from "react";
import { Container, Card, Button, Spinner, Alert, Badge, Row, Col } from "react-bootstrap";
import { API_HOST } from "../services/api";

const styles = `
  .coc-card {
    background: #fff; border-radius: 20px; padding: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.07);
    border: 1px solid rgba(0,0,0,0.05);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    height: 100%;
  }
  .coc-card:hover { transform: translateY(-6px); box-shadow: 0 16px 36px rgba(0,0,0,0.12); }
  .coc-card.urgent { border-color: #FCA5A5; box-shadow: 0 4px 12px rgba(220,38,38,0.12); }
  .coc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .coc-id { font-weight: 800; font-size: 1.1rem; color: #111827; }
  .coc-items { background: #f8fafc; border-radius: 12px; padding: 10px; margin-bottom: 12px; }
  .coc-item { font-size: 0.85rem; color: #374151; display: flex; justify-content: space-between; }
  .coc-btn-primary {
    background: linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%);
    border: none; border-radius: 12px; padding: 10px 0; font-weight: 700;
    box-shadow: 0 6px 18px rgba(37,99,235,0.35);
  }
  .coc-btn-success {
    background: linear-gradient(135deg, #16A34A 0%, #15803D 100%);
    border: none; border-radius: 12px; padding: 10px 0; font-weight: 700;
    box-shadow: 0 6px 18px rgba(22,163,74,0.35);
  }
  .coc-btn-warning {
    background: linear-gradient(135deg, #D97706 0%, #b45309 100%);
    border: none; border-radius: 12px; padding: 10px 0; font-weight: 700;
    box-shadow: 0 6px 18px rgba(217,119,6,0.35);
  }
`;

export default function CocinaPedidos() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const token = localStorage.getItem("kitchenToken");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_HOST}/api/kitchen/orders`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error");
      setOrders((data.data || []).filter((o) => o.status !== "LISTO_PARA_RECOJO" && o.status !== "EN_CAMINO"));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const prepare = async (id) => {
    await fetch(`${API_HOST}/api/kitchen/orders/${id}/prepare`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  const ready = async (id) => {
    await fetch(`${API_HOST}/api/kitchen/orders/${id}/ready`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
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

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = (o.customer_name || "").toLowerCase().includes(q) || (o.id || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "Todos" || o.status === statusFilter;
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
            <h2 className="fw-bold mb-1">Pedidos en Cocina</h2>
            <p className="text-muted mb-0">Gestiona la preparación de pedidos</p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <input
              className="form-control"
              placeholder="Buscar por cliente o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 260, borderRadius: 999 }}
            />
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: 180, borderRadius: 999 }}>
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
          <Col md={4}>
            <Card className="p-3 border-0 shadow-sm">
              <div className="text-muted small">Pendientes</div>
              <h3 className="fw-bold mb-0 text-warning">{orders.filter((o) => o.status === "PENDIENTE").length}</h3>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="p-3 border-0 shadow-sm">
              <div className="text-muted small">En preparación</div>
              <h3 className="fw-bold mb-0 text-info">{orders.filter((o) => o.status === "PREPARANDO").length}</h3>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="p-3 border-0 shadow-sm">
              <div className="text-muted small">Listos</div>
              <h3 className="fw-bold mb-0 text-success">{orders.filter((o) => o.status === "LISTO_PARA_RECOJO").length}</h3>
            </Card>
          </Col>
        </Row>

        {filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">No hay pedidos activos.</div>
        ) : (
          <Row className="g-3">
            {filtered.map((o) => (
              <Col md={6} lg={4} key={o.id}>
                <div className={`coc-card ${isUrgent(o.created_at) ? "urgent" : ""}`}>
                  <div className="coc-header">
                    <span className="coc-id">#{o.id}</span>
                    <Badge bg={o.status === "PENDIENTE" ? "warning" : o.status === "PREPARANDO" ? "info" : "success"} text={o.status === "PREPARANDO" ? "light" : "dark"}>
                      {o.status}
                    </Badge>
                  </div>
                  <div className="text-muted small mb-2">
                    <i className="bi bi-clock me-1"></i>{getElapsed(o.created_at)} · {o.order_type}
                  </div>
                  <div className="fw-semibold mb-1">{o.customer_name}</div>
                  <div className="coc-items">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="coc-item">
                        <span>{it.quantity}x {it.product_name}</span>
                        <span>S/ {it.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted small">Pago: {o.payment_type}</span>
                    <span className="fw-bold text-danger">S/ {o.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="d-flex gap-2">
                    {o.status === "PENDIENTE" && (
                      <Button className="coc-btn-primary text-white flex-grow-1" onClick={() => prepare(o.id)}>
                        <i className="bi bi-fire me-1"></i>Preparar
                      </Button>
                    )}
                    {o.status === "PREPARANDO" && (
                      <Button className="coc-btn-success text-white flex-grow-1" onClick={() => ready(o.id)}>
                        <i className="bi bi-check-lg me-1"></i>Listo
                      </Button>
                    )}
                    {o.status === "LISTO_PARA_RECOJO" && (
                      <Button className="coc-btn-warning text-white flex-grow-1" disabled>
                        Listo para entregar
                      </Button>
                    )}
                    <Button variant="outline-secondary" className="flex-grow-1" onClick={() => window.open(`/cocina/pedido/${o.id}`, "_blank")}>
                      <i className="bi bi-eye me-1"></i>Ver detalles
                    </Button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}