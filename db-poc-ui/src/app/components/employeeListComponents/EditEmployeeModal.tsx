"use client";

import React, { useState, useEffect } from "react";
const url: string = "http://localhost:3050";

interface EditEmployeeModalProps {
  employee: {
    id: number;
    nombre: string;
    nombrePuesto: string;
  };
  onClose: () => void;
  onSubmit: (updatedEmployee: {
    id: number;
    nombre: string;
    nombrePuesto: string;
  }) => void;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  employee,
  onClose,
  onSubmit,
}) => {
  const [nombre, setNombre] = useState(employee.nombre);
  const [nombrePuesto, setNombrePuesto] = useState(employee.nombrePuesto);
  const [mensaje, setMensaje] = useState("");
  const [puestos, setPuestos] = useState<{ Id: number; Nombre: string }[]>([]);

  useEffect(() => {
    const fetchPuestos = async () => {
      try {
        const response = await fetch(`${url}/api/v2/position`);
        if (response.ok) {
          const data = await response.json();
          setPuestos(data.data.puestos);
        } else {
          console.error("Error al obtener los puestos:", response.status);
          alert("No se pudieron cargar los puestos. Inténtalo de nuevo.");
        }
      } catch (error) {
        console.error("Error al realizar la solicitud:", error);
        alert("Ocurrió un error al intentar cargar los puestos.");
      }
    };

    fetchPuestos();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^[a-zA-Z\s]+$/.test(nombre) && nombre !== "") {
      setMensaje("❌ El nombre del empleado debe de contener sólo caracteres y espacios.");
      return;
    }

    onSubmit({
      id: employee.id,
      nombre,
      nombrePuesto,
    });
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
            />
          </div>
          <div className="form-group-Lista">
            <label>Puesto:</label>
            <select
              value={nombrePuesto}
              onChange={(e) => {
                setNombrePuesto(e.target.value);
                setMensaje("");
              }}
            >
              <option value="">Selecciona un puesto</option>
              {puestos.map((puesto) => (
                <option key={puesto.Id} value={puesto.Nombre}>
                  {puesto.Nombre}
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