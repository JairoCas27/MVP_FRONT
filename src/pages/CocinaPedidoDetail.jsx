import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Button, Spinner, Alert, Badge, Row, Col } from "react-bootstrap";
import { API_HOST } from "../services/api";

const styles = `
  .det-wrap { background: #f8f9fa; min-height: 100vh; padding: 24px; }
  .det-header {
    background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
    color: #fff; padding: 24px 28px; border-radius: 20px; margin-bottom: 20px;
    box-shadow: 0 12px 32px rgba(0,0,0,0.12);
  }
  .det-card {
    background: #fff; border-radius: 20px; padding: 24px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.07); border: 1px solid rgba(0,0,0,0.05);
  }
  .prod-row {
    display: flex; align-items: center; gap: 14px; padding: 12px;
    border-radius: 14px; background: #f8fafc; margin-bottom: 10px;
    transition: transform 0.2s ease;
  }
  .prod-row:hover { transform: translateX(4px); }
  .prod-img { width: 64px; height: 64px; border-radius: 12px; object-fit: cover; }
  .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
  .info-row:last-child { border-bottom: none; }
  @media (max-width: 768px) {
    .det-card { padding: 16px; }
    .prod-img { width: 48px; height: 48px; }
  }
`;

export default function CocinaPedidoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("kitchenToken");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_HOST}/api/kitchen/orders`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error");
        const found = (data.data || []).find((o) => String(o.id) === String(id));
        if (!found) throw new Error("Pedido no encontrado");
        setOrder(found);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>;
  if (error || !order) return <Container className="py-5"><Alert variant="danger">{error || "Pedido no encontrado"}</Alert></Container>;

  return (
    <div className="det-wrap">
      <style>{styles}</style>
      <Container style={{ maxWidth: "900px" }}>
        <Button variant="link" className="text-decoration-none text-muted mb-3 p-0" onClick={() => navigate("/cocina/pedidos")}>
          <i className="bi bi-arrow-left me-2"></i>Volver
        </Button>
        <div className="det-header">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h2 className="fw-bold mb-1">Pedido #{order.id}</h2>
              <p className="mb-0 opacity-75">Información completa para preparación</p>
            </div>
            <Badge bg={order.status === "PENDIENTE" ? "warning" : order.status === "PREPARANDO" ? "info" : "success"} text={order.status === "PREPARANDO" ? "light" : "dark"} className="fs-6 px-3 py-2">
              {order.status}
            </Badge>
          </div>
        </div>

        <Row className="g-3 mb-4 justify-content-center">
          {[
            { label: "Cliente", value: order.customer_name },
            { label: "Tipo", value: order.order_type },
            { label: "Pago", value: order.payment_type },
            { label: "Creado", value: order.created_at },
            { label: "Total", value: `S/ ${order.total_amount.toFixed(2)}` },
          ].map((info, idx) => (
            <Col key={idx} xs={6} md style={{ flex: "1 1 0", minWidth: 0 }}>
              <div className="det-card text-center py-3" style={{ height: "100%" }}>
                <div className="text-muted small mb-1">{info.label}</div>
                <div className="fw-bold" style={{ fontSize: "0.95rem", wordBreak: "break-word" }}>{info.value}</div>
              </div>
            </Col>
          ))}
        </Row>

        <Row className="g-4">
          <Col md={12}>
            <div className="det-card">
              <h5 className="fw-bold mb-3"><i className="bi bi-box-seam me-2 text-danger"></i>Productos a preparar</h5>
              {order.items.map((it, idx) => (
                <div key={idx} className="prod-row">
                  <img src={it.product_image} alt={it.product_name} className="prod-img" />
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{it.product_name}</div>
                    {it.options && <div className="text-muted small">{it.options}</div>}
                  </div>
                  <div className="text-end">
                    <div className="small text-muted">{it.quantity}x</div>
                    <div className="fw-bold">S/ {it.subtotal.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}