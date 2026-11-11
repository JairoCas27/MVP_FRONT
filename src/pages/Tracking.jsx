import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Badge, Spinner, Form, Button } from "react-bootstrap";
import { io } from "socket.io-client";
import { API_HOST } from "../services/api";
import { useTrackingOrder } from "../hooks/useOrder";

function Tracking() {
  const { orderId: paramOrderId } = useParams();
  const navigate = useNavigate();

  const [inputOrderId, setInputOrderId] = useState("");
  const [activeOrderId, setActiveOrderId] = useState(paramOrderId || null);
  const [clientOrders, setClientOrders] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const { order, setOrder, loading, error } = useTrackingOrder(activeOrderId);

  useEffect(() => {
    if (paramOrderId) {
      setActiveOrderId(paramOrderId);
    }
  }, [paramOrderId]);

  useEffect(() => {
    const token = localStorage.getItem("clientToken");
    if (!token) return;
    setLoadingHistory(true);
    fetch(`${API_HOST}/api/public/client/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.status === "success") setClientOrders(d.data || []); })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    if (!activeOrderId) return;

    const socket = io(API_HOST);

    socket.on("connect", () => {
      socket.emit("unirse_tracking", { order_id: activeOrderId });
    });

    socket.on("actualizacion_estado", (data) => {
      if (data.id === activeOrderId || data.order_id === activeOrderId) {
        setOrder((prev) => (prev ? { ...prev, status: data.status } : prev));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [activeOrderId, setOrder]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedId = inputOrderId.trim();
    if (trimmedId) {
      navigate(`/tracking/${trimmedId}`);
    }
  };

  const handleReset = () => {
    setActiveOrderId(null);
    setInputOrderId("");
    navigate("/tracking");
  };

  if (!activeOrderId) {
    const token = localStorage.getItem("clientToken");
    if (!token) {
      return (
        <Container className="py-5" style={{ maxWidth: "520px" }}>
          <Card className="border-0 shadow-sm p-4 rounded-4 text-center">
            <div className="rounded-circle p-3 bg-light d-inline-flex mx-auto mb-3 text-danger">
              <i className="bi bi-box-seam fs-1"></i>
            </div>
            <h3 className="fw-bold mb-2">Seguimiento de Pedido</h3>
            <p className="text-muted mb-4">
              Para ver el seguimiento de tus pedidos, inicia sesión en tu cuenta.
            </p>
            <Button className="w-100 py-2 fw-bold text-white border-0" style={{ backgroundColor: "#D63447" }} onClick={() => navigate("/cuenta")}>
              Iniciar Sesión
            </Button>
          </Card>
        </Container>
      );
    }

    return (
      <Container className="py-5" style={{ maxWidth: "760px" }}>
        <Card className="border-0 shadow-sm p-4 rounded-4 mb-4">
          <h4 className="fw-bold mb-3">Mis Pedidos</h4>
          {loadingHistory && <div className="text-center py-3"><Spinner animation="border" variant="danger" /></div>}
          {!loadingHistory && clientOrders.length === 0 && (
            <p className="text-muted mb-0">Aún no tienes pedidos registrados.</p>
          )}
          <div className="d-flex flex-column gap-3">
            {clientOrders.map((o) => {
              const progress = o.status === "PENDIENTE" ? 25 : o.status === "PREPARANDO" ? 50 : (o.status === "EN_CAMINO" || o.status === "LISTO_PARA_RECOJO") ? 75 : 100;
              const statusColor = o.status === "FINALIZADO" ? "#16A34A" : o.status === "CANCELADO" ? "#DC2626" : "#D97706";
              return (
                <div
                  key={o.id}
                  onClick={() => navigate(`/tracking/${o.id}`)}
                  style={{
                    background: "#fff",
                    borderRadius: 18,
                    padding: 20,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                    border: "1px solid rgba(0,0,0,0.05)",
                    cursor: "pointer",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 14px 30px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)";
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="fw-bold fs-5">Pedido #{o.id}</div>
                      <div className="text-muted small">{o.created_at} · {o.order_type} · {o.payment_type}</div>
                    </div>
                    <span
                      style={{
                        background: statusColor,
                        color: "#fff",
                        padding: "4px 12px",
                        borderRadius: 999,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      {o.status}
                    </span>
                  </div>

                  {Array.isArray(o.items) && o.items.length > 0 && (
                    <div className="mb-2" style={{ fontSize: "0.85rem" }}>
                      {o.items.map((it, idx) => (
                        <div key={idx} className="d-flex justify-content-between text-muted">
                          <span>{it.quantity}x {it.product_name}</span>
                          <span>S/ {Number(it.subtotal).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="progress mb-2" style={{ height: 6, borderRadius: 999 }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${progress}%`, background: "linear-gradient(90deg, #D63447, #ff7a18)" }}
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-dark">Total: S/ {Number(o.total_amount).toFixed(2)}</span>
                    <span className="text-danger small fw-semibold">
                      Ver detalle <i className="bi bi-arrow-right"></i>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="danger" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center" style={{ maxWidth: "500px" }}>
        <Card className="border-0 shadow-sm p-4 rounded-4">
          <h4 className="text-danger mb-3">{error}</h4>
          <Button variant="outline-dark" onClick={handleReset}>
            Intentar con otro ID
          </Button>
        </Card>
      </Container>
    );
  }

  if (!order) {
    return null;
  }

  const statusColor = order.status === "FINALIZADO" ? "#16A34A" : order.status === "CANCELADO" ? "#DC2626" : "#D97706";

  return (
    <Container className="py-5" style={{ maxWidth: "640px" }}>
      <Card className="border-0 shadow-lg overflow-hidden" style={{ borderRadius: 24 }}>
        <div style={{ background: "linear-gradient(135deg, #D63447 0%, #a82333 100%)", padding: "28px", color: "#fff", textAlign: "center" }}>
          <div className="rounded-circle bg-white bg-opacity-25 d-inline-flex p-3 mb-3">
            <i className="bi bi-box-seam fs-1"></i>
          </div>
          <h3 className="fw-bold mb-1">Estado de tu Pedido</h3>
          <p className="mb-0 opacity-75 small">Tracking ID: #{order.id}</p>
        </div>

        <div className="p-4">
          <div className="text-center mb-4">
            <span className="text-muted d-block mb-2">Estado Actual</span>
            <span
              style={{
                background: statusColor,
                color: "#fff",
                padding: "8px 24px",
                borderRadius: 999,
                fontWeight: 700,
                fontSize: "1rem",
                display: "inline-block",
              }}
            >
              {order.status}
            </span>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4 px-2">
            {["PENDIENTE", "PREPARANDO", "LISTO", "FINALIZADO"].map((step, idx) => {
              const current = order.status;
              const orderSteps = ["PENDIENTE", "PREPARANDO", "EN_CAMINO", "LISTO_PARA_RECOJO", "FINALIZADO"];
              const currentIndex = orderSteps.indexOf(current === "LISTO_PARA_RECOJO" ? "LISTO_PARA_RECOJO" : current);
              const stepIndex = idx === 2 ? orderSteps.indexOf("EN_CAMINO") : (idx === 3 ? 4 : idx);
              const done = currentIndex >= stepIndex;
              return (
                <div key={step} className="text-center" style={{ flex: 1 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      margin: "0 auto 6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: done ? "linear-gradient(135deg, #D63447, #a82333)" : "#e5e7eb",
                      color: done ? "#fff" : "#9ca3af",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      boxShadow: done ? "0 4px 12px rgba(214,52,71,0.35)" : "none",
                    }}
                  >
                    {done ? <i className="bi bi-check-lg"></i> : idx + 1}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: done ? "#D63447" : "#9ca3af", fontWeight: 600 }}>
                    {step === "LISTO" ? (order.order_type === "DELIVERY" ? "En camino" : "Listo") : step.charAt(0) + step.slice(1).toLowerCase()}
                  </div>
                </div>
              );
            })}
          </div>

          {Array.isArray(order.items) && order.items.length > 0 && (
            <div className="mb-4">
              <h6 className="fw-bold mb-2">Productos</h6>
              {order.items.map((it, idx) => (
                <div key={idx} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <div>
                    <div className="fw-semibold small">{it.quantity}x {it.product_name}</div>
                    {it.options && <div className="text-muted" style={{ fontSize: "0.75rem" }}>{it.options}</div>}
                  </div>
                  <span className="fw-bold small">S/ {Number(it.subtotal).toFixed(2)}</span>
                </div>
              ))}
              <div className="d-flex justify-content-between pt-2 mt-2">
                <span className="text-muted">Pago:</span>
                <span className="fw-bold">{order.payment_type}</span>
              </div>
            </div>
          )}

          <div className="border-top pt-3 mb-4">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Cliente:</span>
              <span className="fw-bold">{order.customer_name}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Tipo de pedido:</span>
              <span className="fw-bold">{order.order_type}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">Total:</span>
              <span className="fw-bold fs-5 text-danger">S/ {order.total_amount.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center">
            <Button variant="link" className="text-muted text-decoration-none small p-0" onClick={handleReset}>
              Consultar otro pedido
            </Button>
          </div>
        </div>
      </Card>
    </Container>
  );
}

export default Tracking;