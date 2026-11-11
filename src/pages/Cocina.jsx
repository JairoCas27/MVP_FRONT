import React, { useEffect, useState } from "react";
import { Container, Card, Button, Spinner, Alert, Badge, Row, Col, Table } from "react-bootstrap";
import { API_HOST } from "../services/api";

const styles = `
  .coc-header {
    background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
    color: #fff; padding: 28px 32px; border-radius: 22px; margin-bottom: 24px;
    box-shadow: 0 16px 40px rgba(0,0,0,0.12);
  }
  .coc-kpi {
    background: #fff; border-radius: 18px; padding: 20px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.04);
    height: 100%; position: relative; overflow: hidden;
  }
  .coc-kpi::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--accent); }
  .coc-icon {
    width: 46px; height: 46px; border-radius: 14px;
    display: inline-flex; align-items: center; justify-content: center; font-size: 1.3rem;
  }
  .coc-card {
    background: #fff; border-radius: 18px; padding: 22px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.04);
    height: 100%;
  }
`;

export default function Cocina() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("kitchenToken");
  const kitchenUser = (() => { try { return JSON.parse(localStorage.getItem("kitchenUser") || "null"); } catch { return null; } })();

  useEffect(() => {
    if (!token) { window.location.href = "/cuenta"; return; }
    const load = async () => {
      try {
        const res = await fetch(`${API_HOST}/api/kitchen/orders`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error");
        setOrders(data.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pending = orders.filter((o) => o.status === "PENDIENTE").length;
  const preparing = orders.filter((o) => o.status === "PREPARANDO").length;
  const ready = orders.filter((o) => o.status === "LISTO_PARA_RECOJO").length;

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  const kpis = [
    { label: "Pendientes", value: pending, icon: "bi-hourglass-split", color: "#D97706", bg: "#FEF3C7", accent: "#D97706" },
    { label: "En preparación", value: preparing, icon: "bi-fire", color: "#0284C7", bg: "#E0F2FE", accent: "#0284C7" },
    { label: "Listos", value: ready, icon: "bi-check-circle", color: "#16A34A", bg: "#DCFCE7", accent: "#16A34A" },
    { label: "Total activos", value: orders.length, icon: "bi-receipt", color: "#7C3AED", bg: "#EDE9FE", accent: "#7C3AED" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", padding: "24px" }}>
      <style>{styles}</style>
      <Container fluid>
        <div className="coc-header">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="fw-bold mb-1">Dashboard Cocina</h2>
              <p className="mb-0 opacity-75">Hola, {kitchenUser?.name || "Cocina"} · Control de pedidos</p>
            </div>
            <div className="text-end">
              <div className="fw-bold fs-5">{new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}</div>
              <div className="opacity-75 small">Actualizado en tiempo real</div>
            </div>
          </div>
        </div>

        <Row className="g-3 mb-4">
          {kpis.map((k, i) => (
            <Col key={i} xs={6} md={3}>
              <div className="coc-kpi" style={{ "--accent": k.accent }}>
                <div className="coc-icon mb-2" style={{ background: k.bg, color: k.color }}>
                  <i className={`bi ${k.icon}`}></i>
                </div>
                <div className="text-muted small">{k.label}</div>
                <div className="fw-bold fs-3">{k.value}</div>
              </div>
            </Col>
          ))}
        </Row>

        <Row className="g-3">
          <Col md={7}>
            <div className="coc-card">
              <h5 className="fw-bold mb-3">Pedidos activos recientes</h5>
              {orders.length === 0 ? (
                <div className="text-muted">No hay pedidos activos.</div>
              ) : (
                <Table hover responsive className="mb-0" size="sm">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Cliente</th>
                      <th>Tipo</th>
                      <th>Estado</th>
                      <th>Productos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 8).map((o) => (
                      <tr key={o.id}>
                        <td className="fw-bold">{o.id}</td>
                        <td>{o.customer_name}</td>
                        <td><Badge bg="light" text="dark">{o.order_type}</Badge></td>
                        <td>
                          <Badge bg={o.status === "PENDIENTE" ? "warning" : o.status === "PREPARANDO" ? "info" : "success"} text={o.status === "PREPARANDO" ? "light" : "dark"}>
                            {o.status}
                          </Badge>
                        </td>
                        <td className="text-muted small">{o.items.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </Col>
          <Col md={5}>
            <div className="coc-card">
              <h5 className="fw-bold mb-3">Distribución de estados</h5>
              {[
                { label: "Pendientes", value: pending, color: "#D97706" },
                { label: "En preparación", value: preparing, color: "#0284C7" },
                { label: "Listos", value: ready, color: "#16A34A" },
              ].map((s, i) => {
                const total = orders.length || 1;
                return (
                  <div key={i} className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-semibold">{s.label}</span>
                      <span className="text-muted">{s.value}</span>
                    </div>
                    <div style={{ height: 10, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 999, width: `${(s.value / total) * 100}%`, background: s.color }}></div>
                    </div>
                  </div>
                );
              })}
              <div className="mt-3 pt-3 border-top small text-muted">
                Total activos: <strong className="text-dark">{orders.length}</strong>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}