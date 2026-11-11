import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { Container, Row, Col, Spinner, Alert, Button, Badge } from "react-bootstrap";
import { API_HOST } from "../services/api";
import { useProducts } from "../hooks/useProducts";

const styles = `
  .pd-wrap { background: #f8f9fa; min-height: 100vh; padding: 40px 0 80px; }
  .pd-card {
    background: #fff;
    border-radius: 28px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.08);
  }
  .pd-img {
    width: 100%;
    height: 100%;
    min-height: 420px;
    object-fit: cover;
  }
  .pd-title {
    font-weight: 800;
    letter-spacing: -0.5px;
    color: #111827;
  }
  .pd-price {
    font-size: 2rem;
    font-weight: 800;
    color: #D63447;
  }
  .pd-btn {
    background: linear-gradient(135deg, #D63447 0%, #a82333 100%);
    border: none;
    border-radius: 14px;
    padding: 14px 0;
    font-weight: 700;
    box-shadow: 0 8px 24px rgba(214,52,71,0.35);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .pd-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(214,52,71,0.45); }
  .pd-qty-btn {
    width: 40px; height: 40px; border-radius: 12px;
    border: 1px solid #e5e7eb; background: #fff; font-weight: 700;
  }
  .related-card {
    background: #fff; border-radius: 18px; overflow: hidden;
    box-shadow: 0 6px 18px rgba(0,0,0,0.06);
    transition: transform 0.2s ease;
  }
  .related-card:hover { transform: translateY(-4px); }
`;

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { carrito, setCarrito } = useOutletContext();
  const { productos } = useProducts();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [selectedSauces, setSelectedSauces] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_HOST}/api/public/products/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Producto no encontrado");
        setProduct(data.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const agregarAlCarrito = () => {
    if (!product) return;
    const options = isBeverage
      ? selectedBrand
      : selectedSauces.join(", ");
    setCarrito((prev) => {
      const ex = prev.find((i) => i.id === product.id && (i.options || "") === (options || ""));
      if (ex) {
        return prev.map((i) => (i.id === product.id && (i.options || "") === (options || "") ? { ...i, cantidad: i.cantidad + qty } : i));
      }
      return [...prev, { id: product.id, nombre: product.name, descripcion: product.description, precio: product.price, imagen: product.image, cantidad: qty, options: options || null }];
    });
    navigate("/checkout");
  };

  const isBeverage = /gaseosa/i.test(product?.name || "");
  const isChicken = /pollo/i.test(product?.name || "");
  const sauces = ["Mostaza", "Tártara", "Ketchup", "Vinagreta", "Huancaina", "Ocopa", "Salsa Golf", "Acevichada"];
  const brands = ["Inca Kola", "Coca-Cola", "Pepsi", "Sprite", "Fanta", "Guaraná"];
  const related = productos.filter((p) => p.id !== Number(id)).slice(0, 4);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="danger" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">{error || "Producto no encontrado"}</Alert>
        <Button variant="dark" onClick={() => navigate("/")}>Volver al inicio</Button>
      </Container>
    );
  }

  return (
    <div className="pd-wrap">
      <style>{styles}</style>
      <Container style={{ maxWidth: "1100px" }}>
        <Button variant="link" className="text-decoration-none text-muted mb-3 p-0" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-2"></i>Volver
        </Button>

        <div className="pd-card">
          <Row className="g-0">
            <Col md={6}>
              <img src={product.image} alt={product.name} className="pd-img" />
            </Col>
            <Col md={6} className="p-4 p-md-5 d-flex flex-column">
              <Badge bg="danger" className="align-self-start mb-3 px-3 py-2" style={{ borderRadius: 999 }}>
                Clásico
              </Badge>
              <h1 className="pd-title mb-2">{product.name}</h1>
              <p className="text-muted mb-4" style={{ fontSize: "1.05rem", lineHeight: 1.6 }}>
                {product.description || "Delicioso pollo a la brasa preparado con nuestra receta tradicional."}
              </p>

              {product.includes && (
                <div className="mb-4 p-3 rounded-3" style={{ background: "#fff7f7", border: "1px solid rgba(214,52,71,0.12)" }}>
                  <div className="fw-bold mb-2" style={{ color: "#D63447" }}>
                    <i className="bi bi-basket2 me-2"></i>¿Qué incluye?
                  </div>
                  <div className="text-muted" style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
                    {product.includes}
                  </div>
                </div>
              )}

              <div className="pd-price mb-4">S/ {product.price.toFixed(2)}</div>

              {isChicken && (
                <div className="mb-4">
                  <div className="fw-bold mb-2" style={{ color: "#D63447" }}>
                    <i className="bi bi-droplet me-2"></i>Elige tus cremas
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {sauces.map((s) => {
                      const active = selectedSauces.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          className={`btn btn-sm rounded-pill ${active ? "btn-danger" : "btn-outline-secondary"}`}
                          onClick={() => {
                            setSelectedSauces((prev) =>
                              prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                            );
                          }}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {isBeverage && (
                <div className="mb-4">
                  <div className="fw-bold mb-2" style={{ color: "#D63447" }}>
                    <i className="bi bi-cup-straw me-2"></i>Elige la marca
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {brands.map((b) => {
                      const active = selectedBrand === b;
                      return (
                        <button
                          key={b}
                          type="button"
                          className={`btn btn-sm rounded-pill ${active ? "btn-danger" : "btn-outline-secondary"}`}
                          onClick={() => setSelectedBrand(b)}
                        >
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="d-flex align-items-center gap-3 mb-4">
                <button className="pd-qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
                <span className="fw-bold fs-5">{qty}</span>
                <button className="pd-qty-btn" onClick={() => setQty((q) => q + 1)}>+</button>
              </div>

              <Button className="pd-btn w-100 text-white" onClick={agregarAlCarrito}>
                <i className="bi bi-cart-plus me-2"></i>Agregar al carrito
              </Button>

              <div className="mt-4 pt-3 border-top">
                <div className="text-muted small">
                  <i className="bi bi-truck me-2"></i>Delivery disponible · <i className="bi bi-credit-card ms-2 me-2"></i>Pago con Yape, Plin o efectivo
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {related.length > 0 && (
          <div className="mt-5">
            <h3 className="fw-bold mb-3">También te puede gustar</h3>
            <Row className="g-3">
              {related.map((p) => (
                <Col key={p.id} xs={6} md={3}>
                  <Link to={`/producto/${p.id}`} className="text-decoration-none">
                    <div className="related-card">
                      <img src={p.imagen} alt={p.nombre} style={{ width: "100%", height: 150, objectFit: "cover" }} />
                      <div className="p-3">
                        <div className="fw-bold text-dark small text-uppercase">{p.nombre}</div>
                        <div className="text-danger fw-bold mt-1">S/ {p.precio.toFixed(2)}</div>
                      </div>
                    </div>
                  </Link>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Container>
    </div>
  );
}