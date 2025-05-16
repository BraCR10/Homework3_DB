import React, { useState } from "react";

interface InsertEmployeePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, salary: number) => Promise<void>;
}

function InsertEmployeePopup({ isOpen, onClose, onSubmit }: InsertEmployeePopupProps) {
  const [name, setName] = useState("");
  const [salary, setSalary] = useState("");
  const [status, setStatus] = useState<"none" | "loading" | "success" | "error">("none");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || name.length<5) {
      setStatus("error");
      setErrorMessage("El nombre debe ser mayor a 5 caracteres");
      return;
    }

    if (!/^[a-zA-Z-]+$/.test(name)) {
      setStatus("error");
      setErrorMessage("El nombre solo puede contener caracteres alfanuméricos o guiones");
      return;
    }
    
    if (!salary.trim() || isNaN(Number(salary)) || Number(salary) <= 0) {
      setStatus("error");
      setErrorMessage("Ingrese un salario válido");
      return;
    }

    try {
      setStatus("loading");
      await onSubmit(name, Number(salary));
      setStatus("success");
      
      setTimeout(() => {
        setName("");
        setSalary("");
        setStatus("none");
        onClose();
      }, 2000);
    } catch (error) {
      setStatus("error");
      setErrorMessage("Error al añadir empleado, use otro nombre o intente mas tarde");
      throw error;
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="popup-header">
          <h2>Ingresar Empleado</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={status === "loading"}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="salary">Salario</label>
            <input
              type="number"
              id="salary"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              disabled={status === "loading"}
            />
          </div>
          
          {status === "error" && (
            <div className="error-message">{errorMessage}</div>
          )}
          
          {status === "success" && (
            <div className="success-message">Empleado añadido!</div>
          )}
          
          <div className="form-actions">
            <button 
              type="submit" 
              disabled={status === "loading"}
              className="submit-button"
            >
              {status === "loading" ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InsertEmployeePopup;