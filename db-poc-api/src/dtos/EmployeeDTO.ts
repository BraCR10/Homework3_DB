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

export interface CreateEmployeeRequestDTO {
  Name: string;
  NameUser: string;
  PasswordUser: string;
  DocumentTypeId: number;
  DateBirth?: Date;
  DocumentValue: string;
  PositionId: number;
  DepartmentId: number;
}

export interface CreateEmployeeSuccessResponseDTO {
  success: boolean;
  data: {
    Id: number;
    Name: string;
  };
  message: string;
  timestamp: string;
}

export interface UpdateEmployeeRequestDTO {
  Name?: string;
  DocumentTypeId?: number;
  DateBirth?: Date;
  DocumentValue?: string;
  PositionId?: number;
  DepartmentId?: number;
}

export interface UpdateEmployeeSuccessResponseDTO {
  success: boolean;
  message: string;
  data: {
    Id: number;
    Name: string;
  };
  timestamp: string;
} 

export interface DeleteEmployeeSuccessResponseDTO {
  success: boolean;
  message: string;
  data: {};
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

export interface ImpersonateEmployeeSuccessResponseDTO {
  success: boolean;
  data: {
    employeeInfo: {
      Name: string;
      DateBirth?: Date;
      DNI: string;
      Position: string;
      Department: string;
    }
  };
  message: string;
  timestamp: string;
}

export interface GetPositionsSuccessResponseDTO {
  success: boolean;
  data: {
    Id: number;
    Name: string;
    HourlySalary: number;
  }[];
  message: string;
  timestamp: string;
}

export interface GetDepartmentsSuccessResponseDTO {
  success: boolean;
  data: {
    Id: number;
    Name: string;
  }[];
  message: string;
  timestamp: string;
}

export interface GetDeductionTypesSuccessResponseDTO {
  success: boolean;
  data: {
    Id: number;
    Name: string;
    IsObligatory: boolean;
    IsPercentage: boolean;
    Percentage?: number;
  }[];
  message: string;
  timestamp: string;
}

export interface GetDocumentTypesSuccessResponseDTO {
  success: boolean;
  data: {
    Id: number;
    Name: string;
  }[];
  message: string;
  timestamp: string;
}

export interface GetWeeklyPayrollSuccessResponseDTO {
  success: boolean;
  data: {
    WeekId: number;
    StartDate: string;
    EndDate: string;
    GrossSalary: number;
    TotalDeductions: number;
    NetSalary: number;
    OrdinaryHours: number;
    NormalExtraHours: number;
    DoubleExtraHours: number;
  }[];
  message: string;
  timestamp: string;
}

export interface GetWeeklyDeductionsSuccessResponseDTO {
  success: boolean;
  data: {
    DeductionType: string;
    isPercentage: boolean;
    Percentage: number;
    Amount: number;
  }[];
  message: string;
  timestamp: string;
}

export interface GetWeeklyGrossDetailSuccessResponseDTO {
  success: boolean;
  data: {
    DateDay: string; // YYYY-MM-DD
    EntryTime: string; // HH:MM
    ExitTime: string; // HH:MM
    OrdinaryHours: number;
    OrdinaryAmount: number;
    NormalExtraHours: number;
    NormalExtraAmount: number;
    DoubleExtraHours: number;
    DoubleExtraAmount: number;
    DayTotal: number;
  }[];
  message: string;
  timestamp: string;
}

export interface GetMonthlyPayrollSuccessResponseDTO {
  success: boolean;
  data: {
    Month: number;
    Year: number;
    MonthName: string;
    GrossSalary: number;
    TotalDeductions: number;
    NetSalary: number;
  }[];
  message: string;
  timestamp: string;
}

export interface GetMonthlyDeductionsSuccessResponseDTO {
  success: boolean;
  data: {
    DeductionType: string;
    isPercentage: boolean;
    Percentage: number;
    Amount: number;
  }[];
  message: string;
  timestamp: string;
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
