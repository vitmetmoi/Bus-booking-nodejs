// src/api/ticketOrder/ticketOrderModel.ts
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// Enum các trường có thể sắp xếp
const SortFieldsEnum = z.enum([
  "tickets.id",
  "tickets.status",
  "users.email",
  "bus_companies.company_name",
  "seats.seat_number",
]);

// Enum trạng thái payment (tương ứng cột status trong payments table)
export const PaymentStatusEnum = z.enum([
  "BOOKED",
  "CANCELED",
  "COMPLETED",
  "REFUNDED"
]);

// Lược đồ Payment theo bảng payments
export const PaymentSchema = z.object({
  id: z.number().openapi({ example: 1 }),
  ticketId: z.number().openapi({ example: 123, description: 'ID vé' }),
  status: PaymentStatusEnum.openapi({ example: 'BOOKED', description: 'Trạng thái thanh toán' }),
  orderAmount: z.number().openapi({ example: 200000, description: 'Số tiền thanh toán (VND)' }),
  paymentMethod: z.string().nullable().openapi({ example: 'ONLINE', description: 'Phương thức thanh toán' }),
  paymentReference: z.string().nullable().openapi({ example: 'VN12345XYZ', description: 'Mã tham chiếu thanh toán' }),
  paymentProviderId: z.number().nullable().openapi({ example: 2, description: 'ID nhà cung cấp thanh toán' }),
  notes: z.string().nullable().openapi({ example: '{"bank":"VCB"}', description: 'Ghi chú JSON hoặc text tự do' }),
  createdAt: z.string().datetime().openapi({ example: '2025-01-01T08:00:00Z', description: 'Ngày tạo' }),
  updatedAt: z.string().datetime().openapi({ example: '2025-01-01T09:00:00Z', description: 'Ngày cập nhật' })
});

// Schema phân trang và lọc
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).optional().openapi({ example: 1, description: "Trang hiện tại" }),
  limit: z.coerce.number().min(1).max(100).optional().openapi({ example: 10, description: "Số lượng mỗi trang" }),
  sortBy: z.string().optional().openapi({ example: "createdAt", description: "Trường sắp xếp" }),
  order: z.enum(["asc", "desc"]).optional().openapi({ example: "desc", description: "Thứ tự sắp xếp" }),
  search: z.string().optional().openapi({ example: "BOOKED", description: "Tìm kiếm nhanh theo trạng thái hoặc text" })
});

// OpenAPI request schemas for filtering
export const GetAllPaymentsSchema = z.object({
  query: paginationSchema,
}).openapi("GetAllPaymentsRequest");

export const GetPaymentsByCompanySchema = z.object({
  params: z.object({
    companyId: z.coerce.number().openapi({ example: 3, description: "ID của nhà xe" }),
  })
}).openapi("GetPaymentsByCompanyRequest");

export const GetPaymentsByStatusSchema = z.object({
  params: z.object({
    status: PaymentStatusEnum.openapi({ example: 'COMPLETED', description: 'Trạng thái thanh toán' }),
  })
}).openapi("GetPaymentsByStatusRequest");

export type Payment = z.infer<typeof PaymentSchema>;
