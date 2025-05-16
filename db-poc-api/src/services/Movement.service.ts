import { execute } from "../config/db.config";
import { TYPES } from "mssql";
import { inSqlParameters } from "../types/queryParams.type";
import { useMock } from "../app";
import ErrorHandler from "../utils/ErrorHandler";
import {
  CreateMovementsSuccessResponseDTO,
  CreateMovementsDTO,
  GetEmployeeMovementsSuccessResponseDTO,
  GetEmployeeMovementsDTO,
  getMovementsTypesSuccessResponseDTO,
  MovementsErrorResponseDTO,
} from "../dtos/MovementsDTO";

class MovementService {
  async employeeMovements(
    data: GetEmployeeMovementsDTO,
  ): Promise<
    GetEmployeeMovementsSuccessResponseDTO | MovementsErrorResponseDTO
  > {
    const params: inSqlParameters = {
      inValorDocumentoIdentidad: [data.DNI, TYPES.VarChar],
    };

    try {
      if (useMock)
        return {
          success: true,
          data: {
            empleado: {
              Id: 1,
              IdPuesto: 1,
              NombrePuesto: "test",
              ValorDocumentoIdentidad: "test",
              Nombre: "test",
              FechaContratacion: "2023-10-01",
              SaldoVacaciones: 0,
              EsActivo: true,
            },
            total: 0,
            movimientos: [
              {
                Id: 123,
                IdEmpleado: 1,
                IdTipoMovimiento: 2,
                NombreTipoMovimiento: "Vacaciones",
                Fecha: new Date("2024-03-10T14:30:22Z"),
                Monto: 3,
                IPAddress: "122.122.122.55",
                IdPostByUserName: "admin",
                NuevoSaldo: 12,
                IdPostByUser: 5,
                UsernamePostByUser: "admin",
                PostInIp: "192.168.1.5",
                PostTime: new Date("2024-03-10T14:30:22Z"),
              },
            ],
          },
        };
      else {
        const response = await execute("sp_listar_movimientos", params, {});
        if (response.output.outResultCode == 0) {
          
          let data = response.recordset;
          if (data.length == 0) {
            return {
              success: true,
              data: {
                empleado: {
                  Id: 0,
                  IdPuesto: 0,
                  NombrePuesto: "",
                  ValorDocumentoIdentidad: "",
                  Nombre: "",
                  FechaContratacion: "",
                  SaldoVacaciones: 0,
                  EsActivo: false,
                },
                total: 0,
                movimientos: [],
              },
            };
          }
          
          const employeeMovementsResponse: GetEmployeeMovementsSuccessResponseDTO =
            {
              success: true,
              data: {
                empleado: {
                  Id: Number(data[0].IdEmpleado),
                  IdPuesto: Number(data[0].IdPuesto),
                  NombrePuesto: data[0].NombrePuesto,
                  ValorDocumentoIdentidad: data[0].ValorDocumentoIdentidad,
                  Nombre: data[0].Nombre,
                  FechaContratacion: data[0].FechaContratacion,
                  SaldoVacaciones: Number(data[0].SaldoVacaciones),
                  EsActivo: data[0].EsActivo,
                },
                total: data.length,
                movimientos: data.map((movimiento: any) => ({
                  Id: Number(movimiento.Id),
                  IdEmpleado: Number(movimiento.IdEmpleado),
                  IdTipoMovimiento: Number(movimiento.IdTipoMovimiento),
                  NombreTipoMovimiento: movimiento.NombreTipoMovimiento,
                  IdPostByUserName: movimiento.IdPostByUserName,
                  IPAddress: movimiento.IPAddress,
                  Fecha: new Date(movimiento.Fecha),
                  Monto: Number(movimiento.Monto),
                  NuevoSaldo: Number(movimiento.NuevoSaldo),
                  IdPostByUser: Number(movimiento.IdPostByUser),
                  UsernamePostByUser: movimiento.UsuarioPostByUser,
                  PostInIp: movimiento.PostInIP,
                  PostTime: new Date(movimiento.PostTime),
                })),
              },
            };
          return employeeMovementsResponse;
        } else {
          return ErrorHandler(response) as MovementsErrorResponseDTO;
        }
      }
    } catch (error) {
      console.error("Error details:", error);
      throw new Error(
        `An error occurred while fetching employee movements: ${error}`,
      );
    }
  }

  async createMovement(
    data: CreateMovementsDTO,
  ): Promise<CreateMovementsSuccessResponseDTO | MovementsErrorResponseDTO> {
    const params: inSqlParameters = {
      inIdTipoMovimiento: [String(data.IdTipoMovimiento), TYPES.Int],
      inMonto: [String(data.Monto), TYPES.Int],
      inValorDocumentoIdentidad: [data.DNIEmpleado, TYPES.VarChar],
      inPostByUserId: [String(data.IdUser), TYPES.Int],
      inPostInIP: [data.IpAddress, TYPES.VarChar],
    };
    try {
      if (useMock)
        return {
          success: true,
          data: {
            id: 1,
            message: "Movimiento creado exitosamente",
          },
        };
      else {
        const response = await execute("sp_insertar_movimiento", params, {});
        if (response.output.outResultCode == 0) {
          let data = response.recordset[0];
          console.log("Response data:", data);
          const createMovementResponse: CreateMovementsSuccessResponseDTO = {
            success: true,
            data: {
              id: data.Id,
              message: "Movimiento creado exitosamente",
            },
          };
          return createMovementResponse;
        } else {
          return ErrorHandler(response) as MovementsErrorResponseDTO;
        }
      }
    } catch (error) {
      console.error("Error details:", error);
      throw new Error(`An error occurred while creating movement: ${error}`);
    }
  }

  async getMovementsTypes(): Promise<
    getMovementsTypesSuccessResponseDTO | MovementsErrorResponseDTO
  > {
    try {
      if (useMock)
        return {
          success: true,
          data: {
            total: 2,
            tiposMovimientos: [
              {
                Id: 1,
                Nombre: "Vacaciones",
                TipoAccion: "RESTA",
              },
              {
                Id: 2,
                Nombre: "Aguinaldo",
                TipoAccion: "SUMA",
              },
            ],
          },
        };
      else {
        const response = await execute("sp_listar_tipos_movimientos", {}, {});
        if (response.output.outResultCode == 0) {
          let data = response.recordset;

          if (data.length == 0) {
            return {
              success: true,
              data: {
                total: 0,
                tiposMovimientos: [],
              },
            };
          }
          const getMovementsTypesResponse: getMovementsTypesSuccessResponseDTO =
            {
              success: true,
              data: {
                total: data.length,
                tiposMovimientos: data,
              },
            };
          return getMovementsTypesResponse;
        } else {
          return ErrorHandler(response) as MovementsErrorResponseDTO;
        }
      }
    } catch (error) {
      console.error("Error details:", error);
      throw new Error(
        `An error occurred while fetching movements types: ${error}`,
      );
    }
  }
}

export default new MovementService();
