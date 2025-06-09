"use client";
import "./styles/globals.css";
import EmployeeLayout from "./employee/EmployeeLayout";
import WeeklyPayroll from "./employee/WeeklyPayroll";
import MonthlyPayroll from "./employee/MonthlyPayroll";
import React, { useEffect, useState } from "react";

// Define la interfaz para el usuario autenticado
interface AuthUser {
  Id: number;
  Username: string;
  Role?: string;
  IdTipoUsuario?: number;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Recupera el usuario del localStorage al cargar la app
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      setUser(JSON.parse(usuarioGuardado));
    }
  }, []);

  // Función de logout (elimina usuario y recarga)
  const handleLogout = () => {
    localStorage.removeItem("usuario");
    setUser(null);
    window.location.reload();
  };

  // Loader mientras carga el usuario
  if (user === null) {
    return (
      <html lang="es">
        <body>
          <div style={{ color: "#fff", textAlign: "center", marginTop: "40vh" }}>Cargando...</div>
        </body>
      </html>
    );
  }

  // Si es empleado, muestra solo la UI de empleado
  if (user.Role === "Empleado" || user.IdTipoUsuario === 2) {
    return (
      <html lang="es">
        <body>
          <EmployeeLayout onLogout={handleLogout}>
            <WeeklyPayroll userId={user.Id} />
            <MonthlyPayroll userId={user.Id} />
          </EmployeeLayout>
        </body>
      </html>
    );
  }

  // Si es admin, muestra la app normal (todas las rutas y children)
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}