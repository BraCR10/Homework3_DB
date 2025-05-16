import ErrorResponseDTO from "./ErrorResponseDTO";
import { Employee } from "../models/EmployeeModel";
import { MovementType } from "../models/MovementTypeModel";
import { Movement } from "../models/MovementsModel";

export interface GetEmployeeMovementsDTO {
  DNI: string;
}

export interface GetEmployeeMovementsSuccessResponseDTO {
  success: boolean;
  data: {
    empleado: Employee;
    total: number;
    movimientos: Movement[];
  };
}

export interface CreateMovementsDTO {
  IdTipoMovimiento: number;
  Monto: number;
  DNIEmpleado: string;
  IdUser: number;
  IpAddress: string;
}

export interface CreateMovementsSuccessResponseDTO {
  success: boolean;
  data: {
    id: number;
    message: string;
  };
}

export interface getMovementsTypesSuccessResponseDTO {
  success: boolean;
  data: {
    total: number;
    tiposMovimientos: MovementType[];
  };
}

export interface MovementsErrorResponseDTO extends ErrorResponseDTO {}
