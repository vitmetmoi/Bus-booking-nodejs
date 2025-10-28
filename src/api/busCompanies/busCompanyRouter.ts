import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import {
  BusCompanySchema,
  GetBusCompanySchema,
  CreateBusCompanySchema,
  UpdateBusCompanySchema,
  BusCompanyQuerySchema
} from "./busCompanyModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { busCompanyController } from "./busCompanyController";
import { upload } from "@/common/middleware/uploadMiddleware";
import { busCompanyUpload } from "@/common/middleware/busCompanyUploadMiddleware";
import { authenticate } from "@/common/middleware/auth/authMiddleware";
import { permission } from "@/common/middleware/auth/permission";

export const busCompanyRegistry = new OpenAPIRegistry();
export const busCompanyRouter: Router = express.Router();

//  Đăng ký model cho OpenAPI
busCompanyRegistry.register("BusCompany", BusCompanySchema);

//  GET /bus-companies
busCompanyRegistry.registerPath({
  method: "get",
  path: "/bus-companies",
  tags: ["BusCompany"],
  summary: "Lấy danh sách nhà xe",
  request: { query: BusCompanyQuerySchema.shape.query },
  responses: createApiResponse(z.array(BusCompanySchema), "Danh sách nhà xe"),
});
busCompanyRouter.get("/", validateRequest(BusCompanyQuerySchema), busCompanyController.getCompanies);

//  GET /bus-companies/:id
busCompanyRegistry.registerPath({
  method: "get",
  path: "/bus-companies/{id}",
  tags: ["BusCompany"],
  summary: "Lấy thông tin chi tiết một nhà xe theo ID",
  request: { params: GetBusCompanySchema.shape.params },
  responses: createApiResponse(BusCompanySchema, "Chi tiết nhà xe"),
});
busCompanyRouter.get("/:id", validateRequest(GetBusCompanySchema), busCompanyController.getCompany);

//  POST /bus-companies
busCompanyRegistry.registerPath({
  method: "post",
  path: "/bus-companies",
  tags: ["BusCompany"],
  summary: "Tạo mới nhà xe",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            name: z.string(),
            descriptions: z.string().optional(),
            image: z.any().optional(),
          }).openapi({
            properties: {
              company_name: {
                type: "string",
                description: "Tên nhà xe",
              },
              descriptions: {
                type: "string",
                description: "Mô tả nhà xe",
              },
              image: {
                type: "string",
                format: "binary",
                description: "Ảnh đại diện nhà xe",
              },
            },
            required: ["company_name"]
          }),
        },
      },
    },
  },
  responses: createApiResponse(BusCompanySchema, "Tạo nhà xe thành công"),
});

busCompanyRouter.post(
  "/",
  authenticate,
  permission,
  busCompanyUpload.fields([
    { name: "image", maxCount: 1 },
  ]),
  busCompanyController.createCompany
);

//  PUT /bus-companies/:id
busCompanyRegistry.registerPath({
  method: "put",
  path: "/bus-companies/{id}",
  tags: ["BusCompany"],
  summary: "Cập nhật nhà xe",
  request: {
    params: UpdateBusCompanySchema.shape.params,
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            name: z.string(),
            descriptions: z.string().optional(),
            image: z.any().optional(),
          }).openapi({
            properties: {
              company_name: {
                type: "string",
                description: "Tên nhà xe",
              },
              descriptions: {
                type: "string",
                description: "Mô tả nhà xe",
              },
              image: {
                type: "string",
                format: "binary",
                description: "Ảnh đại diện nhà xe",
              },
            },
            required: ["company_name"]
          }),
        },
      },
    },
  },
  responses: createApiResponse(BusCompanySchema, "Cập nhật thành công"),
});
busCompanyRouter.put(
  "/:id",
  authenticate,
  permission,
  busCompanyUpload.fields([
    { name: "image", maxCount: 1 },
  ]),
  busCompanyController.updateCompany
);

//  DELETE /bus-companies/:id
busCompanyRegistry.registerPath({
  method: "delete",
  path: "/bus-companies/{id}",
  tags: ["BusCompany"],
  summary: "Xóa nhà xe",
  request: { params: GetBusCompanySchema.shape.params },
  responses: createApiResponse(z.object({ success: z.boolean() }), "Xóa thành công"),
});
busCompanyRouter.delete("/:id", authenticate, permission, validateRequest(GetBusCompanySchema), busCompanyController.deleteCompany);

// Upload featured image for a bus company
busCompanyRouter.post(
  "/:id/featured-image",
  authenticate,
  permission,
  busCompanyUpload.single("featured_image"),
  busCompanyController.uploadFeaturedImage
);