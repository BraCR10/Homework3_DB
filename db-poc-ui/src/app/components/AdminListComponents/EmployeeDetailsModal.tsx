"use client";

import React, { useState, useEffect } from "react";
import '../../styles/employeeDetailsModal.css'

interface EmployeeDetailsModalProps {
  employee: {
    id: number;
    nombre: string;
    documento: string;
    nombrePuesto: string;
    saldoVacaciones: number;
  };
  onClose: () => void;
}

const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({ employee, onClose }) => {
  const [documento, setDocumento] = useState(employee.documento);
  const [nombre, setNombre] = useState(employee.nombre);
  const [nombrePuesto, setNombrePuesto] = useState(employee.nombrePuesto);
  const [saldoVacaciones, setSaldoVacaciones] = useState(employee.saldoVacaciones);

  // Efecto para sincronizar los datos del empleado si cambian
  useEffect(() => {
    setDocumento(employee.documento);
    setNombre(employee.nombre);
    setNombrePuesto(employee.nombrePuesto);
    setSaldoVacaciones(employee.saldoVacaciones);
  }, [employee]);

  return (
    <div className="employee-details-modal-overlay">
      <div className="employee-details-modal-content">
        <h3>Detalles del Empleado</h3>
        <p>
          <strong>Documento de Identidad:</strong> {documento}
        </p>
        <p>
          <strong>Nombre:</strong> {nombre}
        </p>
        <p>
          <strong>Nombre del Puesto:</strong> {nombrePuesto}
        </p>
        <p>
          <strong>Saldo de Vacaciones:</strong> {saldoVacaciones}
        </p>
        <button onClick={onClose} className="employee-details-close-button">
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default EmployeeDetailsModal;