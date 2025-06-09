import ErrorResponseDTO from "../dtos/ErrorResponseDTO";
import { IResult } from "mssql";

export default function ErrorHandler(response: IResult<any>): ErrorResponseDTO {
  const mssqlError = response.recordset && response.recordset[0] && response.recordset[0].message
    ? response.recordset[0].message
    : "Error desconocido en SQL Server";
  console.log("Error in SQL Server: ", mssqlError);
  const errorResponse: ErrorResponseDTO = {
    success: false,
    error: {
      code: response.output.outResultCode,
      detail: mssqlError,
    },
    timestamp: new Date().toISOString()
  };
  return errorResponse;
}