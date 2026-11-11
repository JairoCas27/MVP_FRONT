import React, { useEffect, useState } from "react";
import { Container, Card, Button, Spinner, Alert, Badge, Row, Col, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_HOST } from "../services/api";

const styles = `
  .drv-header {
    background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
    color: #fff; padding: 28px 32px; border-radius: 22px; margin-bottom: 24px;
    box-shadow: 0 16px 40px rgba(0,0,0,0.12);
  }
  .drv-kpi {
    background: #fff; border-radius: 18px; padding: 20px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.04);
    height: 100%; position: relative; overflow: hidden;
  }
  .drv-kpi::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--accent); }
  .drv-icon {
    width: 46px; height: 46px; border-radius: 14px;
    display: inline-flex; align-items: center; justify-content: center; font-size: 1.3rem;
  }
  .drv-card {
    background: #fff; border-radius: 18px; padding: 22px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.04);
    height: 100%;
  }
  .chart-bar { height: 10px; border-radius: 999px; background: #f1f5f9; overflow: hidden; }
  .chart-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #D63447, #ff7a18); }
`;

export default function Repartidor() {
  const navigate = useNavigate();
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("driverToken");

  const driverUser = (() => { try { return JSON.parse(localStorage.getItem("driverUser") || "null"); } catch { return null; } })();

  useEffect(() => {
    if (!token) { navigate("/cuenta"); return; }
    const load = async () => {
      try {
        const [a, h] = await Promise.all([
          fetch(`${API_HOST}/api/driver/active`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
          fetch(`${API_HOST}/api/driver/history`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        ]);
        if (a.status === "success") setActive(a.data || []);
        if (h.status === "success") setHistory(h.data || []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const deliveredToday = history.filter((h) => (h.delivered_at || "").startsWith(today));
  const incomeToday = deliveredToday.reduce((s, h) => s + (h.total_amount || 0), 0);
  const totalIncome = history.reduce((s, h) => s + (h.total_amount || 0), 0);

  // daily income last 7 days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayRevenue = history.filter((h) => (h.delivered_at || "").startsWith(key)).reduce((s, h) => s + (h.total_amount || 0), 0);
    const dayCount = history.filter((h) => (h.delivered_at || "").startsWith(key)).length;
    days.push({ date: key, revenue: dayRevenue, count: dayCount });
  }
  const maxRev = Math.max(...days.map((d) => d.revenue), 1);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  const kpis = [
    { label: "Entregas activas", value: active.length, icon: "bi-truck", color: "#2563EB", bg: "#DBEAFE", accent: "#2563EB" },
    { label: "Entregadas hoy", value: deliveredToday.length, icon: "bi-check-circle", color: "#16A34A", bg: "#DCFCE7", accent: "#16A34A" },
    { label: "Ingresos hoy", value: `S/ ${incomeToday.toFixed(2)}`, icon: "bi-cash-stack", color: "#D63447", bg: "#FEE2E2", accent: "#D63447" },
    { label: "Ingresos totales", value: `S/ ${totalIncome.toFixed(2)}`, icon: "bi-wallet2", color: "#7C3AED", bg: "#EDE9FE", accent: "#7C3AED" },
    { label: "Total entregadas", value: history.length, icon: "bi-box-seam", color: "#EA580C", bg: "#FFEDD5", accent: "#EA580C" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", padding: "24px" }}>
      <style>{styles}</style>
      <Container fluid>
        <div className="drv-header">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="fw-bold mb-1">Dashboard Repartidor</h2>
              <p className="mb-0 opacity-75">Hola, {driverUser?.name || "Repartidor"} · Resumen de tus entregas</p>
            </div>
            <div className="text-end">
              <div className="fw-bold fs-5">{new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}</div>
              <div className="opacity-75 small">Actualizado en tiempo real</div>
            </div>
          </div>
        </div>

        <Row className="g-3 mb-4">
          {kpis.map((k, i) => (
            <Col key={i} xs={6} md={4} lg style={{ flex: "1 1 160px" }}>
              <div className="drv-kpi" style={{ "--accent": k.accent }}>
                <div className="drv-icon mb-2" style={{ background: k.bg, color: k.color }}>
                  <i className={`bi ${k.icon}`}></i>
                </div>
                <div className="text-muted small">{k.label}</div>
                <div className="fw-bold fs-4">{k.value}</div>
              </div>
            </Col>
          ))}
        </Row>

        <Row className="g-3 mb-4">
          <Col md={8}>
            <div className="drv-card">
              <h5 className="fw-bold mb-3">Ingresos últimos 7 días</h5>
              <div className="d-flex align-items-end gap-2" style={{ height: 180 }}>
                {days.map((d) => (
                  <div key={d.date} className="flex-grow-1 text-center">
                    <div style={{ height: 140, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                      <div style={{ width: 28, height: `${(d.revenue / maxRev) * 100}%`, minHeight: 4, background: "linear-gradient(180deg, #D63447, #ff7a18)", borderRadius: 6 }}></div>
                    </div>
                    <small className="text-muted d-block mt-2" style={{ fontSize: "0.7rem" }}>{d.date.slice(5)}</small>
                    <small style={{ fontSize: "0.7rem" }}>S/ {d.revenue.toFixed(0)}</small>
                  </div>
                ))}
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="drv-card">
              <h5 className="fw-bold mb-3">Entregas por día</h5>
              {days.map((d) => {
                const maxC = Math.max(...days.map((x) => x.count), 1);
                return (
                  <div key={d.date} className="mb-2">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-semibold">{d.date.slice(5)}</span>
                      <span className="text-muted">{d.count}</span>
                    </div>
                    <div className="chart-bar">
                      <div className="chart-fill" style={{ width: `${(d.count / maxC) * 100}%`, background: "linear-gradient(90deg, #2563EB, #60a5fa)" }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Col>
        </Row>

        <div className="drv-card">
          <h5 className="fw-bold mb-3">Entregas recientes</h5>
          {history.length === 0 ? (
            <div className="text-muted">Aún no has completado entregas.</div>
          ) : (
            <Table hover responsive className="mb-0" size="sm">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Dirección</th>
                  <th>Pago</th>
                  <th>Total</th>
                  <th>Entregado</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 8).map((h) => (
                  <tr key={h.id}>
                    <td className="fw-bold">{h.id}</td>
                    <td>{h.customer_name}</td>
                    <td style={{ maxWidth: 220 }}>{h.delivery_address}</td>
                    <td><Badge bg="light" text="dark">{h.payment_type}</Badge></td>
                    <td className="fw-bold text-danger">S/ {h.total_amount.toFixed(2)}</td>
                    <td className="text-muted small">{h.delivered_at}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </Container>
    </div>
  );
}