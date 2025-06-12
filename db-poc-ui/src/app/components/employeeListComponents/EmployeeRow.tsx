"use client";

import React from "react";

interface EmployeeRowProps {
  empleado: {
    id: number;
    nombre: string;
    nombrePuesto: string;
  };
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
  handleImpersonate: (id: number) => void; // Nueva función para impersonar
}

const EmployeeRow: React.FC<EmployeeRowProps> = ({
  empleado,
  handleDelete,
  handleQuery,
  handleEdit,
  handleMovementList,
  handleInsertMovement,
  handleImpersonate, // Recibir la función como prop
}) => {
  return (
    <tr>
      <td>{empleado.id}</td>
      <td>{empleado.nombre}</td>
      <td>{empleado.nombrePuesto}</td>
      <td>
        <button
          onClick={() => handleQuery(empleado)}
          className="consultar-boton"
        >
          Consultar
        </button>
        <button
          onClick={() => handleMovementList(empleado)}
          className="movimientos-boton"
        >
          Movimientos
        </button>
        <button
          onClick={() => handleInsertMovement(empleado)}
          className="insertar-movimiento-boton"
        >
          Insertar Movimiento
        </button>
        <button
          onClick={() => handleImpersonate(empleado.id)}
          className="impersonar-boton"
        >
          Impersonar
        </button>
        <button
          onClick={() => handleEdit(empleado)}
          className="editar-boton"
        >
          Editar
        </button>
        <button
          onClick={() => handleDelete(empleado.id)}
          className="eliminar-boton"
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
};

export default EmployeeRow;