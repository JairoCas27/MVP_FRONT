import { useState, useEffect } from "react";
import { API_HOST } from "../services/api";

export function useTrackingOrder(orderId) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`${API_HOST}/api/public/tracking/${orderId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("No se pudo encontrar el pedido");
        }
        return res.json();
      })
      .then((data) => {
        setOrder(data.data);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [orderId]);

  return { order, setOrder, loading, error };
}

export function useCreateOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createOrder = async (orderPayload) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("clientToken");
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(`${API_HOST}/api/public/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al procesar el pedido");
      }

      setLoading(false);
      return data.data?.tracking_id || data.tracking_id;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { createOrder, loading, error };
}