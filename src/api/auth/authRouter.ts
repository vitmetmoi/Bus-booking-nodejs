import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { AuthSchema, SignUpSchema, ResetPasswordSchema, ConfirmResetPasswordSchema, SignInSchema } from "@/api/auth/authModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { authController } from "./authController";
import passport from "passport";
import { localLoginMiddleware } from "@/common/middleware/auth/localLoginMiddleware";
import { z } from "zod";
import { authService } from "@/api/auth/authService";

export const authRegistry = new OpenAPIRegistry();
export const authRouter: Router = express.Router();

authRegistry.register("Auth", AuthSchema);

authRegistry.registerPath({
  method: "get",
  path: "/auth/google",
  tags: ["Auth"],
  summary: "Đăng nhập với Google",
  description: "Chuyển hướng người dùng đến Google để xác thực bằng OAuth2.",
  responses: {
    302: {
      description: "Redirect to Google login page",
    },
  },
});

authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/fail" }),
  (req, res) => {
    res.json({
      data: req.user
    })
  }
);

authRegistry.registerPath({
  method: "post",
  path: "/auth/reset-password",
  tags: ["Auth"],
  summary: "Đặt lại mật khẩu",
  description: "Reset-password",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ResetPasswordSchema.shape.body,
        },
      },
    },
  },
  responses: createApiResponse(AuthSchema, "Send mail successfully", 201),
});

authRouter.post(
  "/reset-password",
  authController.resetPassword
);

authRegistry.registerPath({
  method: "post",
  path: "/auth/reset-password/confirm",
  tags: ["Auth"],
  summary: "Xác nhận đặt lại mật khẩu",
  description: "Xác nhận và cập nhật mật khẩu mới sau khi người dùng đã nhận token qua email",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ConfirmResetPasswordSchema.shape.body,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Reset mật khẩu thành công",
      content: {
        "application/json": {
          schema: z.object({
            statusCode: z.number(),
            message: z.string(),
          }),
        },
      },
    },
    400: {
      description: "Token không hợp lệ hoặc đã hết hạn",
      content: {
        "application/json": {
          schema: z.object({
            statusCode: z.number(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

authRouter.post(
  "/reset-password/confirm",
  authController.confirmResetPassword
);

authRegistry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  summary: "Đăng ký tài khoản",
  description: `
  
- Yêu cầu cung cấp đầy đủ các thông tin: email, số điện thoại và mật khẩu.

- Email phải đúng định dạng email hợp lệ (ví dụ: user@example.com).

- Số điện thoại phải có độ dài từ 9 đến 15 ký tự, có thể bắt đầu bằng dấu '+' và chỉ chứa các chữ số.

- Mật khẩu phải thỏa mãn các điều kiện sau:
  - Có ít nhất 8 ký tự.
  - Có ít nhất một chữ cái viết hoa (A-Z).
  - Có ít nhất một chữ cái viết thường (a-z).
  - Có ít nhất một số (0-9).
  - Có ít nhất một ký tự đặc biệt (ví dụ: @, #, $, %, &,...).

`,
  request: {
    body: {
      content: {
        "application/json": {
          schema: SignUpSchema.shape.body,
        },
      },
    },
  },
  responses: createApiResponse(AuthSchema, "Register account successfully", 201),
});

authRouter.post(
  "/register",
  validateRequest(SignUpSchema),
  authController.register
);

authRegistry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  summary: "Đăng nhập",
  description: "Login account",
  request: {
    body: {
      content: {
        "application/json": {
          schema: SignInSchema.shape.body,
        },
      },
    },
  },
  responses: createApiResponse(AuthSchema, "Login successfully", 201),
});

authRouter.post(
  "/login",
  localLoginMiddleware
);


// Get user profile endpoint
authRegistry.registerPath({
  method: "get",
  path: "/auth/profile",
  tags: ["Auth"],
  summary: "Get user profile",
  description: "Get current user profile information",
  security: [{ bearerAuth: [] }],
  responses: createApiResponse(AuthSchema, "Profile retrieved successfully", 200),
});

authRouter.get("/profile", async (req, res) => {
  try {
    const user = await authService.findById((req as any).user.id);
    res.status(user.statusCode).send(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to get profile" });
  }
});







