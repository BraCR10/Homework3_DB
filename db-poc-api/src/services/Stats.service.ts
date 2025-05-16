import { execute } from "../config/db.config";
import { inSqlParameters } from "../types/queryParams.type";
import { useMock } from "../app";
import ErrorHandler from "../utils/ErrorHandler";
import {
  GetStatsSuccessResponseDTO,
  StatsErrorResponseDTO,
} from "../dtos/StatsDTO";
import { IRecordSet } from "mssql";

class StatsService {
  async getStats(): Promise<
    GetStatsSuccessResponseDTO | StatsErrorResponseDTO
  > {
    const params: inSqlParameters = {};

    try {
      if (useMock)
        return {
          success: true,
          data: {
            totalPuestos: 0,
            totalEmpleados: 0,
            totalGasto: 0,
            fecha: new Date(),
            puestos: [],
          },
        };
      else {
        const result = await execute(
          "sp_listar_estadisticas_plantilla",
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
              totalPuestos: 0,
              totalEmpleados: 0,
              totalGasto: 0,
              fecha: new Date(),
              puestos: [],
            },
          };
        }
        
        const processDataResult = this.processData(data);
        return {
          success: true,
          data: {
            ...processDataResult,
          },
        };
      }
    } catch (error) {
      console.log("Error in getStats: ", error);
      throw new Error(`An error occurred while fetching stats : ${error}`);
    }
  }

  private processData(data: IRecordSet<any>): any {
    const MONTH_DAYS_CANT = 30;

    const totalPuestos = data.length;

    const totalEmpleados = data.reduce(
      (acc: number, puesto: any) => acc + puesto.CantEmpleados,
      0,
    ) ;

    const totalGasto = data.reduce(
      (acc: number, puesto: any) =>
        acc + puesto.CantEmpleados * puesto.SalarioXHora,
      0,
    ) * MONTH_DAYS_CANT;

    const fecha = new Date();

    const puestos = data.map((puesto: any) => ({
      Nombre: puesto.Nombre,
      SalarioXHora: puesto.SalarioXHora,
      CantEmpleados: puesto.CantEmpleados,
      GastoTotal: puesto.CantEmpleados * puesto.SalarioXHora * MONTH_DAYS_CANT,
    }));
    return {
      totalPuestos,
      totalEmpleados,
      totalGasto,
      fecha,
      puestos,
    };
  }
}

export default new StatsService();
