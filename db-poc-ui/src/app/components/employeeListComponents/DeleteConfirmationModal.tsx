"use client";

import React from 'react';
import '../../styles/employee.css';

interface DeleteConfirmationModalProps {
  empleadoId: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ empleadoId, onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Confirmar eliminación</h3>
        <p>¿Estás seguro de que deseas eliminar a este empleado?</p>
        <div className="modal-buttons">
          <button onClick={onConfirm} className="confirm-button">Eliminar</button>
          <button onClick={onCancel} className="cancel-button">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;