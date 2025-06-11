"use client";

import React, { useState, useEffect } from 'react';
const url: string = "http://localhost:3050";

interface InsertEmployeeModalProps {
  onClose: () => void;
  onSubmit: (empleado: { 
    Name: string; 
    NameUser: string; 
    PasswordUser: string; 
    DocumentTypeId: number; 
    DateBirth?: string; 
    DocumentValue: string; 
    PositionId: number; 
    DepartmentId: number; 
  }) => void;
}

const InsertEmployeeModal: React.FC<InsertEmployeeModalProps> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [nameUser, setNameUser] = useState('');
  const [passwordUser, setPasswordUser] = useState('');
  const [documentTypeId, setDocumentTypeId] = useState<number | null>(null);
  const [documentValue, setDocumentValue] = useState('');
  const [dateBirth, setDateBirth] = useState('');
  const [positionId, setPositionId] = useState<number | null>(null);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [positions, setPositions] = useState<{ Id: number; Nombre: string }[]>([]);
  const [departments, setDepartments] = useState<{ Id: number; Nombre: string }[]>([]);
  const [documentTypes, setDocumentTypes] = useState<{ Id: number; Nombre: string }[]>([]);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [positionsResponse, departmentsResponse, documentTypesResponse] = await Promise.all([
          fetch(`${url}/api/v2/catalogs/positions`),
          fetch(`${url}/api/v2/catalogs/departments`),
          fetch(`${url}/api/v2/catalogs/document-types`),
        ]);

        if (positionsResponse.ok) {
          const positionsData = await positionsResponse.json();
          setPositions(positionsData.data || []);
        }

        if (departmentsResponse.ok) {
          const departmentsData = await departmentsResponse.json();
          setDepartments(departmentsData.data || []);
        }

        if (documentTypesResponse.ok) {
          const documentTypesData = await documentTypesResponse.json();
          setDocumentTypes(documentTypesData.data || []);
        }
      } catch (error) {
        console.error("Error al cargar los catálogos:", error);
        alert('Ocurrió un error al intentar cargar los catálogos.');
      }
    };

    fetchCatalogs();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !/^[a-zA-Z\s]+$/.test(name)) {
      setMensaje("❌ El nombre del empleado debe contener solo caracteres y espacios.");
      return;
    }

    if (!nameUser.trim()) {
      setMensaje("❌ El nombre de usuario es obligatorio.");
      return;
    }

    if (!passwordUser.trim()) {
      setMensaje("❌ La contraseña es obligatoria.");
      return;
    }

    if (!documentTypeId) {
      setMensaje("❌ Debes seleccionar un tipo de identificación.");
      return;
    }

    if (!documentValue.trim()) {
      setMensaje("❌ El valor del documento es obligatorio.");
      return;
    }

    if (!positionId) {
      setMensaje("❌ Debes seleccionar un puesto.");
      return;
    }

    if (!departmentId) {
      setMensaje("❌ Debes seleccionar un departamento.");
      return;
    }

    onSubmit({
      Name: name,
      NameUser: nameUser,
      PasswordUser: passwordUser,
      DocumentTypeId: documentTypeId,
      DocumentValue: documentValue,
      DateBirth: dateBirth || undefined,
      PositionId: positionId,
      DepartmentId: departmentId,
    });
  };

  return (
    <div className="insert-employee-modal-overlay">
      <div className="insert-employee-modal-content">
        <h3>Insertar Nuevo Empleado</h3>
        <form onSubmit={handleSubmit} className="insert-employee-form">
          <div className="insert-employee-form-group">
            <label>Nombre:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setMensaje('');
              }}
              required
            />
          </div>
          <div className="insert-employee-form-group">
            <label>Nombre de Usuario:</label>
            <input
              type="text"
              value={nameUser}
              onChange={(e) => {
                setNameUser(e.target.value);
                setMensaje('');
              }}
              required
            />
          </div>
          <div className="insert-employee-form-group">
            <label>Contraseña:</label>
            <input
              type="password"
              value={passwordUser}
              onChange={(e) => {
                setPasswordUser(e.target.value);
                setMensaje('');
              }}
              required
            />
          </div>
          <div className="insert-employee-form-group">
            <label>Tipo de Identificación:</label>
            <select
              value={documentTypeId || ""}
              onChange={(e) => {
                setDocumentTypeId(Number(e.target.value));
                setMensaje('');
              }}
              required
            >
              <option value="">Selecciona un tipo de identificación</option>
              {documentTypes.map((type) => (
                <option key={type.Id} value={type.Id}>
                  {type.Nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="insert-employee-form-group">
            <label>Valor del Documento:</label>
            <input
              type="text"
              value={documentValue}
              onChange={(e) => {
                setDocumentValue(e.target.value);
                setMensaje('');
              }}
              required
            />
          </div>
          <div className="insert-employee-form-group">
            <label>Fecha de Nacimiento:</label>
            <input
              type="date"
              value={dateBirth}
              onChange={(e) => {
                setDateBirth(e.target.value);
                setMensaje('');
              }}
            />
          </div>
          <div className="insert-employee-form-group">
            <label>Puesto:</label>
            <select
              value={positionId || ""}
              onChange={(e) => {
                setPositionId(Number(e.target.value));
                setMensaje('');
              }}
              required
            >
              <option value="">Selecciona un puesto</option>
              {positions.map((position) => (
                <option key={position.Id} value={position.Id}>
                  {position.Nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="insert-employee-form-group">
            <label>Departamento:</label>
            <select
              value={departmentId || ""}
              onChange={(e) => {
                setDepartmentId(Number(e.target.value));
                setMensaje('');
              }}
              required
            >
              <option value="">Selecciona un departamento</option>
              {departments.map((department) => (
                <option key={department.Id} value={department.Id}>
                  {department.Nombre}
                </option>
              ))}
            </select>
          </div>
          {mensaje && <p className="insert-employee-error-message">{mensaje}</p>}
          <div className="insert-employee-form-buttons">
            <button type="submit" className="insert-employee-confirm-button">Insertar</button>
            <button type="button" onClick={onClose} className="insert-employee-cancel-button">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InsertEmployeeModal;