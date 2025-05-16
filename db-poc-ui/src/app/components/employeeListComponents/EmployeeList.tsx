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

const EmployeeList = () => {
  //MOCK de empleados
  /*
  const mockEmpleados: Empleado[] = [
  { id: 1, nombre: 'Juan Pérez', documento: '123456', nombrePuesto: 'Gerente', saldoVacaciones: 10 },
  { id: 2, nombre: 'María López', documento: '654321', nombrePuesto: 'Analista', saldoVacaciones: 5 },
  { id: 3, nombre: 'Carlos Gómez', documento: '789012', nombrePuesto: 'Desarrollador', saldoVacaciones: 3 },
  { id: 4, nombre: 'Ana Torres', documento: '456789', nombrePuesto: 'Diseñador', saldoVacaciones: 2 },
  { id: 5, nombre: 'Luis Martínez', documento: '987654', nombrePuesto: 'Gerente', saldoVacaciones: 4 },
  ];*/
  const [empleados, setEmpleados] = useState<Empleado[]>([]);;
  const [filtro, setFiltro] = useState('');
  const [modalConfirmationVisible, setModalConfirmationVisible] = useState(false);
  const [insertEmployeeModalVisible, setInsertEmployeeModalVisible] = useState(false);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState<number | null>(null); //su valor puede ser un numero o null, empieza con un null
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
  const router = useRouter(); // Hook para manejar la navegación
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

  //Esta funcion se debe de des-comentar para que la web pida los empleados a la api apenas esta inicie
  useEffect(() => { //useEffect es un hook que se efectúa apenas se abra la web
    fetchEmpleados();
  }, []); // El array vacío asegura que esto se ejecute solo una vez al montar el componente
  
  //**************************************************
  //************ACCION DE CARGAR EMPLEADOS************
  // Obtener la lista inicial de empleados desde el backend
  const fetchEmpleados = async () => {
    try {
      const response = await fetch(`${url}/api/v2/employee`);
      if (response.ok) {
        const data = await response.json();
        console.log(data.data.empleados)
        //se recorren todos los empleados del json y se guardan en empleados con los datos necesarios
        const empleadosBackend = data.data.empleados.map((empleado: any) => ({
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
  //******FIN DE ACCION DE CARGAR EMPLEADOS***********

  //**************************************************
  //***************ACCION DE FILTRO*******************
  //Petición al backend de la lista dependiendo del filtro
  const aplicarFiltro = async () => {
    try {
      let response;

      // Caso 1: No hay filtro
      if (!filtro.trim()) {
        response = await fetch(`${url}/api/v2/employee`);
      }
      // Caso 2: Filtro por DNI (números)
      else if (/^\d+$/.test(filtro)) {
        response = await fetch(`${url}/api/v2/employee/DNI/${filtro}`);
      }
      // Caso 3: Filtro por nombre (letras y espacios)
      else if (/^[a-zA-Z\s]+$/.test(filtro)) {
        response = await fetch(`${url}/api/v2/employee/name/${filtro}`);
      } 
      else {
        setEmpleados([]);
        return;
      }

      // Procesar la respuesta del backend
      if (response.ok) {
        const data = await response.json();
        console.log(data.data.empleados);
        const empleadosBackend = data.data.empleados.map((empleado: any) => ({
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
  //***********FIN DE ACCION DE FILTRO****************

  //**************************************************
  //***************ACCION DE INSERTAR*****************
  const handleInsert = async (empleado: { documento: string; nombre: string; idPuesto: number }) => {
    console.log(empleado.idPuesto);
    try {
      // Realizar la petición POST al backend
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
        console.log(data.data.detail); // Mensaje de éxito del backend (borrar)
  
        // Actualizar la lista de empleados en el frontend
        fetchEmpleados();
        alert('Empleado insertado correctamente.');
        setInsertEmployeeModalVisible(false);
      } 
      else if (response.status === 400) { 
        const errorData = await response.json();
        console.error('Error al insertar empleado:', errorData.error.detail); //borrar
        alert(`Error: ${errorData.error.detail}`);
      }
      else {
        console.error('Error desconocido al insertar empleado:', response.status);
        alert('No se pudo insertar el empleado. Inténtalo de nuevo.');
      }
    } 
    catch (error) {
      console.error('Error al realizar la solicitud:', error); //borrar
      alert('Ocurrió un error al intentar insertar el empleado.');
    }
  };
  //**************************************************
  //************FIN DE ACCION DE INSERTAR*************

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
    
    // Buscar el idPuesto correspondiente al nombrePuesto
    let puestospr: { Id: number; Nombre: string }[] = [];
    try {
      const response = await fetch(`${url}/api/v2/position`);
      if (response.ok) {
        const data = await response.json();
        puestospr = (data.data.puestos); // Guardar los puestos en el estado
      } 
      else {
        console.error("Error al obtener los puestos:", response.status);
        alert("No se pudieron cargar los puestos. Inténtalo de nuevo.");
      }
    } 
    catch (error) {
      console.error("Error al realizar la solicitud:", error);
      alert("Ocurrió un error al intentar cargar los puestos.");
    }
    console.log("PUESTOS:", puestospr)
    const puestoSeleccionado = puestospr.find((puesto) => puesto.Nombre === updatedEmployee.nombrePuesto);
  
    if (!puestoSeleccionado) {
      console.error("No se encontró el puesto correspondiente al nombrePuesto.");
      alert("No se encontró el puesto correspondiente al nombrePuesto.");
      return;
    }
  
    const idPuesto = puestoSeleccionado.Id; // Obtener el idPuesto
  
    console.log("Datos enviados al backend:", {
      IdPuestoNuevo: idPuesto,
      ValorDocumentoIdentidadNuevo: updatedEmployee.documento,
      NombreEmpleadoNuevo: updatedEmployee.nombre,
    });
    console.log("DNI", DNIanterior);
  
    try {
      const response = await fetch(`${url}/api/v2/employee/${DNIanterior}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          IdPuestoNuevo: idPuesto, // Enviar el idPuesto
          ValorDocumentoIdentidadNuevo: updatedEmployee.documento,
          NombreEmpleadoNuevo: updatedEmployee.nombre,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log(data.data.message); // Mensaje de éxito del backend
        fetchEmpleados(); // Actualizar la lista de empleados
        setEditEmployeeModalVisible(false);
        alert("Empleado actualizado correctamente.");
      } else if (response.status === 404) {
        const errorData = await response.json();
        alert(`Error: ${errorData.error.detail}`); // Mostrar mensaje de error del backend
      } else {
        alert("Ocurrió un error inesperado al actualizar el empleado.");
      }
    } catch (error) {
      console.error("Error al actualizar el empleado:", error);
      alert("Ocurrió un error al intentar actualizar el empleado.");
    }
  };
  //**************************************************
  //***********FIN DE ACCION DE MODIFICAR*************

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
  //*************FIN DE ACCION DE BORRAR**************

  //**************************************************
  //*****************ACCION DE BORRAR*****************
  const handleDelete = (id: number) => {
    setEmpleadoAEliminar(id);
    setModalConfirmationVisible(true);
  };

  const confirmDelete = async () => {
    if (empleadoAEliminar !== null) {
      // Buscar el empleado correspondiente al id
      const empleado = empleados.find((emp) => emp.id === empleadoAEliminar);
  
      if (!empleado) {
        console.error("No se encontró el empleado con el ID proporcionado.");
        alert("No se encontró el empleado a eliminar.");
        return;
      }
  
      console.log("Documento del empleado a eliminar:", empleado.documento);
  
      try {
        // Realizar la petición DELETE al backend con el documento
        const response = await fetch(`${url}/api/v2/employee/${empleado.documento}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log(data.data.detail); // Mensaje de éxito del backend
  
          // Actualizar la lista de empleados en el frontend
          fetchEmpleados(); // Actualizar la lista de empleados
          alert("Empleado eliminado correctamente.");
        } else {
          console.error("Error al eliminar empleado:", response.status);
          alert("No se pudo eliminar el empleado. Inténtalo de nuevo.");
        }
      } catch (error) {
        console.error("Error al realizar la solicitud:", error);
        alert("Ocurrió un error al intentar eliminar el empleado.");
      } finally {
        // Restablecer el valor del estado
        setEmpleadoAEliminar(null);
        setModalConfirmationVisible(false);
      }
    }
  };

  const cancelDelete = async () => {
    setEmpleadoAEliminar(null);
    setModalConfirmationVisible(false);

    //enviar peticion al backend (intento de borrado)

    // Obtener el usuario logueado desde el localStorage
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");

    // Verificar si el Id existe en el objeto recuperado
    if (!usuarioGuardado.Id) {
      console.error("No se encontró un usuario logueado.");
      alert("No se encontró un usuario logueado.");
      return;
    }

    console.log(empleadoAEliminar)
    console.log("Id del usuario logueado:", usuarioGuardado.Id);

    if (empleadoAEliminar !== null) {
      try {
        const response = await fetch(`${url}/api/v2/employee/deleteTry/${empleadoAEliminar}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ IdUser: usuarioGuardado.Id }),
        });
  
        if (response.ok) {
          //no pasa nada
          //alert('Alerta de intento de borrado con éxito');//borrar
        } 
        else {
          console.error('Error al verificar eliminación:', response.status);
          alert('No se pudo verificar si el empleado puede ser eliminado. Inténtalo de nuevo.');//borrar
        }
      } 
      catch (error) {
        console.error('Error al realizar la solicitud:', error);
        alert('Ocurrió un error al intentar verificar la eliminación del empleado.'); //borrar
      }
    }
  };
  //**************************************************
  //************FIN DE ACCION DE BORRAR***************

  //**************************************************
  //****************ACCION DE L. MOV.*****************
  const handleMovementList = async (empleado: {
    id: number;
    nombre: string;
    documento: string;
    saldoVacaciones: number;
  }) => {
    
    try {
      // Realizar la petición GET al backend
      const response = await fetch(`${url}/api/v2/movement/${empleado.documento}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
  
        // Procesar los datos del empleado y sus movimientos
        const movimientos = data.data.movimientos.map((movimiento: any) => ({
          id: movimiento.Id,
          fecha: movimiento.Fecha,
          tipoMovimiento: movimiento.NombreTipoMovimiento,
          monto: movimiento.Monto,
          nuevoSaldo: movimiento.NuevoSaldo,
          usuario: movimiento.UsernamePostByUser,
          ip: movimiento.PostInIp,
          estampaTiempo: movimiento.PostTime,
        }));
  
        console.log("Movimientos del empleado:", movimientos);
  
        // Redirigir a la página de listar movimientos con los datos del empleado y sus movimientos
        router.push(
          `/movement?employeeId=${empleado.id}&employeeName=${encodeURIComponent(
            empleado.nombre
          )}&employeeDocumento=${empleado.documento}&employeeSaldoVacaciones=${
            empleado.saldoVacaciones
          }&movimientos=${encodeURIComponent(JSON.stringify(movimientos))}`
        );
      } 
      else {
        console.error("Error al obtener movimientos:", response.status);
        alert("No se pudieron cargar los movimientos del empleado.");
      }
    } 
    catch (error) {
      console.error("Error al realizar la solicitud:", error);
      alert("Ocurrió un error al intentar cargar los movimientos.");
    }
  };
  
  //Mock de movimientos
  /*
  const handleMovementList = async () => {
      const mockEmployee = {
        id: 1,
        nombre: "Juan Pérez",
        documento: "123456",
        saldoVacaciones: 10,
      };
    
      // Datos de prueba para los movimientos
      const mockMovimientos = [
        {
          id: 1,
          fecha: "2024-03-10T00:00:00Z",
          tipoMovimiento: "Vacaciones",
          monto: 3,
          nuevoSaldo: 7,
          usuario: "admin",
          ip: "192.168.1.5",
          estampaTiempo: "2024-03-10T14:30:22Z",
        },
        {
          id: 2,
          fecha: "2024-03-15T00:00:00Z",
          tipoMovimiento: "Asignación",
          monto: 5,
          nuevoSaldo: 12,
          usuario: "admin",
          ip: "192.168.1.5",
          estampaTiempo: "2024-03-15T10:00:00Z",
        },
        {
          id: 3,
          fecha: "2024-03-20T00:00:00Z",
          tipoMovimiento: "Vacaciones",
          monto: 2,
          nuevoSaldo: 10,
          usuario: "user1",
          ip: "192.168.1.10",
          estampaTiempo: "2024-03-20T09:15:00Z",
        },
        {
          id: 4,
          fecha: "2024-03-25T00:00:00Z",
          tipoMovimiento: "Asignación",
          monto: 4,
          nuevoSaldo: 14,
          usuario: "user2",
          ip: "192.168.1.11",
          estampaTiempo: "2024-03-25T11:45:00Z",
        },
        {
          id: 5,
          fecha: "2024-03-30T00:00:00Z",
          tipoMovimiento: "Vacaciones",
          monto: 1,
          nuevoSaldo: 13,
          usuario: "admin",
          ip: "192.168.1.5",
          estampaTiempo: "2024-03-30T14:00:00Z",
        },
        {
          id: 6,
          fecha: "2024-04-05T00:00:00Z",
          tipoMovimiento: "Asignación",
          monto: 6,
          nuevoSaldo: 19,
          usuario: "user3",
          ip: "192.168.1.12",
          estampaTiempo: "2024-04-05T08:30:00Z",
        },
        {
          id: 7,
          fecha: "2024-04-10T00:00:00Z",
          tipoMovimiento: "Vacaciones",
          monto: 3,
          nuevoSaldo: 16,
          usuario: "user4",
          ip: "192.168.1.13",
          estampaTiempo: "2024-04-10T13:20:00Z",
        },
        {
          id: 8,
          fecha: "2024-04-15T00:00:00Z",
          tipoMovimiento: "Asignación",
          monto: 7,
          nuevoSaldo: 23,
          usuario: "admin",
          ip: "192.168.1.5",
          estampaTiempo: "2024-04-15T10:10:00Z",
        },
        {
          id: 9,
          fecha: "2024-04-20T00:00:00Z",
          tipoMovimiento: "Vacaciones",
          monto: 2,
          nuevoSaldo: 21,
          usuario: "user5",
          ip: "192.168.1.14",
          estampaTiempo: "2024-04-20T16:45:00Z",
        },
        {
          id: 10,
          fecha: "2024-04-25T00:00:00Z",
          tipoMovimiento: "Asignación",
          monto: 8,
          nuevoSaldo: 29,
          usuario: "user6",
          ip: "192.168.1.15",
          estampaTiempo: "2024-04-25T09:00:00Z",
        },
        {
          id: 11,
          fecha: "2024-04-30T00:00:00Z",
          tipoMovimiento: "Vacaciones",
          monto: 4,
          nuevoSaldo: 25,
          usuario: "admin",
          ip: "192.168.1.5",
          estampaTiempo: "2024-04-30T12:30:00Z",
        },
        {
          id: 12,
          fecha: "2024-05-05T00:00:00Z",
          tipoMovimiento: "Asignación",
          monto: 10,
          nuevoSaldo: 35,
          usuario: "user7",
          ip: "192.168.1.16",
          estampaTiempo: "2024-05-05T15:00:00Z",
        },
      ];
      // Redirigir a la página de listar movimientos con los datos del empleado y sus movimientos
      router.push(
        `/movement?employeeId=${mockEmployee.id}&employeeName=${encodeURIComponent(
          mockEmployee.nombre
        )}&employeeDocumento=${mockEmployee.documento}&employeeSaldoVacaciones=${
          mockEmployee.saldoVacaciones
        }&movimientos=${encodeURIComponent(JSON.stringify(mockMovimientos))}&noMovimientos=${
          mockMovimientos.length === 0
        }`
      );
  };*/
  
  
  //**************************************************
  //************FIN DE ACCION DE L. MOV***************

  //**************************************************
  //****************ACCION DE I. MOV.*****************
  const handleInsertMovement = (empleado: {
    id: number;
    nombre: string;
    documento: string;
    saldoVacaciones: number;
  }) => {
    setEmployeeForMovement(empleado); // Establece el empleado seleccionado
    setInsertMovementModalVisible(true); // Muestra el modal
  };
  //**************************************************
  //****************ACCION DE I. MOV.*****************
  //**************************************************
  //****************ACCION DE VACACIONES**************
  // Función para manejar solicitudes de vacaciones
  const handleRequestVacation = (empleado: {
    id: number;
    nombre: string;
    documento: string;
    saldoVacaciones: number;
  }) => {
    setEmployeeForVacation(empleado);
    setRequestVacationModalVisible(true);
  };

  // Función para ir a la página de listar solicitudes de vacaciones
  const handleListVacations = () => {
    router.push('/vacation');
  };

  // Función para mostrar el modal de tramitar solicitudes
  const handleProcessVacations = () => {
    setProcessVacationModalVisible(true);
  };
  //**************************************************
  //************FIN DE ACCION DE VACACIONES***********

  //**************************************************
  //**************************************************
  //****************ACCION DE LOGOUT******************
  const handleLogout = async () => {
    try {
      // Recuperar el usuario desde el localStorage
      const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");

      // Verificar si el Id existe en el objeto recuperado
      if (!usuarioGuardado.Id) {
        alert("No se encontró un usuario logueado.");
        return;
      }

      // Realizar la petición POST al backend para cerrar sesión
      const response = await fetch(`${url}/api/v2/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          UserId: usuarioGuardado.Id, // Pasar el Id recuperado del localStorage
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log(data.detail); // Mensaje de éxito del backend (puede eliminarlo después)
      } else {
        console.error("Error al cerrar sesión:", response.status);
        alert("Ocurrió un error al intentar cerrar la sesión.ss");
      }
    } catch (error) {
      console.error("Error al realizar la solicitud de logout:", error);
      alert("Ocurrió un error al intentar cerrar la sesión.");
    } finally {
      // Limpiar el localStorage y redirigir al usuario a la página de login
      localStorage.clear();
      router.push("/login");
    }
  };
  //**************************************************
  //************FIN DE ACCION DE LOGOUT***************
  //renderizado
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
          employee={employeeForMovement} // Pasa los datos del empleado seleccionado
          onClose={() => setInsertMovementModalVisible(false)} // Cierra el modal
          onSubmit={(newMovement) => {
            console.log("Nuevo movimiento registrado:", newMovement);
            fetchEmpleados();
            setInsertMovementModalVisible(false); // Cierra el modal después de registrar el movimiento
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