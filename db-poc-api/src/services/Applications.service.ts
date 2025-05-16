import { execute } from "../config/db.config";
import { TYPES } from "mssql";
import { inSqlParameters } from "../types/queryParams.type";
import { useMock } from "../app";
import ErrorHandler from "../utils/ErrorHandler";
import {
  GetApplicationSuccessResponseDTO,
  ApplicationErrorResponseDTO,
  CreateApplicationDTO,
  CreateApplicationSuccessResponseDTO,
  issueApplicationDTO,
  issueApplicationSuccessResponseDTO,
} from "../dtos/ApplicationsDTO";

class ApplicationsService {
  async getApplications(): Promise<
    GetApplicationSuccessResponseDTO | ApplicationErrorResponseDTO
  > {
    const params: inSqlParameters = {};

    try {
      if (useMock)
        return {
          success: true,
          data: {
            total: 0,
            solicitudes: [],
          },
        };
      else {
        const result = await execute(
          "sp_listar_solicitudes_vacaciones",
          params,
          {},
        );

        if (result.output.outResultCode !== 0) {
          return ErrorHandler(result);
        }

        const data = result.recordset;
        if (data.length === 0) {
          return {
            success: true,
            data: {
              total: 0,
              solicitudes: [],
            },
          };
        }

        return {
          success: true,
          data: {
            total: data.length,
            solicitudes: data.map((item: any) => ({
              IdSolicitud: item.IdSolicitud,
              Estado: item.Estado,
              EmpleadoNombre: item.EmpleadoNombre,
              EmpleadoDNI: item.EmpleadoDNI,
              CantDias: item.CantDias,
              FechaInicio: item.FechaInicio,
              FechaFin: item.FechaFin,
              FechaSolicitud: item.FechaSolicitud,
            })),
          },
        };
      }
    } catch (error) {
      console.log("Error in getApplications: ", error);
      throw new Error(
        `An error occurred while fetching applications : ${error}`,
      );
    }
  }

  async createApplication(
    data: CreateApplicationDTO,
  ): Promise<
    CreateApplicationSuccessResponseDTO | ApplicationErrorResponseDTO
  > {
    const params: inSqlParameters = {
      inCantDias: [String(data.CantidadDias), TYPES.Int],
      inValorDocumentoIdentidad: [data.ValorDocumentoIdentidad, TYPES.VarChar],
      inFechaInicio: [String(data.FechaInicio), TYPES.DateTime],
      inFechaFin: [String(data.FechaFin), TYPES.DateTime],
    };
    try {
      if (useMock)
        return {
          success: true,
          data: {
            message: "Solicitud creada exitosamente",
          },
        };
      else {
        const result = await execute(
          "sp_crear_solicitudes_vacaciones",
          params,
          {},
        );

        if (result.output.outResultCode !== 0) {
          return ErrorHandler(result);
        }

        return {
          success: true,
          data: {
            message: "Solicitud de vacaciones creada exitosament",
          },
        };
      }
    } catch (error) {
      console.log("Error in createApplication: ", error);
      throw new Error(
        `An error occurred while creating application : ${error}`,
      );
    }
  }
  async issueApplication(
    data: issueApplicationDTO,
  ): Promise<issueApplicationSuccessResponseDTO | ApplicationErrorResponseDTO> {
    const params: inSqlParameters = {
      inIdSolicitud: [String(data.IdSolicitud), TYPES.Int],
      inIdUsuario: [String(data.IdUsuario), TYPES.Int],
      inNuevoEstado: [data.NuevoEstado, TYPES.VarChar],
      inPostInIP: [data.IPAddress, TYPES.VarChar],
    };
    try {
      if (useMock)
        return {
          success: true,
          data: {
            message: "Solicitud de vacaciones procesada exitosamente",
          },
        };
      else {
        const result = await execute(
          "sp_tramitar_solicitudes_vacaciones",
          params,
          {},
        );

        if (result.output.outResultCode !== 0) {
          return ErrorHandler(result);
        }

        return {
          success: true,
          data: {
            message: "Solicitud de vacaciones procesada exitosamente",
          },
        };
      }
    } catch (error) {
      console.log("Error in issueApplication: ", error);
      throw new Error(`An error occurred while issuing application : ${error}`);
    }
  }
}

export default new ApplicationsService();
