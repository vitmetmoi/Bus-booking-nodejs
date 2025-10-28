import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { TicketOrderSchema, GetAllTicketOrdersSchema, GetTicketOrdersByCompanySchema, GetTicketOrdersByStatusSchema } from "@/api/ticketOrder/ticketOrderModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { ticketOrderController } from "./ticketOrderController";

import { authenticate } from "@/common/middleware/auth/authMiddleware";
import { permission } from "@/common/middleware/auth/permission";

export const ticketOrderRegistry = new OpenAPIRegistry();
export const ticketOrderRouter: Router = express.Router();

ticketOrderRouter.use(authenticate);

// Đăng ký schema của TicketOrder cho OpenAPI
ticketOrderRegistry.register("TicketOrder", TicketOrderSchema);

// 1. Lấy tất cả đơn đặt vé
// http://localhost:3000/ticket-orders?page=1&limit=10&sortBy=tickets.created_at&order=asc&search=John
ticketOrderRegistry.registerPath({
  method: "get",
  path: "/ticket-orders",
  tags: ["Ticket order"],
  summary: "Hiển thị tất cả đơn đặt vé của tất cả người dùng",
  description: `<strong>Phân trang</strong><br />
                <strong>Tìm kiếm theo:</strong> email của người dùng<br />
                <strong>Sắp xếp theo:</strong> ticketId, tickets.status, users.email, bus_companies.company_name, seats.seat_number<br />`,
  request: { query: GetAllTicketOrdersSchema.shape.query },
  responses: createApiResponse(z.array(TicketOrderSchema), "Success"),
});

ticketOrderRouter.get("/", permission, validateRequest(GetAllTicketOrdersSchema), ticketOrderController.getTicketOrders);

// 2. Lấy đơn đặt vé theo nhà xe
// GET /ticket-orders/company/1
ticketOrderRegistry.registerPath({
  method: "get",
  path: "/ticket-orders/company/{companyId}",
  tags: ["Ticket order"],
  summary: "Hiển thị tất cả đơn đặt hàng theo nhà xe",
  request: { params: GetTicketOrdersByCompanySchema.shape.params },
  responses: createApiResponse(z.array(TicketOrderSchema), "Success"),
});

ticketOrderRouter.get("/company/:companyId", permission, validateRequest(GetTicketOrdersByCompanySchema), ticketOrderController.getTicketOrdersByCompany);

// 3. Lấy đơn đặt vé theo trạng thái
// http://localhost:3000/ticket-orders/status/BOOKED
// http://localhost:3000/ticket-orders/status/CANCELLED
ticketOrderRegistry.registerPath({
  method: "get",
  path: "/ticket-orders/status/{status}",
  tags: ["Ticket order"],
  summary: "Hiển thị tất cả đơn hàng theo trạng thái của vé.",
  description: `<strong>Trạng thái:</strong> BOOKED, CANCELLED<br />`,
  request: { params: GetTicketOrdersByStatusSchema.shape.params },
  responses: createApiResponse(z.array(TicketOrderSchema), "Success"),
});

ticketOrderRouter.get("/status/:status", permission, validateRequest(GetTicketOrdersByStatusSchema), ticketOrderController.getTicketOrdersByStatus);
