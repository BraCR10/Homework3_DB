"use client";

import React, { useState, useEffect } from "react";
import '../../styles/insertMovementModal.css';
import { I18NProvider } from "next/dist/server/lib/i18n-provider";
const url: string = "http://localhost:3050";

interface Movimiento {
  NombreTipoMovimiento: string;
  Monto: number;
  IdEmpleado: number;
  UsernameUsuario: string;
}

interface InsertMovementModalProps {
  employee: {
    id: number;
    nombre: string;
    documento: string;
    saldoVacaciones: number;
  };
  onClose: () => void;
  onSubmit: (newMovement: Movimiento) => void;
}

const InsertMovementModal: React.FC<InsertMovementModalProps> = ({ employee, onClose, onSubmit }) => {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const [tiposMovimiento, setTiposMovimiento] = useState<{ Id: number; Nombre: string }[]>([]);
  const [tipoMovimiento, setTipoMovimiento] = useState("");
  const [monto, setMonto] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Obtener los tipos de movimiento desde la API
  useEffect(() => {
    const fetchTiposMovimiento = async () => {
      try {
        const response = await fetch(`${url}/api/v2/movementType`);
        if (response.ok) {
          const data = await response.json();
          console.log("Respuesta de la API:", data); // Verifica la estructura de la respuesta
          // Acceder correctamente a data.tiposMovimientos
          setTiposMovimiento(data.data.tiposMovimientos || []); // Asegúrate de que sea un array
        } else {
          console.error("Error al obtener tipos de movimiento:", response.status);
          alert("No se pudieron cargar los tipos de movimiento. Inténtalo de nuevo.");
        }
      } catch (error) {
        console.error("Error al realizar la solicitud:", error);
        alert("Ocurrió un error al intentar cargar los tipos de movimiento.");
      }
    };
  
    fetchTiposMovimiento();
  }, []);

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tipoMovimiento) {
      setMensaje("❌ Debes seleccionar un tipo de movimiento.");
      return;
    }

    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) {
      setMensaje("❌ El monto debe ser un número mayor a 0.");
      return;
    }
    
    const tipoSeleccionado = tiposMovimiento.find((tipo) => tipo.Nombre === tipoMovimiento);
      if (!tipoSeleccionado) {
        setMensaje("❌ Tipo de movimiento no válido.");
        return;
      }

    const IdTipoMovimiento = tipoSeleccionado.Id; // Asignar el Id del tipo de movimiento


    const newMovement = {
      NombreTipoMovimiento: tipoMovimiento,
      Monto: Number(monto),
      IdEmpleado: employee.id,
      UsernameUsuario: usuario.Username, // Asegurarse de que el usuario tenga un campo Username
    };

    const usuarioLog = JSON.parse(localStorage.getItem("usuario") || "{}");

    try {
      console.log(IdTipoMovimiento, Number(monto), employee.documento, usuarioLog.Id)
      const response = await fetch(`${url}/api/v2/movement/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          IdTipoMovimiento: IdTipoMovimiento, // Usar el Id del tipo de movimiento
          Monto: Number(monto),
          DNIEmpleado: employee.documento,
          IdUser: usuarioLog.Id, // Asegurarse de que el usuario tenga un campo Username
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert("✅ Movimiento registrado correctamente.");
        onSubmit(newMovement); // Llamar a la función onSubmit con el nuevo movimiento
        onClose(); // Cerrar el modal
      } 
      else if (response.status === 400) {
        const errorData = await response.json();
        setMensaje(`❌ Error: ${errorData.error.detail}`);
      } 
      else {
        setMensaje("❌ Ocurrió un error inesperado al registrar el movimiento.");
      }
    } catch (error) {
      console.error("Error al registrar el movimiento:", error);
      setMensaje("❌ Ocurrió un error al intentar registrar el movimiento.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <strong>Insertar Nuevo Movimiento</strong>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Documento de Identidad:</label>
            <p>{employee.documento}</p>
          </div>
          <div className="form-group">
            <label>Nombre del Empleado:</label>
            <p>{employee.nombre}</p>
          </div>
          <div className="form-group">
            <label>Saldo de Vacaciones:</label>
            <p>{employee.saldoVacaciones}</p>
          </div>
          <div className="form-group">
            <label>Tipo de Movimiento:</label>
            <select
              value={tipoMovimiento}
              onChange={(e) => setTipoMovimiento(e.target.value)}
              required
            >
              <option value="">Selecciona un tipo de movimiento</option>
              {tiposMovimiento.length > 0 ? (
                tiposMovimiento.map((tipo) => (
                  <option key={tipo.Id} value={tipo.Nombre}>
                    {tipo.Nombre}
                  </option>
                ))
              ) : (
                <option disabled>Cargando tipos de movimiento...</option>
              )}
            </select>
          </div>
          <div className="form-group">
            <label>Monto:</label>
            <input
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              required
            />
          </div>
          {mensaje && <p className="error-message">{mensaje}</p>}
          <div className="form-buttons">
            <button type="submit" className="confirm-button">
              Confirmar
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

export default InsertMovementModal;