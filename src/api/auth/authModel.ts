import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type User = z.infer<typeof AuthSchema>;
export const AuthSchema = z.object({
    id: z.number(),
    email: z.string().email(),
    password: z.string(),
    username: z.string(),
    reset_token: z.string().nullable().optional(),
    phone: z.string(),
    reset_token_expiry: z
        .union([z.number().int(), z.null()])
        .optional(),
    role: z.enum(["user", "admin"]).default("user"),
    google_id: z.string().nullable().optional(),
    created_at: z.date(),
    updated_at: z.date(),
});

// Input Validation for 'GET users/:id' endpoint
export const GetUserSchema = z.object({
    params: z.object({ id: commonValidations.id }),
});

export const SignUpSchema = z.object({
    body: z
        .object({
            email: z.string().email().openapi({ example: "anhnguyen2k373@gmail.com" }),
            password: z
                .string()
                .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
                .regex(/[A-Z]/, "Phải có ít nhất một chữ hoa")
                .regex(/[a-z]/, "Phải có ít nhất một chữ thường")
                .regex(/[0-9]/, "Phải có ít nhất một số")
                .regex(/[^A-Za-z0-9]/, "Phải có ít nhất một ký tự đặc biệt")
                .openapi({ example: "Ducanh12@#" }),
            phone: z.string().min(9).max(15).regex(/^\+?[0-9]{9,15}$/, "Invalid phone number").openapi({ example: "+84987654321" }),
        })
        .openapi({
            example: {
                email: "user100@gmail.com",
                phone: "0762494312",
                password: "Huy@1234",
            },
        }),
});

export const SignInSchema = z.object({
    body: z
        .object({
            email: z.string().email().openapi({ example: "nguyenthaiviethuy9423@gmail.com" }),
            password: z.string().min(6).openapi({ example: "Huy@9423" }),
        })
        .openapi({
            example: {
                email: "nguyenthaiviethuy9423@gmail.com",
                password: "Huy@9423",
            },
        }),
});


export const ResetPasswordSchema = z.object({
    body: z.object({
        email: z.string().email(),
    })
        .openapi({
            example: {
                email: "nguyenthaiviethuy9423@gmail.com",
            },
        }),
});

export const ConfirmResetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(10, "Token không hợp lệ"),
        newPassword: z.string().min(6, "Mật khẩu phải từ 6 ký tự trở lên"),
    })
        .openapi({
            example: {
                token: "abc123resetTokenXYZ",
                newPassword: "Huy@123456",
            },
        }),
});
