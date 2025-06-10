import { execute } from "../config/db.config";
import { TYPES } from "mssql";
import { inSqlParameters } from "../types/queryParams.type";
import { useMock } from "../app";
import ErrorResponseDTO from "../dtos/ErrorResponseDTO";
import ErrorHandler from "../utils/ErrorHandler";
import {
  GetEmployeesSuccessResponseDTO,
  GetEmployeeByIdSuccessResponseDTO,
  CreateEmployeesSuccessResponseDTO,
  CreateEmployeesDTO,
  EmployeesErrorResponseDTO,
  CreateEmployeeRequestDTO,
  CreateEmployeeSuccessResponseDTO,
  UpdateEmployeesDTO,
  UpdateEmployeesSuccessResponseDTO,
  TryDeleteEmployeeDTO,
  TryDeleteEmployeeSuccessResponseDTO,
  DeleteEmployeeDTO,
  DeleteEmployeeSuccessResponseDTO,
  GetEmployeeByNameDTO,
  GetEmployeeByNameSuccessResponseDTO,
  GetEmployeeByDNIDTO,
  GetEmployeeByDNISuccessResponseDTO,
} from "../dtos/EmployeeDTO";

class EmployeeService {
  async createEmployee(
    data: CreateEmployeesDTO,
  ): Promise<CreateEmployeesSuccessResponseDTO | EmployeesErrorResponseDTO> {
    const params: inSqlParameters = {
      inIdPuesto: [String(data.IdPuesto), TYPES.Int],
      inValorDocumentoIdentidad: [data.ValorDocumentoIdentidad, TYPES.VarChar],
      inNombreEmpleado: [data.NombreEmpleado, TYPES.VarChar],
    };

    try {
      if (useMock)
        return { success: true, data: { id: 1, detail: "Employ was created" } };
      else {
        const response = await execute("sp_insertar_empleado", params, {});
        if (response.output.outResultCode == 0) {
          const data = response.recordset[0];
          return {
            success: true,
            data: { id: data.Id, detail: "Empleado creado" },
          };
        } else {
          return ErrorHandler(response) as EmployeesErrorResponseDTO;
        }
      }
    } catch (error) {
      console.error("Error details:", error);
      throw new Error(`An error occurred while creating the employ: ${error}`);
    }
  }

  async getEmployees(userId: number, ip: string): Promise<
    GetEmployeesSuccessResponseDTO | EmployeesErrorResponseDTO
  > {
    if (useMock)
      return {
        success: true,
        data: [
            {
              Id: 1,
              Name: "test",
              DateBirth: new Date(2005, 11, 12),
              DNI: "1190232021",
              Position: "Empleado",
              Department: "Albañil"
            }
          ],
        message: "",
        timestamp: new Date().toISOString()
      };
    else {
      try {
        const params: inSqlParameters = {
          inIdUsuario: [String(userId), TYPES.Int],
          inIP: [ip, TYPES.VarChar],
        };
        const response = await execute("sp_listar_empleados", params, {});
        if (response.output.outResultCode == 0) {
          return {
            success: true,
            data: response.recordset,
            message: "",
            timestamp: new Date().toISOString()
          };
        } 
        else {
          console.log(response.output.outResultCode)
          return ErrorHandler(response) as ErrorResponseDTO;
        }
      } 
      catch (error) {
        throw new Error("Error fetching the data in the DB.");
      }
    }
  }

  async searchEmployees(
    filter: string,
    userId: number,
    ip: string
  ): Promise<GetEmployeesSuccessResponseDTO | ErrorResponseDTO> {
    const params: inSqlParameters = {
      inBusqueda: [filter, TYPES.VarChar],
      inIdUsuario: [String(userId), TYPES.Int],
      inIP: [ip, TYPES.VarChar],
    };
    try {
      if (useMock) {
        return {
          success: true,
          data: [
            {
              Id: 1,
              Name: "Empleado Filtro",
              DateBirth: new Date(2000, 0, 1),
              DNI: "12345678",
              Position: "Empleado",
              Department: "Recursos Humanos"
            }
          ],
          message: "",
          timestamp: new Date().toISOString()
        };
      } 
      else {
        const response = await execute("sp_buscar_empleados", params, {});
        if (response.output.outResultCode == 0) {
          return {
            success: true,
            data: response.recordset,
            message: "",
            timestamp: new Date().toISOString()
          };
        } else {
          return ErrorHandler(response) as ErrorResponseDTO;
        }
      }
    } catch (error) {
      throw new Error("Error searching employees in the DB.");
    }
  }
  
async getEmployeeById(
  id: number,
  userId: number,
  ip: string
): Promise<GetEmployeeByIdSuccessResponseDTO | EmployeesErrorResponseDTO> {
  const params: inSqlParameters = {
    inIdUsuario: [String(userId), TYPES.Int],
    inIP: [ip, TYPES.VarChar],
    inIdEmpleado: [String(id), TYPES.Int],
  };
  try {
    if (useMock) {
      return {
        success: true,
        data: {
          Id: 1,
          Name: "Empleado Demo",
          DateBirth: new Date(2000, 0, 1),
          DNI: "12345678",
          Position: "Empleado",
          Department: "Recursos Humanos"
        },
        message: "",
        timestamp: new Date().toISOString()
      };
    } 
    else {
      const response = await execute("sp_consultar_empleado", params, {});
      console.log(response.recordset.length)
      if (response.output.outResultCode == 0 && response.recordset.length > 0) {
        const data = response.recordset[0];
        return {
          success: true,
          data: {
            Id: data.Id,
            Name: data.Name,
            DateBirth: data.DateBirth,
            DNI: data.DNI,
            Position: data.Position,
            Department: data.Department
          },
          message: "",
          timestamp: new Date().toISOString()
        };
      } 
      else {
        return ErrorHandler(response) as ErrorResponseDTO;
      }
    }
  } catch (error) {
    throw new Error("Error fetching employee by ID.");
  }
}

async createEmployeeV2(
  data: CreateEmployeeRequestDTO,
  userId: number,
  ip: string
): Promise<CreateEmployeeSuccessResponseDTO | EmployeesErrorResponseDTO> {
  const params: inSqlParameters = {
    inIdUsuario: [String(userId), TYPES.Int],
    inIP: [ip, TYPES.VarChar],
    inNombre: [data.Name, TYPES.VarChar],
    inEmpleadoUsuario: [data.NameUser, TYPES.VarChar],
    inEmpleadoContraseña: [data.PasswordUser, TYPES.VarChar],
    inIdDocTipo: [String(data.DocumentTypeId), TYPES.Int],
    inValorDoc: [data.DocumentValue, TYPES.VarChar],
    inFechaNacimiento: [
      data.DateBirth
        ? (typeof data.DateBirth === "string"
            ? new Date(data.DateBirth).toISOString().slice(0, 10)
            : data.DateBirth.toISOString().slice(0, 10))
        : "",
      TYPES.DateTime
    ],
    inIdPuesto: [String(data.PositionId), TYPES.Int],
    inIdDepartamento: [String(data.DepartmentId), TYPES.Int],
  };
  try {
    if (useMock) {
      return {
        success: true,
        data: { Id: 1, Name: data.Name },
        message: "Empleado creado exitosamente con deducciones obligatorias asignadas",
        timestamp: new Date().toISOString(),
      };
    } 
    else {
      console.log(params)
      const response = await execute("sp_crear_empleado", params, {});
      
      if (response.output.outResultCode == 0 && response.recordset.length > 0) {
        const emp = response.recordset[0];
        return {
          success: true,
          data: { Id: emp.Id, Name: emp.Name },
          message: "Empleado creado exitosamente con deducciones obligatorias asignadas",
          timestamp: new Date().toISOString(),
        };
      } 
      else {
        return ErrorHandler(response) as ErrorResponseDTO;
      }
    }
  } 
  catch (error) {
    return {
      success: false,
      error: {
        code: 50008,
        detail: "Error del sistema creando el empleado",
      },
      timestamp: new Date().toISOString(),
    };
  }
}
  /*
  async getEmployeeById(id: number): Promise<any> {
    if (!id || id < 1) {
      throw new Error("Invalid id");
    }

    const inParams: inSqlParameters = {
      inId: [id.toString(), TYPES.Int],
    };

    try {
      const response = await query("sp_get_employee_by_id", inParams,{});
      if (response.output.outResultCode == 0) {
        return response.recordset[0];
      } else {
        

      }
    } catch (error) {
      throw new Error("Error fetching the data.");
    }
  }
*/
  async updateEmployee(
    data: UpdateEmployeesDTO,
  ): Promise<UpdateEmployeesSuccessResponseDTO | EmployeesErrorResponseDTO> {
    const params: inSqlParameters = {
      inValorDocIdentidad_Actual: [
        data.ValorDocumentoIdentidadActual,
        TYPES.VarChar,
      ],
      inNuevoIdPuesto: [String(data.IdPuestoNuevo), TYPES.Int],
      inNuevoValorDocIdentidad: [
        data.ValorDocumentoIdentidadNuevo,
        TYPES.VarChar,
      ],
      inNuevoNombre: [data.NombreEmpleadoNuevo, TYPES.VarChar],
    };

    try {
      if (useMock)
        return {
          success: true,
          data: {
            message: "Employ was updated",
            updatedFields: [
              "NombrePuesto",
              "ValorDocumentoIdentidad",
              "NombreEmpleado",
            ],
          },
        };
      else {
        const response = await execute("sp_actualizar_empleados", params, {});
        if (response.output.outResultCode == 0) {
          const data = response.recordset[0];
          return {
            success: true,
            data: {
              message: "Empleado actualizado",
              updatedFields: [
                "IdPuesto",
                "ValorDocumentoIdentidad",
                "NombreEmpleado",
              ],
            },
          };
        } else {
          return ErrorHandler(response) as EmployeesErrorResponseDTO;
        }
      }
    } catch (error) {
      console.error("Error details:", error);
      throw new Error(`An error occurred while creating the employ: ${error}`);
    }
  }

  async tryDeleteEmployee(
    data: TryDeleteEmployeeDTO,
  ): Promise<TryDeleteEmployeeSuccessResponseDTO | EmployeesErrorResponseDTO> {
    const params: inSqlParameters = {
      inEmpleadoId: [String(data.IdEmpleado), TYPES.Int],
      inUserId: [String(data.IdUser), TYPES.Int],
      inIP: [data.IPAddress, TYPES.VarChar],
    };

    try {
      if (useMock)
        return {
          success: true,
          data: {
            canDelete: true,
            detail: "Empleado puede ser borrado sin conflictos",
          },
        };
      else {
        const response = await execute(
          "sp_intento_borrado_no_confirmado",
          params,
          {},
        );
        if (response.output.outResultCode == 0) {
          return {
            success: true,
            data: {
              canDelete: true,
              detail: "Empleado puede ser borrado sin conflictos",
            },
          };
        } else {
          return ErrorHandler(response) as EmployeesErrorResponseDTO;
        }
      }
    } catch (error) {
      console.error("Error details:", error);
      throw new Error(`An error occurred while creating the employ: ${error}`);
    }
  }

  async deleteEmployee(
    data: DeleteEmployeeDTO,
  ): Promise<DeleteEmployeeSuccessResponseDTO | EmployeesErrorResponseDTO> {
    const params: inSqlParameters = {
      inValorDocumentoIdentidad: [
        String(data.ValorDocumentoIdentidad),
        TYPES.VarChar,
      ],
    };

    try {
      if (useMock)
        return { success: true, data: { detail: "Employ was deleted" } };
      else {
        const response = await execute(
          "sp_borrado_logico_empleado",
          params,
          {},
        );
        if (response.output.outResultCode == 0) {
          const data = response.recordset[0];
          return { success: true, data: { detail: "Empledo borrado" } };
        } else {
          return ErrorHandler(response) as EmployeesErrorResponseDTO;
        }
      }
    } catch (error) {
      console.error("Error details:", error);
      throw new Error(`An error occurred while creating the employ: ${error}`);
    }
  }

  async getEmployeeByName(
    data: GetEmployeeByNameDTO,
  ): Promise<GetEmployeeByNameSuccessResponseDTO | EmployeesErrorResponseDTO> {
    const params: inSqlParameters = {
      inFiltro: [data.employeeName, TYPES.VarChar],
    };

    try {
      if (useMock)
        return {
          success: true,
          data: {
            total: 1,
            empleados: [
              {
                Id: 1,
                IdPuesto: 1,
                NombrePuesto: "test",
                ValorDocumentoIdentidad: "1211111",
                Nombre: "test",
                FechaContratacion: "2023-10-01",
                SaldoVacaciones: 0,
                EsActivo: true,
              },
            ],
          },
        };
      else {
        const response = await execute("sp_consultar_empleado", params, {});
        if (response.output.outResultCode == 0) {
          return {
            success: true,
            data: {
              total: response.recordset.length,
              empleados: response.recordset,
            },
          };
        } else {
          return ErrorHandler(response) as EmployeesErrorResponseDTO;
        }
      }
    } catch (error) {
      console.error("Error details:", error);
      throw new Error(`An error occurred while creating the employ: ${error}`);
    }
  }

  async getEmployeeByDNI(
    data: GetEmployeeByDNIDTO,
  ): Promise<GetEmployeeByDNISuccessResponseDTO | EmployeesErrorResponseDTO> {
    const params: inSqlParameters = {
      inFiltro: [data.employeeDNI, TYPES.VarChar],
    };

    try {
      if (useMock)
        return {
          success: true,
          data: {
            total: 1,
            empleados: [
              {
                Id: 1,
                IdPuesto: 1,
                NombrePuesto: "1211111",
                ValorDocumentoIdentidad: "test",
                Nombre: "test",
                FechaContratacion: "2023-10-01",
                SaldoVacaciones: 0,
                EsActivo: true,
              },
            ],
          },
        };
      else {
        const response = await execute("sp_consultar_empleado", params, {});
        if (response.output.outResultCode == 0) {
          return {
            success: true,
            data: {
              total: response.recordset.length,
              empleados: response.recordset,
            },
          };
        } else {
          return ErrorHandler(response) as EmployeesErrorResponseDTO;
        }
      }
    } catch (error) {
      console.error("Error details:", error);
      throw new Error(`An error occurred while creating the employ: ${error}`);
    }
  }
}

export default new EmployeeService();
