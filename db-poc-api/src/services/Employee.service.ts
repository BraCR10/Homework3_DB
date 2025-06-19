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
  UpdateEmployeeRequestDTO,
  UpdateEmployeeSuccessResponseDTO,
  CreateEmployeeSuccessResponseDTO,
  GetPositionsSuccessResponseDTO,
  GetDepartmentsSuccessResponseDTO,
  GetDeductionTypesSuccessResponseDTO,
  GetWeeklyPayrollSuccessResponseDTO,
  GetWeeklyDeductionsSuccessResponseDTO,
  GetWeeklyGrossDetailSuccessResponseDTO,
  GetMonthlyPayrollSuccessResponseDTO,
  UpdateEmployeesDTO,
  UpdateEmployeesSuccessResponseDTO,
  TryDeleteEmployeeDTO,
  TryDeleteEmployeeSuccessResponseDTO,
  GetDocumentTypesSuccessResponseDTO,
  DeleteEmployeeSuccessResponseDTO,
  GetEmployeeByNameDTO,
  GetEmployeeByNameSuccessResponseDTO,
  GetEmployeeByDNIDTO,
  GetEmployeeByDNISuccessResponseDTO,
} from "../dtos/EmployeeDTO";
import { error } from "console";

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
  if (!data.DateBirth) {
    throw new Error("DateBirth es requerido");
  }
  const params: inSqlParameters = {
    inIdUsuario: [String(userId), TYPES.Int],
    inIP: [ip, TYPES.VarChar],
    inNombre: [data.Name, TYPES.VarChar],
    inEmpleadoUsuario: [data.NameUser, TYPES.VarChar],
    inEmpleadoContraseña: [data.PasswordUser, TYPES.VarChar],
    inIdDocTipo: [String(data.DocumentTypeId), TYPES.Int],
    inValorDoc: [data.DocumentValue, TYPES.VarChar],
    inFechaNacimiento: [
      data.DateBirth ? new Date(data.DateBirth).toISOString().slice(0, 10) : null,
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

async updateEmployeeV2(
  id: number,
  data: UpdateEmployeeRequestDTO,
  userId: number,
  ip: string
): Promise<UpdateEmployeeSuccessResponseDTO | ErrorResponseDTO> {
  const params: inSqlParameters = {
    inIdUsuario: [String(userId), TYPES.Int],
    inIP: [ip, TYPES.VarChar],
    inIdEmpleado: [String(id), TYPES.Int],
    inNombre: [data.Name ?? null, TYPES.VarChar],
    inIdDocTipo: [data.DocumentTypeId !== null ? String(data.DocumentTypeId) : null, TYPES.Int],
    inValorDoc: [data.DocumentValue ?? null, TYPES.VarChar],
    inFechaNacimiento: [
      data.DateBirth ? new Date(data.DateBirth).toISOString().slice(0, 10) : null,
      TYPES.DateTime
    ],
    inIdPuesto: [data.PositionId !== null ? String(data.PositionId) : null, TYPES.Int],
    inIdDepartamento: [data.DepartmentId !== null ? String(data.DepartmentId) : null, TYPES.Int],
  };

  try {
    console.log(params)
    const response = await execute("sp_actualizar_empleado", params, {});
    if (response.output.outResultCode == 0 && response.recordset.length > 0) {
      const emp = response.recordset[0];
      return {
        success: true,
        message: "Empleado actualizado exitosamente",
        data: {
          Id: emp.Id,
          Name: emp.Name,
        },
        timestamp: new Date().toISOString(),
      };
    } else {
      return ErrorHandler(response) as ErrorResponseDTO;
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 50008,
        detail: "Error del sistema actualizando el empleado",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

async deleteEmployeeV2(
  id: number,
  userId: number,
  ip: string
): Promise<DeleteEmployeeSuccessResponseDTO | ErrorResponseDTO> {
  const params: inSqlParameters = {
    inIdUsuario: [String(userId), TYPES.Int],
    inIP: [ip, TYPES.VarChar],
    inIdEmpleado: [String(id), TYPES.Int],
  };

  try {
    const response = await execute("sp_eliminar_empleados", params, {});
    if (response.output.outResultCode === 0) {
      return {
        success: true,
        message: "Empleado eliminado exitosamente",
        data: {},
        timestamp: new Date().toISOString(),
      };
    } else {
      return ErrorHandler(response) as ErrorResponseDTO;
    }
  } 
  catch (error) {
    return {
      success: false,
      error: {
        code: 50008,
        detail: "Error del sistema eliminando el empleado",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

async impersonateEmployeeV2(
  id: number,
  userId: number,
  ip: string
): Promise<any> {
  const params: inSqlParameters = {
    inIdUsuario: [String(userId), TYPES.Int],
    inIP: [ip, TYPES.VarChar],
    inIdEmpleado: [String(id), TYPES.Int],
  };

  try {
    
    const response = await execute("sp_impersonar_empleado", params, {});
    console.log(params)
    if (response.output.outResultCode === 0 && response.recordset.length > 0) {
      const emp = response.recordset[0];
      return {
        success: true,
        data: {
          employeeInfo: {
            Name: emp.Name,
            DateBirth: emp.DateBirth,
            DNI: emp.DNI,
            Position: emp.Position,
            Department: emp.Department,
          }
        },
        message: "Impersonación exitosa",
        timestamp: new Date().toISOString(),
      };
    } else {
      return ErrorHandler(response);
    }
  } 
  catch (error) {
    console.error("Error en impersonateEmployeeV2:", error);
    return {
      success: false,
      error: {
        code: 50008,
        detail: "Error del sistema al impersonar el empleado",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

async stopImpersonationEmployeeV2(
  id: number,
  userId: number,
  ip: string
): Promise<DeleteEmployeeSuccessResponseDTO | ErrorResponseDTO> {
  const params: inSqlParameters = {
    inIdUsuario: [String(userId), TYPES.Int],
    inIP: [ip, TYPES.VarChar],
    inIdEmpleado: [String(id), TYPES.Int],
  };

  try {
    console.log("s")
    const response = await execute("sp_terminar_impersonar_empleado", params, {});
    if (response.output.outResultCode === 0) {
      return {
        success: true,
        message: "Impersonación terminada exitosamente",
        data: {},
        timestamp: new Date().toISOString(),
      };
    } else {
      return ErrorHandler(response) as ErrorResponseDTO;
    }
  } catch (error) {  
    return {
      success: false,
      error: {
        code: 50008,
        detail: "Error del sistema al terminar la impersonación",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

async getDocumentTypes(
  userId: number,
  ip: string
): Promise<GetDocumentTypesSuccessResponseDTO | ErrorResponseDTO> {
  const params: inSqlParameters = {
    inIdUsuario: [String(userId), TYPES.Int],
    inIP: [ip, TYPES.VarChar],
  };

  try {
    const response = await execute("sp_consultar_tipos_documentos", params, {});
    if (response.output.outResultCode === 0) {
      return {
        success: true,
        data: response.recordset,
        message: "",
        timestamp: new Date().toISOString(),
      };
    } else {
      return ErrorHandler(response) as ErrorResponseDTO;
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 50008,
        detail: "Error del sistema al consultar tipos de documentos",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

async getPositions(
  userId: number,
  ip: string
): Promise<GetPositionsSuccessResponseDTO | ErrorResponseDTO> {
  const params: inSqlParameters = {
    inIdUsuario: [String(userId), TYPES.Int],
    inIP: [ip, TYPES.VarChar],
  };

  try {
    const response = await execute("sp_consultar_puestos", params, {});
    if (response.output.outResultCode === 0) {
      return {
        success: true,
        data: response.recordset,
        message: "",
        timestamp: new Date().toISOString(),
      };
    } else {
      return ErrorHandler(response) as ErrorResponseDTO;
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 50008,
        detail: "Error del sistema al consultar puestos",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

async getDepartments(
  userId: number,
  ip: string
): Promise<GetDepartmentsSuccessResponseDTO | ErrorResponseDTO> {
  const params: inSqlParameters = {
    inIdUsuario: [String(userId), TYPES.Int],
    inIP: [ip, TYPES.VarChar],
  };

  try {
    const response = await execute("sp_consultar_departamentos", params, {});
    if (response.output.outResultCode === 0) {
      return {
        success: true,
        data: response.recordset,
        message: "",
        timestamp: new Date().toISOString(),
      };
    } else {
      return ErrorHandler(response) as ErrorResponseDTO;
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 50008,
        detail: "Error del sistema al consultar departamentos",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

async getDeductionTypes(
  userId: number,
  ip: string
): Promise<GetDeductionTypesSuccessResponseDTO | ErrorResponseDTO> {
  const params: inSqlParameters = {
    inIdUsuario: [String(userId), TYPES.Int],
    inIP: [ip, TYPES.VarChar],
  };

  try {
    const response = await execute("sp_consultar_tipos_deducciones", params, {});
    if (response.output.outResultCode === 0) {
      return {
        success: true,
        data: response.recordset,
        message: "",
        timestamp: new Date().toISOString(),
      };
    } else {
      return ErrorHandler(response) as ErrorResponseDTO;
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 50008,
        detail: "Error del sistema al consultar tipos de deducciones",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

async getWeeklyPayroll(
  employeeId: number,
  userId: number,
  ip: string
): Promise<GetWeeklyPayrollSuccessResponseDTO | ErrorResponseDTO> {
  if (useMock) {
    return {
      success: true,
      data: [
        {
          WeekId: 1,
          StartDate: "2024-06-10",
          EndDate: "2024-06-16",
          GrossSalary: 5000,
          TotalDeductions: 500,
          NetSalary: 4500,
          OrdinaryHours: 40,
          NormalExtraHours: 5,
          DoubleExtraHours: 2,
        },
        {
          WeekId: 2,
          StartDate: "2024-06-17",
          EndDate: "2024-06-23",
          GrossSalary: 5100,
          TotalDeductions: 510,
          NetSalary: 4590,
          OrdinaryHours: 40,
          NormalExtraHours: 4,
          DoubleExtraHours: 3,
        }
      ],
      message: "",
      timestamp: new Date().toISOString(),
    };
  }
  const params: inSqlParameters = {
    inIdUsuario: [String(userId), TYPES.Int],
    inIP: [ip, TYPES.VarChar],
    inIdEmpleado: [String(employeeId), TYPES.Int],
  };

  try {
    const response = await execute("sp_consultar_planillas_semanales", params, {});
    if (response.output.outResultCode === 0) {
      return {
        success: true,
        data: response.recordset,
        message: "",
        timestamp: new Date().toISOString(),
      };
    } else {
      return ErrorHandler(response) as ErrorResponseDTO;
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 50008,
        detail: "Error del sistema al consultar planillas semanales",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

async getWeeklyDeductions(
  employeeId: number,
  weekId: number,
  userId: number,
  ip: string
): Promise<GetWeeklyDeductionsSuccessResponseDTO | ErrorResponseDTO> {
  if (useMock) {
    return {
      success: true,
      data: [
        {
          DeductionType: "Seguro Social",
          isPercentage: true,
          Percentage: 9.5,
          Amount: 150.75,
        },
        {
          DeductionType: "Impuesto Renta",
          isPercentage: false,
          Percentage: 0,
          Amount: 200.00,
        }
      ],
      message: "",
      timestamp: new Date().toISOString(),
    };
  }
  const params: inSqlParameters = {
    inIdUsuario: [String(userId), TYPES.Int],
    inIP: [ip, TYPES.VarChar],
    inIdEmpleado: [String(employeeId), TYPES.Int],
    inIdSemana: [String(weekId), TYPES.Int],
  };

  try {
    const response = await execute("sp_consultar_deducciones_semana", params, {});
    if (response.output.outResultCode === 0) {
      return {
        success: true,
        data: response.recordset,
        message: "",
        timestamp: new Date().toISOString(),
      };
    } else {
      return ErrorHandler(response) as ErrorResponseDTO;
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 50016,
        detail: "Error del sistema al consultar deducciones semanales",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

async getWeeklyGrossDetail(
  employeeId: number,
  weekId: number,
  userId: number,
  ip: string
): Promise<GetWeeklyGrossDetailSuccessResponseDTO | ErrorResponseDTO> {
  if (useMock) {
    return {
      success: true,
      data: [
        {
          DateDay: "2024-06-10",
          EntryTime: "08:00",
          ExitTime: "17:00",
          OrdinaryHours: 8,
          OrdinaryAmount: 400,
          NormalExtraHours: 2,
          NormalExtraAmount: 100,
          DoubleExtraHours: 1,
          DoubleExtraAmount: 80,
          DayTotal: 580
        },
        {
          DateDay: "2024-06-11",
          EntryTime: "08:00",
          ExitTime: "17:00",
          OrdinaryHours: 8,
          OrdinaryAmount: 400,
          NormalExtraHours: 1,
          NormalExtraAmount: 50,
          DoubleExtraHours: 0,
          DoubleExtraAmount: 0,
          DayTotal: 450
        }
      ],
      message: "",
      timestamp: new Date().toISOString(),
    };
  }
  const params: inSqlParameters = {
    inIdUsuario: [String(userId), TYPES.Int],
    inIP: [ip, TYPES.VarChar],
    inIdEmpleado: [String(employeeId), TYPES.Int],
    inIdSemana: [String(weekId), TYPES.Int],
  };

  try {
    const response = await execute("sp_consultar_salario_bruto_semanal", params, {});
    if (response.output.outResultCode === 0) {
      return {
        success: true,
        data: response.recordset,
        message: "",
        timestamp: new Date().toISOString(),
      };
    } else {
      return ErrorHandler(response) as ErrorResponseDTO;
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 50008,
        detail: "Error del sistema al consultar el detalle bruto semanal",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

async getMonthlyPayroll(
  employeeId: number,
  userId: number,
  ip: string
): Promise<GetMonthlyPayrollSuccessResponseDTO | ErrorResponseDTO> {
  if (useMock) {
    return {
      success: true,
      data: [
        {
          Month: 6,
          Year: 2024,
          MonthName: "Junio",
          GrossSalary: 20000,
          TotalDeductions: 2000,
          NetSalary: 18000,
        },
        {
          Month: 5,
          Year: 2024,
          MonthName: "Mayo",
          GrossSalary: 19500,
          TotalDeductions: 1950,
          NetSalary: 17550,
        }
      ],
      message: "",
      timestamp: new Date().toISOString(),
    };
  }
  const params: inSqlParameters = {
    inIdUsuario: [String(userId), TYPES.Int],
    inIP: [ip, TYPES.VarChar],
    inIdEmpleado: [String(employeeId), TYPES.Int],
  };

  try {
    const response = await execute("sp_consultar_plantilla_mensual", params, {});
    if (response.output.outResultCode === 0) {
      return {
        success: true,
        data: response.recordset,
        message: "",
        timestamp: new Date().toISOString(),
      };
    } else {
      return ErrorHandler(response) as ErrorResponseDTO;
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 50008,
        detail: "Error del sistema al consultar planilla mensual",
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
