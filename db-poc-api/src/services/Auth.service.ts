import {
  LoginErrorResponseDTO,
  LoginDTO,
  LoginSuccessResponseDTO,
} from "../dtos/AuthDTO";
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
      inUsername: [username, TYPES.VarChar],
      inPassword: [password, TYPES.VarChar],
      inIP: [IP, TYPES.VarChar],
    };

    try {
      if (useMock) return { success: true, Id: 1, Username: "test" };
      
      else {
        const response = await execute("sp_login", params, {});
        if (response.output.outResultCode == 0) {
          let data = response.recordset[0];
          const loginResponse: LoginSuccessResponseDTO = {
            success: true,
            Id: data.Id,
            Username: username,
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

  async logoutUser(userId: number, ip: string): Promise<boolean> {
    if (!userId) {
      false;
    }
    const params: inSqlParameters = {
      inUserId: [String(userId), TYPES.Int],
      inIP: [ip, TYPES.VarChar],
    };
    try {
      if (useMock) return true;
      else {
        const response = await execute("sp_logout", params, {});
        if (response.output.outResultCode == 0) {
          return true;
        } else {
          throw new Error("DB error");
        }
      }
    } catch (error) {
      console.error("Error details:", error);
      throw new Error(`An error occurred while creating the employ: ${error}`);
    }
  }
}

export default new AuthService();
