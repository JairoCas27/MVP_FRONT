import { useState, useEffect } from "react";
import { Container, Card, Row, Col, Alert, Spinner } from "react-bootstrap";
import { API_HOST } from "../../services/api";

function Metrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch(`${API_HOST}/api/admin/metrics`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error al cargar métricas");
        setMetrics(data.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!metrics) return null;

  const maxRevenue = Math.max(...metrics.daily.map((d) => d.revenue), 1);

  return (
    <Container fluid>
      <h2 className="fw-bold mb-3">Métricas y Ventas</h2>
      <Row className="g-3 mb-4">
        <Col md={3}><Card className="p-3 border-0 shadow-sm"><small className="text-muted">Pedidos totales</small><h3>{metrics.total_orders}</h3></Card></Col>
        <Col md={3}><Card className="p-3 border-0 shadow-sm"><small className="text-muted">Activos</small><h3>{metrics.active_orders}</h3></Card></Col>
        <Col md={3}><Card className="p-3 border-0 shadow-sm"><small className="text-muted">Completados</small><h3>{metrics.completed_orders}</h3></Card></Col>
        <Col md={3}><Card className="p-3 border-0 shadow-sm"><small className="text-muted">Ingresos</small><h3>S/ {metrics.total_revenue.toFixed(2)}</h3></Card></Col>
      </Row>

      <Card className="p-3 border-0 shadow-sm mb-4">
        <h5 className="fw-bold mb-3">Ingresos últimos 7 días</h5>
        <div className="d-flex align-items-end gap-2" style={{ height: 160 }}>
          {metrics.daily.map((d) => (
            <div key={d.date} className="flex-grow-1 text-center">
              <div style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: 4, backgroundColor: "#D63447", borderRadius: 4 }}></div>
              <small className="text-muted d-block mt-1">{d.date.slice(5)}</small>
              <small>S/ {d.revenue.toFixed(0)}</small>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-3 border-0 shadow-sm">
        <h5 className="fw-bold mb-3">Productos más vendidos</h5>
        <ul className="list-unstyled mb-0">
          {metrics.top_products.map((p, i) => (
            <li key={i} className="d-flex justify-content-between border-bottom py-2">
              <span>{p.name}</span>
              <strong>{p.quantity} uds</strong>
            </li>
          ))}
        </ul>
      </Card>
    </Container>
  );
}

export default Metrics;