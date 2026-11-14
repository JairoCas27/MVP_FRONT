import React, { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Container, Row, Col, Spinner, Alert, Form, Button } from "react-bootstrap";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";

const styles = `
  .menu-hero {
    background: linear-gradient(135deg, #1c1917 0%, #3b2a24 100%);
    color: #fff;
    padding: 60px 0 40px;
  }
  .search-box .form-control {
    border-radius: 999px;
    padding: 12px 20px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 14px rgba(0,0,0,0.04);
  }
  @media (max-width: 576px) {
    .menu-hero { padding: 40px 0 24px; }
    .menu-hero h1 { font-size: 1.6rem; }
    .search-box .form-control { padding: 10px 16px; font-size: 0.9rem; }
    .filter-chip { font-size: 0.8rem; padding: 6px 12px; }
  }
  .filter-chip {
    border: 1px solid #e5e7eb;
    background: #fff;
    color: #374151;
    border-radius: 999px;
    padding: 8px 16px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .filter-chip.active {
    background: #D63447;
    color: #fff;
    border-color: #D63447;
  }
`;

export default function Menu() {
  const { carrito, setCarrito } = useOutletContext();
  const { productos, loading, error } = useProducts();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");

  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const ex = prev.find((i) => i.id === producto.id);
      if (ex) return prev.map((i) => (i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i));
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const filtered = useMemo(() => {
    let list = productos;
    if (filter !== "Todos") {
      list = list.filter((p) => (p.nombre || "").toLowerCase().includes(filter.toLowerCase()));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => (p.nombre || "").toLowerCase().includes(q) || (p.descripcion || "").toLowerCase().includes(q));
    }
    return list;
  }, [productos, filter, search]);

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <style>{styles}</style>
      <div className="menu-hero">
        <Container>
          <h1 className="fw-bold mb-2">Nuestro Menú</h1>
          <p className="mb-0" style={{ opacity: 0.9 }}>Elige tus favoritos y arma tu pedido en segundos.</p>
        </Container>
      </div>

      <Container className="py-4" style={{ maxWidth: "1280px" }}>
        <div className="search-box mb-3">
          <Form.Control
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="d-flex gap-2 mb-4" style={{ overflowX: "auto", paddingBottom: 8, flexWrap: "nowrap" }}>
          {["Todos", "Pollo", "Papas", "Ensalada", "Gaseosa"].map((f) => (
            <button
              key={f}
              className={`filter-chip ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="danger" />
          </div>
        )}

        {error && <Alert variant="danger" className="text-center">{error}</Alert>}

        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-5 text-muted">No se encontraron productos.</div>
            ) : (
              <Row className="g-3 g-md-4">
                {filtered.map((prod) => (
                  <Col key={prod.id} xs={6} sm={6} md={4} lg={3}>
                    <ProductCard producto={prod} onAgregar={agregarAlCarrito} />
                  </Col>
                ))}
              </Row>
            )}
          </>
        )}
      </Container>
    </div>
  );
}