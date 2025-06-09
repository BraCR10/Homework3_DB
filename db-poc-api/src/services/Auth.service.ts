import {
  LoginErrorResponseDTO,
  LoginDTO,
  LoginSuccessResponseDTO,
  LogoutSuccessResponseDTO
} from "../dtos/AuthDTO";
import ErrorResponseDTO from "../dtos/ErrorResponseDTO";
import { execute } from "../config/db.config";
import { TYPES } from "mssql";
import { inSqlParameters } from "../types/queryParams.type";
import { useMock } from "../app";
import ErrorHandler from "../utils/ErrorHandler";

class AuthService {
  async loginUser(
    credentials: LoginDTO,
  ): Promise<LoginErrorResponseDTO | LoginSuccessResponseDTO> {
    const {
      Username: username,
      Password: password,
      IpAddress: IP,
    } = credentials;
    const params: inSqlParameters = {
      inUsuario: [username, TYPES.VarChar],
      inPassword: [password, TYPES.VarChar],
      inIP: [IP, TYPES.VarChar],
    };

    try {
      if (useMock) {
        return {
          success: true,
          data: {
            loginStatus: {
              Id: 1,
              Username: "test",
              Role: "Admin"
            }
          },
          message: "Mock login successful",
          timestamp: new Date().toISOString()
        };
      }
      
      else {
        const response = await execute("sp_login", params, {});
        if (response.output.outResultCode == 0) {
          let data = response.recordset[0];
          const loginResponse: LoginSuccessResponseDTO = {
            success: true,
            data: {
              loginStatus: {
                Id: data.Id,
                Username: username,
                Role: data.Role, // "Admin" o "Employee"
              }
            },
            message: "",
            timestamp: new Date().toISOString()
          };
          return loginResponse;
        } 
         else {
          return ErrorHandler(response) as LoginErrorResponseDTO;
        }
      }
    } catch (error) {
      console.error("Error details:", error);
      throw new Error(`An error occurred while creating the employ: ${error}`);
    }
  }

  async logoutUser(userId: number, ip: string): Promise<ErrorResponseDTO | LogoutSuccessResponseDTO> {
    if (!userId) {
      false;
    }
    const params: inSqlParameters = {
      inUserId: [String(userId), TYPES.Int],
      inIP: [ip, TYPES.VarChar],
    };
    try {
      if (useMock) {
        return {
          success: true,
          message: "Sesión finalizada correctamente",
          timestamp: new Date().toISOString()
        };
      } 
      else {
        const response = await execute("sp_logout", params, {});
        if (response.output.outResultCode == 0) {
          return {
            success: true,
            message: "Sesión finalizada correctamente",
            timestamp: new Date().toISOString()
          };
        } 
        else {
          return ErrorHandler(response) as ErrorResponseDTO;
        }
      }
    } 
    catch (error) {
      console.error("Error details:", error);
      throw new Error(`An error occurred while logging out: ${error}`);
    }
  }
}

export default new AuthService();
