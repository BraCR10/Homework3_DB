//Descripción: componente principal que maneja el estado y la lógica de la lista de empleados
"use client";

import React, { useState, useEffect } from 'react'; 
import FilterBar from './FilterBar';
import EmployeeTable from './EmployeeTable';
import '../../styles/employee.css';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import InsertEmployeeModal from './InsertEmployeeModal';
import EmployeeDetailsModal from './EmployeeDetailsModal';
import EditEmployeeModal from './EditEmployeeModal';
import { useRouter } from "next/navigation";
import InsertMovementModal from '../movementListComponents/InsertMovementModal';
import RequestVacationModal from '../vacationComponents/requestvacationModal';
import ProcessVacationModal from '../vacationComponents/processVacationModal';
const url: string = "http://localhost:3050";

interface Empleado {
  id: number;
  nombre: string;
  documento: string;
  idPuesto: number,
  nombrePuesto: string;
  saldoVacaciones: number;
}

interface Movimiento {
  id: number;
  fecha: string;
  tipoMovimiento: string;
  monto: number;
  nuevoSaldo: number;
  usuario: string;
  ip: string;
  estampaTiempo: string;
}

// Interfaces para evitar el uso de any
interface EmpleadoBackend {
  Id: number;
  Nombre: string;
  ValorDocumentoIdentidad: string;
  IdPuesto: number;
  NombrePuesto: string;
  SaldoVacaciones: number;
}

interface MovimientoBackend {
  Id: number;
  Fecha: string;
  NombreTipoMovimiento: string;
  Monto: number;
  NuevoSaldo: number;
  UsernamePostByUser: string;
  PostInIp: string;
  PostTime: string;
}

const EmployeeList = () => {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [filtro, setFiltro] = useState('');
  const [modalConfirmationVisible, setModalConfirmationVisible] = useState(false);
  const [insertEmployeeModalVisible, setInsertEmployeeModalVisible] = useState(false);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState<number | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<{
    id: number;
    nombre: string;
    documento: string;
    nombrePuesto: string;
    saldoVacaciones: number;
  } | null>(null);
  const [editEmployeeModalVisible, setEditEmployeeModalVisible] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<{
    id: number;
    nombre: string;
    documento: string;
    nombrePuesto: string;
    saldoVacaciones: number;
  } | null>(null);
  const router = useRouter();
  const [insertMovementModalVisible, setInsertMovementModalVisible] = useState(false);
  const [employeeForMovement, setEmployeeForMovement] = useState<{
    id: number;
    nombre: string;
    documento: string;
    saldoVacaciones: number;
  } | null>(null);

  const [requestVacationModalVisible, setRequestVacationModalVisible] = useState(false);
  const [employeeForVacation, setEmployeeForVacation] = useState<{
    id: number;
    nombre: string;
    documento: string;
    saldoVacaciones: number;
  } | null>(null);
  const [processVacationModalVisible, setProcessVacationModalVisible] = useState(false);

  useEffect(() => {
    fetchEmpleados();
  }, []);

  //**************************************************
  //************ACCION DE CARGAR EMPLEADOS************
  const fetchEmpleados = async () => {
    try {
      const response = await fetch(`${url}/api/v2/employee`);
      if (response.ok) {
        const data = await response.json();
        const empleadosBackend = data.data.empleados.map((empleado: EmpleadoBackend) => ({
          id: empleado.Id,
          nombre: empleado.Nombre,
          documento: empleado.ValorDocumentoIdentidad,
          idPuesto: empleado.IdPuesto,
          nombrePuesto: empleado.NombrePuesto,
          saldoVacaciones: empleado.SaldoVacaciones
        }));
        setEmpleados(empleadosBackend);
      } 
      else {
        console.error('Error al obtener empleados:', response.status);
      }
    } 
    catch (error) {
      console.error('Error al realizar la solicitud:', error);
    }
  };

  //**************************************************
  //***************ACCION DE FILTRO*******************
  const aplicarFiltro = async () => {
    try {
      let response;

      if (!filtro.trim()) {
        response = await fetch(`${url}/api/v2/employee`);
      }
      else if (/^\d+$/.test(filtro)) {
        response = await fetch(`${url}/api/v2/employee/DNI/${filtro}`);
      }
      else if (/^[a-zA-Z\s]+$/.test(filtro)) {
        response = await fetch(`${url}/api/v2/employee/name/${filtro}`);
      } 
      else {
        setEmpleados([]);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const empleadosBackend = data.data.empleados.map((empleado: EmpleadoBackend) => ({
          id: empleado.Id,
          nombre: empleado.Nombre,
          documento: empleado.ValorDocumentoIdentidad,
          idPuesto: empleado.IdPuesto,
          nombrePuesto: empleado.NombrePuesto,
          saldoVacaciones: empleado.SaldoVacaciones
        }));
        setEmpleados(empleadosBackend);
      } 
      else {
        console.error('Error al obtener empleados:', response.status);
        setEmpleados([]);
      }
    } 
    catch (error) {
      console.error('Error al realizar la solicitud:', error);
      setEmpleados([]);
    }
  };

  //**************************************************
  //***************ACCION DE INSERTAR*****************
  const handleInsert = async (empleado: { documento: string; nombre: string; idPuesto: number }) => {
    try {
      const response = await fetch(`${url}/api/v2/employee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          IdPuesto: empleado.idPuesto,
          ValorDocumentoIdentidad: empleado.documento,
          NombreEmpleado: empleado.nombre,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        fetchEmpleados();
        alert('Empleado insertado correctamente.');
        setInsertEmployeeModalVisible(false);
      } 
      else if (response.status === 400) { 
        const errorData = await response.json();
        alert(`Error: ${errorData.error.detail}`);
      }
      else {
        alert('No se pudo insertar el empleado. Inténtalo de nuevo.');
      }
    } 
    catch (error) {
  console.error(error);
      alert('Ocurrió un error al intentar insertar el empleado.');
    }
  };

  //**************************************************
  //**************ACCION DE MODIFICAR*****************
  const handleEdit = (empleado: {
    id: number;
    nombre: string;
    documento: string;
    nombrePuesto: string;
    saldoVacaciones: number;
  }) => {
    setEmployeeToEdit(empleado);
    setEditEmployeeModalVisible(true);
  };
  
  const handleEditSubmit = async (
    updatedEmployee: {
      id: number;
      nombre: string;
      documento: string;
      nombrePuesto: string;
    },
    DNIanterior: string
  ) => {
    let puestospr: { Id: number; Nombre: string }[] = [];
    try {
      const response = await fetch(`${url}/api/v2/position`);
      if (response.ok) {
        const data = await response.json();
        puestospr = (data.data.puestos);
      } 
      else {
        alert("No se pudieron cargar los puestos. Inténtalo de nuevo.");
      }
    } 
    catch (error) {
  console.error(error);
      alert("Ocurrió un error al intentar cargar los puestos.");
    }
    const puestoSeleccionado = puestospr.find((puesto) => puesto.Nombre === updatedEmployee.nombrePuesto);

    if (!puestoSeleccionado) {
      alert("No se encontró el puesto correspondiente al nombrePuesto.");
      return;
    }

    const idPuesto = puestoSeleccionado.Id;

    try {
      const response = await fetch(`${url}/api/v2/employee/${DNIanterior}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          IdPuestoNuevo: idPuesto,
          ValorDocumentoIdentidadNuevo: updatedEmployee.documento,
          NombreEmpleadoNuevo: updatedEmployee.nombre,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        fetchEmpleados();
        setEditEmployeeModalVisible(false);
        alert("Empleado actualizado correctamente.");
      } else if (response.status === 404) {
        const errorData = await response.json();
        alert(`Error: ${errorData.error.detail}`);
      } else {
        alert("Ocurrió un error inesperado al actualizar el empleado.");
      }
    } catch (error) {
  console.error(error);
      alert("Ocurrió un error al intentar actualizar el empleado.");
    }
  };

  //**************************************************
  //**************ACCION DE CONSULTAR*****************
  const handleQuery = (empleado: {
    id: number;
    nombre: string;
    documento: string;
    nombrePuesto: string;
    saldoVacaciones: number;
  }) => {
    setSelectedEmployee(empleado);
  };

  //**************************************************
  //*****************ACCION DE BORRAR*****************
  const handleDelete = (id: number) => {
    setEmpleadoAEliminar(id);
    setModalConfirmationVisible(true);
  };

  const confirmDelete = async () => {
    if (empleadoAEliminar !== null) {
      const empleado = empleados.find((emp) => emp.id === empleadoAEliminar);

      if (!empleado) {
        alert("No se encontró el empleado a eliminar.");
        return;
      }

      try {
        const response = await fetch(`${url}/api/v2/employee/${empleado.documento}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          fetchEmpleados();
          alert("Empleado eliminado correctamente.");
        } else {
          alert("No se pudo eliminar el empleado. Inténtalo de nuevo.");
        }
      } catch (error) {
      console.error(error);
        alert("Ocurrió un error al intentar eliminar el empleado.");
      } finally {
        setEmpleadoAEliminar(null);
        setModalConfirmationVisible(false);
      }
    }
  };

  const cancelDelete = async () => {
    setEmpleadoAEliminar(null);
    setModalConfirmationVisible(false);

    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");

    if (!usuarioGuardado.Id) {
      alert("No se encontró un usuario logueado.");
      return;
    }

    if (empleadoAEliminar !== null) {
      try {
        const response = await fetch(`${url}/api/v2/employee/deleteTry/${empleadoAEliminar}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ IdUser: usuarioGuardado.Id }),
        });

        if (!response.ok) {
          alert('No se pudo verificar si el empleado puede ser eliminado. Inténtalo de nuevo.');
        }
      } 
      catch (error) {
      console.error(error);
        alert('Ocurrió un error al intentar verificar la eliminación del empleado.');
      }
    }
  };

  //**************************************************
  //****************ACCION DE L. MOV.*****************
  const handleMovementList = async (empleado: {
    id: number;
    nombre: string;
    documento: string;
    saldoVacaciones: number;
  }) => {
    try {
      const response = await fetch(`${url}/api/v2/movement/${empleado.documento}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();

        const movimientos = data.data.movimientos.map((movimiento: MovimientoBackend) => ({
          id: movimiento.Id,
          fecha: movimiento.Fecha,
          tipoMovimiento: movimiento.NombreTipoMovimiento,
          monto: movimiento.Monto,
          nuevoSaldo: movimiento.NuevoSaldo,
          usuario: movimiento.UsernamePostByUser,
          ip: movimiento.PostInIp,
          estampaTiempo: movimiento.PostTime,
        }));

        router.push(
          `/movement?employeeId=${empleado.id}&employeeName=${encodeURIComponent(
            empleado.nombre
          )}&employeeDocumento=${empleado.documento}&employeeSaldoVacaciones=${
            empleado.saldoVacaciones
          }&movimientos=${encodeURIComponent(JSON.stringify(movimientos))}`
        );
      } 
      else {
        alert("No se pudieron cargar los movimientos del empleado.");
      }
    } 
    catch (error) {
    console.error(error);
      alert("Ocurrió un error al intentar cargar los movimientos.");
    }
  };

  //**************************************************
  //****************ACCION DE I. MOV.*****************
  const handleInsertMovement = (empleado: {
    id: number;
    nombre: string;
    documento: string;
    saldoVacaciones: number;
  }) => {
    setEmployeeForMovement(empleado);
    setInsertMovementModalVisible(true);
  };

  //**************************************************
  //****************ACCION DE VACACIONES**************
  const handleRequestVacation = (empleado: {
    id: number;
    nombre: string;
    documento: string;
    saldoVacaciones: number;
  }) => {
    setEmployeeForVacation(empleado);
    setRequestVacationModalVisible(true);
  };

  const handleListVacations = () => {
    router.push('/vacation');
  };

  const handleProcessVacations = () => {
    setProcessVacationModalVisible(true);
  };

  //**************************************************
  //****************ACCION DE LOGOUT******************
  const handleLogout = async () => {
    try {
      const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");

      if (!usuarioGuardado.Id) {
        alert("No se encontró un usuario logueado.");
        return;
      }

      const response = await fetch(`${url}/api/v2/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          UserId: usuarioGuardado.Id,
        }),
      });

      if (!response.ok) {
        alert("Ocurrió un error al intentar cerrar la sesión.");
      }
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al intentar cerrar la sesión.");
    } finally {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  return (
    <div className="listar-empleados-container">
      <h2>Lista de empleados</h2>
      <div className='filtro-container'>
        <FilterBar filtro={filtro} setFiltro={setFiltro} aplicarFiltro={aplicarFiltro} />
        <button onClick={() => setInsertEmployeeModalVisible(true)} className="insertar-boton">
          Insertar empleado
        </button>
        <button onClick={handleListVacations} className="list-vacations-button">
          Listar Solicitudes
        </button>
        <button onClick={handleProcessVacations} className="process-vacation-button">
          Tramitar Solicitudes
        </button>
        <button onClick={handleLogout} className="insertar-boton">
          Logout
        </button>
        <button onClick={() => router.push('/stats')} className="insertar-boton">
          Ver estadísticas
        </button>
      </div>
      <EmployeeTable empleados={empleados} handleDelete={handleDelete} handleQuery={handleQuery} handleEdit={handleEdit} handleMovementList={handleMovementList} handleInsertMovement={handleInsertMovement} handleRequestVacation={handleRequestVacation}/>
      {empleados.length === 0 && (
        <p>No se encontraron empleados con el filtro aplicado.</p>
      )}
      {modalConfirmationVisible && (
        <DeleteConfirmationModal
          empleadoId={empleadoAEliminar!}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
      {insertEmployeeModalVisible && (
        <InsertEmployeeModal
          onClose={() => setInsertEmployeeModalVisible(false)}
          onSubmit={handleInsert}
        />
      )}
      {selectedEmployee && (
        <EmployeeDetailsModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
      {editEmployeeModalVisible && employeeToEdit && (
        <EditEmployeeModal
          employee={employeeToEdit}
          onClose={() => setEditEmployeeModalVisible(false)}
          onSubmit={(updatedEmployee) => handleEditSubmit(updatedEmployee, employeeToEdit.documento)}
        />
      )}
      {insertMovementModalVisible && employeeForMovement && (
        <InsertMovementModal
          employee={employeeForMovement}
          onClose={() => setInsertMovementModalVisible(false)}
          onSubmit={(newMovement) => {
            fetchEmpleados();
            setInsertMovementModalVisible(false);
          }}
        />
      )}
      {requestVacationModalVisible && employeeForVacation && (
        <RequestVacationModal
          employee={employeeForVacation}
          onClose={() => setRequestVacationModalVisible(false)}
          onSubmit={() => {
            fetchEmpleados();
            setRequestVacationModalVisible(false);
          }}
        />
      )}
      {processVacationModalVisible && (
        <ProcessVacationModal
          onClose={() => setProcessVacationModalVisible(false)}
          onSubmit={() => {
            fetchEmpleados();
            setProcessVacationModalVisible(false);
          }}
        />
      )}
    </div>
  );
};

export default EmployeeList;