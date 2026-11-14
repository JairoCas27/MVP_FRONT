import React, { useState, useEffect } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (mobile) setIsOpen(false);
      else setIsOpen(true);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", backgroundColor: "#fff0f3" }}>
      <SidebarAdmin isOpen={isOpen} setIsOpen={setIsOpen} isMobile={isMobile} />

      {isMobile && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 1100,
            width: 48,
            height: 48,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "linear-gradient(135deg, #1a1210 0%, #2b1f1a 100%)",
            color: "#fff",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(214,52,71,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            backdropFilter: "blur(8px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px) scale(1.05)";
            e.currentTarget.style.boxShadow = "0 12px 28px rgba(214,52,71,0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(214,52,71,0.2)";
          }}
        >
          <i className="bi bi-list" style={{ fontSize: "1.4rem" }}></i>
        </button>
      )}

      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
        ></div>
      )}

      <div
        style={{
          flexGrow: 1,
          marginLeft: isMobile ? 0 : (isOpen ? "240px" : "80px"),
          transition: "margin-left 0.3s ease",
          padding: isMobile ? "1rem" : "2rem",
          minHeight: "100vh",
          overflowY: "auto",
          backgroundColor: "#fff0f3",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}