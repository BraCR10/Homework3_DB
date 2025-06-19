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
  DocumentTypeId?: number; // Agregar como opcional si no siempre está presente
  DocumentValue?: string; // Agregar como opcional si no siempre está presente
  DateBirth?: string; // Agregar como opcional si no siempre está presente
  PositionId?: number; // Agregar como opcional si no siempre está presente
  DepartmentId?: number; // Agregar como opcional si no siempre está presente
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
            tipoIdentificacion: empleado.DocumentTypeId || null, // Manejar valores opcionales
            valorDocumento: empleado.DocumentValue || "",
            DateBirth: empleado.DateBirth || "",
            puestoId: empleado.PositionId || null,
            departamentoId: empleado.DepartmentId || null,
          }))
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

  const aplicarFiltro = async () => {
    try {
      const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");
      if (!usuarioGuardado.Id) {
        console.error("No se encontró un usuario logueado.");
        alert("No se encontró un usuario logueado.");
        return;
      }

      const response = await fetch(`${url}/api/v2/employees/search?filter=${filtro}`, {
        method: "GET",
        headers: {
          "User-Id": usuarioGuardado.Id.toString(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: BackendEmployeeResponse = await response.json();
        const empleadosFiltrados: Empleado[] = data.data
          .map((empleado: BackendEmployee) => ({
            id: empleado.Id,
            nombre: empleado.Name,
            nombrePuesto: empleado.Position,
          }))
          .sort((a, b) => a.nombre.localeCompare(b.nombre));
        setEmpleados(empleadosFiltrados);
      } else {
        const errorData: BackendErrorResponse = await response.json();
        console.error("Error al aplicar filtro:", errorData.error.detail);
        alert(`Error: ${errorData.error.detail}`);
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
      alert("Ocurrió un error al intentar aplicar el filtro.");
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

      console.log("Datos enviados al backend:", newEmployee);
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

  const handleEdit = (empleado: Empleado) => {
    setSelectedEmployee(empleado);
    setEditEmployeeModalVisible(true);
    fetchEmpleados();
  };

  const handleDelete = async () => {
    if (!employeeToDelete) return;

    try {
      const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");
      if (!usuarioGuardado.Id) {
        console.error("No se encontró un usuario logueado.");
        alert("No se encontró un usuario logueado.");
        return;
      }

      const response = await fetch(`${url}/api/v2/employees/${employeeToDelete}`, {
        method: "DELETE",
        headers: {
          "User-Id": usuarioGuardado.Id.toString(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("✅ Empleado eliminado exitosamente.");
        fetchEmpleados();
        setDeleteConfirmationVisible(false);
        setEmployeeToDelete(null);
      } else {
        const errorData = await response.json();
        console.error("Error al eliminar empleado:", errorData.error.detail);
        alert(`Error: ${errorData.error.detail}`);
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
      alert("Ocurrió un error al intentar eliminar el empleado.");
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
        <FilterBar filtro={filtro} setFiltro={setFiltro} aplicarFiltro={aplicarFiltro} />
        <button
          onClick={() => setInsertEmployeeModalVisible(true)}
          className="insertar-boton"
        >
          Insertar Empleado
        </button>
        <button onClick={() => router.push("/stats")} className="insertar-boton">
          Ver estadísticas
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
        handleEdit={handleEdit}
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
          onSubmit={(updatedEmployee) => {
            console.log("Empleado actualizado:", updatedEmployee);
            setEditEmployeeModalVisible(false);
          }}
        />
      )}
      {deleteConfirmationVisible && (
        <DeleteConfirmationModal
          empleadoId={employeeToDelete!}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmationVisible(false)}
        />
      )}
    </div>
  );
};

export default EmployeeList;