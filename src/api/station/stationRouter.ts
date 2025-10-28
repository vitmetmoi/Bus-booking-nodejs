// src/routes/stationRouter.ts
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import {
  GetStationSchema,
  StationSchema,
  CreateStationSchema,
  UpdateStationSchema,
  StationQuerySchema
} from "@/api/station/stationModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { stationController } from "@/api/station/stationController";
import { authenticate } from "@/common/middleware/auth/authMiddleware";
import { permission } from "@/common/middleware/auth/permission";
import { stationUpload } from "@/common/middleware/stationUploadMiddleware";

export const stationRegistry = new OpenAPIRegistry();
export const stationRouter: Router = express.Router();

/** 
 * 🗂 Đăng ký schema cho OpenAPI 
 */
stationRegistry.register("Station", StationSchema);

/** 
 *  Lấy danh sách bến xe (Phân trang, Tìm kiếm, Sắp xếp)
 */
stationRegistry.registerPath({
  method: "get",
  path: "/stations",
  tags: ["Station"],
  summary: "Lấy tất cả các bến xe với phân trang, tìm kiếm và sắp xếp",
  //   description: `
  // Hiển thị thông tin tất cả các bến xe 

  //   - **page**: Số trang

  //   - **limit**: Giới hạn số lượng bến xe hiển thị

  //   - **search**: Tìm kiếm bến xe

  //   - **sortBy**: Sắp xếp theo 'tên bến xe','vị trí','thời gian tạo'

  //   - **order**: thứ tự 'tăng dần' hay 'giảm dần'

  // `,
  request: {
    query: StationQuerySchema.shape.query,
  },
  responses: createApiResponse(z.array(StationSchema), "Danh sách các bến xe"),
});
stationRouter.get("/", validateRequest(StationQuerySchema), stationController.getStations);

/** 
 *  Lấy thông tin chi tiết của một bến xe
 */
stationRegistry.registerPath({
  method: "get",
  path: "/stations/{id}",
  tags: ["Station"],
  summary: "Lấy thông tin chi tiết một bến xe theo ID",
  request: {
    params: GetStationSchema.shape.params,
  },
  responses: createApiResponse(StationSchema, "Thông tin chi tiết của bến xe"),
});
stationRouter.get("/:id", validateRequest(GetStationSchema), stationController.getStation);

/** 
 *  Tạo mới một bến xe
 */
// stationRegistry.registerPath({
//   method: "post",
//   path: "/stations",
//   tags: ["Station"],
//   summary: "Tạo mới một bến xe",
//   request: {
//     body: {
//       content: {
//         "multipart/form-data": {
//           schema: z.object({
//             name: z.string(),
//             descriptions: z.string().optional(),
//             location: z.string(),
//             image: z.any().optional(),        // Đây là phần upload file
//             wallpaper: z.any().optional(),    // Đây là phần upload file
//           }),
//         },
//       },
//     },
//   },
//   responses: createApiResponse(StationSchema, "Tạo mới bến xe thành công"),
// });

stationRegistry.registerPath({
  method: "post",
  path: "/stations",
  tags: ["Station"],
  summary: "Tạo mới một bến xe",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            name: z.string(),
            descriptions: z.string().optional(),
            location: z.string(),
            image: z.any().optional(),
            wallpaper: z.any().optional(),
          }).openapi({
            properties: {
              name: {
                type: "string",
                description: "Tên bến xe",
              },
              descriptions: {
                type: "string",
                description: "Mô tả bến xe",
              },
              location: {
                type: "string",
                description: "Vị trí bến xe",
              },
              image: {
                type: "string",
                format: "binary",
                description: "Ảnh đại diện bến xe",
              },
              wallpaper: {
                type: "string",
                format: "binary",
                description: "Ảnh nền của bến xe",
              },
            },
            required: ["name", "location"]
          }),
        },
      },
    },
  },
  responses: createApiResponse(StationSchema, "Tạo mới bến xe thành công"),
});


stationRouter.post(
  "/",
  authenticate,
  permission,
  stationUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "wallpaper", maxCount: 1 },
  ]),
  stationController.createStation
);

/** 
 *  Cập nhật thông tin một bến xe
 */
stationRegistry.registerPath({
  method: "put",
  path: "/stations/{id}",
  tags: ["Station"],
  summary: "Cập nhật thông tin bến xe",
  request: {
    params: UpdateStationSchema.shape.params,
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            name: z.string().optional(),
            descriptions: z.string().optional(),
            location: z.string().optional(),
            image: z.any().optional(),
            wallpaper: z.any().optional(),
          }).openapi({
            properties: {
              name: {
                type: "string",
                description: "Tên bến xe",
              },
              descriptions: {
                type: "string",
                description: "Mô tả bến xe",
              },
              location: {
                type: "string",
                description: "Vị trí bến xe",
              },
              image: {
                type: "string",
                format: "binary",
                description: "Ảnh đại diện bến xe",
              },
              wallpaper: {
                type: "string",
                format: "binary",
                description: "Ảnh nền của bến xe",
              },
            },
          }),
        },
      },
    },
  },
  responses: createApiResponse(StationSchema, "Cập nhật thông tin bến xe thành công"),
});

stationRouter.put(
  "/:id",
  authenticate,
  permission,
  stationUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "wallpaper", maxCount: 1 },
  ]),
  stationController.updateStation
);


/** 
 *  Xóa một bến xe theo ID
 */
stationRegistry.registerPath({
  method: "delete",
  path: "/stations/{id}",
  tags: ["Station"],
  summary: "Xóa một bến xe theo ID",
  request: {
    params: GetStationSchema.shape.params,
  },
  responses: createApiResponse(z.object({ success: z.boolean() }), "Xóa bến xe thành công"),
});
stationRouter.delete("/:id", authenticate, permission, validateRequest(GetStationSchema), stationController.deleteStation);
