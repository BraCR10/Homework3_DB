"use client";

import React, { useState, useEffect } from "react";
const url: string = "http://localhost:3050";

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
  const [puestos, setPuestos] = useState<{ Id: number; Name: string }[]>([]);
  const [departamentos, setDepartamentos] = useState<{ Id: number; Name: string }[]>([]);
  const [tiposIdentificacion, setTiposIdentificacion] = useState<{ Id: number; Name: string }[]>([]);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");

        if (!usuarioGuardado.Id) {
          console.error("No se encontró el ID del usuario.");
          alert("No se encontró el ID del usuario.");
          return;
        }

        const userId = usuarioGuardado.Id.toString();

        const [positionsResponse, departmentsResponse, documentTypesResponse] = await Promise.all([
          fetch(`${url}/api/v2/catalogs/positions`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "User-Id": userId,
            },
          }),
          fetch(`${url}/api/v2/catalogs/departments`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "User-Id": userId,
            },
          }),
          fetch(`${url}/api/v2/catalogs/document-types`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "User-Id": userId,
            },
          }),
        ]);

        if (positionsResponse.ok) {
          const positionsData = await positionsResponse.json();
          setPuestos(positionsData.data || []);
        } else {
          console.error("Error al obtener puestos:", positionsResponse.status);
        }

        if (departmentsResponse.ok) {
          const departmentsData = await departmentsResponse.json();
          setDepartamentos(departmentsData.data || []);
        } else {
          console.error("Error al obtener departamentos:", departmentsResponse.status);
        }

        if (documentTypesResponse.ok) {
          const documentTypesData = await documentTypesResponse.json();
          setTiposIdentificacion(documentTypesData.data || []);
        } else {
          console.error("Error al obtener tipos de identificación:", documentTypesResponse.status);
        }
      } catch (error) {
        console.error("Error al cargar los catálogos:", error);
        alert("Ocurrió un error al intentar cargar los catálogos.");
      }
    };

    fetchCatalogs();
  }, []);

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
              {tiposIdentificacion.map((tipo) => (
                <option key={tipo.Id} value={tipo.Id}>
                  {tipo.Name}
                </option>
              ))}
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
              {puestos.map((puesto) => (
                <option key={puesto.Id} value={puesto.Id}>
                  {puesto.Name}
                </option>
              ))}
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
              {departamentos.map((departamento) => (
                <option key={departamento.Id} value={departamento.Id}>
                  {departamento.Name}
                </option>
              ))}
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