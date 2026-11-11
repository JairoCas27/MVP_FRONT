import React, { useState } from "react";
import SidebarCocina from "../components/SidebarCocina";
import { Outlet } from "react-router-dom";

export default function CocinaLayout() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div style={{ minHeight: "100vh", display: "flex", backgroundColor: "#fff0f3" }}>
      <SidebarCocina isOpen={isOpen} setIsOpen={setIsOpen} />
      <div style={{ flexGrow: 1, marginLeft: isOpen ? "240px" : "80px", transition: "margin-left 0.3s ease", padding: "2rem", minHeight: "100vh", overflowY: "auto", backgroundColor: "#fff0f3" }}>
        <Outlet />
      </div>
    </div>
  );
}