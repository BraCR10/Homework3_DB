"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import '../../styles/vacation.css';
const url: string = "http://localhost:3050";

interface VacationRequest {
  IdSolicitud: number;
  Estado: string;
  EmpleadoNombre: string;
  EmpleadoDNI: string;
  CantDias: number;
  FechaInicio: string;
  FechaFin: string;
  FechaSolicitud: string;
}

const VacationList = () => {
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchVacationRequests();
  }, []);

  const fetchVacationRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${url}/api/v2/vacation_request`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setVacationRequests(data.data.solicitudes);
      } else {
        throw new Error(data.error?.detail || 'Error desconocido');
      }
    } catch (err) {
      console.error('Error al obtener solicitudes de vacaciones:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.push('/employee');
  };

  const getStatusClass = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDIENTE':
        return 'status-pending';
      case 'APROBADA':
        return 'status-approved';
      case 'RECHAZADA':
        return 'status-rejected';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="vacation-container">
      <h2>Solicitudes de Vacaciones</h2>
      
      <button className="back-button" onClick={handleGoBack}>
        Regresar
      </button>
      
      {loading ? (
        <p className="loading-message">Cargando solicitudes...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : vacationRequests.length === 0 ? (
        <p className="no-requests">No se encontraron solicitudes de vacaciones.</p>
      ) : (
        <table className="vacation-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Empleado</th>
              <th>Documento</th>
              <th>Estado</th>
              <th>Días</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Fecha Solicitud</th>
            </tr>
          </thead>
          <tbody>
            {vacationRequests.map((request) => (
              <tr key={request.IdSolicitud}>
                <td>{request.IdSolicitud}</td>
                <td>{request.EmpleadoNombre}</td>
                <td>{request.EmpleadoDNI}</td>
                <td className={getStatusClass(request.Estado)}>
                  {request.Estado}
                </td>
                <td>{request.CantDias}</td>
                <td>{formatDate(request.FechaInicio)}</td>
                <td>{formatDate(request.FechaFin)}</td>
                <td>{formatDate(request.FechaSolicitud)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default VacationList;