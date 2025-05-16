//Descripción: Componente que carga la tabla de empleados real

"use client";

import React from 'react';
import EmployeeRow from './EmployeeRow';
import '../../styles/employee.css'

interface EmployeeTableProps {
  empleados: { id: number; nombre: string; documento: string; nombrePuesto: string; saldoVacaciones: number; }[];
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

const EmployeeTable: React.FC<EmployeeTableProps> = ({ empleados, handleDelete, handleQuery, handleEdit, handleMovementList, handleInsertMovement,handleRequestVacation }) => {
  return (
    <table className="empleados-tabla">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Documento</th>
          <th className='a'>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {empleados.map((empleado) => (
          <EmployeeRow key={empleado.id} empleado={empleado} handleDelete={handleDelete} handleQuery={handleQuery} handleEdit={handleEdit} handleMovementList={handleMovementList} handleInsertMovement={handleInsertMovement} handleRequestVacation={handleRequestVacation}/>
        ))}
      </tbody>
    </table>
  );
};

export default EmployeeTable;