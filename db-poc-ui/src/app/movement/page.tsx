"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import EmployeeMovementList from "../components/movementListComponents/employeeMovementList";

const Movement = () => {
  const searchParams = useSearchParams();

  // Decodificar los parámetros de la URL
  const employeeId = Number(searchParams.get("employeeId"));
  const employeeName = searchParams.get("employeeName") || "";
  const employeeDocumento = searchParams.get("employeeDocumento") || "";
  const employeeSaldoVacaciones = Number(searchParams.get("employeeSaldoVacaciones"));
  const movimientos = JSON.parse(decodeURIComponent(searchParams.get("movimientos") || "[]"));

  return (
    <EmployeeMovementList
      employee={{
        id: employeeId,
        nombre: employeeName,
        documento: employeeDocumento,
        saldoVacaciones: employeeSaldoVacaciones,
      }}
      movimientos={movimientos}
    />
  );
};

export default Movement;