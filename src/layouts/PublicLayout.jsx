import React, { useState, useEffect } from "react";
import MyNavbar from "../components/MyNavbar";
import MyFooter from "../components/MyFooter";
import CarritoBoton from "../components/CarritoBoton";
import WhatsappBoton from "../components/WhatsappBoton";
import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem("carrito");
    return guardado ? JSON.parse(guardado) : [];
  });

  const [isCarritoOpen, setIsCarritoOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  useEffect(() => {
    const clear = () => setCarrito([]);
    window.addEventListener("cartClear", clear);
    return () => window.removeEventListener("cartClear", clear);
  }, [setCarrito]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <MyNavbar />
      
      <main className="flex-grow-1" style={{ paddingTop: "96px" }}>
        <Outlet context={{ carrito, setCarrito }} />
      </main>

      <CarritoBoton 
        carrito={carrito} 
        setCarrito={setCarrito} 
        showOffcanvas={isCarritoOpen}
        setShowOffcanvas={setIsCarritoOpen}
      />

      {!isCarritoOpen && <WhatsappBoton />}

      <MyFooter />
    </div>
  );
}