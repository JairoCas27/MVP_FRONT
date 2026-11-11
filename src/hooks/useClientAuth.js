import { useState } from "react";
import { API_HOST } from "../services/api";

export function useClientAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_HOST}/api/auth/client/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al registrar");
      localStorage.setItem("clientToken", data.data.access_token);
      localStorage.setItem("clientUser", JSON.stringify(data.data.client));
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const login = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_HOST}/api/auth/client/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al iniciar sesión");
      localStorage.setItem("clientToken", data.data.access_token);
      localStorage.setItem("clientUser", JSON.stringify(data.data.client));
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("clientToken");
    localStorage.removeItem("clientUser");
  };

  const getProfile = async () => {
    const token = localStorage.getItem("clientToken");
    if (!token) return null;
    const res = await fetch(`${API_HOST}/api/auth/client/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al obtener perfil");
    localStorage.setItem("clientUser", JSON.stringify(data.data));
    return data.data;
  };

  const updateProfile = async (payload) => {
    const token = localStorage.getItem("clientToken");
    if (!token) throw new Error("No hay sesión");
    const isFormData = payload instanceof FormData;
    const headers = { Authorization: `Bearer ${token}` };
    if (!isFormData) headers["Content-Type"] = "application/json";
    const res = await fetch(`${API_HOST}/api/auth/client/profile`, {
      method: "PUT",
      headers,
      body: isFormData ? payload : JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al actualizar perfil");
    localStorage.setItem("clientUser", JSON.stringify(data.data));
    return data.data;
  };

  return { register, login, logout, getProfile, updateProfile, loading, error };
}