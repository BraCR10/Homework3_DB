"use client";

import React, { useState, useEffect } from "react";
import FilterBar from "./FilterBar";
import EmployeeTable from "./EmployeeTable";
import "../../styles/employee.css";
import "../../styles/insertEmployeeModal.css";
import EditEmployeeModal from "./EditEmployeeModal";
import InsertEmployeeModal from "./InsertEmployeeModal";
import ImpersonateEmployee from "./ImpersonateEmployee";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { useRouter } from "next/navigation";

const url: string = "http://localhost:3050";

// Backend API response interfaces
interface BackendEmployee {
  Id: number;
  Name: string;
  Position: string;
  DocumentTypeId?: number;
  DocumentValue?: string;
  DateBirth?: string;
  PositionId?: number;
  DepartmentId?: number;
}

interface BackendEmployeeResponse {
  success: boolean;
  data: BackendEmployee[];
  message: string;
  timestamp: string;
}

interface BackendErrorResponse {
  success: boolean;
  error: {
    code: number;
    detail: string;
  };
  timestamp: string;
}

// Frontend interfaces
interface Empleado {
  id: number;
  nombre: string;
  nombrePuesto: string;
}

const EmployeeList = () => {
  const [impersonatingEmployeeId, setImpersonatingEmployeeId] = useState<number | null>(null);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [filtro, setFiltro] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Empleado | null>(null);
  const [editEmployeeModalVisible, setEditEmployeeModalVisible] = useState(false);
  const [insertEmployeeModalVisible, setInsertEmployeeModalVisible] = useState(false);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const fetchEmpleados = async () => {
  try {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");
    if (!usuarioGuardado.Id) {
      console.error("No se encontró un usuario logueado.");
      alert("No se encontró un usuario logueado.");
      return;
    }

    const response = await fetch(`${url}/api/v2/employees`, {
      method: "GET",
      headers: {
        "User-Id": usuarioGuardado.Id.toString(),
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data: BackendEmployeeResponse = await response.json();
      const empleadosBackend: Empleado[] = data.data
        .map((empleado: BackendEmployee) => ({
          id: empleado.Id,
          nombre: empleado.Name,
          nombrePuesto: empleado.Position,
          tipoIdentificacion: empleado.DocumentTypeId || null,
          valorDocumento: empleado.DocumentValue || "",
          DateBirth: empleado.DateBirth || "",
          puestoId: empleado.PositionId || null,
          departamentoId: empleado.DepartmentId || null,
        }))
        .filter((empleado) => empleado.nombre.toLowerCase().includes(filtro.toLowerCase())) // Aplica el filtro aquí
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
      setEmpleados(empleadosBackend);
    } else {
      const errorData: BackendErrorResponse = await response.json();
      console.error("Error al obtener empleados:", errorData.error.detail);
      alert(`Error: ${errorData.error.detail}`);
    }
  } catch (error) {
    console.error("Error al realizar la solicitud:", error);
    alert("Ocurrió un error al intentar cargar los empleados.");
  }
};

  const handleInsertEmployee = async (newEmployee: {
    Name: string;
    NameUser: string;
    PasswordUser: string;
    DocumentTypeId: number;
    DateBirth?: string;
    DocumentValue: string;
    PositionId: number;
    DepartmentId: number;
  }) => {
    try {
      const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");
      if (!usuarioGuardado.Id) {
        console.error("No se encontró un usuario logueado.");
        alert("No se encontró un usuario logueado.");
        return;
      }

      const response = await fetch(`${url}/api/v2/employees`, {
        method: "POST",
        headers: {
          "User-Id": usuarioGuardado.Id.toString(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEmployee),
      });

      if (response.ok) {
        alert("✅ Empleado creado exitosamente.");
        fetchEmpleados();
        setInsertEmployeeModalVisible(false);
      } else {
        const errorData: BackendErrorResponse = await response.json();
        console.error("Error al insertar empleado:", errorData.error.detail);
        alert(`Error: ${errorData.error.detail}`);
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
      alert("Ocurrió un error al intentar insertar el empleado.");
    }
  };

  const handleEdit = async (updatedEmployee: {
    id: number;
    nombre: string;
    tipoIdentificacion?: number;
    valorDocumento?: string | null;
    DateBirth?: string;
    puestoId?: number;
    departamentoId?: number;
  }) => {
    try {
      const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");
      if (!usuarioGuardado.Id) {
        console.error("No se encontró un usuario logueado.");
        alert("No se encontró un usuario logueado.");
        return;
      }

      const response = await fetch(`${url}/api/v2/employees/${updatedEmployee.id}`, {
        method: "PUT",
        headers: {
          "User-Id": usuarioGuardado.Id.toString(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Name: updatedEmployee.nombre,
          DocumentTypeId: updatedEmployee.tipoIdentificacion,
          DocumentValue: updatedEmployee.valorDocumento,
          DateBirth: updatedEmployee.DateBirth,
          PositionId: updatedEmployee.puestoId,
          DepartmentId: updatedEmployee.departamentoId,
        }),
      });

      if (response.ok) {
        alert("✅ Empleado actualizado exitosamente.");
        fetchEmpleados();
        setEditEmployeeModalVisible(false);
      } else {
        const errorData: BackendErrorResponse = await response.json();
        console.error("Error al actualizar empleado:", errorData.error.detail);
        alert(`Error: ${errorData.error.detail}`);
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
      alert("Ocurrió un error al intentar actualizar el empleado.");
    }
  };

  const confirmDelete = (id: number) => {
    setEmployeeToDelete(id);
    setDeleteConfirmationVisible(true);
  };

  const handleImpersonate = (id: number) => {
    setImpersonatingEmployeeId(id);
  };

  const stopImpersonation = () => {
    setImpersonatingEmployeeId(null);
  };

  if (impersonatingEmployeeId) {
    return <ImpersonateEmployee employeeId={impersonatingEmployeeId} onStopImpersonation={stopImpersonation} />;
  }

  return (
    <div className="listar-empleados-container">
      <h1>Panel de Administración - Lista de Empleados</h1>
      <div className="filtro-container">
        <FilterBar filtro={filtro} setFiltro={setFiltro} aplicarFiltro={fetchEmpleados} />
        <button
          onClick={() => setInsertEmployeeModalVisible(true)}
          className="insertar-boton"
        >
          Insertar Empleado
        </button>
        <button
          onClick={() => {
            localStorage.clear();
            router.push("/login");
          }}
          className="insertar-boton"
        >
          Logout
        </button>
      </div>
      <EmployeeTable
        empleados={empleados}
        handleEdit={(empleado) => {
          setSelectedEmployee(empleado);
          setEditEmployeeModalVisible(true);
        }}
        handleDelete={confirmDelete}
        handleImpersonate={handleImpersonate}
      />
      {insertEmployeeModalVisible && (
        <InsertEmployeeModal
          onClose={() => setInsertEmployeeModalVisible(false)}
          onSubmit={handleInsertEmployee}
        />
      )}
      {editEmployeeModalVisible && selectedEmployee && (
        <EditEmployeeModal
          employee={selectedEmployee}
          onClose={() => setEditEmployeeModalVisible(false)}
          onSubmit={handleEdit}
        />
      )}
      {deleteConfirmationVisible && (
        <DeleteConfirmationModal
          empleadoId={employeeToDelete!}
          onConfirm={() => {
            fetchEmpleados();
            setDeleteConfirmationVisible(false);
          }}
          onCancel={() => setDeleteConfirmationVisible(false)}
        />
      )}
    </div>
  );
};

export default EmployeeList;