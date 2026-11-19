import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form, Button, Card, Alert, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useCreateOrder } from "../hooks/useOrder";
import { toast } from "react-toastify";

function Checkout({ carrito = [], setCarrito = () => {} }) {
  const navigate = useNavigate();
  const { createOrder, loading, error } = useCreateOrder();
  const [validated, setValidated] = useState(false);
  const [formError, setFormError] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [trackingId, setTrackingId] = useState("");

  const carritoActual = carrito && carrito.length > 0 ? carrito : JSON.parse(localStorage.getItem("carrito") || "[]");

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    order_type: "SALON",
    delivery_address: "",
    table_number: "",
    payment_type: "EFECTIVO"
  });

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const isUpdatingFromMap = useRef(false);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("clientUser") || "null");
      if (user) {
        setFormData((p) => ({
          ...p,
          customer_name: user.name || p.customer_name,
          customer_email: user.email || p.customer_email,
          customer_phone: user.phone || p.customer_phone,
          delivery_address: user.address || p.delivery_address,
        }));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (formData.order_type !== "DELIVERY") return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        if (!formData.delivery_address) {
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
            .then((r) => r.json())
            .then((d) => {
              if (d && d.display_name) {
                setFormData((prev) => ({ ...prev, delivery_address: d.display_name }));
              }
              if (mapInstanceRef.current && markerRef.current) {
                mapInstanceRef.current.setView([lat, lon], 15);
                markerRef.current.setLatLng([lat, lon]);
              }
            })
            .catch(() => {});
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [formData.order_type]);

  useEffect(() => {
    if (formData.order_type !== "DELIVERY") return;
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
  }, [formData.order_type]);

  const initMap = () => {
    if (!mapRef.current || !window.L || mapInstanceRef.current) return;
    const defaultLat = -12.0464;
    const defaultLon = -77.0428;

    const map = window.L.map(mapRef.current).setView([defaultLat, defaultLon], 14);
    mapInstanceRef.current = map;

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    const marker = window.L.marker([defaultLat, defaultLon], { draggable: true }).addTo(map);
    markerRef.current = marker;

    marker.on("dragend", (e) => {
      const pos = e.target.getLatLng();
      isUpdatingFromMap.current = true;
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`)
        .then((r) => r.json())
        .then((d) => {
          if (d && d.display_name) {
            setFormData((prev) => ({ ...prev, delivery_address: d.display_name }));
          }
          isUpdatingFromMap.current = false;
        })
        .catch(() => {
          isUpdatingFromMap.current = false;
        });
    });

    map.on("click", (e) => {
      marker.setLatLng(e.latlng);
      isUpdatingFromMap.current = true;
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
        .then((r) => r.json())
        .then((d) => {
          if (d && d.display_name) {
            setFormData((prev) => ({ ...prev, delivery_address: d.display_name }));
          }
          isUpdatingFromMap.current = false;
        })
        .catch(() => {
          isUpdatingFromMap.current = false;
        });
    });
  };

  useEffect(() => {
    if (formData.order_type !== "DELIVERY") return;
    if (isUpdatingFromMap.current) return;
    if (!formData.delivery_address || formData.delivery_address.length < 5) return;

    const timer = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.delivery_address)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d && d.length > 0) {
            const lat = parseFloat(d[0].lat);
            const lon = parseFloat(d[0].lon);
            if (mapInstanceRef.current && markerRef.current) {
              mapInstanceRef.current.setView([lat, lon], 15);
              markerRef.current.setLatLng([lat, lon]);
            }
          }
        })
        .catch(() => {});
    }, 800);

    return () => clearTimeout(timer);
  }, [formData.delivery_address, formData.order_type]);

  const subtotal = carritoActual.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const deliveryFee = formData.order_type === "DELIVERY" ? 5.00 : 0.00;
  const totalAmount = subtotal + deliveryFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("clientToken");
    if (!token) {
      toast.warn("Debes iniciar sesión para proceder al pago.");
      setTimeout(() => navigate("/cuenta"), 1600);
      return;
    }
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (carritoActual.length === 0) {
      setFormError("El carrito está vacío. Agrega productos antes de continuar.");
      return;
    }

    setFormError("");

    const orderPayload = {
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      customer_phone: formData.customer_phone,
      order_type: formData.order_type,
      delivery_address: formData.order_type === "DELIVERY" ? formData.delivery_address : "",
      table_number: formData.table_number,
      payment_type: formData.payment_type,
      items: carritoActual.map((item) => ({
        product_id: item.id,
        quantity: item.cantidad,
        options: item.options || null
      }))
    };

    try {
      const trackingIdResult = await createOrder(orderPayload);
      setTrackingId(trackingIdResult);
      setCarrito([]);
      localStorage.removeItem("carrito");
      setShowModal(true);
    } catch (err) {
      setFormError(err.message || "Ocurrió un error al procesar el pedido.");
    }
  };

  if (!carritoActual || carritoActual.length === 0 && !showModal) {
    return (
      <Container className="py-5 text-center">
        <div className="rounded-circle bg-light d-inline-flex p-4 shadow-sm mb-3 text-danger">
          <i className="bi bi-cart-x fs-1"></i>
        </div>
        <h3 className="fw-bold text-dark mb-2">Tu carrito está vacío</h3>
        <p className="text-muted mb-4">No hay productos seleccionados para procesar el pedido.</p>
        <Button style={{ backgroundColor: "#D63447", border: "none" }} className="rounded-pill px-4 py-2" onClick={() => navigate("/")}>
          Volver al Menú
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="fw-bold text-dark mb-4">Finalizar Pedido</h2>
      {(error || formError) && <Alert variant="danger">{error || formError}</Alert>}
      <Row>
        <Col lg={7} className="mb-4">
          <Card className="border-0 shadow-sm p-4 rounded-4">
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <h5 className="fw-bold mb-3">Tus Datos</h5>
              <Form.Group className="mb-3" controlId="customer_name">
                <Form.Label>Nombre Completo</Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  placeholder="Ej. Juan Pérez"
                />
                <Form.Control.Feedback type="invalid">Por favor ingresa tu nombre.</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="customer_email">
                <Form.Label>Email (para boleta)</Form.Label>
                <Form.Control
                  type="email"
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="customer_phone">
                <Form.Label>Teléfono / Celular</Form.Label>
                <Form.Control
                  required
                  type="tel"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  placeholder="Ej. 987654321"
                />
                <Form.Control.Feedback type="invalid">Por favor ingresa tu teléfono.</Form.Control.Feedback>
              </Form.Group>

              <h5 className="fw-bold mb-3 mt-4">Modalidad de Pedido</h5>
              <div className="d-flex gap-2 flex-wrap mb-3">
                {[
                  { value: "SALON", label: "En Salón", icon: "bi-shop" },
                  { value: "RECOJO_TIENDA", label: "Recojo en Tienda", icon: "bi-bag-check" },
                  { value: "DELIVERY", label: "Delivery (+S/5)", icon: "bi-bicycle" },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={formData.order_type === opt.value ? "danger" : "outline-secondary"}
                    className="flex-grow-1 rounded-3 py-2"
                    onClick={() => setFormData((p) => ({ ...p, order_type: opt.value }))}
                  >
                    <i className={`bi ${opt.icon} me-2`}></i>
                    {opt.label}
                  </Button>
                ))}
              </div>

              {formData.order_type === "DELIVERY" && (
                <>
                  <Form.Group className="mb-3" controlId="delivery_address">
                    <Form.Label>Dirección de Entrega</Form.Label>
                    <Form.Control
                      required
                      type="text"
                      name="delivery_address"
                      value={formData.delivery_address}
                      onChange={handleChange}
                      placeholder="Av. Principal 123, Depto 402"
                    />
                    <Form.Control.Feedback type="invalid">Ingresa tu dirección de entrega.</Form.Control.Feedback>
                  </Form.Group>

                  <div className="mb-3">
                    <div className="text-muted small mb-2">
                      <i className="bi bi-info-circle me-1"></i>Arrastra el marcador rojo o haz clic en el mapa para ajustar la ubicación exacta.
                    </div>
                    <div ref={mapRef} style={{ width: "100%", height: "280px", borderRadius: "16px", border: "1px solid #e5e7eb", zIndex: 1 }}></div>
                  </div>
                </>
              )}

              {formData.order_type === "SALON" && (
                <Form.Group className="mb-3" controlId="table_number">
                  <Form.Label>Número de Mesa (opcional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="table_number"
                    value={formData.table_number}
                    onChange={handleChange}
                    placeholder="Ej. Mesa 4"
                  />
                </Form.Group>
              )}

              <h5 className="fw-bold mb-3 mt-4">Método de Pago</h5>
              <div className="d-flex gap-2 flex-wrap mb-4">
                {[
                  { value: "EFECTIVO", label: "Pago contra entrega", icon: "bi-cash-coin", color: "#16A34A" },
                  { value: "YAPE", label: "Yape", icon: "bi-phone", color: "#7C3AED" },
                  { value: "PLIN", label: "Plin", icon: "bi-wallet2", color: "#0EA5E9" },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={formData.payment_type === opt.value ? "primary" : "outline-secondary"}
                    className="flex-grow-1 rounded-3 py-3 fw-bold"
                    style={formData.payment_type === opt.value ? { backgroundColor: opt.color, borderColor: opt.color } : {}}
                    onClick={() => setFormData((p) => ({ ...p, payment_type: opt.value }))}
                  >
                    <i className={`bi ${opt.icon} me-2 fs-5`}></i>
                    {opt.label}
                  </Button>
                ))}
              </div>

              <Button
                type="submit"
                className="w-100 py-3 rounded-pill fw-bold text-white border-0 shadow-sm"
                style={{ backgroundColor: "#D63447" }}
                disabled={loading}
              >
                {loading ? "Procesando pedido..." : "Confirmar y Enviar Pedido"}
              </Button>
            </Form>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="border-0 shadow-sm p-4 rounded-4 bg-light">
            <h5 className="fw-bold mb-3">Resumen del Pedido</h5>
            {carritoActual.map((item) => (
              <div key={item.id} className="d-flex justify-content-between mb-2 small">
                <span>{item.cantidad}x {item.nombre}</span>
                <span className="fw-bold">S/ {(item.precio * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
            <hr />
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Subtotal</span>
              <span>S/ {subtotal.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Delivery</span>
              <span>S/ {deliveryFee.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between fw-bold fs-5 text-dark">
              <span>Total a pagar</span>
              <span style={{ color: "#D63447" }}>S/ {totalAmount.toFixed(2)}</span>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} centered backdrop="static" keyboard={false}>
        <Modal.Body className="text-center p-5">
          <div className="rounded-circle bg-success bg-opacity-10 d-inline-flex p-4 shadow-sm mb-3 text-success mx-auto">
            <i className="bi bi-check-circle-fill fs-1"></i>
          </div>
          <h3 className="fw-bold text-dark mb-2">¡Pedido creado con éxito!</h3>
          <p className="text-muted mb-4">Tu pedido ha sido procesado correctamente y ya está en marcha.</p>
          
          <div className="bg-light p-3 rounded-3 mb-4">
            <span className="text-muted d-block small mb-1">Tu ID de seguimiento es:</span>
            <span className="fw-bold fs-3 text-dark">{trackingId}</span>
          </div>

          <Button
            style={{ backgroundColor: "#D63447", border: "none" }}
            className="w-100 rounded-pill py-3 fw-bold text-white shadow-sm"
            onClick={() => navigate(`/tracking/${trackingId}`)}
          >
            Ir a Seguir mi Pedido
          </Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default Checkout;