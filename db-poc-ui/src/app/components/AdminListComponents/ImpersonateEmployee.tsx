"use client";

import React, { useEffect, useState } from "react";
import WeeklyPayroll from "../../employee/WeeklyPayroll";
import MonthlyPayroll from "../../employee/MonthlyPayroll";

const url: string = "http://localhost:3050";

interface ImpersonateEmployeeProps {
  employeeId: number; // ID del empleado a impersonar
  onStopImpersonation: () => void; // Función para regresar a la vista de administrador
}

export default function ImpersonateEmployee({ employeeId, onStopImpersonation }: ImpersonateEmployeeProps) {
  const [employeeInfo, setEmployeeInfo] = useState<{
    Name: string;
    DateBirth?: string;
    DNI: string;
    Position: string;
    Department: string;
  } | null>(null);

  useEffect(() => {
    const impersonateEmployee = async () => {
      try {
        // Limpia el estado antes de cargar nuevos datos
        setEmployeeInfo(null);
        
        const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");

        if (!usuarioGuardado.Id) {
          console.error("No se encontró un usuario logueado.");
          alert("No se encontró un usuario logueado.");
          return;
        }

        const userId = usuarioGuardado.Id.toString();

        const response = await fetch(`${url}/api/v2/employees/${employeeId}/impersonate`, {
          method: "POST",
          headers: {
            "User-Id": userId,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setEmployeeInfo(data.data.employeeInfo);
          localStorage.setItem("impersonating", JSON.stringify({ employeeId, adminId: usuarioGuardado.Id }));
        } else {
          const errorData = await response.json();
          console.error("Error al impersonar empleado:", errorData.error.detail);
          alert(`Error: ${errorData.error.detail}`);
        }
      } catch (error) {
        console.error("Error al realizar la solicitud:", error);
        alert("Ocurrió un error al intentar impersonar el empleado.");
      }
    };

    impersonateEmployee();
  }, [employeeId]);

  const stopImpersonation = async () => {
    try {
      const impersonatingData = JSON.parse(localStorage.getItem("impersonating") || "{}");

      if (!impersonatingData.adminId) {
        console.error("No se encontró información de impersonación.");
        alert("No se encontró información de impersonación.");
        return;
      }

      const response = await fetch(`${url}/api/v2/employees/${employeeId}/stop-impersonation`, {
        method: "POST",
        headers: {
          "User-Id": impersonatingData.adminId.toString(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        localStorage.removeItem("impersonating");
        onStopImpersonation();
      } else {
        const errorData = await response.json();
        console.error("Error al terminar impersonación:", errorData.error.detail);
        alert(`Error: ${errorData.error.detail}`);
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
      alert("Ocurrió un error al intentar terminar la impersonación.");
    }
  };

  if (!employeeInfo) {
    return <div>Cargando información del empleado...</div>;
  }

  return (
    <div className="impersonate-employee-container">
      <h2>Impersonando a {employeeInfo.Name}</h2>
      <p><strong>Departamento:</strong> {employeeInfo.Department}</p>
      <p><strong>Puesto:</strong> {employeeInfo.Position}</p>
      <p><strong>DNI:</strong> {employeeInfo.DNI}</p>
      <p><strong>Fecha de Nacimiento:</strong> {employeeInfo.DateBirth || "No disponible"}</p>

      {/* Mostrar las interfaces de empleado */}
      <WeeklyPayroll userId={employeeId} />
      <MonthlyPayroll userId={employeeId} />

      {/* Botón para regresar a la vista de administrador */}
      <button onClick={stopImpersonation} className="stop-impersonation-button">
        Regresar a vista de administrador
      </button>
    </div>
  );
}