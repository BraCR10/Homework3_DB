"use client";

import React, { useState, useEffect } from "react";
import '../../styles/employeeDetailsModal.css'

interface EmployeeDetails {
  Id: number;
  Name: string;
  DateBirth: string;
  DNI: string;
  Position: string;
  Department: string;
}

interface EmployeeDetailsModalProps {
  employeeId: number;
  onClose: () => void;
}

const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({ employeeId, onClose }) => {
  const [employeeDetails, setEmployeeDetails] = useState<EmployeeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const url: string = "http://localhost:3050";

  useEffect(() => {
    fetchEmployeeDetails();
  }, [employeeId]);

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");
      if (!usuarioGuardado.Id) {
        setError("No se encontró un usuario logueado.");
        return;
      }

      const response = await fetch(`${url}/api/v2/employees/${employeeId}`, {
        method: "GET",
        headers: {
          "User-Id": usuarioGuardado.Id.toString(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEmployeeDetails(data.data);
        } else {
          setError(data.error?.detail || "Error al obtener los detalles del empleado");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error?.detail || "Error al obtener los detalles del empleado");
      }
    } catch (error) {
      console.error("Error al obtener detalles del empleado:", error);
      setError("Ocurrió un error al intentar cargar los detalles del empleado.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "No disponible";
    try {
      // Crear la fecha usando el string completo para evitar problemas de zona horaria
      const date = new Date(dateString);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }
      
      // Usar toLocaleDateString con opciones específicas para evitar problemas de zona horaria
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC' // Forzar UTC para evitar conversiones de zona horaria
      });
    } catch {
      return "Fecha inválida";
    }
  };

  if (loading) {
    return (
      <div className="employee-details-modal-overlay">
        <div className="employee-details-modal-content">
          <div className="loading">Cargando detalles del empleado...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employee-details-modal-overlay">
        <div className="employee-details-modal-content">
          <h3>Error</h3>
          <p className="error-message">{error}</p>
          <button onClick={onClose} className="employee-details-close-button">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  if (!employeeDetails) {
    return (
      <div className="employee-details-modal-overlay">
        <div className="employee-details-modal-content">
          <h3>Error</h3>
          <p>No se pudieron cargar los detalles del empleado.</p>
          <button onClick={onClose} className="employee-details-close-button">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-details-modal-overlay">
      <div className="employee-details-modal-content">
        <h3>Detalles del Empleado</h3>
        <div className="employee-details-grid">
          <div className="detail-item">
            <strong>ID:</strong> {employeeDetails.Id}
          </div>
          <div className="detail-item">
            <strong>Nombre:</strong> {employeeDetails.Name}
          </div>
          <div className="detail-item">
            <strong>DNI:</strong> {employeeDetails.DNI}
          </div>
          <div className="detail-item">
            <strong>Fecha de Nacimiento:</strong> {formatDate(employeeDetails.DateBirth)}
          </div>
          <div className="detail-item">
            <strong>Puesto:</strong> {employeeDetails.Position}
          </div>
          <div className="detail-item">
            <strong>Departamento:</strong> {employeeDetails.Department}
          </div>
        </div>
        <button onClick={onClose} className="employee-details-close-button">
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default EmployeeDetailsModal;