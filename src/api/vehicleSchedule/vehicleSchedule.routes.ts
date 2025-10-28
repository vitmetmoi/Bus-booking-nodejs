import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import {
  VehicleScheduleSchema,
  CreateVehicleScheduleSchema,
  UpdateVehicleScheduleSchema,
  VehicleScheduleQuerySchema,
  DeleteVehicleScheduleSchema,
  GetVehicleScheduleSchema,
} from "./vehicleSchedule.model";
import { validateRequest } from "@/common/utils/httpHandlers";
import { vehicleScheduleController } from "./vehicleSchedule.controller";

import { authenticate } from "@/common/middleware/auth/authMiddleware";
import { permission } from "@/common/middleware/auth/permission";



export const vehicleScheduleRegistry = new OpenAPIRegistry();
export const vehicleScheduleRouter: Router = express.Router();

// vehicleScheduleRouter.use(authenticate);
vehicleScheduleRouter.use(authenticate);


vehicleScheduleRegistry.register("VehicleSchedule", VehicleScheduleSchema);

vehicleScheduleRegistry.registerPath({
  method: "get",
  path: "/vehicle-schedules",
  tags: ["VehicleSchedule"],
  operationId: "getVehicleSchedules",
  summary: "Hiển thị tất cả lịch trình của xe (phân trang, sắp xếp, tìm kiếm)",
  description: `phân trang<br /> 
                tìm kiếm theo: route_id, bus_id<br />
                sắp xếp theo: id:asc, id:desc, departure_time:asc, departure_time:desc<br />`,
  request: { query: VehicleScheduleQuerySchema.shape.query },
  responses: createApiResponse(z.array(VehicleScheduleSchema), "Success"),
});

vehicleScheduleRouter.get(
  "/",
  validateRequest(VehicleScheduleQuerySchema),
  vehicleScheduleController.getSchedules
);

// {
//   "route_id": 1,
//   "bus_id": 2,
//   "departure_time": "2025-06-01 08:00:00",
//   "arrival_time": "2025-06-01 10:00:00",
//   "available_seats": 30,
//   "total_seats": 40,
//   "status": "AVAILABLE"
// }

vehicleScheduleRegistry.registerPath({
  method: "post",
  path: "/vehicle-schedules",
  tags: ["VehicleSchedule"],
  operationId: "createVehicleSchedule",
  summary: "Thêm mới lịch trình xe",
  description: `Tạo mới một lịch trình xe với thông tin chi tiết bao gồm tuyến đường, xe, thời gian khởi hành.<br /><br />
                **route_id**: ID của tuyến đường (route)<br /><br />
                **bus_id**: ID của xe bus<br /><br />
                **departure_time**: Thời gian khởi hành VD: 2025-06-01 08:00:00<br /><br />
                `,

  request: {
    body: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              route_id: {
                type: "integer",
                format: "int32",
                example: 1,
                description: "ID của tuyến đường (route)",
              },
              bus_id: {
                type: "integer",
                format: "int32",
                example: 2,
                description: "ID của xe bus",
              },
              departure_time: {
                type: "string",
                format: "date-time",
                example: "2025-06-01 08:00:00",
                description: "Thời gian xe khởi hành (ISO 8601)",
              },

            },
            required: ["route_id", "bus_id", "departure_time"],
          },
        },
      },
    },
  },
  responses: createApiResponse(VehicleScheduleSchema, "Tạo lịch trình xe thành công", 201),
});

vehicleScheduleRouter.post(
  "/",
  permission,
  validateRequest(CreateVehicleScheduleSchema),
  vehicleScheduleController.createSchedule
);

// {
//   "available_seats": 25,
//   "status": "FULL"
// }

vehicleScheduleRegistry.registerPath({
  method: "put",
  path: "/vehicle-schedules/{id}",
  tags: ["VehicleSchedule"],
  operationId: "updateVehicleSchedule",
  summary: "Cập nhật lịch trình xe theo ID",
  description: `Cập nhật thông tin lịch trình xe theo ID. <br /><br />
                **route_id**: ID của tuyến đường (route)<br /><br />
                **bus_id**: ID của xe bus<br /><br />
                **departure_time**: Thời gian khởi hành VD: 2025-06-01 08:00:00<br /><br />
                `,

  request: {
    params: GetVehicleScheduleSchema.shape.params,
    body: {
      content: {
        "application/json": {
          schema: UpdateVehicleScheduleSchema.shape.body,
        },
      },
    },
  },
  responses: createApiResponse(VehicleScheduleSchema, "Vehicle schedule updated successfully", 200),
});

vehicleScheduleRouter.put(
  "/:id",
  permission,
  validateRequest(UpdateVehicleScheduleSchema),
  vehicleScheduleController.updateSchedule
);

vehicleScheduleRegistry.registerPath({
  method: "delete",
  path: "/vehicle-schedules/{id}",
  tags: ["VehicleSchedule"],
  operationId: "deleteVehicleSchedule",
  summary: "Xóa lịch trình xe",
  description: `Xoá lịch trình xe theo id.<br />
                Xoá ticket thuộc schedule_id trong bảng tickets.<br />
                Xoá tất cả payments liên quan tới các ticket này`,
  request: { params: DeleteVehicleScheduleSchema.shape.params },
  responses: createApiResponse(GetVehicleScheduleSchema, "Vehicle schedule deleted successfully"),
});

vehicleScheduleRouter.delete(
  "/:id",
  permission,
  validateRequest(DeleteVehicleScheduleSchema),
  vehicleScheduleController.deleteSchedule
);