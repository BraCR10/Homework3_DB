"use client";

import React, { useState, useEffect } from "react";
const url: string = "http://localhost:3050";

interface InsertEmployeeModalProps {
  onClose: () => void;
  onSubmit: (empleado: {
    Name: string;
    NameUser: string;
    PasswordUser: string;
    DocumentTypeId: number;
    DocumentValue: string;
    DateBirth?: string; // Cambiado a string para enviar YYYY-MM-DD
    PositionId: number;
    DepartmentId: number;
  }) => void;
}

const InsertEmployeeModal: React.FC<InsertEmployeeModalProps> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [nameUser, setNameUser] = useState("");
  const [passwordUser, setPasswordUser] = useState("");
  const [documentTypeId, setDocumentTypeId] = useState<number | null>(null);
  const [documentValue, setDocumentValue] = useState("");
  const [dateBirth, setDateBirth] = useState("");
  const [positionId, setPositionId] = useState<number | null>(null);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [positions, setPositions] = useState<{ Id: number; Name: string }[]>([]);
  const [departments, setDepartments] = useState<{ Id: number; Name: string }[]>([]);
  const [documentTypes, setDocumentTypes] = useState<{ Id: number; Name: string }[]>([]);

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
          setPositions(positionsData.data || []);
        } else {
          console.error("Error al obtener puestos:", positionsResponse.status);
        }

        if (departmentsResponse.ok) {
          const departmentsData = await departmentsResponse.json();
          setDepartments(departmentsData.data || []);
        } else {
          console.error("Error al obtener departamentos:", departmentsResponse.status);
        }

        if (documentTypesResponse.ok) {
          const documentTypesData = await documentTypesResponse.json();
          setDocumentTypes(documentTypesData.data || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
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

    // Formatear la fecha a YYYY-MM-DD
    const formattedDateBirth = dateBirth ? new Date(dateBirth).toISOString().split("T")[0] : undefined;

    try {
      const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");

      if (!usuarioGuardado.Id) {
        console.error("No se encontró un usuario logueado.");
        alert("No se encontró un usuario logueado.");
        return;
      }

      const userId = usuarioGuardado.Id.toString();

      const response = await fetch(`${url}/api/v2/employees`, {
        method: "POST", // Método correcto para crear un empleado
        headers: {
          "Content-Type": "application/json",
          "User-Id": userId, // Enviar el User-Id en los headers
        },
        body: JSON.stringify({
          Name: name,
          NameUser: nameUser,
          PasswordUser: passwordUser,
          DocumentTypeId: documentTypeId,
          DocumentValue: documentValue,
          DateBirth: formattedDateBirth, // Fecha formateada como YYYY-MM-DD
          PositionId: positionId,
          DepartmentId: departmentId,
        }),
      });
      console.log("Headers enviados:", {
        "Content-Type": "application/json",
        "User-Id": userId,
      });

      console.log("Datos enviados al backend:", {
        Name: name,
        NameUser: nameUser,
        PasswordUser: passwordUser,
        DocumentTypeId: documentTypeId,
        DocumentValue: documentValue,
        DateBirth: formattedDateBirth,
        PositionId: positionId,
        DepartmentId: departmentId,
      });
      if (response.ok) {
        const data = await response.json();
        alert("✅ Empleado creado exitosamente.");
        onSubmit(data.data); // Enviar los datos al componente padre
        onClose(); // Cerrar el modal
      } else {
        const errorData = await response.json();
        setMensaje(`❌ Error: ${errorData.error.detail}`);
      }
    } catch (error) {
      console.error("Error al insertar el empleado:", error);
      setMensaje("❌ Ocurrió un error al intentar insertar el empleado.");
    }
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
                setMensaje("");
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
                setMensaje("");
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
                setMensaje("");
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
                setMensaje("");
              }}
              required
            >
              <option value="">Selecciona un tipo de identificación</option>
              {documentTypes.map((type) => (
                <option key={type.Id} value={type.Id}>
                  {type.Name}
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
                setMensaje("");
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
                setMensaje("");
              }}
            />
          </div>
          <div className="insert-employee-form-group">
            <label>Puesto:</label>
            <select
              value={positionId || ""}
              onChange={(e) => {
                setPositionId(Number(e.target.value));
                setMensaje("");
              }}
              required
            >
              <option value="">Selecciona un puesto</option>
              {positions.map((position) => (
                <option key={position.Id} value={position.Id}>
                  {position.Name}
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
                setMensaje("");
              }}
              required
            >
              <option value="">Selecciona un departamento</option>
              {departments.map((department) => (
                <option key={department.Id} value={department.Id}>
                  {department.Name}
                </option>
              ))}
            </select>
          </div>
          {mensaje && <p className="insert-employee-error-message">{mensaje}</p>}
          <div className="insert-employee-form-buttons">
            <button type="submit" className="insert-employee-confirm-button">
              Insertar
            </button>
            <button type="button" onClick={onClose} className="insert-employee-cancel-button">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InsertEmployeeModal;