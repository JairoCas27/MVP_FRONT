import React, { useState, useEffect } from "react";
import SidebarCocina from "../components/SidebarCocina";
import { Outlet } from "react-router-dom";

export default function CocinaLayout() {
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
      {isMobile && (
        <button onClick={() => setIsOpen(true)} style={{ position: "fixed", top: 16, left: 16, zIndex: 1100, width: 44, height: 44, borderRadius: 12, border: "none", background: "#181515", color: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
          <i className="bi bi-list fs-4"></i>
        </button>
      )}
      {isMobile && isOpen && (
        <div onClick={() => setIsOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999 }}></div>
      )}
      <SidebarCocina isOpen={isOpen} setIsOpen={setIsOpen} isMobile={isMobile} />
      <div style={{ flexGrow: 1, marginLeft: isMobile ? 0 : (isOpen ? "240px" : "80px"), transition: "margin-left 0.3s ease", padding: isMobile ? "1rem" : "2rem", minHeight: "100vh", overflowY: "auto", backgroundColor: "#fff0f3" }}>
        <Outlet />
      </div>
    </div>
  );
}