"use client";

import React, { useState } from "react";

interface EditEmployeeModalProps {
  employee: {
    id: number;
    nombre: string;
    tipoIdentificacion?: number;
    valorDocumento?: string;
    DateBirth?: string;
    puestoId?: number;
    departamentoId?: number;
  };
  onClose: () => void;
  onSubmit: (updatedEmployee: {
    id: number;
    nombre: string;
    tipoIdentificacion?: number;
    valorDocumento?: string | null; // Permitir null
    DateBirth?: string;
    puestoId?: number;
    departamentoId?: number;
  }) => void;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  employee,
  onClose,
  onSubmit,
}) => {
  const [nombre, setNombre] = useState(employee.nombre || "");
  const [tipoIdentificacion, setTipoIdentificacion] = useState<number | undefined>(employee.tipoIdentificacion);
  const [valorDocumento, setValorDocumento] = useState(employee.valorDocumento || "");
  const [DateBirth, setDateBirth] = useState(employee.DateBirth || "");
  const [puestoId, setPuestoId] = useState<number | undefined>(employee.puestoId);
  const [departamentoId, setDepartamentoId] = useState<number | undefined>(employee.departamentoId);
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !/^[a-zA-Z\s]+$/.test(nombre)) {
      setMensaje("❌ El nombre del empleado debe contener solo caracteres y espacios.");
      return;
    }

    // Formatear la fecha a YYYY-MM-DD
    const formattedDateBirth = DateBirth ? new Date(DateBirth).toISOString().split("T")[0] : undefined;

    // Enviar los datos actualizados al componente padre
    onSubmit({
      id: employee.id,
      nombre,
      tipoIdentificacion,
      valorDocumento: valorDocumento.trim() ? valorDocumento : null, // Enviar null si está vacío
      DateBirth: formattedDateBirth,
      puestoId,
      departamentoId,
    });

    onClose(); // Cerrar el modal después de enviar los datos
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Modificar Empleado</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                setMensaje("");
              }}
              required
            />
          </div>
          <div className="form-group">
            <label>Tipo de Identificación:</label>
            <select
              value={tipoIdentificacion || ""}
              onChange={(e) => {
                setTipoIdentificacion(Number(e.target.value));
                setMensaje("");
              }}
            >
              <option value="">Selecciona un tipo de identificación</option>
              <option value={1}>Cédula</option>
              <option value={2}>Pasaporte</option>
            </select>
          </div>
          <div className="form-group">
            <label>Valor del Documento:</label>
            <input
              type="text"
              value={valorDocumento}
              onChange={(e) => {
                setValorDocumento(e.target.value);
                setMensaje("");
              }}
            />
          </div>
          <div className="form-group">
            <label>Fecha de Nacimiento:</label>
            <input
              type="date"
              value={DateBirth}
              onChange={(e) => {
                setDateBirth(e.target.value);
                setMensaje("");
              }}
            />
          </div>
          <div className="form-group">
            <label>Puesto:</label>
            <select
              value={puestoId || ""}
              onChange={(e) => {
                setPuestoId(Number(e.target.value));
                setMensaje("");
              }}
            >
              <option value="">Selecciona un puesto</option>
              <option value={1}>Gerente</option>
              <option value={2}>Analista</option>
            </select>
          </div>
          <div className="form-group">
            <label>Departamento:</label>
            <select
              value={departamentoId || ""}
              onChange={(e) => {
                setDepartamentoId(Number(e.target.value));
                setMensaje("");
              }}
            >
              <option value="">Selecciona un departamento</option>
              <option value={1}>Recursos Humanos</option>
              <option value={2}>IT</option>
            </select>
          </div>
          {mensaje && <p className="login-message-error">{mensaje}</p>}
          <div className="form-buttons">
            <button type="submit" className="confirm-button">
              Guardar Cambios
            </button>
            <button type="button" onClick={onClose} className="cancel-button">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeModal;