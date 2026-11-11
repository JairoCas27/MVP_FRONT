import React from "react";
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from "react-bootstrap";
import { useActiveOrders } from "../../hooks/useAdmin";

const styles = `
  .kanban-col {
    background: #f8fafc;
    border-radius: 16px;
    padding: 12px;
    min-height: 400px;
  }
  .kanban-title {
    font-weight: 700;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .order-card {
    background: #fff;
    border-radius: 14px;
    padding: 14px;
    margin-bottom: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    border: 1px solid #e5e7eb;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .order-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  }
`;

const STATUS_COLUMNS = [
  { key: "PENDIENTE", label: "Pendiente", color: "#D97706", bg: "#FEF3C7" },
  { key: "PREPARANDO", label: "Preparando", color: "#0284C7", bg: "#E0F2FE" },
  { key: "EN_CAMINO", label: "En camino / Listo", color: "#15803D", bg: "#DCFCE7" },
];

function getColumn(status) {
  if (status === "PENDIENTE") return "PENDIENTE";
  if (status === "PREPARANDO") return "PREPARANDO";
  if (status === "EN_CAMINO" || status === "LISTO_PARA_RECOJO") return "EN_CAMINO";
  return "PENDIENTE";
}

export default function Pedidos() {
  const { orders, loading, error, advanceOrderState, cancelOrder, refetch } = useActiveOrders();

  const getElapsed = (createdAt) => {
    try {
      const diff = (Date.now() - new Date(createdAt.replace(" ", "T")).getTime()) / 60000;
      if (diff < 1) return "ahora";
      if (diff < 60) return `${Math.floor(diff)} min`;
      return `${Math.floor(diff / 60)} h ${Math.floor(diff % 60)} min`;
    } catch {
      return "";
    }
  };

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>;
  }
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  const grouped = STATUS_COLUMNS.reduce((acc, col) => {
    acc[col.key] = [];
    return acc;
  }, {});
  orders.forEach((o) => {
    const col = getColumn(o.status);
    if (grouped[col]) grouped[col].push(o);
  });

  return (
    <div>
      <style>{styles}</style>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Gestión de Pedidos</h2>
          <p className="text-muted mb-0">Tablero Kanban en tiempo real</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <Badge bg="danger" className="fs-6 px-3 py-2">
            {orders.length} activos
          </Badge>
          <Button variant="outline-secondary" size="sm" onClick={() => refetch && refetch()}>
            <i className="bi bi-arrow-clockwise"></i> Actualizar
          </Button>
        </div>
      </div>

      <Row className="g-3">
        {STATUS_COLUMNS.map((col) => (
          <Col key={col.key} md={4}>
            <div className="kanban-col">
              <div className="kanban-title">
                <span style={{ color: col.color }}>{col.label}</span>
                <Badge style={{ background: col.bg, color: col.color }} className="rounded-pill">
                  {grouped[col.key].length}
                </Badge>
              </div>
              {grouped[col.key].length === 0 && (
                <div className="text-muted small text-center py-4">Sin pedidos</div>
              )}
              {grouped[col.key].map((order) => {
                const elapsed = getElapsed(order.created_at);
                const urgent = (() => {
                  try {
                    const diff = (Date.now() - new Date(order.created_at.replace(" ", "T")).getTime()) / 60000;
                    return diff > 15;
                  } catch { return false; }
                })();
                return (
                  <div key={order.id} className="order-card" style={urgent ? { borderColor: "#FCA5A5", boxShadow: "0 4px 12px rgba(220,38,38,0.12)" } : {}}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <div className="fw-bold">#{order.id}</div>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>{order.order_type}</div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-danger">S/ {order.total_amount}</div>
                        <div className="text-muted" style={{ fontSize: "0.7rem" }}>{elapsed}</div>
                      </div>
                    </div>
                    <div className="mb-2" style={{ fontSize: "0.85rem" }}>
                      <div className="fw-semibold">{order.customer_name}</div>
                      <a href={`tel:${order.customer_phone}`} className="text-muted small text-decoration-none">
                        <i className="bi bi-telephone me-1"></i>{order.customer_phone}
                      </a>
                    </div>
                    <ul className="list-unstyled mb-2" style={{ fontSize: "0.8rem" }}>
                      {order.items.map((it, idx) => (
                        <li key={idx} className="text-muted">
                          {it.quantity}x {it.product_name}
                          {it.options && <span className="d-block" style={{ fontSize: "0.7rem" }}>{it.options}</span>}
                        </li>
                      ))}
                    </ul>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="danger"
                        className="flex-grow-1"
                        onClick={() => advanceOrderState(order.id)}
                      >
                        Avanzar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => cancelOrder(order.id)}
                      >
                        <i className="bi bi-x"></i>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
}