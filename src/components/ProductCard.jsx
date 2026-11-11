import React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const styles = `
  .pc-card {
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
  .pc-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 18px 40px rgba(0,0,0,0.14);
  }
  .pc-img-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: #f3f4f6;
  }
  .pc-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.45s ease, filter 0.3s ease;
  }
  .pc-card:hover .pc-img {
    transform: scale(1.08);
    filter: brightness(0.65);
  }
  .pc-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.25);
    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;
  }
  .pc-img-wrap:hover .pc-overlay {
    opacity: 1;
  }
  .pc-overlay span {
    color: #fff;
    font-weight: 700;
    font-size: 0.95rem;
    padding: 8px 16px;
    border-radius: 999px;
    background: rgba(214,52,71,0.9);
    box-shadow: 0 4px 14px rgba(0,0,0,0.3);
  }
  .pc-price {
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
  .pc-body {
    padding: 18px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .pc-title {
    font-weight: 800;
    font-size: 1.05rem;
    color: #111827;
    margin-bottom: 6px;
    letter-spacing: 0.3px;
  }
  .pc-desc {
    color: #6b7280;
    font-size: 0.85rem;
    margin-bottom: 14px;
    flex: 1;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .pc-btn {
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
  .pc-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 22px rgba(214,52,71,0.45);
  }
  .pc-btn:active { transform: scale(0.98); }
`;

export function ProductCard({ producto, onAgregar }) {
  return (
    <>
      <style>{styles}</style>
      <div className="pc-card">
        <div className="pc-img-wrap">
          <Link to={`/producto/${producto.id}`}>
            <img src={producto.imagen} alt={producto.nombre} className="pc-img" />
            <div className="pc-overlay">
              <span><i className="bi bi-eye me-2"></i>Ver detalles</span>
            </div>
          </Link>
          <span className="pc-price">S/ {producto.precio.toFixed(2)}</span>
        </div>
        <div className="pc-body">
          <Link to={`/producto/${producto.id}`} className="text-decoration-none">
            <div className="pc-title text-uppercase">{producto.nombre}</div>
          </Link>
          <div className="pc-desc">{producto.descripcion}</div>
          <button className="pc-btn w-100" onClick={() => onAgregar(producto)}>
            <i className="bi bi-cart-plus me-2"></i>Agregar
          </button>
        </div>
      </div>
    </>
  );
}