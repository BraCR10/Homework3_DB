import ErrorResponseDTO from "./ErrorResponseDTO";
import { Position } from "../models/PositionModel";

export interface GetPositionsSuccessResponseDTO {
  success: boolean;
  data: {
    total: number;
    puestos: Position[];
  };
}

export interface PositionErrorResponseDTO extends ErrorResponseDTO {}
