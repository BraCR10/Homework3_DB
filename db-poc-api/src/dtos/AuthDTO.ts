import ErrorResponseDTO from "./ErrorResponseDTO";

export interface LoginDTO {
  Username: string;
  Password: string;
  IpAddress: string;
}

export interface LoginSuccessResponseDTO {
  success: boolean;
  Id: number;
  Username: string;
}

export interface LoginErrorResponseDTO extends ErrorResponseDTO {}
