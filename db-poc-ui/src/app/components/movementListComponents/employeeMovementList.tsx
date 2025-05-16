"use client";

import React, {useState} from "react";
import { useRouter } from "next/navigation";
import InsertMovementModal from "./InsertMovementModal";
import "../../styles/employeeMovement.css"

interface Employee {
  id: number;
  nombre: string;
  documento: string;
  saldoVacaciones: number;
}

interface Movimiento {
  id: number;
  fecha: string;
  tipoMovimiento: string;
  monto: number;
  nuevoSaldo: number;
  usuario: string;
  ip: string;
  estampaTiempo: string;
}

interface EmployeeMovementListProps {
  employee: Employee;
  movimientos: Movimiento[];
}

const EmployeeMovementList: React.FC<EmployeeMovementListProps> = ({ employee, movimientos }) => {
  const router = useRouter();
  const [insertMovementModalVisible, setInsertMovementModalVisible] = useState(false);
  return (
    <div className="movements-container">
        <h2>Movimientos del empleado</h2>
      <p>
        <strong>Nombre:</strong> <span className="employee-info">{employee.nombre}</span>
      </p>
      <p>
        <strong>Documento de identidad:</strong> <span className="employee-info">{employee.documento}</span>
      </p>
      <p>
        <strong>Saldo de vacaciones:</strong> <span className="employee-info">{employee.saldoVacaciones}</span>
      </p>
      <button
          className="back-button"
          onClick={() => router.push("/employee")} // Redirigir a Employee
        >
          Regresar
        </button>
      <button 
        className="insertar-boton"
        onClick={() => setInsertMovementModalVisible(true)}
      >
          Insertar Movimiento
      </button>
      {insertMovementModalVisible && (
        <InsertMovementModal
          employee={employee}
          onClose={() => setInsertMovementModalVisible(false)}
          onSubmit={(newMovement) => {
            console.log("Nuevo movimiento registrado:", newMovement);
            router.push("/employee");
            setInsertMovementModalVisible(false); // Cerrar el modal después de registrar el movimiento
          }}
        />
      )}
      {movimientos.length === 0 ? (
        <p>No se encontraron movimientos para este empleado.</p>
      ) : (
        <table className="movements-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo de Movimiento</th>
              <th>Monto</th>
              <th>Nuevo Saldo</th>
              <th>Usuario</th>
              <th>IP</th>
              <th>Estampa de Tiempo</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((movimiento) => (
              <tr key={movimiento.id}>
                <td>{new Date(movimiento.fecha).toLocaleDateString()}</td>
                <td>{movimiento.tipoMovimiento}</td>
                <td>{movimiento.monto}</td>
                <td>{movimiento.nuevoSaldo}</td>
                <td>{movimiento.usuario}</td>
                <td>{movimiento.ip}</td>
                <td>{new Date(movimiento.estampaTiempo).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EmployeeMovementList;