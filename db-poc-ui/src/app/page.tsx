"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "./components/loginComponents/LoginForm";
import EmployeeList from "./components/AdminListComponents/EmployeeList";
import WeeklyPayroll from "./employee/WeeklyPayroll";
import MonthlyPayroll from "./employee/MonthlyPayroll";

export default function Page() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Limpiar el localStorage al iniciar la aplicación
    localStorage.clear();

    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    if (!usuario.Role) {
      // Si no hay usuario, muestra el login
      setUserRole(null);
    } else {
      // Si hay usuario, establece el rol
      setUserRole(usuario.Role);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!userRole) {
    // Mostrar el formulario de login si no hay usuario
    return <LoginForm />;
  }

  if (userRole === "Administrador") {
    // Mostrar el panel de administración si el usuario es administrador
    return (
      <div className="admin-panel">
        <h1>Panel de Administración</h1>
        <EmployeeList />
      </div>
    );
  }

  if (userRole === "Empleado") {
    // Mostrar las planillas si el usuario es empleado
    return (
      <div className="employee-panel">
        <h1>Planillas</h1>
        <WeeklyPayroll userId={JSON.parse(localStorage.getItem("usuario") || "{}").Id} />
        <MonthlyPayroll userId={JSON.parse(localStorage.getItem("usuario") || "{}").Id} />
      </div>
    );
  }

  // Si el rol no es válido, fuerza logout
  localStorage.removeItem("usuario");
  router.push("/login");
  return null;
}