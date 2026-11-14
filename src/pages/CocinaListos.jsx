import React, { useEffect, useState } from "react";
import { Container, Card, Button, Spinner, Alert, Badge, Row, Col } from "react-bootstrap";
import { API_HOST } from "../services/api";

const styles = `
  .listo-card {
    background: #fff; border-radius: 20px; padding: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.07);
    border: 1px solid rgba(0,0,0,0.05);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    height: 100%;
  }
  .listo-card:hover { transform: translateY(-6px); box-shadow: 0 16px 36px rgba(0,0,0,0.12); }
  .listo-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .listo-id { font-weight: 800; font-size: 1.1rem; color: #111827; }
  .listo-items { background: #f8fafc; border-radius: 12px; padding: 10px; margin-bottom: 12px; }
  .listo-item { font-size: 0.85rem; color: #374151; display: flex; justify-content: space-between; }
`;

export default function CocinaListos() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("kitchenToken");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_HOST}/api/kitchen/orders`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error");
      setOrders((data.data || []).filter((o) => o.status === "LISTO_PARA_RECOJO"));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = orders.filter((o) =>
    (o.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (o.id || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", padding: "24px" }}>
      <style>{styles}</style>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 className="fw-bold mb-1">Pedidos Listos</h2>
            <p className="text-muted mb-0">Pedidos preparados listos para entrega</p>
          </div>
          <div className="d-flex gap-2">
            <input
              className="form-control"
              placeholder="Buscar por cliente o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 260, borderRadius: 999 }}
            />
            <Button variant="outline-secondary" size="sm" onClick={load}>
              <i className="bi bi-arrow-clockwise me-1"></i>Actualizar
            </Button>
          </div>
        </div>

        <Row className="g-3 mb-3">
          <Col xs={6} md={6}>
            <Card className="p-3 border-0 shadow-sm">
              <div className="text-muted small">Listos</div>
              <h3 className="fw-bold mb-0 text-success">{orders.length}</h3>
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
              <h3 className="fw-bold mb-0 text-danger">S/ {orders.reduce((s, o) => s + (o.total_amount || 0), 0).toFixed(2)}</h3>
            </Card>
          </Col>
        </Row>

        {filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">No hay pedidos listos.</div>
        ) : (
          <Row className="g-3">
            {filtered.map((o) => (
              <Col md={6} lg={4} key={o.id}>
                <div className="listo-card">
                  <div className="listo-header">
                    <span className="listo-id">#{o.id}</span>
                    <Badge bg="success">Listo</Badge>
                  </div>
                  <div className="fw-semibold mb-1">{o.customer_name}</div>
                  <div className="text-muted small mb-2">{o.order_type} · {o.payment_type}</div>
                  <div className="d-flex gap-2 mb-3 flex-wrap">
                    {o.items.map((it, idx) => (
                      <div key={idx} style={{ width: 56, height: 56, borderRadius: 12, overflow: "hidden", background: "#f3f4f6", border: "1px solid #e5e7eb" }}>
                        <img src={it.product_image} alt={it.product_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>
                  <div className="listo-items">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="listo-item">
                        <span>{it.quantity}x {it.product_name}</span>
                        <span>S/ {it.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="fw-bold text-danger">Total: S/ {o.total_amount.toFixed(2)}</div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}