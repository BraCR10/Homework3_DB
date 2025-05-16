"use client";

import React, { useState, useEffect } from 'react';
import '../../styles/vacation.css';
const url: string = "http://localhost:3050";

interface RequestVacationModalProps {
  employee: {
    id: number;
    nombre: string;
    documento: string;
    saldoVacaciones: number;
  };
  onClose: () => void;
  onSubmit: () => void;
}

const RequestVacationModal: React.FC<RequestVacationModalProps> = ({ 
  employee, 
  onClose, 
  onSubmit 
}) => {
  const [cantidadDias, setCantidadDias] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [manualDateSelection, setManualDateSelection] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];

  useEffect(() => {
    if (manualDateSelection && fechaInicio && fechaFin) {
      const startDate = new Date(fechaInicio);
      const endDate = new Date(fechaFin);
      
      if (startDate <= endDate) {
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setCantidadDias(String(diffDays));
      }
    }
  }, [fechaInicio, fechaFin, manualDateSelection]);

  const updateEndDate = () => {
    if (!manualDateSelection && fechaInicio && cantidadDias && !isNaN(Number(cantidadDias)) && Number(cantidadDias) > 0) {
      const startDate = new Date(fechaInicio);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + Number(cantidadDias) - 1); // Restar 1 porque incluimos el día de inicio
      setFechaFin(endDate.toISOString().split('T')[0]);
    }
  };

  useEffect(() => {
    if (!manualDateSelection) {
      updateEndDate();
    }
  }, [fechaInicio, cantidadDias, manualDateSelection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cantidadDias || isNaN(Number(cantidadDias)) || Number(cantidadDias) <= 0) {
      setError('La cantidad de días debe ser un número mayor a 0');
      return;
    }

    if (Number(cantidadDias) > employee.saldoVacaciones) {
      setError(`No tiene suficiente saldo de vacaciones. Saldo actual: ${employee.saldoVacaciones} días`);
      return;
    }

    if (!fechaInicio) {
      setError('La fecha de inicio es requerida');
      return;
    }

    if (!fechaFin) {
      setError('La fecha de fin es requerida');
      return;
    }

    const startDate = new Date(fechaInicio);
    const endDate = new Date(fechaFin);
    
    if (startDate > endDate) {
      setError('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    startDate.setHours(0, 0, 0, 0); 
    if (startDate < today) {
      setError('La fecha de inicio debe ser igual o posterior al día de hoy');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await fetch(`${url}/api/v2/vacation_request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ValorDocumentoIdentidad: employee.documento,
          CantidadDias: Number(cantidadDias),
          FechaInicio: fechaInicio,
          FechaFin: fechaFin
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Solicitud de vacaciones creada exitosamente');
        // Esperar 1.5 segundos antes de cerrar el modal
        setTimeout(() => {
          onSubmit();
          onClose();
        }, 1500);
      } else {
        throw new Error(data.error?.detail || 'Error al crear la solicitud');
      }
    } catch (err) {
      console.error('Error al crear solicitud de vacaciones:', err);
      setError(err instanceof Error ? err.message : 'Error al enviar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="vacation-modal-overlay">
      <div className="vacation-modal-content">
        <h3>Solicitar Vacaciones</h3>
        
        <div className="vacation-form-group">
          <label>Empleado:</label>
          <p>{employee.nombre}</p>
        </div>
        
        <div className="vacation-form-group">
          <label>Documento de Identidad:</label>
          <p>{employee.documento}</p>
        </div>
        
        <div className="vacation-form-group">
          <label>Saldo Disponible:</label>
          <p>{employee.saldoVacaciones} días</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="vacation-form-group">
            <label className="vacation-checkbox-container">
              <input 
                type="checkbox" 
                checked={manualDateSelection}
                onChange={() => setManualDateSelection(!manualDateSelection)}
              />
              <span className="vacation-checkbox-text">Selección manual de fechas</span>
            </label>
          </div>
        
          {!manualDateSelection ? (
            <>
              <div className="vacation-form-group">
                <label htmlFor="cantidadDias">Cantidad de Días:</label>
                <input
                  type="number"
                  id="cantidadDias"
                  value={cantidadDias}
                  onChange={(e) => {
                    setCantidadDias(e.target.value);
                  }}
                  min="1"
                  max={employee.saldoVacaciones}
                  required
                />
              </div>
              
              <div className="vacation-form-group">
                <label htmlFor="fechaInicio">Fecha de Inicio:</label>
                <input
                  type="date"
                  id="fechaInicio"
                  value={fechaInicio}
                  onChange={(e) => {
                    setFechaInicio(e.target.value);
                  }}
                  min={formattedToday}
                  required
                />
              </div>
              
              <div className="vacation-form-group">
                <label htmlFor="fechaFin">Fecha de Fin:</label>
                <input
                  type="date"
                  id="fechaFin"
                  value={fechaFin}
                  min={fechaInicio || formattedToday}
                  required
                  readOnly
                  className="vacation-readonly-input"
                />
                <small className="vacation-input-help">La fecha de fin se calcula automáticamente</small>
              </div>
            </>
          ) : (
            <>
              <div className="vacation-form-group">
                <label htmlFor="fechaInicio">Fecha de Inicio:</label>
                <input
                  type="date"
                  id="fechaInicio"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  min={formattedToday}
                  required
                />
              </div>
              
              <div className="vacation-form-group">
                <label htmlFor="fechaFin">Fecha de Fin:</label>
                <input
                  type="date"
                  id="fechaFin"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  min={fechaInicio || formattedToday}
                  required
                />
              </div>
              
              <div className="vacation-form-group">
                <label htmlFor="cantidadDias">Cantidad de Días:</label>
                <input
                  type="number"
                  id="cantidadDias"
                  value={cantidadDias}
                  min="1"
                  max={employee.saldoVacaciones}
                  required
                  readOnly
                  className="vacation-readonly-input"
                />
                <small className="vacation-input-help">La cantidad de días se calcula automáticamente</small>
              </div>
            </>
          )}
          
          {error && <p className="vacation-error-message">{error}</p>}
          {success && <p className="vacation-success-message">{success}</p>}
          
          <div className="vacation-form-buttons">
            <button 
              type="submit" 
              className="vacation-button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
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
      </div>
    </div>
  );
};

export default RequestVacationModal;