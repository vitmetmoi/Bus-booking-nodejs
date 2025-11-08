import { StatusCodes } from "http-status-codes";
import { BookTicketInputSchema, Route, Bus, Seat, Schedule, Ticket, TicketSchema, RouteSchema, BusSchema, SeatSchema, Payment, PaymentSchema } from "@/api/ticket/ticketModel";
import { TicketRepository } from "@/api/ticket/ticketRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { db } from "@/common/config/database";
import { embed } from "@/common/utils/embedding";

// Định nghĩa interface cho thông tin người dùng hiện tại
interface CurrentUser {
  id: number;
  email: string;
  role: string; // Giả định có thuộc tính isAdmin để kiểm tra quyền admin
}

export class TicketService {
  private ticketRepository: TicketRepository;

  constructor(repository: TicketRepository = new TicketRepository()) {
    this.ticketRepository = repository;
  }

  // Lựa chọn tuyến đường đi
  async getRoutes(): Promise<ServiceResponse<Route[] | null>> {
    try {
      const routes = await this.ticketRepository.getRoutes();
      if (!Array.isArray(routes)) {
        logger.warn("Invalid data format returned from repository");
        return ServiceResponse.success<Route[]>("No routes found", []);
      }

      const transformedRoutes = routes.map(route => ({
        ...route,
        created_at: new Date(route.created_at),
        updated_at: new Date(route.updated_at),
      }));

      const validatedRoutes = RouteSchema.array().parse(transformedRoutes);
      return ServiceResponse.success<Route[]>("Routes retrieved", validatedRoutes);
    } catch (ex) {
      logger.error(`Error fetching routes: ${(ex as Error).message}`);
      return ServiceResponse.failure("Error fetching routes", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Xử lý webhook từ SePay
  async processSePayWebhook(payload: any): Promise<ServiceResponse<any>> {
    try {

      // Lấy ticketId từ description, ví dụ: "DH 2" => 2
      const description: string | undefined = payload?.description || payload?.content;
      if (!description) {
        return ServiceResponse.failure("Missing description in webhook payload", null, StatusCodes.BAD_REQUEST);
      }

      const match = description.match(/\bDH\s*(\d+)\b/i) || description.match(/\b(\d+)\b/);
      const ticketId = match ? Number.parseInt(match[1], 10) : NaN;
      if (!ticketId || Number.isNaN(ticketId)) {
        return ServiceResponse.failure("Cannot extract ticket id from description", null, StatusCodes.BAD_REQUEST);
      }

      const transferAmount: number = Number(payload?.transferAmount);
      if (!transferAmount || Number.isNaN(transferAmount) || transferAmount <= 0) {
        return ServiceResponse.failure("Invalid transfer amount", null, StatusCodes.BAD_REQUEST);
      }

      // Lấy vé hiện có
      const ticket = await this.ticketRepository.getTicketById(ticketId);
      if (!ticket) {
        return ServiceResponse.failure("Ticket not found", null, StatusCodes.NOT_FOUND);
      }

      // if (ticket.status !== "PENDING" && ticket.status !== "pending") {
      //   return ServiceResponse.failure("Ticket is not in PENDING status", null, StatusCodes.BAD_REQUEST);
      // }

      // Lấy số tiền cần thanh toán từ schedules + có thể cộng phụ phí theo ghế nếu có
      // Lưu ý sự không thống nhất tên cột giữa migrations đầu (schedules.price) và model hiện tại
      console.log("ticket", ticket);
      const schedule = await db("schedules").where({ id: ticket.schedule_id }).first();
      if (!schedule) {
        return ServiceResponse.failure("Schedule not found for ticket", null, StatusCodes.NOT_FOUND);
      }
      const basePrice = Number(ticket.total_price);

      const seat = await db("seats").where({ id: ticket.seat_id }).first();
      const extra = seat?.price_for_type_seat ? Number(seat.price_for_type_seat) : 0;
      // const requiredAmount = basePrice + extra;
      const requiredAmount = 2000;

      if (transferAmount !== requiredAmount) {
        return ServiceResponse.failure("Transfer amount does not match ticket amount", null, StatusCodes.BAD_REQUEST);
      }

      // Đúng số tiền: cập nhật ticket -> BOOKED, cập nhật seat, tạo bản ghi payments
      await db("tickets")
        .where({ id: ticketId })
        .update({ status: "BOOKED", updated_at: new Date() });

      await this.ticketRepository.updateSeatStatus(ticket.seat_id, "BOOKED");
      await db("seats").where({ id: ticket.seat_id }).update({ status: "BOOKED" });
      // Lưu đơn hàng vào payments
      const order = await db("payments")
        .insert({
          ticket_id: ticketId,
          status: "BOOKED",
          order_amount: requiredAmount,
          payment_method: "ONLINE",
          payment_reference: String(payload?.referenceCode || payload?.id || ""),
          payment_provider_id: null,
          notes: JSON.stringify({
            gateway: payload?.gateway,
            transactionDate: payload?.transactionDate,
            accountNumber: payload?.accountNumber,
            code: payload?.code,
            content: payload?.content,
            transferType: payload?.transferType,
            accumulated: payload?.accumulated,
            subAccount: payload?.subAccount,
          }),
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*");

      return ServiceResponse.success("Webhook handled", Array.isArray(order) ? order[0] : order);
    } catch (ex) {
      console.log(ex);
      logger.error(`Error processing SePay webhook: ${(ex as Error).message}`);
      return ServiceResponse.failure("Error processing webhook", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Lựa chọn xe đi
  async getBusesByRoute(routeId: number): Promise<ServiceResponse<Bus[] | null>> {
    try {
      const cars = await this.ticketRepository.getBusesByRoute(routeId);
      if (!Array.isArray(cars)) {
        logger.warn("Invalid data format returned from repository");
        return ServiceResponse.success<Bus[]>("No cars found", []);
      }

      const transformedBuses = cars.map(bus => ({
        ...bus,
        created_it: new Date(bus.created_at),
        updated_it: new Date(bus.updated_at),
      }));

      const validatedBuses = BusSchema.array().parse(transformedBuses);
      return ServiceResponse.success<Bus[]>("Buses retrieved", validatedBuses);
    } catch (ex) {
      logger.error(`Error fetching cars: ${(ex as Error).message}`);
      return ServiceResponse.failure("Error fetching cars", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Lựa chọn ghế đi
  async getAvailableSeats(busId: number): Promise<ServiceResponse<Seat[] | null>> {
    try {
      const seats = await this.ticketRepository.getAvailableSeats(busId);
      if (!Array.isArray(seats)) {
        logger.warn("Invalid data format returned from repository");
        return ServiceResponse.success<Seat[]>("No seats found", []);
      }

      const transformedSeats = seats.map(seat => ({
        ...seat,
        created_at: new Date(seat.created_at),
        updated_at: new Date(seat.updated_at),
      }));

      const validatedSeats = SeatSchema.array().parse(transformedSeats);
      return ServiceResponse.success<Seat[]>("Seats retrieved", validatedSeats);
    } catch (ex) {
      logger.error(`Error fetching seats: ${(ex as Error).message}`);
      return ServiceResponse.failure("Error fetching seats", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Đặt vé
  async bookTicket(input: unknown, currentUser: CurrentUser): Promise<ServiceResponse<Ticket | null>> {
    try {
      const parsedInput = BookTicketInputSchema.parse(input);
      const { schedule_id, seat_id, payment_method } = parsedInput;

      // Kiểm tra ghế và xe
      const seat = await db("seats").where({ id: seat_id, status: "AVAILABLE" }).first();
      if (!seat) {
        return ServiceResponse.failure("Seat not available", null, StatusCodes.BAD_REQUEST);
      }

      const existingTicket = await db("tickets")
        .where({ seat_id: seat_id, schedule_id: schedule_id })
        .andWhere("status", "BOOKED")
        .first();
      if (existingTicket) {
        return ServiceResponse.failure("Seat is already booked", null, StatusCodes.BAD_REQUEST);
      }


      // Tạo ticket
      console.log('currentUser', currentUser);
      // const embedding = await embed(`ticket ${seat_id} for schedule ${schedule_id} user ${currentUser.id}`) as number[];
      const ticketData = {
        user_id: currentUser.id || 1,
        seat_id: seat_id,
        total_price: seat.price_for_type_seat || 0,
        schedule_id: schedule_id,
        // ticket_number: `TK${Date.now()}${Math.floor(Math.random() * 1000)}`,
        // embedding: JSON.stringify(embedding),
        created_at: new Date(),
        updated_at: new Date(),
      };

      const [ticketId] = await db("tickets").insert(ticketData);
      const ticket = {
        id: ticketId,
        status: "PENDING" as const,
        ...ticketData,
        // embedding: embedding // Use the original array for the response
      };




      // Tạo bản ghi thanh toán trong bảng payments
      // const paymentData = {
      //   user_id: currentUser.id,
      //   ticket_id: ticketId,
      //   payment_method: payment_method,
      //   amount: seat.price_for_type_seat,
      //   status: "PENDING" as const,
      // };
      // await this.ticketRepository.createOrUpdatePayment(paymentData);

      return ServiceResponse.success<Ticket>("Ticket booked successfully", ticket);
    } catch (error) {
      logger.error(`Error booking ticket: ${(error as Error).message}`);
      console.log(error);
      return ServiceResponse.failure("Failed to book ticket", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Hủy vé
  async cancelTicket(ticketId: number, reason: string, currentUser: CurrentUser): Promise<ServiceResponse<null>> {
    try {
      const ticket = await db<Ticket>("tickets").where({ id: ticketId }).first();
      if (!ticket) {
        return ServiceResponse.failure("Ticket not found", null, StatusCodes.NOT_FOUND);
      }
      if (ticket.status === "CANCELED") {
        return ServiceResponse.failure("Ticket already cancelled", null, StatusCodes.BAD_REQUEST);
      }

      // Kiểm tra quyền truy cập
      const isAdmin = currentUser.role === "ADMIN";
      if (!isAdmin) {
        const ticketUserId = await this.ticketRepository.getTicketUserId(ticketId);
        if (!ticketUserId) {
          return ServiceResponse.failure(
            "No user associated with this ticket",
            null,
            StatusCodes.NOT_FOUND
          );
        }
        if (ticketUserId !== currentUser.id) {
          return ServiceResponse.failure(
            "You can only cancel your own tickets",
            null,
            StatusCodes.FORBIDDEN
          );
        }
      }

      await this.ticketRepository.cancelTicket(ticketId, reason);
      await this.ticketRepository.updateSeatStatus(ticket.seat_id, "AVAILABLE");
      await this.ticketRepository.updateScheduleStatus(ticket.schedule_id, true);

      return ServiceResponse.success<null>("Ticket cancelled successfully", null);
    } catch (ex) {
      logger.error(`Error cancelling ticket: ${(ex as Error).message}`);
      return ServiceResponse.failure("Error cancelling ticket", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Hiển thị lịch sử đặt vé theo trạng thái
  async getTicketsByStatus(status: "BOOKED" | "CANCELED"): Promise<ServiceResponse<Ticket[] | null>> {
    try {
      const tickets = await this.ticketRepository.getTicketsByStatus(status);
      if (!Array.isArray(tickets)) {
        logger.warn("Invalid data format returned from repository");
        return ServiceResponse.success<Ticket[]>("No tickets found for this status", []);
      }

      const validatedTickets = TicketSchema.array().parse(tickets);
      return ServiceResponse.success<Ticket[]>("Tickets retrieved for status", validatedTickets);
    } catch (ex) {
      logger.error(`Error fetching tickets for status: ${(ex as Error).message}`);
      return ServiceResponse.failure("Error fetching tickets for status", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Hiển thị lịch sử đặt vé theo nhà xe
  async getTicketsByCompany(companyId: number): Promise<ServiceResponse<Ticket[] | null>> {
    try {
      const tickets = await this.ticketRepository.getTicketsByCompany(companyId);
      if (!Array.isArray(tickets)) {
        logger.warn("Invalid data format returned from repository");
        return ServiceResponse.success<Ticket[]>("No tickets found for this company", []);
      }

      const validatedTickets = TicketSchema.array().parse(tickets);
      return ServiceResponse.success<Ticket[]>("Tickets retrieved for company", validatedTickets);
    } catch (ex) {
      logger.error(`Error fetching tickets for company: ${(ex as Error).message}`);
      return ServiceResponse.failure("Error fetching tickets for company", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Xem lại tất cả lịch sử đặt vé với pagination
  async getTicketHistory(currentUser: CurrentUser, page: number = 1, limit: number = 10, status: string = "", search: string = ""): Promise<ServiceResponse<{ tickets: Ticket[]; total: number; page: number; limit: number } | null>> {
    try {
      let result: { tickets: Ticket[]; total: number };
      console.log("currentUser", currentUser)
      console.log("page", page)
      console.log("limit", limit)
      if (currentUser.role === "admin") {
        // Admin xem toàn bộ lịch sử
        result = await this.ticketRepository.getAllTickets(page, limit, status, search);
        console.log("result", result)
      } else {
        // Người dùng thông thường chỉ xem lịch sử của chính mình
        result = await this.ticketRepository.getTicketsByUserId(currentUser.id, page, limit);
      }



      return ServiceResponse.success("Tickets retrieved", {
        tickets: result.tickets,
        total: result.total,
        page,
        limit
      });
    } catch (ex) {
      logger.error(`Error fetching tickets: ${(ex as Error).message}`);
      console.error('getTicketHistory error:', ex);
      return ServiceResponse.failure("Error fetching tickets", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Chọn phương thức thanh toán
  async selectPaymentMethod(ticketId: number, paymentMethod: "ONLINE" | "CASH", userId: number, amount: number): Promise<ServiceResponse<Payment | null>> {
    const trx = await db.transaction();
    try {
      const ticket = await trx<Ticket>("tickets").where({ id: ticketId }).first();
      if (!ticket) {
        await trx.rollback();
        return ServiceResponse.failure("Ticket not found", null, StatusCodes.NOT_FOUND);
      }
      if (ticket.status === "CANCELED") {
        await trx.rollback();
        return ServiceResponse.failure("Cannot select payment method for cancelled ticket", null, StatusCodes.BAD_REQUEST);
      }

      const existingPayment = await this.ticketRepository.getPaymentByTicketId(ticketId);
      if (existingPayment && existingPayment.status === "COMPLETED") {
        await trx.rollback();
        return ServiceResponse.failure("Ticket already paid", null, StatusCodes.BAD_REQUEST);
      }

      // Tính số tiền mặc định theo schedule + phụ thu loại ghế nếu cần
      let defaultAmount = 0;
      if (ticket) {
        const schedule = await trx("schedules").where({ id: ticket.schedule_id }).first();
        const seat = await trx("seats").where({ id: ticket.seat_id }).first();
        const base = schedule ? Number(schedule.price) : 0;
        const extra = seat?.price_for_type_seat ? Number(seat.price_for_type_seat) : 0;
        defaultAmount = base + extra;
      }

      const paymentData = {
        payment_provider_id: undefined, // Có thể thêm logic chọn provider sau
        user_id: userId,
        ticket_id: ticketId,
        payment_method: paymentMethod,
        amount: amount || defaultAmount,
        status: "PENDING" as const,
      };

      const payment = await this.ticketRepository.createOrUpdatePayment(paymentData);
      await trx.commit();

      const validatedPayment = PaymentSchema.parse(payment);
      return ServiceResponse.success<Payment>("Payment method selected successfully", validatedPayment);
    } catch (ex) {
      await trx.rollback();
      logger.error(`Error selecting payment method: ${(ex as Error).message}`);
      return ServiceResponse.failure("Error selecting payment method", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Xóa thông tin hủy vé xe
  async deleteCancelledTicket(ticketId: number, reason: string): Promise<ServiceResponse<null>> {
    try {
      const ticket = await this.ticketRepository.getTicketById(ticketId);
      if (!ticket) {
        return ServiceResponse.failure("Ticket not found", null, StatusCodes.NOT_FOUND);
      }
      if (ticket.status !== "CANCELED") {
        return ServiceResponse.failure("Only cancelled tickets can be deleted", null, StatusCodes.BAD_REQUEST);
      }

      await this.ticketRepository.deleteCancelledTicket(ticketId, reason);
      await db("seats").where({ id: ticket.seat_id }).update({ status: "BOOKED" });
      await db("schedules").where({ id: ticket.schedule_id }).update({ is_active: false });

      return ServiceResponse.success<null>("Cancelled ticket deleted successfully", null);
    } catch (ex) {
      logger.error(`Error deleting cancelled ticket: ${(ex as Error).message}`);
      return ServiceResponse.failure("Error deleting cancelled ticket", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Hiển thi danh sách thông tin hủy theo vé xe
  async getCancelledTickets(): Promise<ServiceResponse<Ticket[] | null>> {
    try {
      const tickets = await this.ticketRepository.getTicketsByStatus("CANCELED");
      if (!Array.isArray(tickets)) {
        logger.warn("Invalid data format returned from repository");
        return ServiceResponse.success<Ticket[]>("No cancelled tickets found", []);
      }

      const transformedTickets = tickets.map((ticket) => ({
        ...ticket,
        created_at: ticket.created_at instanceof Date ? ticket.created_at : new Date(ticket.created_at),
        updated_at: ticket.updated_at instanceof Date ? ticket.updated_at : new Date(ticket.updated_at),
      }));

      const validatedTickets = TicketSchema.array().parse(transformedTickets);
      return ServiceResponse.success<Ticket[]>("Cancelled tickets retrieved", validatedTickets);
    } catch (ex) {
      logger.error(`Error fetching cancelled tickets: ${(ex as Error).message}`);
      return ServiceResponse.failure("Error fetching cancelled tickets", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  //  Tra cứu vé xe bằng mã vé với số điện thoại
  async searchTicketByIdAndPhone(ticketId: number, phoneNumber: string): Promise<ServiceResponse<Ticket | null>> {
    try {
      const ticket = await this.ticketRepository.searchTicketByIdAndPhone(ticketId, phoneNumber);
      if (!ticket) {
        return ServiceResponse.failure("No tickets found with this ticket code and phone number.", null, StatusCodes.NOT_FOUND);
      }
      const validatedTicket = TicketSchema.parse(ticket);
      return ServiceResponse.success<Ticket>("Successfully found the ticket", validatedTicket);
    } catch (ex) {
      logger.error(`Error when checking the ticket: ${(ex as Error).message}`);
      return ServiceResponse.failure("Error when checking the ticket", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Thêm mới thông tin hủy vé xe dành cho admin
  async createCancelTicket(ticketId: number, reason: string): Promise<ServiceResponse<null>> {
    try {
      const ticket = await this.ticketRepository.getTicketById(ticketId);
      if (!ticket) {
        return ServiceResponse.failure("Ticket not found", null, StatusCodes.NOT_FOUND);
      }
      if (ticket.status !== "BOOKED") {
        return ServiceResponse.failure("Only booked tickets can be cancelled", null, StatusCodes.BAD_REQUEST);
      }

      await this.ticketRepository.createCancelTicket(ticketId, reason);
      await db("seats").where({ id: ticket.seat_id }).update({ status: "AVAILABLE" });
      await db("schedules").where({ id: ticket.schedule_id }).update({ is_active: true });

      return ServiceResponse.success<null>("Ticket cancellation information added successfully", null);
    } catch (ex) {
      logger.error(`Error creating cancellation information: ${(ex as Error).message}`);
      return ServiceResponse.failure("Error creating cancellation information", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Kiểm tra trạng thái thanh toán
  async checkPaymentStatus(ticketId: number): Promise<ServiceResponse<{ status: string } | null>> {
    try {
      const ticket = await this.ticketRepository.getTicketById(ticketId);
      if (!ticket) {
        return ServiceResponse.failure("Ticket not found", null, StatusCodes.NOT_FOUND);
      }

      // Kiểm tra trong bảng payments để xem có thanh toán thành công không
      const order = await db("payments").where({ ticket_id: ticketId }).first();


      let ticketStatus = ticket.status || "PENDING";

      // Nếu có order và status là BOOKED, coi như thanh toán thành công
      if (order && order.status === "BOOKED") {

        ticketStatus = "BOOKED";
      }

      return ServiceResponse.success<{ status: string }>("Payment status retrieved", {
        status: ticketStatus,

      });
    } catch (ex) {
      logger.error(`Error checking payment status: ${(ex as Error).message}`);
      return ServiceResponse.failure("Error checking payment status", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Lấy vé theo ID với thông tin chi tiết
  async getTicketById(ticketId: number): Promise<ServiceResponse<any | null>> {
    try {
      const ticket = await this.ticketRepository.getTicketByIdWithDetails(ticketId);
      if (!ticket) {
        return ServiceResponse.failure("Ticket not found", null, StatusCodes.NOT_FOUND);
      }

      // Chỉ trả về vé có trạng thái BOOKED
      if (ticket.status !== "BOOKED") {
        return ServiceResponse.failure("Ticket is not in BOOKED status", null, StatusCodes.BAD_REQUEST);
      }

      return ServiceResponse.success("Ticket retrieved successfully", ticket);
    } catch (ex) {
      logger.error(`Error fetching ticket by ID: ${(ex as Error).message}`);
      return ServiceResponse.failure("Error fetching ticket", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Lấy tất cả vé của user theo ID (chỉ trả về BOOKED)
  async getTicketsByUserId(userId: number): Promise<ServiceResponse<any[] | null>> {
    try {
      console.log("userId", userId)
      const tickets = await this.ticketRepository.getTicketsByUserIdWithDetails(userId);

      // Lọc chỉ lấy vé có trạng thái BOOKED
      const bookedTickets = tickets.filter(ticket => ticket.status === "BOOKED");

      if (bookedTickets.length === 0) {
        return ServiceResponse.success("No booked tickets found for this user", []);
      }

      return ServiceResponse.success("User tickets retrieved successfully", bookedTickets);
    } catch (ex) {
      logger.error(`Error fetching tickets by user ID: ${(ex as Error).message}`);
      return ServiceResponse.failure("Error fetching user tickets", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Lấy tất cả vé của user hiện tại (chỉ trả về BOOKED)
  async getCurrentUserTickets(userId: number): Promise<ServiceResponse<any[] | null>> {
    try {
      const tickets = await this.ticketRepository.getTicketsByUserIdWithDetails(userId);

      // Lọc chỉ lấy vé có trạng thái BOOKED
      const bookedTickets = tickets.filter(ticket => ticket.status === "BOOKED");

      if (bookedTickets.length === 0) {
        return ServiceResponse.success("No booked tickets found for this user", []);
      }

      return ServiceResponse.success("User tickets retrieved successfully", bookedTickets);
    } catch (ex) {
      logger.error(`Error fetching current user tickets: ${(ex as Error).message}`);
      return ServiceResponse.failure("Error fetching user tickets", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

}

export const ticketService = new TicketService();
