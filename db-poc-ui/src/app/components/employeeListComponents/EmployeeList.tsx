"use client";

import React, { useState, useEffect } from "react";
import FilterBar from "./FilterBar";
import EmployeeTable from "./EmployeeTable";
import "../../styles/employee.css";
import EditEmployeeModal from "./EditEmployeeModal";
import { useRouter } from "next/navigation";

const url: string = "http://localhost:3050";

// Backend API response interfaces
interface BackendEmployee {
  Id: number;
  Name: string;
  Document: string;
  Position: string;
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
  documento: string;
  nombrePuesto: string;
}

const EmployeeList = () => {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [filtro, setFiltro] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Empleado | null>(null);
  const [editEmployeeModalVisible, setEditEmployeeModalVisible] = useState(false);
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
        const empleadosBackend: Empleado[] = data.data.map((empleado: BackendEmployee) => ({
          id: empleado.Id,
          nombre: empleado.Name,
          documento: empleado.Document,
          nombrePuesto: empleado.Position,
        }));
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
        const empleadosFiltrados: Empleado[] = data.data.map((empleado: BackendEmployee) => ({
          id: empleado.Id,
          nombre: empleado.Name,
          documento: empleado.Document,
          nombrePuesto: empleado.Position,
        }));
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

  const handleEdit = (empleado: Empleado) => {
    setSelectedEmployee(empleado);
    setEditEmployeeModalVisible(true);
  };

  const handleDelete = (id: number) => {
    console.log("Eliminar empleado con ID:", id);
  };

  const handleQuery = (empleado: Empleado) => {
    console.log("Consultar empleado:", empleado);
  };

  const handleMovementList = (empleado: Empleado) => {
    console.log("Listar movimientos del empleado:", empleado);
  };

  const handleInsertMovement = (empleado: Empleado) => {
    console.log("Insertar movimiento para el empleado:", empleado);
  };

  return (
    <div className="listar-empleados-container">
      <h2>Panel de Administración - Lista de Empleados</h2>
      <div className="filtro-container">
        <FilterBar filtro={filtro} setFiltro={setFiltro} aplicarFiltro={aplicarFiltro} />
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
        handleDelete={handleDelete}
        handleQuery={handleQuery}
        handleMovementList={handleMovementList}
        handleInsertMovement={handleInsertMovement}
      />
      {empleados.length === 0 && <p>No se encontraron empleados.</p>}
      {editEmployeeModalVisible && selectedEmployee && (
        <EditEmployeeModal
          employee={selectedEmployee}
          onClose={() => setEditEmployeeModalVisible(false)}
          onSubmit={(updatedEmployee) => {
            console.log("Empleado actualizado:", updatedEmployee);
            fetchEmpleados();
            setEditEmployeeModalVisible(false);
          }}
        />
      )}
    </div>
  );
};

export default EmployeeList;