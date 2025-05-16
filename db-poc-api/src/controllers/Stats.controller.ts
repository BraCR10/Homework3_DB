import { Request, Response } from "express";
import StatsService from "../services/Stats.service";
import { StatsErrorResponseDTO } from "../dtos/StatsDTO";

export async function getStats(_req: Request, res: Response): Promise<void> {
  try {
    const response = await StatsService.getStats();
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    console.error("Error retrieving movement types:", error);

    const errorMessage: StatsErrorResponseDTO = {
      success: false,
      error: {
        code: 50008,
        detail: "Un error a ocurrido al obtener las estadisticas",
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
