"use client";
import "./styles/globals.css";
import EmployeeLayout from "./employee/EmployeeLayout";
import WeeklyPayroll from "./employee/WeeklyPayroll";
import MonthlyPayroll from "./employee/MonthlyPayroll";
import LoginForm from "./components/loginComponents/LoginForm";
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
  const [loading, setLoading] = useState(true);

  // Recupera el usuario del localStorage al cargar la app
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      setUser(JSON.parse(usuarioGuardado));
    }
    setLoading(false);
  }, []);

  // Función de logout (elimina usuario y recarga)
  const handleLogout = () => {
    localStorage.removeItem("usuario");
    setUser(null);
    window.location.reload();
  };

  // Mientras verifica el localStorage
  if (loading) {
    return (
      <html lang="es">
        <body>
          <div style={{ color: "#fff", textAlign: "center", marginTop: "40vh" }}>Cargando...</div>
        </body>
      </html>
    );
  }

  // Si no hay usuario, muestra el login
  if (!user) {
    return (
      <html lang="es">
        <body>
          <LoginForm />
        </body>
      </html>
    );
  }

  // Si es empleado, muestra solo la UI de empleado
  if (user.Role === "Employee" || user.IdTipoUsuario === 2) {
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