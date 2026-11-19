import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import Logo from "../assets/logo.png";

function MyFooter() {
  return (
    <footer>
      <style>
        {`
          .footer-dark {
            background: linear-gradient(135deg, #181515 0%, #110e0e 100%);
            color: #f0f0f0;
            padding: 40px 0 30px 0;
            border-top: none;
            position: relative;
            overflow: hidden;
          }
          
          .footer-bottom {
            background-color: #0c0a0a;
            color: #888888;
            padding: 16px 0;
            text-align: center;
            border-top: 1px solid #241d1d;
          }

          .footer-logo {
            max-height: 95px;
            width: auto;
            object-fit: contain;
            filter: drop-shadow(0 4px 12px rgba(255, 77, 77, 0.25));
            transition: transform 0.3s ease;
          }

          .footer-logo:hover {
            transform: scale(1.04);
          }

          .social-btn {
            width: 44px;
            height: 44px;
            background-color: #241d1d;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            border: 1px solid #332828;
          }

          .social-btn i {
            color: #f0f0f0;
            font-size: 1.2rem;
            transition: color 0.3s ease;
          }

          .social-btn:hover {
            background-color: #FF4D4D;
            transform: translateY(-4px);
            border-color: #FF4D4D;
            box-shadow: 0 6px 15px rgba(255, 77, 77, 0.4);
          }

          .social-btn:hover i {
            color: #ffffff;
          }

          .info-text {
            font-size: 1rem;
            font-weight: 300;
            margin-bottom: 0.5rem !important;
          }

          .info-link {
            color: #f0f0f0;
            text-decoration: none;
            transition: color 0.2s ease;
          }

          .info-link:hover {
            color: #FF4D4D !important;
          }

          .icon-accent {
            color: #FF4D4D;
            margin-right: 10px;
            font-size: 1.1rem;
            text-shadow: 0 0 10px rgba(255, 77, 77, 0.3);
          }

          .footer-divider {
            border-color: #2b2222 !important;
          }
        `}
      </style>

      <div className="footer-dark">
        <Container>
          <Row className="align-items-center text-center text-md-start">
            <Col md={6} className="mb-4 mb-md-0 d-flex flex-column align-items-center align-items-md-start border-md-end footer-divider">
              
              <div className="mb-3 ps-md-4">
                <img src={Logo} alt="La Fogata Logo" className="footer-logo" />
              </div>
              
              <p className="info-text">
                <i className="bi bi-telephone-fill icon-accent"></i>
                Delivery: <a href="tel:5521836" className="info-link fw-bold text-white">552-1836</a>
              </p>

              <p className="info-text">
                <i className="bi bi-whatsapp icon-accent"></i>
                WhatsApp:{" "}
                <a href="https://wa.me/51917508175" target="_blank" rel="noopener noreferrer" className="info-link fw-bold text-white">
                  917 508 175
                </a>
                {" / "}
                <a href="https://wa.me/51950026505" target="_blank" rel="noopener noreferrer" className="info-link fw-bold text-white">
                  950 026 505
                </a>
              </p>

              <p className="info-text fw-bold text-white mb-0">
                <i className="bi bi-geo-alt-fill icon-accent"></i>
                Ancón - Lima - Perú
              </p>
            </Col>

            <Col md={6} className="text-center d-flex flex-column align-items-center">
              <h6 className="text-uppercase fw-bold mb-3" style={{ letterSpacing: "3px", color: "#b8b8b8", fontSize: "0.9rem" }}>
                Síguenos en nuestras redes
              </h6>
              <div className="d-flex justify-content-center gap-3">
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Facebook">
                  <i className="bi bi-facebook"></i>
                </a>
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Instagram">
                  <i className="bi bi-instagram"></i>
                </a>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Twitter X">
                  <i className="bi bi-twitter-x"></i>
                </a>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <div className="footer-bottom">
        <Container>
          <small className="text-uppercase" style={{ letterSpacing: "1.5px", fontSize: "0.75rem" }}>
            © 2026 La Fogata. Todos los Derechos Reservados.
          </small>
        </Container>
      </div>
    </footer>
  );
}

export default MyFooter;