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
    background: #fff; border-radius: 20px; padding: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.07); border: 1px solid rgba(0,0,0,0.05);
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .prod-row {
    display: flex; align-items: center; gap: 14px; padding: 12px;
    border-radius: 14px; background: #f8fafc; margin-bottom: 10px;
    transition: transform 0.2s ease;
  }
  .prod-row:hover { transform: translateX(4px); }
  .prod-img { width: 64px; height: 64px; border-radius: 12px; object-fit: cover; }
`;

export default function RepartidorPedido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("driverToken");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState(null);
  const [dest, setDest] = useState(null);

  useEffect(() => {
    if (!token) { navigate("/cuenta"); return; }
    const load = async () => {
      try {
        const res = await fetch(`${API_HOST}/api/driver/deliveries/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error");
        setOrder(data.data);
        setError(null);
        if (data.data.delivery_address) {
          fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.data.delivery_address)}`)
            .then((r) => r.json())
            .then((d) => { if (d && d.length) setDest({ lat: parseFloat(d[0].lat), lon: parseFloat(d[0].lon) }); })
            .catch(() => {});
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const accept = async () => {
    await fetch(`${API_HOST}/api/driver/deliveries/${id}/accept`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    setOrder((o) => (o ? { ...o, status: "EN_CAMINO" } : o));
  };

  const markDelivered = async () => {
    await fetch(`${API_HOST}/api/driver/deliveries/${id}/delivered`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    navigate("/repartidor/activos");
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>;
  if (error || !order) return <Container className="py-5"><Alert variant="danger">{error || "Pedido no encontrado"}</Alert></Container>;

  const osmSrc = dest
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${dest.lon - 0.01},${dest.lat - 0.01},${dest.lon + 0.01},${dest.lat + 0.01}&layer=mapnik&marker=${dest.lat},${dest.lon}`
    : null;

  const infoItems = [
    { label: "Cliente", value: order.customer_name, span: false },
    { label: "Tipo", value: order.order_type, span: false },
    { label: "Pago", value: order.payment_type, span: false },
    { label: "Creado", value: order.created_at, span: false },
    { label: "Teléfono", value: order.customer_phone, span: false },
    { label: "Total", value: `S/ ${order.total_amount.toFixed(2)}`, span: true },
  ];

  return (
    <div className="det-wrap">
      <style>{styles}</style>
      <Container style={{ maxWidth: "1100px" }}>
        <Button variant="link" className="text-decoration-none text-muted mb-3 p-0" onClick={() => navigate("/repartidor/activos")}>
          <i className="bi bi-arrow-left me-2"></i>Volver
        </Button>

        <div className="det-header">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h2 className="fw-bold mb-1">Pedido #{order.id}</h2>
              <p className="mb-0 opacity-75">Detalle completo de la entrega</p>
            </div>
            <Badge bg={order.status === "EN_CAMINO" ? "success" : "warning"} text={order.status === "EN_CAMINO" ? "light" : "dark"} className="fs-6 px-3 py-2">
              {order.status === "EN_CAMINO" ? "En camino" : order.status}
            </Badge>
          </div>
        </div>

        <Row className="g-3 mb-4">
          {infoItems.map((info, idx) => (
            <Col key={idx} xs={info.span ? 12 : 6} md={info.span ? 12 : 3} style={{ flex: "1 1 0", minWidth: 0 }}>
              <div className="det-card text-center" style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 70 }}>
                <div className="text-muted small mb-1">{info.label}</div>
                <div className="fw-bold" style={{ fontSize: "0.95rem", wordBreak: "break-word" }}>{info.value}</div>
              </div>
            </Col>
          ))}
        </Row>

        <Row className="g-4">
          <Col md={12}>
            <div className="det-card">
              <h5 className="fw-bold mb-3"><i className="bi bi-box-seam me-2 text-danger"></i>Productos a entregar</h5>
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
              <div className="mt-3 pt-3 border-top">
                <div className="text-muted small mb-2">Progreso de entrega</div>
                <div className="progress" style={{ height: 8, borderRadius: 999 }}>
                  <div className="progress-bar" role="progressbar" style={{ width: order.status === "PENDIENTE" ? "25%" : order.status === "PREPARANDO" ? "50%" : (order.status === "EN_CAMINO" || order.status === "LISTO_PARA_RECOJO") ? "75%" : "100%", background: "linear-gradient(90deg, #D63447, #ff7a18)" }}></div>
                </div>
                <div className="d-flex justify-content-between mt-2" style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
                  <span>Pendiente</span>
                  <span>Preparando</span>
                  <span>En camino</span>
                  <span>Entregado</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Row className="g-4 mt-1">
          <Col md={12}>
            <div className="det-card">
              <h5 className="fw-bold mb-3"><i className="bi bi-map me-2 text-danger"></i>Seguimiento en tiempo real</h5>
              {coords && (
                <div className="text-muted small mb-2">
                  <i className="bi bi-geo-alt me-1"></i>Tu ubicación: {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}
                </div>
              )}
              {dest && (
                <div className="text-muted small mb-2">
                  <i className="bi bi-flag me-1"></i>Destino: {dest.lat.toFixed(5)}, {dest.lon.toFixed(5)}
                </div>
              )}
              {dest ? (
                <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #e5e7eb" }}>
                  <iframe
                    title="mapa-seguimiento"
                    width="100%"
                    height="320"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${dest.lon - 0.01},${dest.lat - 0.01},${dest.lon + 0.01},${dest.lat + 0.01}&layer=mapnik&marker=${dest.lat},${dest.lon}`}
                  ></iframe>
                </div>
              ) : (
                <div className="text-center py-5 text-muted">Cargando mapa...</div>
              )}
            </div>
          </Col>
        </Row>

        <div className="d-flex justify-content-center mt-4">
          {order.status !== "EN_CAMINO" && order.status !== "FINALIZADO" && order.status !== "CANCELADO" && (
            <Button variant="primary" className="rounded-pill px-4" onClick={accept}>
              <i className="bi bi-check-lg me-2"></i>Aceptar pedido
            </Button>
          )}
          {order.status === "EN_CAMINO" && (
            <Button variant="success" className="rounded-pill px-4" onClick={markDelivered}>
              <i className="bi bi-check2-circle me-2"></i>Marcar entregado
            </Button>
          )}
          {order.status === "FINALIZADO" && (
            <div className="text-success fw-bold fs-5"><i className="bi bi-check-circle me-2"></i>Pedido entregado</div>
          )}
        </div>
      </Container>
    </div>
  );
}