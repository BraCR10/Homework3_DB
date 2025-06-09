import ErrorResponseDTO from "./ErrorResponseDTO";

export interface LoginDTO {
  Username: string;
  Password: string;
  IpAddress: string;
}

export interface LoginSuccessResponseDTO {
  success: boolean;
  data: {
    loginStatus: {
      Id: number;
      Username: string;
      Role: string; // "Admin" o "Employee"
    }
  };
  message: string;
  timestamp: string;
}

// Puedes agregar esto en tu AuthDTO.ts
export interface LogoutSuccessResponseDTO {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface LoginErrorResponseDTO extends ErrorResponseDTO {}
