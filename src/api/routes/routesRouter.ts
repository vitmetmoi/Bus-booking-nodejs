import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders"; // Bạn đã xây dựng hàm này cho OpenAPI response
import { validateRequest } from "@/common/utils/httpHandlers"; // Nếu bạn muốn validate request data
import { routesController } from "@/api/routes/routesController"; // Controller để xử lý logic route
import { RoutesSchema, CreateRoutesSchema, PaginatedRoutesResponseSchema } from "./routesModel"; // Schema Zod cho routes

import { permission } from "@/common/middleware/auth/permission";
import { authenticate } from "@/common/middleware/auth/authMiddleware";

// Khởi tạo OpenAPI registry
export const routesRegistry = new OpenAPIRegistry();

// Khởi tạo router
export const routesRouter: Router = express.Router();

// routesRouter.use(authenticate);

// Đăng ký schema OpenAPI cho Routes
routesRegistry.register("Routes", RoutesSchema);

// Đăng ký đường dẫn cho OpenAPI với method 'get'

// Đăng ký handler cho GET /routes
routesRegistry.registerPath({
  method: "get",
  path: "/routes",
  operationId: "getAllRoutes",
  tags: ["Routes"],
  summary: "Lấy danh sách routes có hỗ trợ phân trang, tìm kiếm và lọc",
  parameters: [
    {
      name: "page",
      in: "query",
      required: false,
      schema: { type: "integer", minimum: 1 },
      description: "Số trang (mặc định: 1)",
    },
    {
      name: "limit",
      in: "query",
      required: false,
      schema: { type: "integer", minimum: 1 },
      description: "Số lượng bản ghi mỗi trang (mặc định: 10)",
    },
    {
      name: "departure_station_id",
      in: "query",
      required: false,
      schema: { type: "number" },
      description: "Tìm theo id trạm khởi hành ",
    },
    {
      name: "arrival_station_id",
      in: "query",
      required: false,
      schema: { type: "number" },
      description: "Tìm theo id trạm đích  ",
    },
    {
      name: "sortBy",
      in: "query",
      required: false,
      schema: {
        type: "string",
        enum: ['distance_km', 'estimated_duration_hours', 'created_at'],
      },
      description: "Sắp xếp theo trường ('distance_km' | 'estimated_duration_hours' | 'created_at')",
    },
    {
      name: "order",
      in: "query",
      required: false,
      schema: {
        type: "string",
        enum: ["asc", "desc"],
      },
      description: "Thứ tự sắp xếp (tăng dần hoặc giảm dần)",
    },
  ],
  responses: createApiResponse(PaginatedRoutesResponseSchema, "Thành công"),
});
routesRouter.get("/", routesController.getAllRoutes);
//them moi tuyen duong 




routesRegistry.registerPath({
  method: "post",
  path: "/routes",
  tags: ["Routes"],
  operationId: "createRoutes",  // Thay 'operation' bằng 'operationId'
  summary: "Thêm mới tuyến đường",  // Thêm phần mô tả ngắn gọn về API
  description: `
    API này dùng để tạo mới một tuyến đường.
    Bạn cần cung cấp các thông tin sau:
    - departure_station_id: ID trạm xuất phát
    - arrival_station_id: ID trạm đến
    - distance_km: Khoảng cách (km)
    - estimated_duration_hours: Thời gian di chuyển (giờ)`,
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            departure_station_id: {
              type: "number",
              description: "ID của trạm khởi hành"
            },
            arrival_station_id: {
              type: "number",
              description: "ID của trạm đến"
            },
            distance_km: {
              type: "number",
              description: 'Khoảng cách (km)'
            },
            estimated_duration_hours: {
              type: "number",
              description: "Thời gian di chuyển (giờ)"
            },
          },

        },
      },
    },
  },
  responses: {

    400: {
      description: "Invalid input data",
    },
    500: {
      description: "Internal server error",
    },
  },
})


routesRouter.post("/", authenticate, permission, validateRequest(CreateRoutesSchema), routesController.createRoutes);
//update tuyen duong theo id
routesRegistry.registerPath({
  method: "put",
  path: "/routes/{id}",
  tags: ["Routes"],
  operationId: "updateRoute",
  summary: "Cập nhật thông tin tuyến đường theo ID",
  description: `
    API này dùng để cập nhật thông tin tuyến đường đã tồn tại.
    Bạn cần cung cấp ID tuyến đường trong path và các trường muốn cập nhật trong body:
    - departure_station_id: ID trạm xuất phát (nếu muốn thay đổi)
    - arrival_station_id: ID trạm đến (nếu muốn thay đổi)
    - distance_km: Khoảng cách (km) (nếu muốn thay đổi)
    - estimated_duration_hours: Thời gian di chuyển (giờ) (nếu muốn thay đổi)
  `,
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      description: "ID của tuyến đường cần cập nhật",
      schema: {
        type: "number",
      },
    },
  ],
  requestBody: {
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            departure_station_id: {
              type: "number",
              description: "ID của trạm khởi hành",
            },
            arrival_station_id: {
              type: "number",
              description: "ID của trạm đến",
            },
            distance_km: {
              type: "number",
              description: "Khoảng cách (km)",
            },
            estimated_duration_hours: {
              type: "number",
              description: "Thời gian di chuyển (giờ)",
            },
          },
          // Không bắt buộc phải cập nhật tất cả trường
          // Nếu muốn bắt buộc thì thêm "required" vào đây
        },
      },
    },
  },
  responses: {
    200: {
      description: "Cập nhật tuyến đường thành công",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              id: { type: "number" },
              departure_station_id: { type: "number" },
              arrival_station_id: { type: "number" },
              distance_km: { type: "number" },
              estimated_duration_hours: { type: "number" },
              updated_at: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
    400: { description: "Dữ liệu gửi lên không hợp lệ" },
    404: { description: "Không tìm thấy tuyến đường với ID này" },
    500: { description: "Lỗi máy chủ" },
  },
});

routesRouter.put("/:id", authenticate, permission, validateRequest(CreateRoutesSchema), routesController.updateRoutes);
//Xoa tuyen duong
routesRegistry.registerPath({
  method: "delete",
  path: "/routes/{id}",
  operationId: "deleteRoutes",
  summary: "Xóa tuyến đường theo id",
  tags: ["Routes"],
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      schema: { type: "integer" },
      description: "ID của route cần xóa",
    },
  ],
  responses: {
    200: {
      description: "Routes đã được xóa thành công",
      content: {
        "application/json": {
          schema: RoutesSchema,
        },
      },
    },
    404: {
      description: "Không tìm thấy banner",
    },
    500: {
      description: "Lỗi server nội bộ",
    },
  },
});
routesRouter.delete("/:id", authenticate, permission, routesController.deleteRoutes);
