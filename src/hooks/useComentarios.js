import { useState, useEffect } from "react";
import { API_HOST } from "../services/api";

export function useComentarios() {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);

  const enviarComentario = async (comentarioData) => {
    setEnviando(true);
    setError(null);
    setExito(false);

    try {
      const response = await fetch(`${API_HOST}/api/public/feedbacks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customer_name: comentarioData.nombre,
          phone: comentarioData.celular,
          message: comentarioData.mensaje,
          rating: comentarioData.calificacion || 5
        })
      });

      if (!response.ok) {
        throw new Error("Error al enviar el comentario");
      }

      const data = await response.json();
      setExito(true);
      setEnviando(false);
      return data;
    } catch (err) {
      setError(err.message);
      setEnviando(false);
      throw err;
    }
  };

  return { enviarComentario, enviando, error, exito };
}