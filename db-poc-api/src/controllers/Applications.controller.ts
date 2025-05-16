import { Request, Response } from "express";
import Application from "../services/Applications.service";
import {
  ApplicationErrorResponseDTO,
  CreateApplicationDTO,
  issueApplicationDTO,
  ApplicationStatus
} from "../dtos/ApplicationsDTO";

export async function getApplications(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const response = await Application.getApplications();
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    console.error("Error during application retrieval:", error);
    const errorMessage: ApplicationErrorResponseDTO = {
      success: false,
      error: {
        code: 50008,
        detail: "Un error a ocurrido al obtener las solicitudes",
      },
    };
    res.status(500).json({
      success: errorMessage.success,
      error: {
        code: errorMessage.error.code,
        details: errorMessage.error.detail,
      },
    });
  }
}

export async function createApplication(
  req: Request,
  res: Response,
): Promise<void> {
  const data = req.body as CreateApplicationDTO;

  //validation
  if (
    !data.ValorDocumentoIdentidad ||
    !data.CantidadDias ||
    !data.FechaInicio ||
    !data.FechaFin
  ) {
    const errorMessage: ApplicationErrorResponseDTO = {
      success: false,
      error: {
        code: 400,
        detail: "Faltan datos para crear la solicitud o JSON mal formado",
      },
    };
    res.status(400).json({
      success: errorMessage.success,
      error: {
        code: errorMessage.error.code,
        details: errorMessage.error.detail,
      },
    });
    return;
  }

  try {
    const response = await Application.createApplication(data);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    console.error("Error during application creation:", error);
    const errorMessage: ApplicationErrorResponseDTO = {
      success: false,
      error: {
        code: 50008,
        detail: "Un error a ocurrido al crear la solicitud",
      },
    };
    res.status(500).json({
      success: errorMessage.success,
      error: {
        code: errorMessage.error.code,
        details: errorMessage.error.detail,
      },
    });
  }
}
export async function issueApplication(
  req: Request,
  res: Response,
): Promise<void> {
  const idSolicitud = req.params.idSolicitud;
  const { IdUsuario, NuevoEstado } = req.body;
  const IPAddress = req.ip ? req.ip : "";

  //validation
  if (!idSolicitud || !IdUsuario || !NuevoEstado) {
    const errorMessage: ApplicationErrorResponseDTO = {
      success: false,
      error: {
        code: 400,
        detail: "Faltan datos para emitir la solicitud o JSON mal formado",
      },
    };
    res.status(400).json({
      success: errorMessage.success,
      error: {
        code: errorMessage.error.code,
        details: errorMessage.error.detail,
      },
    });
    return;
  }

  if (Object.values(ApplicationStatus).indexOf(NuevoEstado) === -1) {
    const errorMessage: ApplicationErrorResponseDTO = {
      success: false,
      error: {
        code: 400,
        detail: "El nuevo estado no es valido",
      },
    };
    res.status(400).json({
      success: errorMessage.success,
      error: {
        code: errorMessage.error.code,
        details: errorMessage.error.detail,
      },
    });
    return;
  }
  
  const data: issueApplicationDTO = {
    IdSolicitud: Number(idSolicitud),
    IdUsuario: Number(IdUsuario),
    NuevoEstado: NuevoEstado,
    IPAddress: IPAddress,
  };

  try {
    const response = await Application.issueApplication(data);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    console.error("Error during application issuance:", error);
    const errorMessage: ApplicationErrorResponseDTO = {
      success: false,
      error: {
        code: 50008,
        detail: "Un error a ocurrido al emitir la solicitud",
      },
    };
    res.status(500).json({
      success: errorMessage.success,
      error: {
        code: errorMessage.error.code,
        details: errorMessage.error.detail,
      },
    });
  }
}
