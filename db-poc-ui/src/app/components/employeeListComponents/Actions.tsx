"use client";

import React from 'react';

interface ActionsProps {
  empleado: {
    id: number;
    nombre: string;
    documento: string;
    nombrePuesto: string;
    saldoVacaciones: number;
  };
  handleDelete: (id: number) => void;
  handleQuery: (empleado: {
    id: number;
    nombre: string;
    documento: string;
    nombrePuesto: string;
    saldoVacaciones: number;
  }) => void;
  handleEdit: (empleado: {
    id: number;
    nombre: string;
    documento: string;
    nombrePuesto: string;
    saldoVacaciones: number;
  }) => void;
  handleMovementList: (empleado: {
    id: number;
    nombre: string;
    documento: string;
    nombrePuesto: string;
    saldoVacaciones: number;
  }) => void;
  handleInsertMovement: (empleado: {
    id: number;
    nombre: string;
    documento: string;
    nombrePuesto: string;
    saldoVacaciones: number;
  }) => void;
  handleRequestVacation: (empleado: {
    id: number;
    nombre: string;
    documento: string;
    saldoVacaciones: number;
  }) => void;
}

const Actions: React.FC<ActionsProps> = ({ empleado, handleDelete, handleQuery, handleEdit, handleMovementList, handleInsertMovement,handleRequestVacation }) => {
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
      <button 
        className="button_actions"
        onClick={() => handleRequestVacation(empleado)}
      >
        Solicitar Vacaciones
      </button>
      <button onClick={() => handleDelete(empleado.id)}>Eliminar</button>
    </>
  );
};

export default Actions;