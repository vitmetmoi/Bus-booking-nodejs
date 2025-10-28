import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { env } from "@/common/utils/envConfig";

export const localLoginMiddleware = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", { session: false }, (err: any, data: any, info: any) => {
    if (err || !data) {
      return res.status(401).json({ message: info?.message || "Login failed" });
    }

    const { token, user } = data;

    // Set JWT as HttpOnly cookie for browser clients
    const cookieOptions = {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: env.isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: "/",
    } as const;
    res.cookie("access_token", token, cookieOptions);

    return res.status(200).json({
      "success": true,
      message: "Login successful",
      token,
      user,
      statusCode: 200,
    });
  })(req, res, next);
};


