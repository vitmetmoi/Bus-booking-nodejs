import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type User = z.infer<typeof UserSchema>;
export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  age: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export const CreateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().int().nonnegative().optional(),
  }),
});

export const UpdateUserSchema = z.object({
  params: z.object({ id: commonValidations.id }),
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    age: z.number().int().nonnegative().optional(),
  }),
});

// Input Validation for 'GET users/:id' endpoint
export const GetUserSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

// export const UserQuerySchema = z.object({
//   query: z.object({
//     page: z.coerce.number().min(1).default(1),
//     limit: z.coerce.number().min(1).default(10),
//     email: z.string().optional(),
//     sortBy: z
//       .enum(["id:asc", "id:desc", "email:asc", "email:desc"])
//       .default("id:asc"),
//   }),
// });

export const UserQuerySchema = z.object({
  query: z.object({
    page: z.coerce
      .number()
      .min(1)
      .default(1)
      .describe("Trang hiện tại (bắt đầu từ 1)"),
    limit: z.coerce
      .number()
      .min(1)
      .default(10)
      .describe("Số lượng người dùng trên mỗi trang"),
    email: z
      .string()
      .optional()
      .describe("Tìm kiếm người dùng theo email (có thể là một phần email)"),
    sortBy: z
      .enum(["id:asc", "id:desc", "email:asc", "email:desc"])
      .default("id:asc")
      .describe("Sắp xếp kết quả theo id hoặc email (tăng dần hoặc giảm dần)"),
  }),
});


export const PaginatedUsersResponseSchema = z.object({
  results: z.array(UserSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});


