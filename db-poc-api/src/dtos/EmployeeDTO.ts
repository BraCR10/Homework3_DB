import ErrorResponseDTO from "./ErrorResponseDTO";
import { Employee } from "../models/EmployeeModel";

export interface GetEmployeesSuccessResponseDTO {
  success: boolean;
  data:
     {
      Id: number,
      Name: string,
      DateBirth : Date,
      DNI: string,
      Position: string,
      Department: string,
    }[],
  message: string,
  timestamp: string
}
export interface GetEmployeeByIdSuccessResponseDTO {
  success: boolean;
  data: {
    Id: number;
    Name: string;
    DateBirth: Date;
    DNI: string;
    Position: string;
    Department: string;
  };
  message: string;
  timestamp: string;
}

export interface CreateEmployeesDTO {
  IdPuesto: number;
  ValorDocumentoIdentidad: string;
  NombreEmpleado: string;
}

export interface CreateEmployeesSuccessResponseDTO {
  success: boolean;
  data: {
    id: number;
    detail: string;
  };
}

export interface UpdateEmployeesDTO {
  ValorDocumentoIdentidadActual: string;
  ValorDocumentoIdentidadNuevo: string;
  IdPuestoNuevo: number;
  NombreEmpleadoNuevo: string;
}

export interface UpdateEmployeesSuccessResponseDTO {
  success: boolean;
  data: {
    message: string;
    updatedFields: string[];
  };
}

export interface TryDeleteEmployeeDTO {
  IdEmpleado: number;
  IdUser: number;
  IPAddress: string;
}
export interface TryDeleteEmployeeSuccessResponseDTO {
  success: boolean;
  data: {
    canDelete: boolean;
    detail: string;
  };
}

export interface DeleteEmployeeDTO {
  ValorDocumentoIdentidad: string;
}
export interface DeleteEmployeeSuccessResponseDTO {
  success: boolean;
  data: {
    detail: string;
  };
}

export interface GetEmployeeByNameDTO {
  employeeName: string;
}
export interface GetEmployeeByNameSuccessResponseDTO {
  success: boolean;
  data: {
    total: number;
    empleados: Employee[];
  };
}

export interface GetEmployeeByDNIDTO {
  employeeDNI: string;
}
export interface GetEmployeeByDNISuccessResponseDTO {
  success: boolean;
  data: {
    total: number;
    empleados: Employee[];
  };
}

export interface EmployeesErrorResponseDTO extends ErrorResponseDTO {}
