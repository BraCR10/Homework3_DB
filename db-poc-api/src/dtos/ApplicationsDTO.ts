import { Application } from "../models/ApplicationModel";
import ErrorResponseDTO from "./ErrorResponseDTO";

export interface GetApplicationSuccessResponseDTO {
  success: boolean;
  data: {
    total: number;
    solicitudes: Application[];
  };
}

export interface CreateApplicationDTO {
  ValorDocumentoIdentidad: string;
  CantidadDias: number;
  FechaInicio: Date;
  FechaFin: Date;
}

export interface CreateApplicationSuccessResponseDTO {
  success: boolean;
  data: {
    message: string;
  };
}

export enum ApplicationStatus {
  PENDIENTE = "Pendiente",
  APROBADA = "Aprobado",
  RECHAZADA = "Rechazado",
}

export interface issueApplicationDTO {
  IdSolicitud: number;
  IdUsuario: number;
  NuevoEstado: ApplicationStatus;
  IPAddress: string;
}

export interface issueApplicationSuccessResponseDTO {
  success: boolean;
  data: {
    message: string;
  };
}

export interface ApplicationErrorResponseDTO extends ErrorResponseDTO {}
