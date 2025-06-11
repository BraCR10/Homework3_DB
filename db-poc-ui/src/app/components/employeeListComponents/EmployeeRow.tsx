"use client";

import React from "react";
import Actions from "./Actions";

interface EmployeeRowProps {
  empleado: {
    id: number;
    nombre: string;
    documento: string;
    nombrePuesto: string;
  };
  handleDelete: (id: number) => void;
  handleQuery: (empleado: {
    id: number;
    nombre: string;
    documento: string;
    nombrePuesto: string;
  }) => void;
  handleEdit: (empleado: {
    id: number;
    nombre: string;
    documento: string;
    nombrePuesto: string;
  }) => void;
  handleMovementList: (empleado: {
    id: number;
    nombre: string;
    documento: string;
    nombrePuesto: string;
  }) => void;
  handleInsertMovement: (empleado: {
    id: number;
    nombre: string;
    documento: string;
    nombrePuesto: string;
  }) => void;
}

const EmployeeRow: React.FC<EmployeeRowProps> = ({
  empleado,
  handleDelete,
  handleQuery,
  handleEdit,
  handleMovementList,
  handleInsertMovement,
}) => {
  return (
    <tr>
      <td>{empleado.nombre}</td>
      <td>{empleado.documento}</td>
      <td>{empleado.nombrePuesto}</td>
      <td>
        <Actions
          empleado={empleado}
          handleDelete={handleDelete}
          handleQuery={handleQuery}
          handleEdit={handleEdit}
          handleMovementList={handleMovementList}
          handleInsertMovement={handleInsertMovement}
        />
      </td>
    </tr>
  );
};

export default EmployeeRow;