"use client";

import React from "react";
import EmployeeRow from "./EmployeeRow";
import "../../styles/employee.css";

interface EmployeeTableProps {
  empleados: {
    id: number;
    nombre: string;
    nombrePuesto: string;
  }[];
  handleEdit: (empleado: {
    id: number;
    nombre: string;
    nombrePuesto: string;
  }) => void;
  handleDelete: (id: number) => void;
  handleQuery: (empleado: {
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
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  empleados,
  handleEdit,
  handleDelete,
  handleQuery,
  handleMovementList,
  handleInsertMovement,
}) => {
  return (
    <table className="empleados-tabla">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Puesto</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {empleados.map((empleado) => (
          <EmployeeRow
            key={empleado.id}
            empleado={empleado}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleQuery={handleQuery}
            handleMovementList={handleMovementList}
            handleInsertMovement={handleInsertMovement}
          />
        ))}
      </tbody>
    </table>
  );
};

export default EmployeeTable;