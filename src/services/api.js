const _raw = (import.meta.env.VITE_API_HOST || "").trim();
export const API_HOST = _raw ? _raw.replace(/\/+$/, "") : "https://mvp-back-m41z.onrender.com";