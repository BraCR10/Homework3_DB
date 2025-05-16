import { Request, Response } from "express";
import LoginService from "../services/Auth.service";
import { LoginErrorResponseDTO, LoginDTO } from "../dtos/AuthDTO";

export async function loginUser(req: Request, res: Response): Promise<void> {
  try {
    const { Username, Password } = req.body;

    if (!Username || !Password) {
      console.error("Username and password are required.");
      const errorResponse: LoginErrorResponseDTO = {
        success: false,
        error: {
          code: 400,
          detail: "Username and password are required.",
        },
      };
      res.status(400).json({ success: false, error: errorResponse });
      return;
    }

    if (typeof Username !== "string" || typeof Password !== "string") {
      console.error("Username and password must be strings.");
      const errorResponse: LoginErrorResponseDTO = {
        success: false,
        error: {
          code: 400,
          detail: "Username and password must be strings.",
        },
      };
      res.status(400).json({ success: false, error: errorResponse });
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
    } else {
      res.status(401).json(response);
    }
  } catch (error) {
    const errorMessage: LoginErrorResponseDTO = {
      success: false,
      error: {
        code: 50008,
        detail: "Un error a ocurrido al iniciar sesión",
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

export async function logoutUser(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.body.UserId;
    if (!userId) {
      console.error("User ID is required.");
      res.status(400).json({
        success: false,
        error: { code: 400, details: "User ID is required." },
      });
      return;
    }
    const ip = req.ip ? req.ip : "";
    const response = await LoginService.logoutUser(userId, ip);

    if (response) {
      res
        .status(200)
        .json({ success: true, detail: "Sesión finalizada correctamente" });
    } else {
      res.status(401).json({
        success: false,
        error: { code: 401, details: "Logout failed" },
      });
    }
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({
      success: false,
      error: {
        code: 50008,
        detail: "Un error a ocurrido mientras el cierre de sesion ",
      },
    });
  }
}
