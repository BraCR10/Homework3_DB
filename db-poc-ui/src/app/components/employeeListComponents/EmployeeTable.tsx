"use client";

import React from "react";
import EmployeeRow from "./EmployeeRow";

interface EmployeeTableProps {
  empleados: {
    id: number;
    nombre: string;
    nombrePuesto: string;
  }[];
  handleDelete: (id: number) => void;
  handleQuery: (empleado: {
    id: number;
    nombre: string;
    nombrePuesto: string;
  }) => void;
  handleEdit: (empleado: {
    id: number;
    nombre: string;
    nombrePuesto: string;
  }) => void;
  handleMovementList: (empleado: {
    id: number;
    nombre: string;
    nombrePuesto: string;
  }) => void;
  handleInsertMovement: (empleado: {
    id: number;
    nombre: string;
    nombrePuesto: string;
  }) => void;
  handleImpersonate: (id: number) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  empleados,
  handleDelete,
  handleEdit,
  handleImpersonate,
}) => {
  if (empleados.length === 0) {
    return <p>No hay empleados para mostrar.</p>;
  }
  return (
    <table className="empleados-tabla">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Puesto</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {empleados.map((empleado) => (
          <EmployeeRow
            key={empleado.id} // Agregar la propiedad `key` única
            empleado={empleado}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
            handleImpersonate={handleImpersonate}
          />
        ))}
      </tbody>
    </table>
  );
};

export default EmployeeTable;