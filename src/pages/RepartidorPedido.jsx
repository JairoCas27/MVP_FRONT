import React, { useEffect, useState, useRef } from "react";
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
    height: 100%; display: flex; flex-direction: column; justify-content: center;
  }
  .prod-row {
    display: flex; align-items: center; gap: 14px; padding: 12px;
    border-radius: 14px; background: #f8fafc; margin-bottom: 10px;
  }
  .prod-img { width: 64px; height: 64px; border-radius: 12px; object-fit: cover; }
  .address-badge { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 12px 16px; margin-bottom: 14px; color: #991b1b; font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 10px; }
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
  const [routeCoords, setRouteCoords] = useState([]);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

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
  }, [id, token, navigate]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const fetchRoute = async () => {
      const startLat = coords ? coords.lat : (dest ? dest.lat - 0.01 : -12.0464);
      const startLon = coords ? coords.lon : (dest ? dest.lon - 0.01 : -77.0428);
      const targetDest = dest ? dest : { lat: startLat + 0.01, lon: startLon + 0.01 };

      try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${targetDest.lon},${targetDest.lat}?overview=full&geometries=geojson`);
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const latLngs = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setRouteCoords(latLngs);
        }
      } catch {
        setRouteCoords([
          [startLat, startLon],
          [targetDest.lat, targetDest.lon]
        ]);
      }
    };

    fetchRoute();
  }, [coords, dest]);

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if (!window.L && !document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    } else if (window.L) {
      initMap();
    }
  }, [coords, dest, routeCoords]);

  const initMap = () => {
    if (!mapRef.current || !window.L) return;
    const defaultLat = coords ? coords.lat : (dest ? dest.lat : -12.0464);
    const defaultLon = coords ? coords.lon : (dest ? dest.lon : -77.0428);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = window.L.map(mapRef.current).setView([defaultLat, defaultLon], 14);
    mapInstanceRef.current = map;

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    const driverPos = coords ? [coords.lat, coords.lon] : [defaultLat - 0.01, defaultLon - 0.01];
    window.L.marker(driverPos).addTo(map).bindPopup("Mi Ubicación (Repartidor)").openPopup();

    if (dest) {
      window.L.marker([dest.lat, dest.lon]).addTo(map).bindPopup(`Destino: ${order?.delivery_address || ""}`);
    }

    if (routeCoords && routeCoords.length > 0) {
      window.L.polyline(routeCoords, { color: "#D63447", weight: 6, opacity: 0.85 }).addTo(map);
      map.fitBounds(routeCoords);
    }
  };

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

  const infoItems = [
    { label: "Cliente", value: order.customer_name, span: false },
    { label: "Telefono", value: order.customer_phone, span: false },
    { label: "Tipo", value: order.order_type, span: false },
    { label: "Pago", value: order.payment_type, span: false },
    { label: "Creado", value: order.created_at, span: false },
    { label: "Total", value: `S/ ${order.total_amount.toFixed(2)}`, span: false },
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
              <p className="mb-0 opacity-75">Navegación y ruta real por calles en tiempo real</p>
            </div>
            <Badge bg={order.status === "EN_CAMINO" ? "success" : "warning"} text={order.status === "EN_CAMINO" ? "light" : "dark"} className="fs-6 px-3 py-2">
              {order.status === "EN_CAMINO" ? "En camino" : order.status}
            </Badge>
          </div>
        </div>

        <Row className="g-3 mb-4">
          {infoItems.map((info, idx) => (
            <Col key={idx} xs={info.span ? 12 : 6} md={info.span ? 12 : 3}>
              <div className="det-card text-center" style={{ minHeight: 70 }}>
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
            </div>
          </Col>
        </Row>

        <Row className="g-4 mt-1">
          <Col md={12}>
            <div className="det-card">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h5 className="fw-bold mb-0"><i className="bi bi-map me-2 text-danger"></i>Mapa de Navegación y Trazado de Ruta</h5>
              </div>

              <div className="address-badge">
                <i className="bi bi-geo-alt-fill fs-5 text-danger"></i>
                <div>
                  <div className="small text-uppercase text-muted" style={{ fontSize: "0.7rem" }}>Dirección de Destino:</div>
                  <div>{order.delivery_address}</div>
                </div>
              </div>

              {coords && (
                <div className="text-muted small mb-2">
                  <i className="bi bi-crosshair text-success me-1"></i>Tu ubicación GPS actual detectada
                </div>
              )}

              <div ref={mapRef} style={{ width: "100%", height: "420px", borderRadius: "16px", border: "1px solid #e5e7eb", zIndex: 1 }}></div>
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