import { useState, useEffect } from "react";
import { Container, Card, Row, Col, Alert, Spinner, Table } from "react-bootstrap";
import { API_HOST } from "../../services/api";

const styles = `
  .ing-wrap { background: #f8f9fa; min-height: 100vh; padding: 28px; }
  .ing-header {
    background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
    color: #fff; padding: 30px 32px; border-radius: 22px; margin-bottom: 24px;
    box-shadow: 0 16px 40px rgba(0,0,0,0.12);
  }
  .ing-kpi {
    background: #fff; border-radius: 18px; padding: 20px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.04);
    height: 100%; position: relative; overflow: hidden;
  }
  .ing-kpi::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--accent); }
  .ing-icon {
    width: 46px; height: 46px; border-radius: 14px;
    display: inline-flex; align-items: center; justify-content: center; font-size: 1.3rem;
  }
  .ing-card {
    background: #fff; border-radius: 18px; padding: 22px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.04);
    height: 100%;
  }
  .chart-bar { height: 10px; border-radius: 999px; background: #f1f5f9; overflow: hidden; }
  .chart-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #D63447, #ff7a18); }
`;

export default function Ingresos() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_HOST}/api/admin/metrics`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error al cargar ingresos");
        setMetrics(data.data);
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
    { label: "Cancelados", value: metrics.cancelled_orders, icon: "bi-x-circle", color: "#DC2626", bg: "#FEE2E2", accent: "#DC2626" },
  ];

  return (
    <div className="ing-wrap">
      <style>{styles}</style>
      <Container fluid>
        <div className="ing-header">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="fw-bold mb-1">Ingresos</h2>
              <p className="mb-0 opacity-75">Análisis financiero y de ventas</p>
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
              <div className="ing-kpi" style={{ "--accent": k.accent }}>
                <div className="ing-icon mb-2" style={{ background: k.bg, color: k.color }}>
                  <i className={`bi ${k.icon}`}></i>
                </div>
                <div className="text-muted small">{k.label}</div>
                <div className="fw-bold fs-3">{k.value}</div>
              </div>
            </Col>
          ))}
        </Row>

        <Row className="g-3 mb-4">
          <Col md={8}>
            <div className="ing-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Ingresos y pedidos (últimos 7 días)</h5>
                <div className="d-flex gap-3 small">
                  <span><span style={{ width: 10, height: 10, borderRadius: "50%", background: "#D63447", display: "inline-block", marginRight: 6 }}></span>Ingresos</span>
                  <span><span style={{ width: 10, height: 10, borderRadius: "50%", background: "#2563EB", display: "inline-block", marginRight: 6 }}></span>Pedidos</span>
                </div>
              </div>
              <svg viewBox="0 0 700 220" style={{ width: "100%", height: 220 }}>
                {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                  <line key={i} x1="40" y1={190 - t * 160} x2="680" y2={190 - t * 160} stroke="#e5e7eb" strokeWidth="1" />
                ))}
                <polyline
                  fill="none"
                  stroke="#D63447"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={metrics.daily.map((d, i) => `${40 + (i * (640 / (metrics.daily.length - 1 || 1)))},${190 - (d.revenue / maxRevenue) * 160}`).join(" ")}
                />
                <polyline
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={metrics.daily.map((d, i) => `${40 + (i * (640 / (metrics.daily.length - 1 || 1)))},${190 - (d.orders / maxOrders) * 160}`).join(" ")}
                />
                {metrics.daily.map((d, i) => (
                  <circle key={`r-${i}`} cx={40 + (i * (640 / (metrics.daily.length - 1 || 1)))} cy={190 - (d.revenue / maxRevenue) * 160} r="4" fill="#D63447" />
                ))}
                {metrics.daily.map((d, i) => (
                  <circle key={`o-${i}`} cx={40 + (i * (640 / (metrics.daily.length - 1 || 1)))} cy={190 - (d.orders / maxOrders) * 160} r="4" fill="#2563EB" />
                ))}
                {metrics.daily.map((d, i) => (
                  <text key={`l-${i}`} x={40 + (i * (640 / (metrics.daily.length - 1 || 1)))} y={210} textAnchor="middle" fontSize="10" fill="#6b7280">
                    {d.date.slice(5)}
                  </text>
                ))}
              </svg>
            </div>
          </Col>
          <Col md={4}>
            <div className="ing-card">
              <h5 className="fw-bold mb-3">Productos más vendidos</h5>
              {metrics.top_products.length === 0 && <p className="text-muted small">Sin datos aún.</p>}
              {metrics.top_products.map((p, i) => {
                const maxQ = Math.max(...metrics.top_products.map((x) => x.quantity), 1);
                return (
                  <div key={i} className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-semibold">{p.name}</span>
                      <span className="text-muted">{p.quantity} uds</span>
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

        <Row className="g-3 mb-4">
          <Col md={6}>
            <div className="ing-card">
              <h5 className="fw-bold mb-3">Ingresos por método de pago</h5>
              {(metrics.revenue_by_payment || []).length === 0 && <p className="text-muted small">Sin datos.</p>}
              {(metrics.revenue_by_payment || []).map((r, i) => (
                <div key={i} className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="fw-semibold">{r.payment_type}</span>
                    <span className="text-muted">{r.count} pedidos · S/ {r.revenue.toFixed(2)}</span>
                  </div>
                  <div className="chart-bar">
                    <div className="chart-fill" style={{ width: `${metrics.total_revenue ? (r.revenue / metrics.total_revenue) * 100 : 0}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Col>
          <Col md={6}>
            <div className="ing-card">
              <h5 className="fw-bold mb-3">Ingresos por modalidad</h5>
              {(metrics.revenue_by_order_type || []).length === 0 && <p className="text-muted small">Sin datos.</p>}
              {(metrics.revenue_by_order_type || []).map((r, i) => (
                <div key={i} className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="fw-semibold">{r.order_type}</span>
                    <span className="text-muted">{r.count} pedidos · S/ {r.revenue.toFixed(2)}</span>
                  </div>
                  <div className="chart-bar">
                    <div className="chart-fill" style={{ width: `${metrics.total_revenue ? (r.revenue / metrics.total_revenue) * 100 : 0}%`, background: "linear-gradient(90deg, #2563EB, #60a5fa)" }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Col>
        </Row>

        <Row className="g-3">
          <Col md={12}>
            <div className="ing-card">
              <h5 className="fw-bold mb-3">Resumen por día</h5>
              <Table hover responsive className="mb-0" size="sm">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Pedidos</th>
                    <th>Ingresos</th>
                    <th>Ticket promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.daily.map((d) => (
                    <tr key={d.date}>
                      <td className="fw-semibold">{d.date}</td>
                      <td>{d.orders}</td>
                      <td className="fw-bold text-danger">S/ {d.revenue.toFixed(2)}</td>
                      <td className="text-muted">S/ {d.orders ? (d.revenue / d.orders).toFixed(2) : "0.00"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}