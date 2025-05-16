import { execute } from "../config/db.config";
//import { TYPES } from "mssql";
import { inSqlParameters } from "../types/queryParams.type";
import { useMock } from "../app";
import ErrorHandler from "../utils/ErrorHandler";
import {
  GetPositionsSuccessResponseDTO,
  PositionErrorResponseDTO,
} from "../dtos/PositionDTO";

class PositionService {
  async getPositions(): Promise<
    GetPositionsSuccessResponseDTO | PositionErrorResponseDTO
  > {
    const params: inSqlParameters = {};
    try {
      if (useMock) {
        return {
          success: true,
          data: {
            total: 0,
            puestos: [
              {
                Id: 1,
                Nombre: "Puesto test",
                SalarioPorHora: 1000,
              },
            ],
          },
        };
      } else {
        const response = await execute("sp_listar_puestos", params, {});
        if (response.output.outResultCode === 0) {
          const data = response.recordset;

          if (data.length === 0) {
            return {
              success: true,
              data: {
                total: 0,
                puestos: [],
              },
            };
          }
          
          return {
            success: true,
            data: {
              total: data.length,
              puestos: data,
            },
          };
        } else {
          return ErrorHandler(response);
        }
      }
    } catch (error) {
      console.log("Error in getPositions: ", error);
      throw new Error(`An error occurred while fetching positions : ${error}`);
    }
  }
}

export default new PositionService();
