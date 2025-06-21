import { Request, Response } from "express";
import ErrorResponseDTO from "../dtos/ErrorResponseDTO";
import EmployeeService from "../services/Employee.service";
import {
  CreateEmployeesDTO,
  UpdateEmployeesDTO,
  CreateEmployeeRequestDTO,
  CreateEmployeeSuccessResponseDTO,
  EmployeesErrorResponseDTO,
  UpdateEmployeeRequestDTO,
  UpdateEmployeeSuccessResponseDTO,
  TryDeleteEmployeeDTO,
  GetEmployeeByNameDTO,
  GetEmployeeByDNIDTO,
} from "../dtos/EmployeeDTO";

export const createEmployee = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data: CreateEmployeesDTO = req.body;

    if (
      !data.NombreEmpleado ||
      !data.ValorDocumentoIdentidad ||
      !data.IdPuesto
    ) {
      console.error("Request body is required.");
      const errorResponse: ErrorResponseDTO = {
        success: false,
        error: {
          code: 400,
          detail: "El body de la petición es requerido.",
        },
        timestamp: new Date().toISOString()
      };
      res.status(400).json({ success: false, error: errorResponse });
      return;
    }

    if (!data.IdPuesto || typeof data.IdPuesto !== "number") {
      const errorResponse: ErrorResponseDTO = {
        success: false,
        error: {
          code: 400,
          detail: "El ID de puesto es requerido y numerico",
        },
        timestamp: new Date().toISOString()
      };
      res.status(400).json({ success: false, error: errorResponse });
      return;
    }

    const response = await EmployeeService.createEmployee(data);

    if (response.success) {
      res.status(201).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    console.error("Error during employee creation:", error);
    const errorMessage: ErrorResponseDTO = {
      success: false,
      error: {
        code: 50008,
        detail: "Error del sistema creando el empleado",
      },
      timestamp: new Date().toISOString()
    };
    res.status(500).json({
      success: errorMessage.success,
      error: {
        code: errorMessage.error.code,
        details: errorMessage.error.detail,
      },
    });
  }
};

export const getEmployees = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userIdHeader = req.headers["user-id"];
    const userId = userIdHeader ? Number(userIdHeader) : undefined;
    if (!userId || isNaN(userId)) {
      console.error("User ID is required.");
      res.status(400).json({
        success: false,
        error: { 
          code: 400, 
          detail: "User ID is required in header and must be a number."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    const ip = req.ip ? req.ip : "";
    const response = await EmployeeService.getEmployees(userId, ip);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } 
  catch (error) {
    const errorMessage: ErrorResponseDTO = {
        success: false,
        error: {
        code: 50008,
        detail: "Un error a ocurrido mientras se obtenian los empleados"
        },
        timestamp: new Date().toISOString()
    };
    res.status(500).json(errorMessage);
  }
};

export const searchEmployees = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const filter = req.query.filter as string;
    const userIdHeader = req.headers["user-id"];
    const userId = userIdHeader ? Number(userIdHeader) : undefined;
    if (!userId || isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "User ID is required in header and must be a number."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    const ip = req.ip ? req.ip : "";
    const response = await EmployeeService.searchEmployees(filter, userId, ip);
    if (response.success) {
      res.status(200).json(response);
    } 
    else {
      res.status(500).json(response);
    }
  } 
  catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 50008,
        detail: "Un error ocurrió al buscar empleados"
      },
      timestamp: new Date().toISOString()
    });
  }
};

export const getEmployeeById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const userIdHeader = req.headers["user-id"];
    const userId = userIdHeader ? Number(userIdHeader) : undefined;
    if (!id || isNaN(id)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "ID de empleado es requerido y debe ser numérico."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    if (!userId || isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "User ID is required in header and must be a number."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    const ip = req.ip ? req.ip : "";
    const response = await EmployeeService.getEmployeeById(id, userId, ip);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(404).json(response);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 50008,
        detail: "Un error ocurrió al consultar el empleado por ID"
      },
      timestamp: new Date().toISOString()
    });
  }
};

export const createEmployeeV2 = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userIdHeader = req.headers["user-id"];
    const userId = userIdHeader ? Number(userIdHeader) : undefined;
    if (!userId || isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "User ID is required in header and must be a number.",
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }
    const ip = req.ip ? req.ip : "";
    const data: CreateEmployeeRequestDTO = req.body;

    // Validación básica
    if (
      !data.Name ||
      !data.NameUser ||
      !data.PasswordUser ||
      !data.DocumentTypeId ||
      !data.DocumentValue ||
      !data.PositionId ||
      !data.DepartmentId
    ) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "Todos los campos obligatorios deben estar presentes.",
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const response = await EmployeeService.createEmployeeV2(data, userId, ip);

    if (response.success) {
      res.status(201).json(response);
    } else {
      res.status(500).json(response);
    }
  } 
  catch (error) {
        console.log("s")
    console.log(error)
    res.status(500).json({
      success: false,
      error: {
        code: 50008,
        detail: "Error del sistema creando el empleado",
      },
      timestamp: new Date().toISOString(),
    });
  }
};

export const updateEmployeeV2 = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const userIdHeader = req.headers["user-id"];
    const userId = userIdHeader ? Number(userIdHeader) : undefined;
    if (!id || isNaN(id)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "ID de empleado es requerido y debe ser numérico."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    if (!userId || isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "User ID is required in header and must be a number."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    const ip = req.ip ? req.ip : "";
    const data: UpdateEmployeeRequestDTO = req.body;

    const response = await EmployeeService.updateEmployeeV2(id, data, userId, ip);

    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 50008,
        detail: "Error del sistema actualizando el empleado",
      },
      timestamp: new Date().toISOString(),
    });
  }
};

export const deleteEmployeeV2 = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const userIdHeader = req.headers["user-id"];
    const userId = userIdHeader ? Number(userIdHeader) : undefined;
    if (!id || isNaN(id)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "ID de empleado es requerido y debe ser numérico."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    if (!userId || isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "User ID is required in header and must be a number."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    const ip = req.ip ? req.ip : "";
    const response = await EmployeeService.deleteEmployeeV2(id, userId, ip);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 50009,
        detail: "Error del sistema eliminando el empleado",
      },
      timestamp: new Date().toISOString(),
    });
  }
};

export const impersonateEmployeeV2 = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const userIdHeader = req.headers["user-id"];
    const userId = userIdHeader ? Number(userIdHeader) : undefined;
    if (!id || isNaN(id)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "ID de empleado es requerido y debe ser numérico."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    if (!userId || isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "User ID is required in header and must be a number."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    const ip = req.ip ? req.ip : "";
    const response = await EmployeeService.impersonateEmployeeV2(id, userId, ip);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } 
  catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 5008,
        detail: "Error del sistema al impersonar el empleado",
      },
      timestamp: new Date().toISOString(),
    });
  }
};

export const stopImpersonationEmployeeV2 = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const userIdHeader = req.headers["user-id"];
    const userId = userIdHeader ? Number(userIdHeader) : undefined;
    if (!id || isNaN(id)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "ID de empleado es requerido y debe ser numérico."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    if (!userId || isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "User ID is required in header and must be a number."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    const ip = req.ip ? req.ip : "";
    const response = await EmployeeService.stopImpersonationEmployeeV2(id, userId, ip);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } 
  catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 50008,
        detail: "Error del sistema al terminar la impersonación",
      },
      timestamp: new Date().toISOString(),
    });
  }
};

export const getDocumentTypes = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userIdHeader = req.headers["user-id"];
    const userId = userIdHeader ? Number(userIdHeader) : undefined;
    if (!userId || isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "User ID is required in header and must be a number."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    const ip = req.ip ? req.ip : "";
    const response = await EmployeeService.getDocumentTypes(userId, ip);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 50011,
        detail: "Error del sistema al consultar tipos de documentos",
      },
      timestamp: new Date().toISOString(),
    });
  }
};

export const getPositions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userIdHeader = req.headers["user-id"];
    const userId = userIdHeader ? Number(userIdHeader) : undefined;
    if (!userId || isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "User ID is required in header and must be a number."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    const ip = req.ip ? req.ip : "";
    const response = await EmployeeService.getPositions(userId, ip);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 50012,
        detail: "Error del sistema al consultar puestos",
      },
      timestamp: new Date().toISOString(),
    });
  }
};

export const getDepartments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userIdHeader = req.headers["user-id"];
    const userId = userIdHeader ? Number(userIdHeader) : undefined;
    if (!userId || isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "User ID is required in header and must be a number."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    const ip = req.ip ? req.ip : "";
    const response = await EmployeeService.getDepartments(userId, ip);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 50013,
        detail: "Error del sistema al consultar departamentos",
      },
      timestamp: new Date().toISOString(),
    });
  }
};

export const getDeductionTypes = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userIdHeader = req.headers["user-id"];
    const userId = userIdHeader ? Number(userIdHeader) : undefined;
    if (!userId || isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "User ID is required in header and must be a number."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    const ip = req.ip ? req.ip : "";
    const response = await EmployeeService.getDeductionTypes(userId, ip);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 50014,
        detail: "Error del sistema al consultar tipos de deducciones",
      },
      timestamp: new Date().toISOString(),
    });
  }
};

export const getWeeklyPayroll = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const employeeId = Number(req.params.id);
    const userIdHeader = req.headers["user-id"];
    const userId = userIdHeader ? Number(userIdHeader) : undefined;
    
    console.log("Datos recibidos en el backend:", {
      employeeId,
      userId,
    });
    
    if (!employeeId || isNaN(employeeId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "ID de empleado es requerido y debe ser numérico."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    if (!userId || isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "User ID is required in header and must be a number."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    const ip = req.ip ? req.ip : "";
    const response = await EmployeeService.getWeeklyPayroll(employeeId, userId, ip);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 50015,
        detail: "Error del sistema al consultar planillas semanales",
      },
      timestamp: new Date().toISOString(),
    });
  }
};

export const getWeeklyDeductions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const employeeId = Number(req.params.id);
    const weekId = Number(req.params.weekId);
    const userIdHeader = req.headers["user-id"];
    const userId = userIdHeader ? Number(userIdHeader) : undefined;
    if (!employeeId || isNaN(employeeId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "ID de empleado es requerido y debe ser numérico."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    if (!weekId || isNaN(weekId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "ID de semana es requerido y debe ser numérico."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    if (!userId || isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "User ID is required in header and must be a number."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    const ip = req.ip ? req.ip : "";
    const response = await EmployeeService.getWeeklyDeductions(employeeId, weekId, userId, ip);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 50016,
        detail: "Error del sistema al consultar deducciones semanales",
      },
      timestamp: new Date().toISOString(),
    });
  }
};

export const getWeeklyGrossDetail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const employeeId = Number(req.params.id);
    const weekId = Number(req.params.weekId);
    const userIdHeader = req.headers["user-id"];
    const userId = userIdHeader ? Number(userIdHeader) : undefined;
    if (!employeeId || isNaN(employeeId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "ID de empleado es requerido y debe ser numérico."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    if (!weekId || isNaN(weekId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "ID de semana es requerido y debe ser numérico."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    if (!userId || isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "User ID is required in header and must be a number."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    const ip = req.ip ? req.ip : "";
    const response = await EmployeeService.getWeeklyGrossDetail(employeeId, weekId, userId, ip);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 50017,
        detail: "Error del sistema al consultar el detalle bruto semanal",
      },
      timestamp: new Date().toISOString(),
    });
  }
};

export const getMonthlyPayroll = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const employeeId = Number(req.params.id);
    const userIdHeader = req.headers["user-id"];
    const userId = userIdHeader ? Number(userIdHeader) : undefined;
    if (!employeeId || isNaN(employeeId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "ID de empleado es requerido y debe ser numérico."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    if (!userId || isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "User ID is required in header and must be a number."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    const ip = req.ip ? req.ip : "";
    const response = await EmployeeService.getMonthlyPayroll(employeeId, userId, ip);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 50018,
        detail: "Error del sistema al consultar planilla mensual",
      },
      timestamp: new Date().toISOString(),
    });
  }
};

export const getMonthlyDeductions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const employeeId = Number(req.params.id);
    const monthId = Number(req.params.monthId);
    const userIdHeader = req.headers["user-id"];
    const userId = userIdHeader ? Number(userIdHeader) : undefined;
    if (!employeeId || isNaN(employeeId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "ID de empleado es requerido y debe ser numérico."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    if (!monthId || isNaN(monthId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "ID de mes es requerido y debe ser numérico."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    if (!userId || isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 400,
          detail: "User ID is required in header and must be a number."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    const ip = req.ip ? req.ip : "";
    const response = await EmployeeService.getMonthlyDeductions(employeeId, monthId, userId, ip);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 50019,
        detail: "Error del sistema al consultar deducciones mensuales",
      },
      timestamp: new Date().toISOString(),
    });
  }
};

/*
export const getEmployeeById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const response = await EmployeeService.getEmployeeById(Number(id));
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    res.status(500).json({ success: false, error: errorMessage });
  }
};
*/

export const updateEmployee = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const DNI = req.params.DNI;

    if (!DNI || typeof DNI !== "string" || DNI.trim() === "") {
      const errorResponse: ErrorResponseDTO = {
        success: false,
        error: {
          code: 400,
          detail: "El DNI es requerido",
        },
        timestamp: new Date().toISOString()
      };
      res.status(400).json({ success: false, error: errorResponse });
      return;
    }
    const dniRegex = /^[0-9]+$/;

    if (!dniRegex.test(DNI)) {
      const errorResponse: ErrorResponseDTO = {
        success: false,
        error: {
          code: 400,
          detail: "DNI tiene un formato invalido",
        },
        timestamp: new Date().toISOString()
      };
      res.status(400).json({ success: false, error: errorResponse });
      return;
    }

    const { IdPuestoNuevo, ValorDocumentoIdentidadNuevo, NombreEmpleadoNuevo } =
      req.body;
    // Warning : This function requires all the parameters to be passed, even if they are not updated.
    if (
      !IdPuestoNuevo ||
      !ValorDocumentoIdentidadNuevo ||
      !NombreEmpleadoNuevo
    ) {
      console.error("Request body is required.");
      const errorResponse: ErrorResponseDTO = {
        success: false,
        error: {
          code: 400,
          detail: "El body de la petición es requerido.",
        },
        timestamp: new Date().toISOString()
      };
      res.status(400).json({ success: false, error: errorResponse });
      return;
    }

    if (!IdPuestoNuevo || typeof IdPuestoNuevo !== "number") {
      const errorResponse: ErrorResponseDTO = {
        success: false,
        error: {
          code: 400,
          detail: "El ID de puesto es requerido y numerico",
        },
        timestamp: new Date().toISOString()
      };
      res.status(400).json({ success: false, error: errorResponse });
      return;
    }

    const data: UpdateEmployeesDTO = {
      ValorDocumentoIdentidadActual: DNI,
      IdPuestoNuevo: IdPuestoNuevo,
      ValorDocumentoIdentidadNuevo: ValorDocumentoIdentidadNuevo,
      NombreEmpleadoNuevo: NombreEmpleadoNuevo,
    };

    const response = await EmployeeService.updateEmployee(data);

    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    console.error("Error during employee update:", error);
    const errorMessage: ErrorResponseDTO = {
      success: false,
      error: {
        code: 50008,
        detail: "Error del sistema actualizando el empleado",
      },
      timestamp: new Date().toISOString()
    };
    res.status(500).json({
      success: errorMessage.success,
      error: {
        code: errorMessage.error.code,
        details: errorMessage.error.detail,
      },
    });
  }
};

export const tryDeleteEmployee = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const IdEmpleado = Number(req.params.IdEmpleado);

  if (isNaN(IdEmpleado) || IdEmpleado <= 0) {
    const errorResponse: ErrorResponseDTO = {
      success: false,
      error: {
        code: 400,
        detail: "El ID de empleado es requerido",
      },
      timestamp: new Date().toISOString()
    };
    res.status(400).json({ success: false, error: errorResponse });
    return;
  }

  const { IdUser } = req.body;
  if (!IdUser || typeof IdUser !== "number") {
    const errorResponse: ErrorResponseDTO = {
      success: false,
      error: {
        code: 400,
        detail: "El ID de usuario es requerido y numerico",
      },
      timestamp: new Date().toISOString()
    };
    res.status(400).json({ success: false, error: errorResponse });
    return;
  }
  const IPAddress = req.ip ? req.ip : "";
  const data: TryDeleteEmployeeDTO = { IdEmpleado, IdUser, IPAddress };
  try {
    const response = await EmployeeService.tryDeleteEmployee(data);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    console.error("Error during employee deletion:", error);
    const errorMessage: ErrorResponseDTO = {
      success: false,
      error: {
        code: 50008,
        detail: "Un error a ocurrido al eliminar el empleado",
      },
      timestamp: new Date().toISOString()
    };
    res.status(500).json({
      success: errorMessage.success,
      error: {
        code: errorMessage.error.code,
        details: errorMessage.error.detail,
      },
    });
  }
};
export const getEmployeeByName = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const employeeName = req.params.employeeName;

  if (
    !employeeName ||
    typeof employeeName !== "string" ||
    employeeName.trim() === ""
  ) {
    const errorResponse: ErrorResponseDTO = {
      success: false,
      error: {
        code: 400,
        detail: "Nombre de empleado es requerido",
      },
      timestamp: new Date().toISOString()
    };
    res.status(400).json({ success: false, error: errorResponse });
    return;
  }

  const data: GetEmployeeByNameDTO = { employeeName };
  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(employeeName)) {
    const errorResponse: ErrorResponseDTO = {
      success: false,
      error: {
        code: 400,
        detail: "Nombre de empleado tiene un formato invalido",
      },
      timestamp: new Date().toISOString()
    };

    res.status(400).json({ success: false, error: errorResponse });
    return;
  }
  if (!data.employeeName) {
    console.error("Employee name is required.");
    const errorResponse: ErrorResponseDTO = {
      success: false,
      error: {
        code: 400,
        detail: "Nombre de empleado es requerido.",
      },
      timestamp: new Date().toISOString()
    };
    res.status(400).json({ success: false, error: errorResponse });
    return;
  }
  try {
    const response = await EmployeeService.getEmployeeByName(data);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    console.error("Error fetching employees by name:", error);
    const errorMessage: ErrorResponseDTO = {
      success: false,
      error: {
        code: 50008,
        detail: "Error al buscar empleados por nombre",
      },
      timestamp: new Date().toISOString()
    };
    res.status(500).json({
      success: errorMessage.success,
      error: {
        code: errorMessage.error.code,
        details: errorMessage.error.detail,
      },
    });
  }
};

export const getEmployeeByDNI = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const employeeDNI = req.params.employeeDNI;

  if (
    !employeeDNI ||
    typeof employeeDNI !== "string" ||
    employeeDNI.trim() === ""
  ) {
    const errorResponse: ErrorResponseDTO = {
      success: false,
      error: {
        code: 400,
        detail: "Valid employee DNI is required",
      },
      timestamp: new Date().toISOString()
    };
    res.status(400).json({ success: false, error: errorResponse });
    return;
  }

  const dniRegex = /^[0-9]+$/;
  if (!dniRegex.test(employeeDNI)) {
    const errorResponse: ErrorResponseDTO = {
      success: false,
      error: {
        code: 400,
        detail: "DNI tiene un formato invalido",
      },
      timestamp: new Date().toISOString()
    };
    res.status(400).json({ success: false, error: errorResponse });
    return;
  }

  const data: GetEmployeeByDNIDTO = { employeeDNI };

  if (!data.employeeDNI) {
    console.error("Employee DNI is required.");
    const errorResponse: ErrorResponseDTO = {
      success: false,
      error: {
        code: 400,
        detail: "DNI de empleado es requerido.",
      },
      timestamp: new Date().toISOString()
    };
    res.status(400).json({ success: false, error: errorResponse });
    return;
  }
  try {
    const response = await EmployeeService.getEmployeeByDNI(data);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    console.error("Error fetching employees by DNI:", error);
    const errorMessage: ErrorResponseDTO = {
      success: false,
      error: {
        code: 50008,
        detail: "Error al buscar empleados por DNI",
      },
      timestamp: new Date().toISOString()
    };
    res.status(500).json({
      success: errorMessage.success,
      error: {
        code: errorMessage.error.code,
        details: errorMessage.error.detail,
      },
    });
  }
};