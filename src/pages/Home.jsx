import React, { useEffect, useRef, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Container, Row, Col, Spinner, Alert, Carousel } from "react-bootstrap";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";

const homeStyles = `
  .hero-polleria {
    position: sticky;
    top: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    color: #fff;
    overflow: hidden;
    z-index: 0;
  }
  .hero-bg {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(110deg, rgba(15,15,15,0.72) 0%, rgba(15,15,15,0.4) 55%, rgba(214,52,71,0.32) 100%),
      url('https://upload.wikimedia.org/wikipedia/commons/8/81/Pollo_a_la_brasa.jpg') center/cover no-repeat;
    transform-origin: center center;
    will-change: transform;
    z-index: 0;
  }
  .hero-polleria::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 140px;
    background: linear-gradient(to top, #f8f9fa, transparent);
  }
  .hero-title {
    font-weight: 800;
    letter-spacing: -0.5px;
    line-height: 1.02;
    text-shadow: 0 4px 24px rgba(0,0,0,0.35);
    animation: fadeUp 0.9s ease both;
  }
  .hero-sub {
    max-width: 620px;
    opacity: 0.95;
    font-size: 1.15rem;
    animation: fadeUp 0.9s ease 0.15s both;
  }
  .hero-cta {
    background: #D63447;
    border: none;
    border-radius: 999px;
    padding: 14px 34px;
    font-weight: 700;
    box-shadow: 0 10px 30px rgba(214,52,71,0.45);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    animation: fadeUp 0.9s ease 0.3s both;
  }
  .hero-cta:hover {
    background: #b92a3a;
    transform: translateY(-2px);
    box-shadow: 0 14px 34px rgba(214,52,71,0.55);
  }
  .hero-cta-outline {
    border: 2px solid rgba(255,255,255,0.7);
    color: #fff;
    border-radius: 999px;
    padding: 12px 30px;
    font-weight: 600;
    background: transparent;
    transition: background 0.2s ease;
    animation: fadeUp 0.9s ease 0.35s both;
  }
  .hero-cta-outline:hover { background: rgba(255,255,255,0.15); color: #fff; }
  .feature-card {
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    height: 100%;
    box-shadow: 0 6px 18px rgba(0,0,0,0.05);
    transition: transform 0.2s ease;
  }
  .feature-card:hover { transform: translateY(-4px); }
  .feature-icon {
    width: 52px; height: 52px; border-radius: 14px;
    display: inline-flex; align-items: center; justify-content: center;
    background: #FEE2E2; color: #D63447; font-size: 1.5rem; margin-bottom: 14px;
  }
  .section-heading { font-weight: 800; letter-spacing: -0.3px; color: #111827; }
  .section-sub { color: #6b7280; max-width: 640px; margin: 0 auto; }
  .category-card {
    position: relative;
    border-radius: 18px;
    overflow: hidden;
    height: 170px;
    display: block;
    color: #fff;
    text-decoration: none;
    box-shadow: 0 8px 22px rgba(0,0,0,0.08);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .category-card:hover { transform: translateY(-6px); box-shadow: 0 14px 30px rgba(0,0,0,0.14); }
  .category-card img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.4s ease;
  }
  .category-card:hover img { transform: scale(1.08); }
  .category-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0.15));
    display: flex; align-items: flex-end; padding: 16px;
  }
  .category-name { font-weight: 700; font-size: 1.1rem; text-shadow: 0 2px 8px rgba(0,0,0,0.4); }
  .classic-card {
    background: linear-gradient(180deg, #ffffff 0%, #fff7f7 100%);
    border-radius: 22px;
    overflow: hidden;
    box-shadow: 0 12px 30px rgba(0,0,0,0.09);
    border: 1px solid rgba(214,52,71,0.08);
    transition: transform 0.28s ease, box-shadow 0.28s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .classic-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 18px 40px rgba(0,0,0,0.14);
  }
  .classic-img-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 10;
    overflow: hidden;
    background: #f3f4f6;
  }
  .classic-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.45s ease, filter 0.3s ease;
  }
  .classic-card:hover .classic-img {
    transform: scale(1.08);
    filter: brightness(0.65);
  }
  .classic-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.25);
    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;
    z-index: 2;
  }
  .classic-img-wrap:hover .classic-overlay {
    opacity: 1;
  }
  .classic-overlay span {
    color: #fff;
    font-weight: 700;
    font-size: 0.9rem;
    padding: 8px 16px;
    border-radius: 999px;
    background: rgba(214,52,71,0.9);
    box-shadow: 0 4px 14px rgba(0,0,0,0.3);
  }
  .classic-price {
    position: absolute;
    top: 14px;
    right: 14px;
    background: linear-gradient(135deg, #D63447, #a82333);
    color: #fff;
    font-weight: 700;
    font-size: 0.95rem;
    padding: 6px 14px;
    border-radius: 999px;
    box-shadow: 0 6px 16px rgba(214,52,71,0.4);
  }
  .classic-badge {
    position: absolute;
    top: 14px;
    left: 14px;
    background: rgba(255,255,255,0.9);
    color: #D63447;
    font-weight: 800;
    font-size: 0.75rem;
    padding: 5px 12px;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  .classic-body {
    padding: 18px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .classic-title {
    font-weight: 800;
    font-size: 1.1rem;
    color: #111827;
    margin-bottom: 6px;
    letter-spacing: 0.3px;
  }
  .classic-desc {
    color: #6b7280;
    font-size: 0.85rem;
    margin-bottom: 14px;
    flex: 1;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .classic-btn {
    background: linear-gradient(135deg, #D63447 0%, #a82333 100%);
    color: #fff;
    border: none;
    border-radius: 14px;
    padding: 12px 0;
    font-weight: 700;
    letter-spacing: 0.3px;
    box-shadow: 0 6px 16px rgba(214,52,71,0.3);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .classic-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 22px rgba(214,52,71,0.45);
  }
  .classic-btn:active { transform: scale(0.98); }
  .menu-section { position: relative; z-index: 1; background: #f8f9fa; }
  .empty-state {
    background: #fff; border-radius: 16px; padding: 40px; text-align: center;
    color: #6b7280; box-shadow: 0 4px 14px rgba(0,0,0,0.04);
  }
  .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .reveal.visible { opacity: 1; transform: translateY(0); }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @media (max-width: 768px) {
    .hero-polleria { min-height: 62vh; text-align: center; padding: 40px 0; }
    .hero-title { font-size: 2rem; }
    .hero-sub { font-size: 1rem; }
    .hero-cta, .hero-cta-outline { width: 100%; text-align: center; }
    .inf-carousel-card { flex: 0 0 140px !important; height: 200px !important; }
    .classic-card { margin-bottom: 12px; }
    .section-heading { font-size: 1.4rem; }
  }
  @media (max-width: 576px) {
    .hero-title { font-size: 1.7rem; }
    .hero-polleria { min-height: 52vh; }
    .category-chip { font-size: 0.75rem; padding: 6px 12px; }
  }
`;

const CATEGORIES = [
  { name: "Pollos y Combos", img: "https://upload.wikimedia.org/wikipedia/commons/8/81/Pollo_a_la_brasa.jpg", href: "#menu" },
  { name: "Piqueos", img: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80", href: "#menu" },
  { name: "Ensaladas", img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80", href: "#menu" },
  { name: "Bebidas", img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80", href: "#menu" },
];

export default function Home() {
  const { carrito, setCarrito } = useOutletContext();
  const { productos, loading, error } = useProducts();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY || 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.12 }
    );
    const nodes = document.querySelectorAll(".reveal");
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [productos]);

  const agregarAlCarrito = (producto) => {
    setCarrito((prevCarrito) => {
      const itemExistente = prevCarrito.find((item) => item.id === producto.id);
      if (itemExistente) {
        return prevCarrito.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prevCarrito, { ...producto, cantidad: 1 }];
    });
  };

  const pollosYCombos = productos.slice(0, 6);
  const platosExtras = productos.slice(6);
  const clasicos = productos.slice(0, 3);

  const chickenProducts = productos.filter((p) => /pollo/i.test(p.nombre || ""));
  const otherProducts = productos.filter((p) => !/pollo/i.test(p.nombre || ""));
  const interleaved = [];
  const maxLen = Math.max(chickenProducts.length, otherProducts.length);
  for (let i = 0; i < maxLen; i++) {
    if (chickenProducts[i]) interleaved.push(chickenProducts[i]);
    if (otherProducts[i]) interleaved.push(otherProducts[i]);
  }
  const carouselItems = interleaved.length ? interleaved : productos;

  return (
    <div className="menu-section" style={{ minHeight: "100vh" }}>
      <style>{homeStyles}</style>

      {/* HERO */}
      <section className="hero-polleria" style={{ position: "relative", overflow: "hidden" }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "-10% -5% -10% -5%",
            backgroundImage: "url('https://www.radionacional.gob.pe/sites/default/files/pollo_brasa.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: `translateY(${scrollY * 0.3}px) scale(${1 + Math.min(scrollY / (window.innerHeight || 1), 1) * 0.35})`,
            transition: "transform 0.1s linear",
            zIndex: 0,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(110deg, rgba(15,15,15,0.82) 0%, rgba(15,15,15,0.48) 55%, rgba(214,52,71,0.38) 100%)",
            zIndex: 1,
          }}
        />
        <Container className="position-relative" style={{ zIndex: 2 }}>
          <Row className="align-items-center">
            <Col lg={7}>
              <span className="badge bg-light text-danger fw-bold px-3 py-2 mb-3" style={{ borderRadius: 999 }}>
                🔥 Sabor que enciende tu día
              </span>
              <h1 className="hero-title display-3 mb-3">
                El mejor pollo a la brasa de la ciudad
              </h1>
              <p className="hero-sub mb-4">
                Jugoso, dorado y con ese sabor inconfundible que te hace volver.
                Pide en línea, elige tu modalidad y sigue tu pedido en tiempo real.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <a href="#menu" className="btn hero-cta text-white text-decoration-none">
                  <i className="bi bi-fire me-2"></i>Ver menú
                </a>
                <button
                  className="btn hero-cta-outline text-decoration-none"
                  onClick={() => {
                    const token = localStorage.getItem("clientToken");
                    if (!token) {
                      toast.warn("Debes iniciar sesión para proceder al pago.");
                      setTimeout(() => { window.location.href = "/cuenta"; }, 1600);
                      return;
                    }
                    window.location.href = "/checkout";
                  }}
                >
                  Pedir ahora
                </button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CARRUSEL INFINITO - pollo a la brasa y mucho mas */}
      <section style={{ width: "100%", background: "#fff", padding: "48px 0", overflow: "hidden" }}>
        <Container>
          <div className="text-center mb-4">
            <h2 className="section-heading mb-2">Pollo a la brasa y mucho más</h2>
            <p className="section-sub">Explora nuestra carta completa.</p>
          </div>
        </Container>
        <div style={{ width: "100%", overflow: "hidden" }}>
          <div
            className="inf-carousel-track"
            style={{
              display: "flex",
              gap: "18px",
              width: "max-content",
              animation: "infScroll 20s linear infinite",
            }}
          >
            {carouselItems.concat(carouselItems).map((c, i) => (
              <a
                key={i}
                href="/menu"
                className="text-decoration-none inf-carousel-card"
                style={{
                  flex: "0 0 170px",
                  height: "340px",
                  position: "relative",
                  overflow: "hidden",
                  background: "#000",
                }}
              >
                <img src={c.imagen || c.img} alt={c.nombre || c.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div className="inf-carousel-overlay">
                  <span>{c.nombre || c.name}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes infScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .inf-carousel-card .inf-carousel-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.25s ease;
            color: #fff;
            font-weight: 700;
            font-size: 1.05rem;
            text-align: center;
            padding: 12px;
          }
          .inf-carousel-card:hover .inf-carousel-overlay {
            opacity: 1;
          }
        `}</style>
      </section>

      {/* CATEGORIES */}


      {/* CLASICOS */}
      {clasicos.length > 0 && (
        <Container className="py-5 reveal">
          <div className="text-center mb-4">
            <h2 className="section-heading mb-2">Los Clásicos</h2>
            <p className="section-sub">Los favoritos que nunca fallan.</p>
          </div>
          <Row className="g-3 g-md-4">
            {clasicos.map((prod) => (
              <Col key={prod.id} xs={12} sm={6} md={4}>
                <div className="classic-card">
                  <div className="classic-img-wrap">
                    <Link to={`/producto/${prod.id}`}>
                      <img src={prod.imagen} alt={prod.nombre} className="classic-img" />
                      <div className="classic-overlay">
                        <span><i className="bi bi-eye me-2"></i>Ver detalles</span>
                      </div>
                    </Link>
                    <span className="classic-badge">Clásico</span>
                    <span className="classic-price">S/ {prod.precio.toFixed(2)}</span>
                  </div>
                  <div className="classic-body">
                    <Link to={`/producto/${prod.id}`} className="text-decoration-none">
                      <div className="classic-title text-uppercase">{prod.nombre}</div>
                    </Link>
                    <div className="classic-desc">{prod.descripcion}</div>
                    <button className="classic-btn" onClick={() => agregarAlCarrito(prod)}>
                      <i className="bi bi-cart-plus me-2"></i>Agregar
                    </button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      )}

      {/* MENU */}
      <Container id="menu" className="py-4 pb-5 reveal" style={{ maxWidth: "1280px" }}>
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="danger" />
            <p className="text-muted mt-3 mb-0">Cargando menú...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="text-center">
            Error al cargar los productos: {error}
          </Alert>
        )}

        <div className="text-center py-4">
          <a href="/menu" className="btn hero-cta text-white text-decoration-none">
            <i className="bi bi-journal-text me-2"></i>Ver menú completo
          </a>
        </div>
      </Container>

      {/* LOCALES / CONTACTO */}
      <section style={{ background: "#fff", padding: "60px 0" }}>
        <Container>
          <Row className="g-4 align-items-center">
            <Col md={6}>
              <h2 className="section-heading mb-3">Visítanos</h2>
              <p className="text-muted mb-4" style={{ fontSize: "1.05rem" }}>
                Av. Principal 123, Lima. Atención de lunes a domingo de 11:00 am a 11:00 pm.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <a href="#" className="btn btn-outline-danger rounded-pill px-4 fw-semibold">
                  <i className="bi bi-geo-alt me-2"></i>Ver locales
                </a>
                <a href="/feedback" className="btn btn-dark rounded-pill px-4 fw-semibold">
                  <i className="bi bi-chat-dots me-2"></i>Contáctanos
                </a>
              </div>
            </Col>
            <Col md={6}>
              <div style={{ borderRadius: 24, overflow: "hidden", boxShadow: "0 16px 40px rgba(0,0,0,0.12)" }}>
                <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80" alt="Local" style={{ width: "100%", height: "300px", objectFit: "cover" }} />
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}