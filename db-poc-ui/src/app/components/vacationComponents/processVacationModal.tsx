"use client";

import React, { useState, useEffect } from 'react';
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

interface ProcessVacationModalProps {
  onClose: () => void;
  onSubmit: () => void;
}

const ProcessVacationModal: React.FC<ProcessVacationModalProps> = ({ 
  onClose, 
  onSubmit 
}) => {
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    fetchPendingVacationRequests();
  }, []);

  const fetchPendingVacationRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      setUnauthorized(false);
      
      // Verificar si hay un usuario logueado
      const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");
      if (!usuarioGuardado.Id) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${url}/api/v2/vacation_request`);
      
      // Extraer el cuerpo de la respuesta como JSON (independientemente del código de estado)
      const data = await response.json().catch(() => null);
      
      
      if (!response.ok) {
        
        if (data && data.error) {
          
          if (data.error.detail && data.error.detail.includes('no autorizado')) {
            setUnauthorized(true);
            throw new Error(data.error.detail);
          }
         
        }

        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Procesar datos exitosos
      if (data && data.success) {
        const pendingRequests = data.data.solicitudes.filter(
          (req: VacationRequest) => req.Estado.toUpperCase() === 'PENDIENTE'
        );
        setVacationRequests(pendingRequests);
      } else {
        throw new Error('Formato de respuesta inesperado');
      }
    } catch (err) {
      console.error('Error al obtener solicitudes de vacaciones:', err);
      
      // Clasificar el error
      if (err instanceof Error) {
        if (err.message.includes('no autorizado')) {
          setUnauthorized(true);
        }
        else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setError('Error de conexión. Verifique su red e intente nuevamente.');
        }
        // Otros errores
        else {
          setError(err.message);
        }
      } else {
        setError('Error al cargar las solicitudes');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRequestId) {
      setError('Debe seleccionar una solicitud');
      return;
    }
    
    if (!newStatus) {
      setError('Debe seleccionar un estado para la solicitud');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Obtener el ID del usuario del localStorage
      const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");
      
      if (!usuarioGuardado.Id) {
        setUnauthorized(true);
        throw new Error("No se encontró un usuario logueado");
      }
      
      const requestData = {
        IdUsuario: Number(usuarioGuardado.Id),
        NuevoEstado: newStatus
      };
      
      console.log("Tramitando solicitud:", {
        idSolicitud: selectedRequestId,
        datos: requestData
      });
      
      const response = await fetch(`${url}/api/v2/vacation_request/${selectedRequestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json().catch(() => null);
      
      if (!response.ok || (data && !data.success)) {
        if (data && data.error) {
          if (data.error.detail && data.error.detail.includes('no autorizado')) {
            setUnauthorized(true);
            throw new Error(data.error.detail);
          }
          throw new Error(data.error.detail || `Error ${response.status}`);
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Proceso exitoso
      setSuccess('Solicitud de vacaciones tramitada exitosamente');
      setSelectedRequestId(null);
      setNewStatus('');
      
      fetchPendingVacationRequests();
      
      setTimeout(() => {
        if (vacationRequests.length <= 1) {
          onSubmit();
          onClose();
        }
      }, 1500);
    } catch (err) {
      console.error('Error al tramitar solicitud de vacaciones:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('no autorizado')) {
          setUnauthorized(true);
        }
        else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setError('Error de conexión. Verifique su red e intente nuevamente.');
        }
        else {
          setError(err.message);
        }
      } else {
        setError('Error al tramitar la solicitud');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (unauthorized) {
    return (
      <div className="vacation-modal-overlay">
        <div className="vacation-modal-content">
          <h3>Tramitar Solicitudes de Vacaciones</h3>
          <div className="unauthorized-message">
            <p>Usuario no autorizado para tramitar solicitudes.</p>
            <p className="unauthorized-help">Por favor, contacte con el administrador si necesita acceso.</p>
            <div className="vacation-form-buttons">
              <button 
                type="button" 
                className="vacation-button-secondary"
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vacation-modal-overlay">
      <div className="vacation-modal-content">
        <h3>Tramitar Solicitudes de Vacaciones</h3>
        
        {loading ? (
          <p className="loading-message">Cargando solicitudes pendientes...</p>
        ) : error ? (
          <div>
            <p className="vacation-error-message">{error}</p>
            <div className="vacation-form-buttons">
              <button 
                type="button" 
                className="vacation-button-secondary"
                onClick={onClose}
              >
                Cerrar
              </button>
              <button 
                type="button" 
                className="vacation-button-primary"
                onClick={() => {
                  setError(null);
                  fetchPendingVacationRequests();
                }}
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : vacationRequests.length === 0 ? (
          <div>
            <p className="no-requests">No hay solicitudes pendientes por tramitar.</p>
            <div className="vacation-form-buttons">
              <button 
                type="button" 
                className="vacation-button-secondary"
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="vacation-form-group">
              <label htmlFor="requestSelect">Seleccionar Solicitud:</label>
              <select
                id="requestSelect"
                value={selectedRequestId || ''}
                onChange={(e) => setSelectedRequestId(Number(e.target.value))}
                required
              >
                <option value="">-- Seleccione una solicitud --</option>
                {vacationRequests.map((request) => (
                  <option key={request.IdSolicitud} value={request.IdSolicitud}>
                    {request.EmpleadoNombre} - {request.CantDias} días - Inicio: {formatDate(request.FechaInicio)}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedRequestId && (
              <div className="vacation-form-group">
                <label htmlFor="statusSelect">Nuevo Estado:</label>
                <select
                  id="statusSelect"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                >
                  <option value="">-- Seleccione un estado --</option>
                  <option value="Aprobado">Aprobar</option>
                  <option value="Rechazado">Rechazar</option>
                </select>
              </div>
            )}
            
            {success && <p className="vacation-success-message">{success}</p>}
            
            <div className="vacation-form-buttons">
              <button 
                type="submit" 
                className="vacation-button-primary"
                disabled={isSubmitting || !selectedRequestId || !newStatus}
              >
                {isSubmitting ? 'Procesando...' : 'Tramitar Solicitud'}
              </button>
              
              <button 
                type="button" 
                className="vacation-button-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProcessVacationModal;