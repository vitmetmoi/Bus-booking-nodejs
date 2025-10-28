import type { Request, RequestHandler, Response } from "express";
import { authService } from "@/api/auth/authService";
// Hello
class AuthController {
  public register: RequestHandler = async (req, res) => {
    const serviceResponse = await authService.register(req.body);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public resetPassword: RequestHandler = async (req: Request, res: Response) => {
    const response = await authService.resetPassword(req.body.email);
    res.status(response.statusCode).send(response);
  };

  public confirmResetPassword: RequestHandler = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    const response = await authService.confirmResetPassword(token, newPassword);
    res.status(response.statusCode).send(response);
  };

  public logout: RequestHandler = async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        const cookieToken = (req as any).cookies?.access_token as string | undefined;
        if (!cookieToken) {
          res.status(401).json({ message: "Không có token" });
          return;
        }
        await authService.logout(cookieToken);
        res.clearCookie("access_token", { path: "/" });
        res.status(200).json({ message: "Đăng xuất thành công" });
        return;
      }

      const token = authHeader.split(" ")[1];
      await authService.logout(token);

      res.clearCookie("access_token", { path: "/" });
      res.status(200).json({ message: "Đăng xuất thành công" });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  };
}

export const authController = new AuthController();
