///Descripción: Componente de los botones de acciones

"use client";

import React from 'react';
import Actions from './Actions';

interface EmployeeRowProps {
  empleado: { id: number; nombre: string; documento: string; nombrePuesto: string; saldoVacaciones: number; };
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

const EmployeeRow: React.FC<EmployeeRowProps> = ({ empleado, handleDelete, handleQuery, handleEdit, handleMovementList, handleInsertMovement , handleRequestVacation}) => {
  return (
    <tr>
      <td>{empleado.nombre}</td>
      <td>{empleado.documento}</td>
      <td>
        <Actions empleado={empleado} handleDelete={handleDelete} handleQuery={handleQuery} handleEdit={handleEdit} handleMovementList={handleMovementList} handleInsertMovement={handleInsertMovement} handleRequestVacation={handleRequestVacation}/>
      </td>
    </tr>
  );
};

export default EmployeeRow;