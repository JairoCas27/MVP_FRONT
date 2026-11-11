import React, { useEffect, useState } from "react";
import { Container, Card, Row, Col, Alert, Spinner, Table, Badge } from "react-bootstrap";
import { API_HOST } from "../../services/api";

const styles = `
  .dash-page { background: #f3f4f6; min-height: 100vh; }
  .dash-header {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    color: #fff;
    padding: 28px 32px;
    border-radius: 20px;
    margin-bottom: 24px;
    box-shadow: 0 12px 32px rgba(0,0,0,0.12);
  }
  .kpi-card {
    background: #fff;
    border-radius: 18px;
    padding: 20px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
    border: 1px solid rgba(0,0,0,0.04);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    height: 100%;
    position: relative;
    overflow: hidden;
  }
  .kpi-card:hover { transform: translateY(-4px); box-shadow: 0 14px 32px rgba(0,0,0,0.1); }
  .kpi-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: var(--accent, #D63447);
  }
  .kpi-icon {
    width: 48px; height: 48px; border-radius: 14px;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 1.3rem;
  }
  .chart-card {
    background: #fff;
    border-radius: 18px;
    padding: 22px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
    border: 1px solid rgba(0,0,0,0.04);
    height: 100%;
  }
  .chart-bar {
    height: 12px; border-radius: 999px; background: #f1f5f9; overflow: hidden;
  }
  .chart-fill {
    height: 100%; border-radius: 999px;
    background: linear-gradient(90deg, #D63447, #ff7a18);
    transition: width 0.6s ease;
  }
  .chart-bar-blue { background: #f1f5f9; }
  .chart-fill-blue {
    height: 100%; border-radius: 999px;
    background: linear-gradient(90deg, #2563EB, #60a5fa);
  }
  .status-dot {
    width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 6px;
  }
  .recent-row:hover { background: #f9fafb; }
  @media (max-width: 768px) {
    .dash-header { padding: 20px; }
  }
`;

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [counts, setCounts] = useState({ products: 0, clients: 0, feedbacks: 0, deliveries: 0, activeOrders: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    const load = async () => {
      try {
        const [m, p, c, f, d, a] = await Promise.all([
          fetch(`${API_HOST}/api/admin/metrics`, { headers }).then((r) => r.json()),
          fetch(`${API_HOST}/api/admin/products`, { headers }).then((r) => r.json()),
          fetch(`${API_HOST}/api/admin/clients`, { headers }).then((r) => r.json()),
          fetch(`${API_HOST}/api/admin/feedbacks`, { headers }).then((r) => r.json()),
          fetch(`${API_HOST}/api/admin/deliveries`, { headers }).then((r) => r.json()),
          fetch(`${API_HOST}/api/admin/orders/active`, { headers }).then((r) => r.json()),
        ]);
        if (m.status === "success") setMetrics(m.data);
        setCounts({
          products: p.data?.length || 0,
          clients: c.data?.length || 0,
          feedbacks: f.data?.length || 0,
          deliveries: d.data?.length || 0,
          activeOrders: a.data || [],
        });
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!metrics) return null;

  const maxRevenue = Math.max(...metrics.daily.map((d) => d.revenue), 1);
  const maxOrders = Math.max(...metrics.daily.map((d) => d.orders), 1);

  const kpis = [
    { label: "Ingresos totales", value: `S/ ${metrics.total_revenue.toFixed(2)}`, icon: "bi-cash-stack", color: "#16A34A", bg: "#DCFCE7", accent: "#16A34A" },
    { label: "Pedidos totales", value: metrics.total_orders, icon: "bi-receipt", color: "#2563EB", bg: "#DBEAFE", accent: "#2563EB" },
    { label: "Pedidos activos", value: metrics.active_orders, icon: "bi-hourglass-split", color: "#D97706", bg: "#FEF3C7", accent: "#D97706" },
    { label: "Productos", value: counts.products, icon: "bi-box-seam", color: "#7C3AED", bg: "#EDE9FE", accent: "#7C3AED" },
    { label: "Clientes", value: counts.clients, icon: "bi-people", color: "#0EA5E9", bg: "#E0F2FE", accent: "#0EA5E9" },
    { label: "Entregas activas", value: counts.deliveries, icon: "bi-truck", color: "#EA580C", bg: "#FFEDD5", accent: "#EA580C" },
  ];

  return (
    <div className="dash-page">
      <style>{styles}</style>
      <Container fluid>
        <div className="dash-header">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="fw-bold mb-1">Dashboard</h2>
              <p className="mb-0 opacity-75">Resumen general del negocio · La Fogata</p>
            </div>
            <div className="text-end">
              <div className="fw-bold fs-5">{new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}</div>
              <div className="opacity-75 small">Actualizado en tiempo real</div>
            </div>
          </div>
        </div>

        <Row className="g-3 mb-4">
          {kpis.map((k, i) => (
            <Col key={i} xs={6} md={4} lg={3} xl={2} style={{ flex: "1 1 150px" }}>
              <div className="kpi-card" style={{ "--accent": k.accent }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="kpi-icon" style={{ background: k.bg, color: k.color }}>
                    <i className={`bi ${k.icon}`}></i>
                  </div>
                </div>
                <div className="text-muted small">{k.label}</div>
                <div className="fw-bold fs-4">{k.value}</div>
              </div>
            </Col>
          ))}
        </Row>

        <Row className="g-3 mb-4">
          <Col md={8}>
            <div className="chart-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Ingresos y pedidos (últimos 7 días)</h5>
                <div className="d-flex gap-3 small">
                  <span><span className="status-dot" style={{ background: "#D63447" }}></span>Ingresos</span>
                  <span><span className="status-dot" style={{ background: "#2563EB" }}></span>Pedidos</span>
                </div>
              </div>
              <svg viewBox="0 0 700 200" style={{ width: "100%", height: 200 }}>
                {/* grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                  <line key={i} x1="40" y1={180 - t * 150} x2="680" y2={180 - t * 150} stroke="#e5e7eb" strokeWidth="1" />
                ))}
                {/* revenue line */}
                <polyline
                  fill="none"
                  stroke="#D63447"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={metrics.daily.map((d, i) => `${40 + (i * (640 / (metrics.daily.length - 1 || 1)))},${180 - (d.revenue / maxRevenue) * 150}`).join(" ")}
                />
                {/* orders line */}
                <polyline
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={metrics.daily.map((d, i) => `${40 + (i * (640 / (metrics.daily.length - 1 || 1)))},${180 - (d.orders / maxOrders) * 150}`).join(" ")}
                />
                {/* dots revenue */}
                {metrics.daily.map((d, i) => (
                  <circle key={`r-${i}`} cx={40 + (i * (640 / (metrics.daily.length - 1 || 1)))} cy={180 - (d.revenue / maxRevenue) * 150} r="4" fill="#D63447" />
                ))}
                {/* dots orders */}
                {metrics.daily.map((d, i) => (
                  <circle key={`o-${i}`} cx={40 + (i * (640 / (metrics.daily.length - 1 || 1)))} cy={180 - (d.orders / maxOrders) * 150} r="4" fill="#2563EB" />
                ))}
                {/* x labels */}
                {metrics.daily.map((d, i) => (
                  <text key={`l-${i}`} x={40 + (i * (640 / (metrics.daily.length - 1 || 1)))} y={198} textAnchor="middle" fontSize="10" fill="#6b7280">
                    {d.date.slice(5)}
                  </text>
                ))}
              </svg>
            </div>
          </Col>
          <Col md={4}>
            <div className="chart-card">
              <h5 className="fw-bold mb-3">Productos más vendidos</h5>
              {metrics.top_products.length === 0 && <p className="text-muted small">Sin datos aún.</p>}
              {metrics.top_products.map((p, i) => {
                const maxQ = Math.max(...metrics.top_products.map((x) => x.quantity), 1);
                return (
                  <div key={i} className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-semibold">{p.name}</span>
                      <span className="text-muted">{p.quantity}</span>
                    </div>
                    <div className="chart-bar">
                      <div className="chart-fill" style={{ width: `${(p.quantity / maxQ) * 100}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Col>
        </Row>

        <Row className="g-3">
          <Col md={7}>
            <div className="chart-card">
              <h5 className="fw-bold mb-3">Pedidos activos recientes</h5>
              {counts.activeOrders.length === 0 && <p className="text-muted small">No hay pedidos activos.</p>}
              <Table hover responsive className="mb-0" size="sm">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {counts.activeOrders.slice(0, 8).map((o) => (
                    <tr key={o.id} className="recent-row">
                      <td className="fw-bold">{o.id}</td>
                      <td>{o.customer_name}</td>
                      <td><Badge bg="light" text="dark">{o.order_type}</Badge></td>
                      <td>
                        <Badge bg={o.status === "FINALIZADO" ? "success" : "warning"} text={o.status === "FINALIZADO" ? "light" : "dark"}>
                          {o.status}
                        </Badge>
                      </td>
                      <td className="fw-bold">S/ {o.total_amount}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Col>
          <Col md={5}>
            <div className="chart-card">
              <h5 className="fw-bold mb-3">Estado de pedidos</h5>
              {[
                { label: "Completados", value: metrics.completed_orders, color: "#16A34A" },
                { label: "Activos", value: metrics.active_orders, color: "#D97706" },
                { label: "Cancelados", value: metrics.cancelled_orders, color: "#DC2626" },
              ].map((s, i) => {
                const total = metrics.total_orders || 1;
                return (
                  <div key={i} className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-semibold">{s.label}</span>
                      <span className="text-muted">{s.value}</span>
                    </div>
                    <div className="chart-bar">
                      <div className="chart-fill" style={{ width: `${(s.value / total) * 100}%`, background: s.color }}></div>
                    </div>
                  </div>
                );
              })}
              <div className="mt-3 pt-3 border-top small text-muted">
                Total de pedidos: <strong className="text-dark">{metrics.total_orders}</strong>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}