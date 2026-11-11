import React, { useState, useEffect } from "react";
import { Container, Card, Button, Modal, Form, Alert, Spinner, Badge } from "react-bootstrap";
import { API_HOST } from "../../services/api";

const styles = `
  .fb-card {
    background: #fff;
    border-radius: 18px;
    padding: 22px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
    border: 1px solid rgba(0,0,0,0.05);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    height: 100%;
  }
  .fb-card:hover { transform: translateY(-4px); box-shadow: 0 14px 32px rgba(0,0,0,0.1); }
  .fb-card.hidden { opacity: 0.5; background: #f9fafb; }
  .star { color: #f6ad55; }
`;

export default function FeedbacksList() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ message: "", rating: 5, customer_name: "", is_visible: true });
  const token = localStorage.getItem("token");

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_HOST}/api/admin/feedbacks`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al cargar opiniones");
      setFeedbacks(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeedbacks(); }, []);

  const openEdit = (fb) => {
    setEditing(fb);
    setEditForm({
      message: fb.message,
      rating: fb.rating || 5,
      customer_name: fb.customer_name,
      is_visible: fb.is_visible !== false,
    });
  };

  const saveEdit = async () => {
    try {
      const res = await fetch(`${API_HOST}/api/admin/feedbacks/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al guardar");
      setEditing(null);
      fetchFeedbacks();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleVisible = async (fb) => {
    try {
      await fetch(`${API_HOST}/api/admin/feedbacks/${fb.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_visible: !(fb.is_visible !== false) }),
      });
      fetchFeedbacks();
    } catch (e) {}
  };

  const remove = async (fb) => {
    if (!window.confirm("¿Eliminar este comentario?")) return;
    try {
      await fetch(`${API_HOST}/api/admin/feedbacks/${fb.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFeedbacks();
    } catch (e) {}
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="danger" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container fluid>
      <style>{styles}</style>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Opiniones de Clientes</h2>
          <p className="text-muted mb-0">Gestión de comentarios y valoraciones</p>
        </div>
        <Badge bg="danger" className="fs-6 px-3 py-2">{feedbacks.length} opiniones</Badge>
      </div>

      {feedbacks.length === 0 ? (
        <div className="text-center py-5 text-muted">No hay opiniones registradas.</div>
      ) : (
        <div className="row g-3">
          {feedbacks.map((fb) => (
            <div className="col-md-6 col-lg-4" key={fb.id}>
              <div className={`fb-card ${fb.is_visible === false ? "hidden" : ""}`}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h5 className="fw-bold mb-0">{fb.customer_name}</h5>
                    <div className="text-muted small">{fb.phone}</div>
                  </div>
                  <div className="text-warning">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <i key={s} className={`bi ${s <= (fb.rating || 5) ? "bi-star-fill" : "bi-star"} star me-1`}></i>
                    ))}
                  </div>
                </div>
                <p className="text-muted mb-3" style={{ fontSize: "0.9rem", fontStyle: "italic" }}>
                  "{fb.message}"
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">{fb.created_at}</span>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-secondary" onClick={() => openEdit(fb)}>
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button size="sm" variant={fb.is_visible === false ? "outline-success" : "outline-warning"} onClick={() => toggleVisible(fb)}>
                      <i className={`bi ${fb.is_visible === false ? "bi-eye" : "bi-eye-slash"}`}></i>
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => remove(fb)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal show={!!editing} onHide={() => setEditing(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar comentario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control value={editForm.customer_name} onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Calificación</Form.Label>
            <div>
              {[1, 2, 3, 4, 5].map((s) => (
                <i
                  key={s}
                  className={`bi ${s <= editForm.rating ? "bi-star-fill" : "bi-star"} text-warning me-2`}
                  style={{ cursor: "pointer", fontSize: "1.4rem" }}
                  onClick={() => setEditForm({ ...editForm, rating: s })}
                ></i>
              ))}
            </div>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mensaje</Form.Label>
            <Form.Control as="textarea" rows={3} value={editForm.message} onChange={(e) => setEditForm({ ...editForm, message: e.target.value })} />
          </Form.Group>
          <Form.Check
            type="switch"
            label="Visible"
            checked={editForm.is_visible}
            onChange={(e) => setEditForm({ ...editForm, is_visible: e.target.checked })}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button>
          <Button variant="danger" onClick={saveEdit}>Guardar</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}