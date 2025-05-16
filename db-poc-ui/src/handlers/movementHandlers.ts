import { useRouter } from "next/navigation";

export const handleMovementList = async (
    router: ReturnType<typeof useRouter>,
    empleado: {
    id: number;
    nombre: string;
    documento: string;
    saldoVacaciones: number;
    }

    ) => {
    try {
      // Realizar la petición GET al backend
      const response = await fetch(`http://localhost:3001/api/v2/movement/${empleado.id}`, {
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

/*
export const handleMovementList = (
    router: ReturnType<typeof useRouter>
) => {

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
    // Otros movimientos...
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