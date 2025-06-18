"use client";

import React from "react";

interface EmployeeRowProps {
  empleado: {
    id: number;
    nombre: string;
    nombrePuesto: string;
  };
  handleDelete: (id: number) => void;
  handleEdit: (empleado: {
    id: number;
    nombre: string;
    nombrePuesto: string;
  }) => void;
  handleImpersonate: (id: number) => void; // Nueva función para impersonar
}

const EmployeeRow: React.FC<EmployeeRowProps> = ({
  empleado,
  handleDelete,
  handleEdit,
  handleImpersonate, // Recibir la función como prop
}) => {
  return (
    <tr>
      <td>{empleado.id}</td>
      <td>{empleado.nombre}</td>
      <td>{empleado.nombrePuesto}</td>
      <td>
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