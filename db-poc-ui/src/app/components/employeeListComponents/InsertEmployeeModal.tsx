"use client";

import React, { useState, useEffect } from 'react';
import LoginMessage from '../loginComponents/LoginMessage';
const url: string = "http://localhost:3050";

interface InsertEmployeeModalProps {
  onClose: () => void;
  onSubmit: (empleado: { documento: string; nombre: string; idPuesto: number }) => void;
}

const InsertEmployeeModal: React.FC<InsertEmployeeModalProps> = ({ onClose, onSubmit}) => {
  const [documento, setDocumento] = useState('');
  const [nombre, setNombre] = useState('');
  const [NombrePuesto, setNombrePuesto] = useState<string | ''>('');
  const [idPuesto, setIdPuesto] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [puestos, setPuestos] = useState<{ Id: number; Nombre: string }[]>([]);

  // Obtener los puestos desde la API al montar el componente
  useEffect(() => {
    const fetchPuestos = async () => {
      try {
        const response = await fetch(`${url}/api/v2/position`);
        if (response.ok) {
          const data = await response.json();
          setPuestos(data.data.puestos); // Guardar los puestos en el estado
        } 
        else {
          console.error("Error al obtener los puestos:", response.status);
          alert('No se pudieron cargar los puestos. Inténtalo de nuevo.');
        }
      } 
      catch (error) {
        console.error("Error al realizar la solicitud:", error);
        alert('Ocurrió un error al intentar cargar los puestos.');
      }
    };

    fetchPuestos();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    // Validar que el documento solo contiene números
    if (!/^\d+$/.test(documento)) {
      setMensaje("❌ El documento de identidad debe de contener sólo números.");
      return;
    }
  
    // Validar que el nombre solo contiene caracteres y espacios
    if (!/^[a-zA-Z\s]+$/.test(nombre)) {
      setMensaje("❌ El nombre del empleado debe de contener sólo carácteres y espacios.");
      return;
    }
  
    // Validar que se haya seleccionado un puesto
    if (!idPuesto) {
      setMensaje("❌ Debes seleccionar un puesto.");
      return;
    }
  
    // Enviar los datos al componente padre con idPuesto
    onSubmit({ documento, nombre, idPuesto }); // Aquí se pasa idPuesto correctamente
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Insertar Nuevo Empleado</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Documento de Identidad:</label>
            <input
              type="text"
              value={documento}
              onChange={(e) => {
                setDocumento(e.target.value)
                setMensaje('');
              }}
              required
            />
          </div>
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value)
                setMensaje('')
              }}
              required
            />
          </div>
          <div className="form-group-Lista">
            <label>Puesto:</label>
            <select
              value={idPuesto || ""} // Usar idPuesto como valor del select
              onChange={(e) => {
                setIdPuesto(Number(e.target.value)); // Guardar el Id del puesto como número
                setNombrePuesto(puestos.find((puesto) => puesto.Id === Number(e.target.value))?.Nombre || ""); // Opcional: actualizar NombrePuesto
                setMensaje("");
              }}
              required
            >
              <option value="">Selecciona un puesto</option>
              {/* Mapear los puestos en la lista */}
              {puestos.map((puesto) => (
                <option key={puesto.Id} value={puesto.Id}> {/* Usar puesto.Id como value */}
                  {puesto.Nombre}
                </option>
              ))}
            </select>
          </div>
          <LoginMessage mensaje={mensaje} />
          <div className="form-buttons">
            <button type="submit" className="confirm-button">Insertar</button>
            <button type="button" onClick={onClose} className="cancel-button">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InsertEmployeeModal;