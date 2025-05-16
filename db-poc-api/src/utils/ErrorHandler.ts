import ErrorResponseDTO from "../dtos/ErrorResponseDTO";
import { IResult } from "mssql";

export default function ErrorHandler(response: IResult<any>): ErrorResponseDTO {
  const mssqlError = response.recordset[0].detail;
  console.log("Error in SQL Server: ", mssqlError);
  const errorResponse: ErrorResponseDTO = {
    success: false,
    error: {
      code: response.output.outResultCode,
      detail: mssqlError,
    },
  };
  return errorResponse;
}
