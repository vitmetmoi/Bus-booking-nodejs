import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { GetSeatSchema, SeatSchema } from "@/api/seat/seatModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { seatController } from "./seatController";

import { permission } from "@/common/middleware/auth/permission";
import { authenticate } from "@/common/middleware/auth/authMiddleware";

export const seatRegistry = new OpenAPIRegistry();
export const seatRoter: Router = express.Router();

seatRoter.use(authenticate);

seatRegistry.register("User", SeatSchema);

seatRegistry.registerPath({
	method: "get",
	path: "/seats",
	tags: ["Seat"],
	summary: "Hiển thị danh sách tất cả chỗ ngồi",
	description: `
Hiển thị danh sách tất cả chỗ ngồi

  - **id**: ID của ghế

  - **bus_id**: ID của xe chứa ghế này

  - **seat_number**: Số ghế 

  - **seat_type**: Loại ghế (ví dụ: "VIP", "Standard")

  - **status**: Trạng thái ghế (ví dụ: "AVAILABLE", "BOOKED")

  - **price_for_type_seat**: Giá vé theo loại ghế

  - **created_at**: Thời gian tạo bản ghi (ISO 8601)

  - **updated_at**: Thời gian cập nhật bản ghi (ISO 8601)
`,
	responses: createApiResponse(z.array(SeatSchema), "Success"),
});

seatRoter.get("/", permission, seatController.getSeats);

seatRegistry.registerPath({
	method: "get",
	path: "/seats/{id}",
	tags: ["Seat"],
	summary: "Hiển thị danh sách ghế theo xe",
	description: `
Hiển thị danh sách ghế theo xe

  - **id**: ID của ghế 

  - **bus_id**: ID của xe chứa ghế này 

  - **seat_number**: Số ghế 

  - **seat_type**: Loại ghế (ví dụ: "VIP")

  - **status**: Trạng thái ghế (ví dụ: "AVAILABLE")

  - **price_for_type_seat**: Giá vé tương ứng với loại ghế 

  - **created_at**: Thời gian tạo bản ghi 

  - **updated_at**: Thời gian cập nhật bản ghi 

  - **bus_name**: Tên xe 

  - **bus_license_plate**: Biển số xe
`,
	request: { params: GetSeatSchema.shape.params },
	responses: createApiResponse(SeatSchema, "Success"),
});

seatRoter.get("/:id", permission, validateRequest(GetSeatSchema), seatController.getSeat);

seatRegistry.registerPath({
	method: "delete",
	path: "/seats/{id}",
	tags: ["Seat"],
	summary: "Xóa ghế theo xe",
	description: "Xóa ghế theo ID của xe",
	request: { params: GetSeatSchema.shape.params },
	responses: createApiResponse(SeatSchema, "Success"),
});

seatRoter.delete("/:id", permission, validateRequest(GetSeatSchema), seatController.deleteSeat);



