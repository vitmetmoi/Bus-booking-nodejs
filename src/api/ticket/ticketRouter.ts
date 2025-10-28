import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { BookTicketInputSchema, CancelTicketSchema, RouteSchema, BusSchema, SeatSchema, TicketSchema, TicketSearchSchema, TicketSearchQueryOnly, PaymentSchema } from "@/api/ticket/ticketModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { ticketController } from "./ticketController";
import { permission } from "@/common/middleware/auth/permission";
import { authenticate } from "@/common/middleware/auth/authMiddleware";

export const ticketRegistry = new OpenAPIRegistry();
export const ticketRouter: Router = express.Router();

// ticketRouter.use(authenticate);



// Đặt vé
ticketRegistry.registerPath({
  method: "post",
  path: "/tickets/booking",
  tags: ["Book tickets"],
  summary: "Đặt vé",
  description: `Đặt vé<br /> 
                - Chức năng này sẽ cho phép người dùng nhập id tuyến đường, id xe khách, id ghế mình chọn và phương thức thanh toán để đặt vé.<br />
                - Vé sẽ tự động được đặt cho người dùng hiện tại (dựa trên token xác thực)<br />
                - Chức năng này ta cần nhập body có dạng sau để đặt vé:<br />
                {<br />
                  "route_id": 1,<br />
                  "bus_id": 1,<br />
                  "seat_id": 1<br />
                  "paymentMethod": "ONLINE"<br />
                }<br />
                route_id: Id tuyến đường mình chọn<br />
                bus_Id: Id xe khách mình chọn<br />
                seat_id: Id ghế mình chọn<br />
                paymentMethod: Phương thức thanh toán ('ONLINE' hoặc 'CASH')<br />
                <b>Note: Nếu tuyến đường và xe không có trong lịch trình (schedule) thì sẽ có thông báo và vé sẽ không được đặt. Tương tự, xe phải thuộc tuyến đường mình chọn và ghế cũng phải thuộc chiếc xe đó.</b>`,
  request: {
    body: {
      content: {
        "application/json": {
          schema: BookTicketInputSchema, // Sử dụng schema đầu vào trực tiếp
        },
      },
    },
  },
  responses: createApiResponse(TicketSchema, "Success"),
});
ticketRouter.post("/booking", authenticate, ticketController.bookTicket);

// Hủy vé
ticketRegistry.registerPath({
  method: "put",
  path: "/tickets/cancel/{ticketId}",
  tags: ["Book tickets"],
  summary: "Hủy vé",
  description: `Hủy vé<br /> 
                - Chức năng này sẽ cho phép người dùng nhập id vé xe và lý do hủy, sau đó chuyển sang trạng thái Cancelled(đã hủy)<br />
                - Chức năng này ta cần nhập ID của vé xe mình chọn và lý do hủy trong body<br />
                <b>Note: Người dùng chỉ có thể hủy vé của chính mình. Hãy xem lịch sử đặt vé và tìm vé mình vừa đặt.</b>
                ticketId: Id vé xe<br />
                Body:<br />
                {<br />
                  "reason": "Lý do hủy vé (ví dụ: Hủy do thay đổi lịch trình)"<br />
                }<br />`,
  request: {
    params: CancelTicketSchema.shape.params,
    body: {
      content: {
        "application/json": {
          schema: CancelTicketSchema.shape.body,
        },
      },
    },
  },
  responses: createApiResponse(
    z.null().openapi({ description: "No content" }),
    "Success"
  ),
});
ticketRouter.put("/cancel/:ticketId", authenticate, validateRequest(CancelTicketSchema), ticketController.cancelTicket);


// Lịch sử đặt vé theo trạng thái
ticketRegistry.registerPath({
  method: "get",
  path: "/tickets/history_status/{status}",
  tags: ["Booking history"],
  summary: "Lịch sử đặt vé theo trạng thái",
  description: `Lịch sử đặt vé theo trạng thái<br /> 
                - Chức năng này sẽ cho phép người dùng lựa chọn trạng thái vé xe và hiển thị danh sách lịch sử đặt vé theo trạng thái đó<br />
                - Chức năng này ta cần nhập ID của xe khách mình chọn<br />
                status: Trạng thái vé (BOOKED, CANCELED)<br />
                <br />
                <b>id</b>: Id vé<br />
                <b>schedule_id</b>: Id lịch trình<br />
                <b>seat_id</b>: Id ghế đã lựa chọn<br />
                <b>departure_time</b>: Thời gian khởi hành<br />
                <b>arrival_time</b>: Thời gian đến nơi<br />
                <b>seat_type</b>: Loại ghế đã lựa chọn ('LUXURY', 'VIP', 'STANDARD')<br />
                <b>price</b>: Giá tiền vé<br />
                <b>status</b>: Trạng thái của vé ('BOOKED', 'CANCELED')<br />
                <b>created_at</b>: Thời gian tạo vé<br />
                <b>updated_at</b>: Thời gian cập nhật vé<br />`,
  request: {
    params: z.object({
      status: z.enum(["BOOKED", "CANCELED"]),
    }),
  },
  responses: createApiResponse(z.array(TicketSchema), "Success"),
});
ticketRouter.get("/history_status/:status", authenticate, permission, ticketController.getTicketsByStatus);

// Lịch sử đặt vé theo nhà xe
ticketRegistry.registerPath({
  method: "get",
  path: "/tickets/history_companyid/{companyId}",
  tags: ["Booking history"],
  summary: "Lịch sử đặt vé theo nhà xe",
  description: `Lịch sử đặt vé theo nhà xe<br /> 
                - Tương tự, chức năng này sẽ cho phép người dùng nhập id nhà xe mình chọn và hiển thị danh sách lịch sử đặt vé theo nhà xe đó<br />
                - Chức năng này ta cần nhập ID của xe khách mình chọn<br />
                companyId: Id nhà xe<br />
                <br />
                <b>id</b>: Id vé<br />
                <b>schedule_id</b>: Id lịch trình<br />
                <b>seat_id</b>: Id ghế đã lựa chọn<br />
                <b>departure_time</b>: Thời gian khởi hành<br />
                <b>arrival_time</b>: Thời gian đến nơi<br />
                <b>seat_type</b>: Loại ghế đã lựa chọn ('LUXURY', 'VIP', 'STANDARD')<br />
                <b>price</b>: Giá tiền vé<br />
                <b>status</b>: Trạng thái của vé ('BOOKED', 'CANCELED')<br />
                <b>created_at</b>: Thời gian tạo vé<br />
                <b>updated_at</b>: Thời gian cập nhật vé<br />`,
  request: {
    params: z.object({
      companyId: z.string().regex(/^\d+$/, "Company ID must be a numeric string"),
    }),
  },
  responses: createApiResponse(z.array(TicketSchema), "Success"),
});
ticketRouter.get("/history_companyid/:companyId", authenticate, permission, ticketController.getTicketsByCompany);

// Xem tất cả lịch sử đặt vé với pagination
ticketRegistry.registerPath({
  method: "get",
  path: "/tickets/history",
  tags: ["Booking history"],
  summary: "Xem tất cả lịch sử đặt vé với pagination",
  description: `Xem tất cả lịch sử đặt vé với pagination<br /> 
                - Chức năng này hiển thị danh sách lịch sử đặt vé với phân trang<br />
                - Admin có thể xem toàn bộ lịch sử đặt vé.<br />
                - Người dùng thông thường chỉ xem được lịch sử đặt vé của chính mình.<br />
                - Query parameters: page (số trang), limit (số lượng mỗi trang)<br />
                <br />
                <b>id</b>: Id vé<br />
                <b>schedule_id</b>: Id lịch trình<br />
                <b>seat_id</b>: Id ghế đã lựa chọn<br />
                <b>departure_time</b>: Thời gian khởi hành<br />
                <b>arrival_time</b>: Thời gian đến nơi<br />
                <b>seat_type</b>: Loại ghế đã lựa chọn ('LUXURY', 'VIP', 'STANDARD')<br />
                <b>price</b>: Giá tiền vé<br />
                <b>status</b>: Trạng thái của vé ('BOOKED', 'CANCELED')<br />
                <b>created_at</b>: Thời gian tạo vé<br />
                <b>updated_at</b>: Thời gian cập nhật vé<br />`,
  request: {
    query: z.object({
      page: z.string().optional().default("1"),
      limit: z.string().optional().default("10"),
    }),
  },
  responses: createApiResponse(z.object({
    tickets: z.array(TicketSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  }), "Success"),
});
ticketRouter.get("/history", authenticate, ticketController.getTicketHistory);


//  Tra cứu vé xe bằng mã vé với số điện thoại
ticketRegistry.registerPath({
  method: "get",
  path: "/tickets/search",
  tags: ["Ticket"],
  operationId: "searchTicket",
  summary: "Tra cứu vé xe bằng mã vé và số điện thoại",
  description: `Tra cứu vé xe bằng mã vé và số điện thoại<br /> 
                - Chức năng này sẽ cho phép tất cả mọi người có thể tra cứu vé xe bằng mã vé và số điện thoại của người đặt vé đó.<br />
                - Chức năng này ta cần nhập ID của vé xe và ID của user đã đặt vé đó<br />
                ticketId: Id vé xe<br />
                phoneNumber: Số điện thoại có người đặt mã vé đó.<br />
                - VD: Mã vé 1 cửa người dùng 1 đặt với số điện thoại là 0256568962<br />
                Note: Số điện thoại đăng ký cần có 10 số, mã vé phải được đặt bởi ngời dùng có số điện thoại đó.<br />
                <br />
                <b>id</b>: Id vé<br />
                <b>schedule_id</b>: Id lịch trình<br />
                <b>seat_id</b>: Id ghế đã lựa chọn<br />
                <b>departure_time</b>: Thời gian khởi hành<br />
                <b>arrival_time</b>: Thời gian đến nơi<br />
                <b>seat_type</b>: Loại ghế đã lựa chọn ('LUXURY', 'VIP', 'STANDARD')<br />
                <b>price</b>: Giá tiền vé<br />
                <b>status</b>: Trạng thái của vé ('BOOKED', 'CANCELED')<br />
                <b>created_at</b>: Thời gian tạo vé<br />
                <b>updated_at</b>: Thời gian cập nhật vé<br />`,
  request: {
    query: TicketSearchQueryOnly,
  },
  responses: createApiResponse(TicketSchema, "Successfully found the ticket", 200),
});

// Trong router:
ticketRouter.get("/search", validateRequest(TicketSearchSchema), ticketController.searchTicketByIdAndPhone);

// Lấy vé theo ID
ticketRegistry.registerPath({
  method: "get",
  path: "/tickets/{ticketId}",
  tags: ["Ticket"],
  operationId: "getTicketById",
  summary: "Lấy thông tin vé theo ID",
  description: `Lấy thông tin vé theo ID<br /> 
                - Chức năng này sẽ cho phép lấy thông tin chi tiết của vé theo ID<br />
                - Chỉ trả về vé có trạng thái BOOKED<br />
                - Bao gồm thông tin về lịch trình, tuyến đường, xe, ghế, và bến xe<br />
                ticketId: ID của vé xe<br />
                <br />
                <b>id</b>: Id vé<br />
                <b>seat_id</b>: Id ghế đã lựa chọn<br />
                <b>schedule_id</b>: Id lịch trình<br />
                <b>total_price</b>: Tổng giá vé<br />
                <b>user_id</b>: Id người dùng<br />
                <b>status</b>: Trạng thái của vé (chỉ trả về BOOKED)<br />
                <b>departure_time</b>: Thời gian khởi hành<br />
                <b>arrival_time</b>: Thời gian đến nơi<br />
                <b>bus_name</b>: Tên xe<br />
                <b>company_name</b>: Tên nhà xe<br />
                <b>seat_number</b>: Số ghế<br />
                <b>seat_type</b>: Loại ghế<br />
                <b>departure_station_name</b>: Tên bến đi<br />
                <b>arrival_station_name</b>: Tên bến đến<br />`,
  request: {
    params: z.object({
      ticketId: z.string().regex(/^\d+$/, "Ticket ID must be a numeric string"),
    }),
  },
  responses: createApiResponse(z.any(), "Successfully retrieved ticket information", 200),
});

ticketRouter.get("/:ticketId", ticketController.getTicketById);

// Lấy tất cả vé của user theo ID
ticketRegistry.registerPath({
  method: "get",
  path: "/tickets/user/{userId}",
  tags: ["Ticket"],
  operationId: "getTicketsByUserId",
  summary: "Lấy tất cả vé của user theo ID",
  description: `Lấy tất cả vé của user theo ID<br /> 
                - Chức năng này sẽ cho phép lấy tất cả vé của một user cụ thể<br />
                - Chỉ trả về vé có trạng thái BOOKED<br />
                - Bao gồm thông tin chi tiết về lịch trình, tuyến đường, xe, ghế, và bến xe<br />
                userId: ID của user<br />
                <br />
                Trả về danh sách vé với thông tin:<br />
                <b>id</b>: Id vé<br />
                <b>seat_id</b>: Id ghế đã lựa chọn<br />
                <b>schedule_id</b>: Id lịch trình<br />
                <b>total_price</b>: Tổng giá vé<br />
                <b>user_id</b>: Id người dùng<br />
                <b>status</b>: Trạng thái của vé (chỉ trả về BOOKED)<br />
                <b>departure_time</b>: Thời gian khởi hành<br />
                <b>arrival_time</b>: Thời gian đến nơi<br />
                <b>bus_name</b>: Tên xe<br />
                <b>company_name</b>: Tên nhà xe<br />
                <b>seat_number</b>: Số ghế<br />
                <b>seat_type</b>: Loại ghế<br />
                <b>departure_station_name</b>: Tên bến đi<br />
                <b>arrival_station_name</b>: Tên bến đến<br />`,
  request: {
    params: z.object({
      userId: z.string().regex(/^\d+$/, "User ID must be a numeric string"),
    }),
  },
  responses: createApiResponse(z.array(z.any()), "Successfully retrieved user tickets", 200),
});

ticketRouter.get("/user/:userId", authenticate, ticketController.getTicketsByUserId);

// Lấy tất cả vé của user hiện tại
ticketRegistry.registerPath({
  method: "get",
  path: "/tickets/user/me",
  tags: ["Ticket"],
  operationId: "getCurrentUserTickets",
  summary: "Lấy tất cả vé của user hiện tại",
  description: `Lấy tất cả vé của user hiện tại<br /> 
                - Chức năng này sẽ cho phép lấy tất cả vé của user đang đăng nhập<br />
                - Chỉ trả về vé có trạng thái BOOKED<br />
                - Yêu cầu xác thực<br />
                - Bao gồm thông tin chi tiết về lịch trình, tuyến đường, xe, ghế, và bến xe<br />
                <br />
                Trả về danh sách vé với thông tin:<br />
                <b>id</b>: Id vé<br />
                <b>seat_id</b>: Id ghế đã lựa chọn<br />
                <b>schedule_id</b>: Id lịch trình<br />
                <b>total_price</b>: Tổng giá vé<br />
                <b>user_id</b>: Id người dùng<br />
                <b>status</b>: Trạng thái của vé (chỉ trả về BOOKED)<br />
                <b>departure_time</b>: Thời gian khởi hành<br />
                <b>arrival_time</b>: Thời gian đến nơi<br />
                <b>bus_name</b>: Tên xe<br />
                <b>company_name</b>: Tên nhà xe<br />
                <b>seat_number</b>: Số ghế<br />
                <b>seat_type</b>: Loại ghế<br />
                <b>departure_station_name</b>: Tên bến đi<br />
                <b>arrival_station_name</b>: Tên bến đến<br />`,
  security: [{ bearerAuth: [] }],
  responses: createApiResponse(z.array(z.any()), "Successfully retrieved current user tickets", 200),
});

ticketRouter.get("/user/me", authenticate, ticketController.getCurrentUserTickets);

// Webhook SePay: nhận thông báo chuyển khoản QR
ticketRegistry.registerPath({
  method: "post",
  path: "/tickets/payment/sepay/webhook",
  tags: ["Payment"],
  summary: "Webhook từ SePay (QR chuyển khoản)",
  description: `Webhook SePay gửi về khi người dùng quét QR và chuyển tiền thành công.<br />
                Body (ví dụ):<br />
                {<br />
                "id": 92704,<br />
                "gateway": "Vietcombank",<br />
                "transactionDate": "2024-07-25 14:02:37",<br />
                "accountNumber": "0123499999",<br />
                "code": null,<br />
                "content": "chuyen tien mua iphone",<br />
                "transferType": "in",<br />
                "transferAmount": 2277000,<br />
                "accumulated": 19077000,<br />
                "subAccount": null,<br />
                "referenceCode": "MBVCB.3278907687",<br />
                "description": "DH 2"<br />
                }<br />
                Ghi chú: ticketId sẽ được trích xuất từ trường description (VD: "DH 2" -> ticketId = 2).`,
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            id: z.number(),
            gateway: z.string(),
            transactionDate: z.string(),
            accountNumber: z.string(),
            code: z.any().nullable(),
            content: z.string(),
            transferType: z.string(),
            transferAmount: z.number(),
            accumulated: z.number(),
            subAccount: z.any().nullable(),
            referenceCode: z.string(),
            description: z.string(),
          }),
        },
      },
    },
  },
  responses: createApiResponse(z.any(), "Success"),
});
ticketRouter.post("/payment/sepay/webhook", ticketController.handleSePayWebhook);

// Xóa thông tin hủy vé
ticketRegistry.registerPath({
  method: "put",
  path: "/tickets/cancel_ticket/delete/{ticketId}",
  tags: ["Ticket"],
  summary: "Cập nhật trạng thái vé từ CANCELED thành BOOKED cho admin",
  description: `Cập nhật trạng thái vé từ CANCELED thành BOOKED cho admin<br /> 
                - Chức năng này sẽ cho phép quản trị viên nhập id vé xe đã hủy và chuyển trạng thái của vé đó từ CANCELED về BOOKED, kèm theo lý do khôi phục.<br />
                - Chức năng này ta cần nhập params với ticketId và body có dạng sau:<br />
                Params: {ticketId: "3"}<br />
                Body:<br />
                {<br />
                  "reason": "Khôi phục do lỗi hủy vé"<br />
                }<br />
                ticketId: Id vé xe<br />
                reason: Lý do khôi phục vé (bắt buộc)<br />`,
  request: {
    params: z.object({
      ticketId: z.string().regex(/^\d+$/, "Ticket ID must be a numeric string"),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            reason: z.string().min(1, "Reason is required"),
          }),
        },
      },
    },
  },
  responses: createApiResponse(z.any(), "Success"),
});
ticketRouter.put("/cancel_ticket/delete/:ticketId", authenticate, permission, ticketController.deleteCancelledTicket);

// // Chọn phương thức thanh toán
// ticketRegistry.registerPath({
//   method: "post",
//   path: "tickets/payment/{ticketId}",
//   tags: ["Ticket"],
//   summary: "Chọn phương thức thanh toán",
//   description: `Chọn phương thức thanh toán<br />
//                 - Chức năng này sẽ cho phép nhập <br />
//                 - Chức năng này ta cần nhập body theo dạng sau: <br />
//                 {<br />
//                   "paymentMethod": "CASH", <br />
//                   "userId": 1, <br />
//                   "amount": 50 <br />
//                 }<br />
//                 "paymentMethod": Phương thức thanh toán ('CASH', 'ONLINE')<br />
//                 "userId": Id người dùng<br />
//                 "amount": Tổng số tiền thanh toán<br />`,
//   request: {
//     params: z.object({
//       ticketId: z.string().regex(/^\d+$/, "Ticket ID must be a numeric string"),
//     }),
//     body: {
//       content: {
//         "application/json": {
//           schema: z.object({
//             paymentMethod: z.enum(["ONLINE", "CASH"]),
//             userId: z.number(),
//             amount: z.number().positive(),
//           }),
//         },
//       },
//     },
//   },
//   responses: createApiResponse(PaymentSchema, "Success"),
// });
// ticketRouter.post("/payment/:ticketId", authenticate, ticketController.selectPaymentMethod);

// Kiểm tra trạng thái thanh toán
ticketRegistry.registerPath({
  method: "get",
  path: "/tickets/payment/status/{ticketId}",
  tags: ["Payment"],
  summary: "Kiểm tra trạng thái thanh toán",
  description: `Kiểm tra trạng thái thanh toán<br />
                - Chức năng này sẽ cho phép kiểm tra trạng thái thanh toán của vé<br />
                - Trả về status và payment_status<br />
                ticketId: Id vé xe<br />`,
  request: {
    params: z.object({
      ticketId: z.string().regex(/^\d+$/, "Ticket ID must be a numeric string"),
    }),
  },
  responses: createApiResponse(z.object({
    status: z.string(),
    payment_status: z.string(),
  }), "Success"),
});
ticketRouter.get("/payment/status/:ticketId", ticketController.checkPaymentStatus);