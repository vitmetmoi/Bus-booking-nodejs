import type { Request, RequestHandler, Response } from "express";
import { ticketService } from "@/api/ticket/ticketService";
import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";

// Định nghĩa interface cho thông tin người dùng trong req.user
interface JwtPayload {
  id: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

class TicketController {
  // Lựa chọn tuyến đường đi
  public getRoutes: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await ticketService.getRoutes();
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // Webhook nhận từ SePay
  public handleSePayWebhook: RequestHandler = async (req: Request, res: Response) => {
    const payload = req.body;
    const serviceResponse = await ticketService.processSePayWebhook(payload);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // Lựa chọn xe đi
  public getBusesByRoute: RequestHandler = async (req: Request, res: Response) => {
    const routeId = Number.parseInt(req.params.routeId as string, 10);
    const serviceResponse = await ticketService.getBusesByRoute(routeId);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // Lựa chọn ghế đi
  public getAvailableSeats: RequestHandler = async (req: Request, res: Response) => {
    const busId = Number.parseInt(req.params.busId as string, 10);
    const serviceResponse = await ticketService.getAvailableSeats(busId);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // Đặt vé
  public bookTicket: RequestHandler = async (req: Request, res: Response) => {
    // Lấy thông tin người dùng hiện tại từ req.user
    const currentUser = req.user as JwtPayload;
    if (!currentUser || !currentUser.id) {
      res.status(StatusCodes.UNAUTHORIZED).send(
        ServiceResponse.failure("Chưa đăng nhập", null, StatusCodes.UNAUTHORIZED)
      );
      return;
    }
    const serviceResponse = await ticketService.bookTicket(req.body, {
      id: currentUser.id,
      email: currentUser.email,
      role: currentUser.role,
    });
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // Hủy vé
  public cancelTicket: RequestHandler = async (req: Request, res: Response) => {
    const ticketId = Number.parseInt(req.params.ticketId as string, 10);
    const { reason } = req.body;
    // Lấy thông tin người dùng hiện tại từ req.user
    const currentUser = req.user as JwtPayload;
    if (!currentUser || !currentUser.id) {
      res.status(StatusCodes.UNAUTHORIZED).send(
        ServiceResponse.failure("Chưa đăng nhập", null, StatusCodes.UNAUTHORIZED)
      );
      return;
    }
    const serviceResponse = await ticketService.cancelTicket(ticketId, reason, {
      id: currentUser.id,
      email: currentUser.email,
      role: currentUser.role,
    });
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // Thêm mới thông tin hủy vé xe dành cho admin
  public createCancelTicket: RequestHandler = async (req: Request, res: Response) => {
    const ticketId = Number.parseInt(req.params.ticketId as string, 10);
    const { reason } = req.body;
    if (isNaN(ticketId)) {
      res.status(StatusCodes.BAD_REQUEST).send(
        ServiceResponse.failure("Invalid ticketId. Must be a number", null, StatusCodes.BAD_REQUEST)
      );
      return;
    }
    const serviceResponse = await ticketService.createCancelTicket(ticketId, reason);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // Hiển thị lịch sử đặt vé theo trạng thái
  public getTicketsByStatus: RequestHandler = async (req: Request, res: Response) => {
    const { status } = req.params as { status?: string };
    if (!status) {
      res.status(StatusCodes.BAD_REQUEST).send(
        ServiceResponse.failure("Status is required", null, StatusCodes.BAD_REQUEST)
      );
      return;
    }
    console.log("Received status:", status);
    if (status !== "BOOKED" && status !== "CANCELED") {
      res.status(StatusCodes.BAD_REQUEST).send(
        ServiceResponse.failure("Invalid status. Must be 'BOOKED' or 'CANCELLED'", null, StatusCodes.BAD_REQUEST)
      );
      return;
    }
    const serviceResponse = await ticketService.getTicketsByStatus(status as "BOOKED" | "CANCELED");
    res.status(serviceResponse.statusCode).send(serviceResponse);
  }

  // Hiển thị lịch sử đặt vé theo nhà xe
  public getTicketsByCompany: RequestHandler = async (req, res) => {
    const { companyId } = req.params;
    const serviceResponse = await ticketService.getTicketsByCompany(Number(companyId));
    res.status(serviceResponse.statusCode).send(serviceResponse);
  }

  // Xem tất cả lịch sử đặt vé với pagination
  public getTicketHistory: RequestHandler = async (req, res) => {
    try {
      const currentUser = req.user as JwtPayload;
      if (!currentUser || !currentUser.id) {
        res.status(StatusCodes.UNAUTHORIZED).send(
          ServiceResponse.failure("Chưa đăng nhập", null, StatusCodes.UNAUTHORIZED)
        );
        return;
      }

      // Extract pagination parameters from query
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string || "";
      const search = req.query.search as string || "";

      const serviceResponse = await ticketService.getTicketHistory({
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role,
      }, page, limit, status, search);

      res.status(serviceResponse.statusCode).send(serviceResponse);
    } catch (error) {
      console.error('Error in getTicketHistory:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(
        ServiceResponse.failure("Lỗi server khi lấy lịch sử vé", null, StatusCodes.INTERNAL_SERVER_ERROR)
      );
    }
  };

  // // Chọn phương thức thanh toán
  // public selectPaymentMethod: RequestHandler = async (req: Request, res: Response) => {
  //   const ticketId = Number.parseInt(req.params.ticketId as string, 10);
  //   const { paymentMethod, userId, amount } = req.body;

  //   if (isNaN(ticketId)) {
  //     res.status(StatusCodes.BAD_REQUEST).send(
  //       ServiceResponse.failure("Invalid ticketId. Must be a number", null, StatusCodes.BAD_REQUEST)
  //     );
  //     return;
  //   }

  //   if (!paymentMethod || !["ONLINE", "CASH"].includes(paymentMethod)) {
  //     res.status(StatusCodes.BAD_REQUEST).send(
  //       ServiceResponse.failure("Invalid payment method. Must be ONLINE or CASH", null, StatusCodes.BAD_REQUEST)
  //     );
  //     return;
  //   }

  //   if (isNaN(userId)) {
  //     res.status(StatusCodes.BAD_REQUEST).send(
  //       ServiceResponse.failure("Invalid userId. Must be a number", null, StatusCodes.BAD_REQUEST)
  //     );
  //     return;
  //   }

  //   if (isNaN(amount) || amount <= 0) {
  //     res.status(StatusCodes.BAD_REQUEST).send(
  //       ServiceResponse.failure("Invalid amount. Must be a positive number", null, StatusCodes.BAD_REQUEST)
  //     );
  //     return;
  //   }

  //   const serviceResponse = await ticketService.selectPaymentMethod(ticketId, paymentMethod, userId, amount);
  //   res.status(serviceResponse.statusCode).send(serviceResponse);
  // };

  // Xóa thông tin hủy vé xe

  public deleteCancelledTicket: RequestHandler = async (req: Request, res: Response) => {
    const ticketId = Number.parseInt(req.params.ticketId as string, 10);
    const { reason } = req.body;
    if (isNaN(ticketId)) {
      res.status(StatusCodes.BAD_REQUEST).send(
        ServiceResponse.failure("Invalid ticketId. Must be a number", null, StatusCodes.BAD_REQUEST)
      );
      return;
    }

    const serviceResponse = await ticketService.deleteCancelledTicket(ticketId, reason);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // Tra cứu vé xe bằng mã vé với số điện thoại
  public searchTicketByIdAndPhone: RequestHandler = async (req: Request, res: Response) => {
    const { ticketId, phoneNumber } = req.query;

    if (!ticketId || !phoneNumber) {
      res.status(StatusCodes.BAD_REQUEST).send(
        ServiceResponse.failure("Ticket code and phone number are required.", null, StatusCodes.BAD_REQUEST)
      );
      return;
    }

    const ticketIdNum = Number.parseInt(ticketId as string, 10);
    if (isNaN(ticketIdNum)) {
      res.status(StatusCodes.BAD_REQUEST).send(
        ServiceResponse.failure("The ticket code must be a number.", null, StatusCodes.BAD_REQUEST)
      );
      return;
    }

    const phoneRegex = /^0\d{9}$/; // Định dạng số điện thoại Việt Nam: bắt đầu bằng 0, 10 chữ số
    if (!phoneRegex.test(phoneNumber as string)) {
      res.status(StatusCodes.BAD_REQUEST).send(
        ServiceResponse.failure("The phone number is invalid.", null, StatusCodes.BAD_REQUEST)
      );
      return;
    }

    const serviceResponse = await ticketService.searchTicketByIdAndPhone(ticketIdNum, phoneNumber as string);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // Lấy vé theo ID
  public getTicketById: RequestHandler = async (req: Request, res: Response) => {
    const { ticketId } = req.params;

    if (!ticketId) {
      res.status(StatusCodes.BAD_REQUEST).send(
        ServiceResponse.failure("Ticket ID is required.", null, StatusCodes.BAD_REQUEST)
      );
      return;
    }

    const ticketIdNum = Number.parseInt(ticketId, 10);
    if (isNaN(ticketIdNum)) {
      res.status(StatusCodes.BAD_REQUEST).send(
        ServiceResponse.failure("The ticket ID must be a number.", null, StatusCodes.BAD_REQUEST)
      );
      return;
    }

    const serviceResponse = await ticketService.getTicketById(ticketIdNum);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // Lấy tất cả vé của user theo ID
  public getTicketsByUserId: RequestHandler = async (req: Request, res: Response) => {

    // Lấy thông tin người dùng hiện tại từ req.user
    const currentUser = req.user as JwtPayload;
    console.log("current user3", currentUser)
    if (!currentUser || !currentUser.id) {
      res.status(StatusCodes.UNAUTHORIZED).send(
        ServiceResponse.failure("Chưa đăng nhập", null, StatusCodes.UNAUTHORIZED)
      );
      return;
    }

    const serviceResponse = await ticketService.getTicketsByUserId(currentUser.id);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // Lấy tất cả vé của user hiện tại
  public getCurrentUserTickets: RequestHandler = async (req: Request, res: Response) => {
    try {
      const currentUser = req.user as JwtPayload;

      if (!currentUser || !currentUser.id) {
        res.status(StatusCodes.UNAUTHORIZED).send(
          ServiceResponse.failure("Chưa đăng nhập", null, StatusCodes.UNAUTHORIZED)
        );
        return;
      }

      const serviceResponse = await ticketService.getCurrentUserTickets(currentUser.id);
      res.status(serviceResponse.statusCode).send(serviceResponse);
    } catch (error) {
      console.error('Error in getCurrentUserTickets:', error);

    }

  };

  // Hiển thị danh sách thông tin hủy theo vé xe
  public getCancelledTickets: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await ticketService.getCancelledTickets();
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // Kiểm tra trạng thái thanh toán
  public checkPaymentStatus: RequestHandler = async (req: Request, res: Response) => {
    const ticketId = Number.parseInt(req.params.ticketId as string, 10);
    if (isNaN(ticketId)) {
      res.status(StatusCodes.BAD_REQUEST).send(
        ServiceResponse.failure("Invalid ticketId. Must be a number", null, StatusCodes.BAD_REQUEST)
      );
      return;
    }
    const serviceResponse = await ticketService.checkPaymentStatus(ticketId);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

}

export const ticketController = new TicketController();
