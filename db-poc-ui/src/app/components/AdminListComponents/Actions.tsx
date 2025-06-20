"use client";

import React from "react";

interface ActionsProps {
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
}

const Actions: React.FC<ActionsProps> = ({
  empleado,
  handleDelete,
  handleQuery,
  handleEdit,
  handleMovementList,
  handleInsertMovement,
}) => {
  return (
    <>
      <button className="button_actions" onClick={() => handleQuery(empleado)}>
        Consultar
      </button>
      <button className="button_actions" onClick={() => handleEdit(empleado)}>
        Modificar
      </button>
      <button className="button_actions" onClick={() => handleMovementList(empleado)}>
        Listar Movimientos
      </button>
      <button className="button_actions" onClick={() => handleInsertMovement(empleado)}>
        Insertar Movimientos
      </button>
      <button className="button_actions" onClick={() => handleDelete(empleado.id)}>Eliminar</button>
    </>
  );
};
export default Actions;