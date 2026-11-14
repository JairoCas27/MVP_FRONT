import React, { useEffect, useState } from "react";
import { Container, Card, Table, Spinner, Alert, Badge, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_HOST } from "../services/api";

const styles = `
  .hist-card {
    background: #fff; border-radius: 18px; padding: 22px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.04);
  }
  .hist-kpi {
    background: #fff; border-radius: 16px; padding: 18px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.04);
    height: 100%;
  }
  .hist-row:hover { background: #f9fafb; }
`;

export default function RepartidorHistorial() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const token = localStorage.getItem("driverToken");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_HOST}/api/driver/history`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error");
        setHistory(data.data);
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

  const filtered = history.filter((h) => {
    const q = search.toLowerCase();
    const matchSearch = (h.id || "").toLowerCase().includes(q) || (h.customer_name || "").toLowerCase().includes(q) || (h.delivery_address || "").toLowerCase().includes(q);
    const matchDate = !dateFilter || (h.delivered_at || "").startsWith(dateFilter);
    return matchSearch && matchDate;
  });

  const totalReceived = filtered.reduce((s, h) => s + (h.total_amount || 0), 0);
  const avgTicket = filtered.length ? totalReceived / filtered.length : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", padding: "24px" }}>
      <style>{styles}</style>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 className="fw-bold mb-1">Historial de Entregas</h2>
            <p className="text-muted mb-0">Pedidos completados y dinero recibido</p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <input
              className="form-control"
              placeholder="Buscar por ID, cliente o dirección..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 280, borderRadius: 999 }}
            />
            <input
              type="date"
              className="form-control"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ maxWidth: 180, borderRadius: 999 }}
            />
          </div>
        </div>

        <Row className="g-3 mb-4">
          <Col xs={6} md={6}>
            <div className="hist-kpi">
              <div className="text-muted small">Entregas completadas</div>
              <h3 className="fw-bold mb-0">{filtered.length}</h3>
            </div>
          </Col>
          <Col xs={6} md={6}>
            <div className="hist-kpi">
              <div className="text-muted small">Ticket promedio</div>
              <h3 className="fw-bold mb-0">S/ {avgTicket.toFixed(2)}</h3>
            </div>
          </Col>
        </Row>
        <Row className="g-3 mb-4">
          <Col xs={12} md={6} className="mx-auto">
            <div className="hist-kpi">
              <div className="text-muted small">Total recibido</div>
              <h3 className="fw-bold mb-0 text-success">S/ {totalReceived.toFixed(2)}</h3>
            </div>
          </Col>
        </Row>

        <div className="hist-card">
          {filtered.length === 0 ? (
            <div className="text-center py-5 text-muted">No hay entregas completadas.</div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Dirección</th>
                  <th>Pago</th>
                  <th>Total</th>
                  <th>Entregado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((h) => (
                  <tr key={h.id} className="hist-row">
                    <td className="fw-bold">{h.id}</td>
                    <td>{h.customer_name}</td>
                    <td title={h.delivery_address || ""} style={{ maxWidth: 160, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {h.delivery_address || "—"}
                    </td>
                    <td><Badge bg="light" text="dark">{h.payment_type}</Badge></td>
                    <td className="fw-bold text-danger">S/ {h.total_amount.toFixed(2)}</td>
                    <td className="text-muted small">{h.delivered_at}</td>
                    <td>
                      <Button size="sm" variant="outline-secondary" onClick={() => navigate(`/repartidor/pedido/${h.id}`)}>
                        <i className="bi bi-eye me-1"></i>Ver detalles
                      </Button>
                    </td>
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