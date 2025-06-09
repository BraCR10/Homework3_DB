import { Request, Response } from "express";
import LoginService from "../services/Auth.service";
import { LoginDTO } from "../dtos/AuthDTO";
import ErrorResponseDTO from "../dtos/ErrorResponseDTO";

export async function loginUser(req: Request, res: Response): Promise<void> {
  try {
    const { Username, Password } = req.body;

    if (!Username || !Password) {
      console.error("Username and password are required.");
      const errorResponse: ErrorResponseDTO = {
        success: false,
        error: {
          code: 400,
          detail: "Username and password are required."
        },
        timestamp: new Date().toISOString()
      };
      res.status(400).json(errorResponse);
      return;
    }

    if (typeof Username !== "string" || typeof Password !== "string") {
      console.error("Username and password must be strings.");
      const errorResponse: ErrorResponseDTO = {
        success: false,
        error: {
          code: 400,
          detail: "Username and password must be strings."
        },
        timestamp: new Date().toISOString()
      };
      res.status(400).json(errorResponse);
      return;
    }

    const credentials: LoginDTO = {
      Username: Username,
      Password: Password,
      IpAddress: req.ip ? req.ip : "",
    };
    const response = await LoginService.loginUser(credentials);

    if (response.success) {
      res.status(200).json(response);
    } 
    else {
      res.status(401).json(response);
    }
  } 
  catch (error) {
    const errorMessage: ErrorResponseDTO = {
      success: false,
      error: {
        code: 50008,
        detail: "Un error a ocurrido mientras el cierre de sesion"
      },
      timestamp: new Date().toISOString()
    };

    res.status(500).json(errorMessage);
  }
}

export async function logoutUser(req: Request, res: Response): Promise<void> {
  try {
    const userIdHeader = req.headers["user-id"];
    const userId = userIdHeader ? Number(userIdHeader) : undefined;
    if (!userId || isNaN(userId)) {
      console.error("User ID is required.");
      res.status(400).json({
        success: false,
        error: { 
          code: 400, 
          detail: "User ID is required in header and must be a number."
        },
        timestamp: new Date().toISOString()
      });
      return;
    }
    const ip = req.ip ? req.ip : "";
    const response = await LoginService.logoutUser(userId, ip);

    if (response.success) {
      res.status(200).json(response);
    }
    else {
      res.status(401).json(response);
    }
  } 
  catch (error) {
    const errorMessage: ErrorResponseDTO = {
      success: false,
      error: {
        code: 50008,
        detail: "Un error a ocurrido mientras el cierre de sesion"
      },
      timestamp: new Date().toISOString()
    };

    res.status(500).json(errorMessage);
  }
}
