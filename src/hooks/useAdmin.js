import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { API_HOST } from "../services/api";

export function useActiveOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay token de autenticación. Inicia sesión como administrador.");
      }

      const response = await fetch(`${API_HOST}/api/admin/orders/active`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al cargar pedidos activos");
      setOrders(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const socket = io(API_HOST);

    socket.on("connect", () => {
      socket.emit("unirse_admin");
    });

    socket.on("nuevo_pedido", (newOrder) => {
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.value = 0.15;
        osc.start();
        setTimeout(() => { osc.stop(); ctx.close(); }, 250);
      } catch (e) {}
    });

    socket.on("actualizacion_estado", (updated) => {
      setOrders((prevOrders) => {
        if (updated.status === "FINALIZADO" || updated.status === "CANCELADO") {
          return prevOrders.filter((o) => o.id !== updated.order_id);
        }
        return prevOrders.map((o) => {
          if (o.id === updated.order_id) {
            return { ...o, status: updated.status };
          }
          return o;
        });
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const advanceOrderState = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_HOST}/api/admin/orders/${orderId}/next-state`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al actualizar estado");
      return data;
    } catch (err) {
      throw err;
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_HOST}/api/admin/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al cancelar pedido");
      return data;
    } catch (err) {
      throw err;
    }
  };

  return { orders, loading, error, advanceOrderState, cancelOrder, refetch: fetchOrders };
}

export function useFeedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No hay token de autenticación. Inicia sesión como administrador.");
        }

        const response = await fetch(`${API_HOST}/api/admin/feedbacks`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al cargar opiniones");
        setFeedbacks(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  return { feedbacks, loading, error };
}

export function useRevenue() {
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No hay token de autenticación. Inicia sesión como administrador.");
        }

        const response = await fetch(`${API_HOST}/api/admin/revenue`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al calcular ganancias");
        setRevenue(data.data.total_revenue);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, []);

  return { revenue, loading, error };
}