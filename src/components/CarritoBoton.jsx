import React from "react";
import { Offcanvas, Button, Badge, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "bootstrap-icons/font/bootstrap-icons.css";

function CarritoBoton({ carrito = [], setCarrito = () => {}, showOffcanvas, setShowOffcanvas }) {
  const navigate = useNavigate();

  const handleClose = () => setShowOffcanvas(false);
  const handleShow = () => setShowOffcanvas(true);

  const cantidadTotal = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const precioTotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const eliminarItem = (id) => {
    const nuevoCarrito = carrito.filter((item) => item.id !== id);
    setCarrito(nuevoCarrito);
    localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
  };

  const modificarCantidad = (id, delta) => {
    const nuevoCarrito = carrito.map((item) => {
      if (item.id === id) {
        const nuevaCantidad = item.cantidad + delta;
        return { ...item, cantidad: nuevaCantidad > 0 ? nuevaCantidad : 1 };
      }
      return item;
    });
    setCarrito(nuevoCarrito);
    localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
  };

  const irACheckout = () => {
    const token = localStorage.getItem("clientToken");
    if (!token) {
      handleClose();
      toast.warn("Debes iniciar sesión para proceder al pago.");
      setTimeout(() => navigate("/cuenta"), 1600);
      return;
    }
    handleClose();
    navigate("/checkout");
  };

  return (
    <>
      {!showOffcanvas && (
        <div
          className="position-fixed"
          style={{ bottom: "90px", right: "20px", zIndex: 1050 }}
        >
          <Button
            onClick={handleShow}
            style={{
              background: "linear-gradient(135deg, #D63447 0%, #a82333 100%)",
              border: "none",
              width: "62px",
              height: "62px",
              borderRadius: "50%",
              boxShadow: "0 8px 24px rgba(214,52,71,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px) scale(1.05)";
              e.currentTarget.style.boxShadow = "0 12px 28px rgba(214,52,71,0.55)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(214,52,71,0.45)";
            }}
          >
            <i className="bi bi-cart3 fs-4 text-white"></i>
            {cantidadTotal > 0 && (
              <Badge
                bg="light"
                text="danger"
                className="position-absolute top-0 start-100 translate-middle rounded-pill px-2 py-1 fw-bold"
                style={{ fontSize: "0.75rem", border: "2px solid #D63447" }}
              >
                {cantidadTotal}
              </Badge>
            )}
          </Button>
        </div>
      )}

      <Offcanvas show={showOffcanvas} onHide={handleClose} placement="end" style={{ width: "100%", maxWidth: "440px" }}>
        <Offcanvas.Header closeButton className="border-bottom py-4 px-4" style={{ background: "linear-gradient(135deg, #fff 0%, #fff7f7 100%)" }}>
          <Offcanvas.Title className="fw-bold fs-4 d-flex align-items-center text-dark">
            <div className="rounded-circle p-2 d-flex align-items-center justify-content-center me-3" style={{ background: "linear-gradient(135deg, #D63447, #a82333)", color: "#fff", width: "48px", height: "48px", boxShadow: "0 6px 16px rgba(214,52,71,0.35)" }}>
              <i className="bi bi-bag-check fs-5"></i>
            </div>
            <div>
              <span>Tu Carrito</span>
              <div className="text-muted fs-6 fw-normal">
                {cantidadTotal} {cantidadTotal === 1 ? "producto" : "productos"}
              </div>
            </div>
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="d-flex flex-column p-0" style={{ background: "#f8f9fa" }}>
          {carrito.length === 0 ? (
            <div className="text-center my-auto p-5 text-muted">
              <div className="rounded-circle bg-white d-inline-flex p-4 shadow-sm mb-3 text-danger">
                <i className="bi bi-cart-x fs-1"></i>
              </div>
              <h5 className="fw-bold text-dark mb-1">Tu carrito está vacío</h5>
              <p className="text-muted small mb-0">Agrega deliciosos platos para comenzar tu pedido.</p>
            </div>
          ) : (
            <>
              <div className="flex-grow-1 overflow-auto p-3 d-flex flex-column gap-3">
                {carrito.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-4 p-3 d-flex align-items-center gap-3"
                    style={{ boxShadow: "0 6px 18px rgba(0,0,0,0.06)", border: "1px solid rgba(214,52,71,0.06)" }}
                  >
                    <div style={{ width: 74, height: 74, borderRadius: 14, overflow: "hidden", flexShrink: 0, background: "#f3f4f6" }}>
                      <img
                        src={item.imagen || item.image || ""}
                        alt={item.nombre}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>

                    <div className="flex-grow-1">
                      <h6 className="mb-1 fw-bold text-dark">{item.nombre}</h6>
                      {item.options && <div className="text-muted small mb-1"><i className="bi bi-check2-circle me-1"></i>{item.options}</div>}
                      <div className="text-muted small mb-2">S/ {item.precio.toFixed(2)} c/u</div>
                      <div className="d-inline-flex align-items-center border rounded-pill bg-light px-2 py-1">
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-dark text-decoration-none px-1 shadow-none"
                          onClick={() => modificarCantidad(item.id, -1)}
                        >
                          <i className="bi bi-dash"></i>
                        </Button>
                        <span className="mx-2 fw-bold small text-dark">{item.cantidad}</span>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-dark text-decoration-none px-1 shadow-none"
                          onClick={() => modificarCantidad(item.id, 1)}
                        >
                          <i className="bi bi-plus"></i>
                        </Button>
                      </div>
                    </div>

                    <div className="text-end d-flex flex-column align-items-end justify-content-between" style={{ minHeight: "74px" }}>
                      <Button
                        variant="light"
                        size="sm"
                        className="p-0 text-danger border-0 rounded-circle shadow-none d-flex align-items-center justify-content-center"
                        style={{ width: "30px", height: "30px", backgroundColor: "#fff5f5" }}
                        onClick={() => eliminarItem(item.id)}
                      >
                        <i className="bi bi-trash small"></i>
                      </Button>
                      <div className="fw-bold text-dark fs-6">S/ {(item.precio * item.cantidad).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white border-top p-4 shadow-lg">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted fw-semibold">Subtotal a pagar</span>
                  <span className="fs-4 fw-bold text-dark">S/ {precioTotal.toFixed(2)}</span>
                </div>

                <Button
                  className="w-100 py-3 rounded-pill fs-6 fw-bold shadow-sm d-flex align-items-center justify-content-center text-white border-0"
                  style={{ background: "linear-gradient(135deg, #D63447 0%, #a82333 100%)" }}
                  onClick={irACheckout}
                >
                  <span>Proceder al Pago</span>
                  <i className="bi bi-arrow-right ms-2 fs-5"></i>
                </Button>
              </div>
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default CarritoBoton;