import { useState, useEffect } from "react";
import { Container, Card, Table, Button, Alert, Spinner, Badge, Row, Col, Form, Modal } from "react-bootstrap";
import { API_HOST } from "../../services/api";

const styles = `
  .deliv-card {
    border: none;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
    overflow: hidden;
  }
  .status-pill {
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
  }
`;

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [coords, setCoords] = useState(null);
  const token = localStorage.getItem("token");

  const fetchDrivers = async () => {
    try {
      const res = await fetch(`${API_HOST}/api/admin/drivers`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.status === "success") setDrivers(data.data || []);
    } catch (e) {}
  };

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_HOST}/api/admin/deliveries/all`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al cargar entregas");
      setDeliveries(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeliveries(); fetchDrivers(); }, []);

  const assignDriver = async (id, driverId) => {
    await fetch(`${API_HOST}/api/admin/deliveries/${id}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ driver_id: driverId ? Number(driverId) : null }),
    });
    fetchDeliveries();
  };

  const markDelivered = async (id) => {
    await fetch(`${API_HOST}/api/admin/deliveries/${id}/delivered`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchDeliveries();
  };

  const openDetail = (d) => {
    setSelected(d);
    setShowDetail(true);
    setCoords(null);
    if (d.delivery_address) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(d.delivery_address)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data && data.length) setCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
        })
        .catch(() => {});
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  const pending = deliveries.filter((d) => d.status !== "FINALIZADO" && d.status !== "CANCELADO");
  const completed = deliveries.filter((d) => d.status === "FINALIZADO" || d.status === "CANCELADO");

  return (
    <Container fluid>
      <style>{styles}</style>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Entregas (Delivery)</h2>
          <p className="text-muted mb-0">Gestión de pedidos a domicilio</p>
        </div>
        <Button variant="outline-secondary" size="sm" onClick={fetchDeliveries}>
          <i className="bi bi-arrow-clockwise me-1"></i>Actualizar
        </Button>
      </div>

      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="p-3 border-0 shadow-sm">
            <div className="text-muted small">Pendientes / En camino</div>
            <h3 className="fw-bold mb-0">{pending.length}</h3>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-3 border-0 shadow-sm">
            <div className="text-muted small">Entregados</div>
            <h3 className="fw-bold mb-0 text-success">{completed.filter((d) => d.status === "FINALIZADO").length}</h3>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-3 border-0 shadow-sm">
            <div className="text-muted small">Total deliveries</div>
            <h3 className="fw-bold mb-0">{deliveries.length}</h3>
          </Card>
        </Col>
      </Row>

      <Card className="deliv-card mb-4">
        <Card.Header className="bg-white fw-bold">Pendientes / En camino</Card.Header>
        <Card.Body className="p-0">
          {pending.length === 0 ? (
            <div className="text-center py-4 text-muted">No hay entregas pendientes.</div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th><th>Cliente</th><th>Teléfono</th><th>Dirección</th><th>Estado</th><th>Repartidor</th><th>Total</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((d) => (
                  <tr key={d.id}>
                    <td className="fw-bold">{d.id}</td>
                    <td>{d.customer_name}</td>
                    <td>{d.customer_phone}</td>
                    <td style={{ maxWidth: 220 }}>{d.delivery_address}</td>
                    <td>
                      <span className="status-pill" style={{ background: d.status === "EN_CAMINO" ? "#DCFCE7" : "#FEF3C7", color: d.status === "EN_CAMINO" ? "#15803D" : "#D97706" }}>
                        {d.status}
                      </span>
                    </td>
                    <td>
                      <Form.Select size="sm" value={d.driver_id || ""} onChange={(e) => assignDriver(d.id, e.target.value)}>
                        <option value="">Sin asignar</option>
                        {drivers.map((dr) => (
                          <option key={dr.id} value={dr.id}>{dr.name}</option>
                        ))}
                      </Form.Select>
                    </td>
                    <td className="fw-bold">S/ {d.total_amount.toFixed(2)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button size="sm" variant="outline-secondary" onClick={() => openDetail(d)}>
                          <i className="bi bi-eye"></i>
                        </Button>
                        <Button size="sm" variant="success" onClick={() => markDelivered(d.id)}>Entregado</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Card className="deliv-card">
        <Card.Header className="bg-white fw-bold">Entregados / Cancelados</Card.Header>
        <Card.Body className="p-0">
          {completed.length === 0 ? (
            <div className="text-center py-4 text-muted">No hay entregas completadas.</div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th><th>Cliente</th><th>Dirección</th><th>Estado</th><th>Repartidor</th><th>Total</th><th>Entregado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {completed.map((d) => (
                  <tr key={d.id}>
                    <td className="fw-bold">{d.id}</td>
                    <td>{d.customer_name}</td>
                    <td style={{ maxWidth: 220 }}>{d.delivery_address}</td>
                    <td>
                      <span className="status-pill" style={{ background: d.status === "FINALIZADO" ? "#DCFCE7" : "#FEE2E2", color: d.status === "FINALIZADO" ? "#15803D" : "#DC2626" }}>
                        {d.status}
                      </span>
                    </td>
                    <td>{d.driver_name || "—"}</td>
                    <td className="fw-bold">S/ {d.total_amount.toFixed(2)}</td>
                    <td className="text-muted small">{d.delivered_at || d.created_at}</td>
                    <td>
                      <Button size="sm" variant="outline-secondary" onClick={() => openDetail(d)}>
                        <i className="bi bi-eye"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showDetail} onHide={() => setShowDetail(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalle de entrega</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <Row className="g-3">
              <Col md={6}>
                <div className="mb-2"><strong>Cliente:</strong> {selected.customer_name}</div>
                <div className="mb-2"><strong>Teléfono:</strong> {selected.customer_phone}</div>
                <div className="mb-2"><strong>Dirección:</strong> {selected.delivery_address}</div>
                <div className="mb-2"><strong>Estado:</strong> {selected.status}</div>
                <div className="mb-2"><strong>Método de pago:</strong> {selected.payment_type}</div>
                <div className="mb-2"><strong>Repartidor:</strong> {selected.driver_name || "—"}</div>
                <div className="mb-2"><strong>Total:</strong> S/ {selected.total_amount.toFixed(2)}</div>
                <div className="mb-2"><strong>Creado:</strong> {selected.created_at}</div>
                {selected.delivered_at && <div className="mb-2"><strong>Entregado:</strong> {selected.delivered_at}</div>}
              </Col>
              <Col md={6}>
                {coords ? (
                  <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #e5e7eb" }}>
                    <iframe
                      title="mapa-entrega-detalle"
                      width="100%"
                      height="260"
                      style={{ border: 0 }}
                      loading="lazy"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.01},${coords.lat - 0.01},${coords.lon + 0.01},${coords.lat + 0.01}&layer=mapnik&marker=${coords.lat},${coords.lon}`}
                    ></iframe>
                  </div>
                ) : (
                  <div className="text-center py-5 text-muted">Cargando mapa...</div>
                )}
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selected && selected.status !== "FINALIZADO" && (
            <Button variant="success" onClick={() => { markDelivered(selected.id); setShowDetail(false); }}>
              Marcar entregado
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowDetail(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}