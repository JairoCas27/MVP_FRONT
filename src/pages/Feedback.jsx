import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card, Alert } from "react-bootstrap";
import { FaCommentAlt, FaUser, FaPhoneAlt, FaPaperPlane, FaCheckCircle, FaStar, FaShieldAlt, FaHeart } from "react-icons/fa";
import { useComentarios } from "../hooks/useComentarios";
import { API_HOST } from "../services/api";
import { HeroSection } from "../components/Herosection";

const feedbackStyles = `
  .feedback-wrapper {
    max-width: 1180px;
    margin: -60px auto 0 auto;
    position: relative;
    z-index: 10;
    padding: 0 15px 80px 15px;
  }
  .feedback-card {
    background: #ffffff;
    border: none;
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.08);
    padding: 45px 40px;
    transition: transform 0.2s ease;
  }
  .form-control:focus, .form-control:active {
    border-color: #D63447;
    box-shadow: 0 0 0 0.2rem rgba(214,52,71,0.2);
  }
  .star-rating {
    font-size: 2.2rem;
    color: #e2e8f0;
    cursor: pointer;
    transition: color 0.2s ease, transform 0.2s ease;
  }
  .star-rating:hover { transform: scale(1.15); }
  .star-rating.active { color: #f6ad55; }
  .info-side-card {
    background: linear-gradient(180deg, #ffffff 0%, #fff7f7 100%);
    border: none;
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.08);
    padding: 45px 40px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border: 1px solid rgba(214,52,71,0.08);
  }
  .info-icon {
    width: 48px; height: 48px; border-radius: 14px;
    display: inline-flex; align-items: center; justify-content: center;
    background: #FEE2E2; color: #D63447; font-size: 1.2rem; margin-right: 14px;
  }
  @media (max-width: 768px) {
    .feedback-card, .info-side-card { padding: 30px 24px; }
  }
`;

function timeAgo(dateString) {
  try {
    const diff = (Date.now() - new Date(dateString.replace(" ", "T")).getTime()) / 1000;
    if (diff < 60) return "hace unos segundos";
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    if (diff < 2592000) return `hace ${Math.floor(diff / 86400)} días`;
    return new Date(dateString.replace(" ", "T")).toLocaleDateString("es-PE");
  } catch {
    return dateString;
  }
}

export default function Feedback() {
  const [formData, setFormData] = useState({
    nombre: "",
    celular: "",
    mensaje: "",
    calificacion: 5
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [validationError, setValidationError] = useState("");
  const [comentarios, setComentarios] = useState([]);
  const { enviarComentario, enviando, error, exito } = useComentarios();

  const fetchComentarios = () => {
    fetch(`${API_HOST}/api/public/feedbacks`)
      .then((r) => r.json())
      .then((d) => { if (d.status === "success") setComentarios(d.data || []); })
      .catch(() => {});
  };

  useEffect(() => { fetchComentarios(); }, []);
  useEffect(() => { if (exito) fetchComentarios(); }, [exito]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.celular.trim() || !formData.mensaje.trim()) {
      setValidationError("Por favor, complete todos los campos requeridos.");
      return;
    }
    setValidationError("");

    try {
      await enviarComentario(formData);
      setFormData({ nombre: "", celular: "", mensaje: "", calificacion: 5 });
    } catch (err) {
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <style>{feedbackStyles}</style>

      <HeroSection
        title="Buzón de Opiniones y Mejoras"
        subtitle="Su retroalimentación es fundamental para seguir brindándole el mejor servicio"
        gradient="linear-gradient(135deg, #D63447 0%, #a82333 100%)"
        padding="70px 0 120px 0"
        textAlign="center"
      />

      <div className="feedback-wrapper">
        <Row className="g-4 align-items-stretch">
          <Col lg={7}>
            <Card className="feedback-card h-100">
              <div className="d-flex align-items-center mb-4 pb-2 border-bottom">
                <FaCommentAlt className="text-danger me-2 fs-4" />
                <h3 className="fw-bold mb-0 text-dark fs-4">Déjenos su Comentario</h3>
              </div>

              {exito && (
                <Alert variant="success" className="rounded-3 border-0 shadow-sm py-3 mb-4 text-center">
                  <FaCheckCircle className="me-2 mb-1 fs-5" /> Comentario enviado con éxito. ¡Muchas gracias!
                </Alert>
              )}

              {(validationError || error) && (
                <Alert variant="danger" className="rounded-3 border-0 shadow-sm py-3 mb-4 text-center">
                  <FaShieldAlt className="me-2 mb-1" /> {validationError || error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <div className="mb-4 text-center bg-light p-3 rounded-3">
                  <label className="d-block fw-bold text-secondary text-uppercase small mb-2" style={{ letterSpacing: "0.5px" }}>Califique su experiencia</label>
                  <div className="d-flex justify-content-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star-rating ${(hoverRating || formData.calificacion) >= star ? "active" : ""}`}
                        onClick={() => setFormData({ ...formData, calificacion: star })}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        <FaStar />
                      </span>
                    ))}
                  </div>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-dark small text-uppercase">Nombre Completo</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted"><FaUser /></span>
                    <Form.Control
                      type="text"
                      name="nombre"
                      placeholder="Ingrese su nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="border-start-0 bg-light py-2 px-3"
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold text-dark small text-uppercase">Número de Celular</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted"><FaPhoneAlt /></span>
                    <Form.Control
                      type="tel"
                      name="celular"
                      placeholder="Ingrese su celular"
                      value={formData.celular}
                      onChange={handleChange}
                      className="border-start-0 bg-light py-2 px-3"
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-dark small text-uppercase">Mensaje o Sugerencia</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="mensaje"
                    placeholder="Cuéntenos en qué podemos mejorar o qué le pareció nuestro servicio..."
                    value={formData.mensaje}
                    onChange={handleChange}
                    className="bg-light p-3"
                  />
                </Form.Group>

                <Button variant="danger" type="submit" size="lg" className="w-100 fw-bold py-3 rounded-pill d-flex align-items-center justify-content-center gap-2 shadow-sm text-uppercase" disabled={enviando}>
                  {enviando ? "Enviando..." : <><FaPaperPlane /> Enviar Comentario</>}
                </Button>
              </Form>
            </Card>
          </Col>

          <Col lg={5}>
            <div className="info-side-card">
              <h4 className="fw-bold text-dark mb-3">¿Por qué importa su opinión?</h4>
              <p className="text-muted mb-4" style={{ lineHeight: "1.7" }}>
                Cada reseña y sugerencia es revisada directamente por nuestro equipo de calidad para optimizar nuestros procesos, desde la cocina hasta la entrega a domicilio.
              </p>
              <div className="d-flex align-items-start mb-4">
                <div className="info-icon">
                  <FaStar />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-1">Compromiso de Calidad</h6>
                  <p className="text-muted small mb-0" style={{ lineHeight: "1.6" }}>Trabajamos cada día para ofrecerle el mejor pollo a la brasa del mercado.</p>
                </div>
              </div>
              <div className="d-flex align-items-start mb-4">
                <div className="info-icon">
                  <FaCommentAlt />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-1">Atención Personalizada</h6>
                  <p className="text-muted small mb-0" style={{ lineHeight: "1.6" }}>Si requiere soporte inmediato con un pedido, contáctenos directamente por teléfono.</p>
                </div>
              </div>
              <div className="d-flex align-items-start">
                <div className="info-icon">
                  <FaHeart />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-1">Gracias por su confianza</h6>
                  <p className="text-muted small mb-0" style={{ lineHeight: "1.6" }}>Su experiencia nos ayuda a mejorar día a día.</p>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <div className="mt-5">
          <h3 className="fw-bold mb-3">Opiniones de nuestros clientes</h3>
          {comentarios.length === 0 && <p className="text-muted">Aún no hay comentarios.</p>}
          <Row className="g-3">
            {comentarios.map((c) => (
              <Col md={6} key={c.id}>
                <Card className="border-0 shadow-sm p-3 h-100" style={{ borderRadius: 16 }}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="fw-bold">{c.customer_name}</div>
                    <div className="text-warning">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <i key={s} className={`bi ${s <= (c.rating || 5) ? "bi-star-fill" : "bi-star"} me-1`}></i>
                      ))}
                    </div>
                  </div>
                  <p className="text-muted mb-2" style={{ fontSize: "0.9rem", fontStyle: "italic" }}>"{c.message}"</p>
                  <div className="text-muted small">{timeAgo(c.created_at)}</div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  );
}