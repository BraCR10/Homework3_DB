import { Request, Response } from "express";
import MovementService from "../services/Movement.service";
import {
  GetEmployeeMovementsDTO,
  MovementsErrorResponseDTO,
  CreateMovementsDTO,
} from "../dtos/MovementsDTO";

export const getEmployeeMovements = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const DNI = req.params.DNI;

  if (!DNI) {
    const errorResponse: MovementsErrorResponseDTO = {
      success: false,
      error: {
        code: 400,
        detail: "DNI es requerido",
      },
    };
    res.status(400).json({ success: false, error: errorResponse });
    return;
  }
  const DNIregex = /^[0-9]+$/;
  if (!DNIregex.test(DNI)) {
    const errorResponse: MovementsErrorResponseDTO = {
      success: false,
      error: {
        code: 400,
        detail: "El DNI debe ser un número",
      },
    };
    res.status(400).json({ success: false, error: errorResponse });
    return;
  }

  const data: GetEmployeeMovementsDTO = {
    DNI: DNI,
  };
  try {
    const response = await MovementService.employeeMovements(data);

    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    console.error("Error during employee movements retrieval:", error);
    const errorMessage: MovementsErrorResponseDTO = {
      success: false,
      error: {
        code: 50008,
        detail: "Un error a ocurrido al obtener los movimientos del empleado",
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
};

export const createMovement = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { IdTipoMovimiento, Monto, DNIEmpleado, IdUser } = req.body;

  if (!IdTipoMovimiento || !Monto || !DNIEmpleado || !IdUser) {
    const errorResponse: MovementsErrorResponseDTO = {
      success: false,
      error: {
        code: 400,
        detail: "IdTipoMovimiento, Monto, DNIEmpleado e IdUser son requeridos",
      },
    };
    res.status(400).json({ success: false, error: errorResponse });
    return;
  }

  const regex = /^[0-9]+$/;

  if (!regex.test(DNIEmpleado)) {
    const errorResponse: MovementsErrorResponseDTO = {
      success: false,
      error: {
        code: 400,
        detail: "DNIEmpleado debe ser números",
      },
    };
    res.status(400).json({ success: false, error: errorResponse });
    return;
  }

  if (
    typeof Monto !== "number" ||
    typeof IdTipoMovimiento !== "number" ||
    typeof IdUser !== "number"
  ) {
    const errorResponse: MovementsErrorResponseDTO = {
      success: false,
      error: {
        code: 400,
        detail: "IdTipoMovimiento, Monto e IdUser deben ser números",
      },
    };
    res.status(400).json({ success: false, error: errorResponse });
    return;
  }

  if (Number.isInteger(Monto) === false) {
    const errorResponse: MovementsErrorResponseDTO = {
      success: false,
      error: {
        code: 400,
        detail: "Monto debe ser un número entero",
      },
    };
    res.status(400).json({ success: false, error: errorResponse });
    return;
  }
  const data: CreateMovementsDTO = {
    IdTipoMovimiento: IdTipoMovimiento,
    Monto: Monto,
    DNIEmpleado: DNIEmpleado,
    IdUser: IdUser,
    IpAddress: req.ip ? req.ip : "",
  };

  try {
    const response = await MovementService.createMovement(data);

    if (response.success) {
      res.status(201).json(response);
    } else {
      res.status(400).json(response);
    }
  } catch (error) {
    console.error("Error during movement creation:", error);
    const errorMessage: MovementsErrorResponseDTO = {
      success: false,
      error: {
        code: 50008,
        detail: "An error occurred while creating the movement",
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
};

export const getMovementsTypes = async (_req: Request, res: Response) => {
  try {
    const response = await MovementService.getMovementsTypes();

    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    console.error("Error retrieving movement types:", error);
    const errorMessage: MovementsErrorResponseDTO = {
      success: false,
      error: {
        code: 50008,
        detail: "Un error a ocurrido al obtener los tipos de movimiento",
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
};
