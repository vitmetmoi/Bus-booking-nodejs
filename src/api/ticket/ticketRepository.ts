import type { Route, Bus, Seat, Schedule, Ticket, Payment } from "@/api/ticket/ticketModel";
import { db } from "@/common/config/database";

export class TicketRepository {
  // Lấy danh sách tuyến đường
  async getRoutes(): Promise<Route[]> {
    return await db<Route>("routes").select("*");
  }

  // Lấy danh sách xe theo tuyến đường
  async getBusesByRoute(routeId: number): Promise<Bus[]> {
    return await db("cars")
      .join("schedules", "cars.id", "schedules.bus_id")
      .where("schedules.route_id", routeId)
      .andWhere("schedules.is_active", true)
      .andWhere("schedules.departure_time", ">", new Date()) // Chỉ lấy lịch trình trong tương lai
      .select("cars.*")
      .distinct(); // nếu 1 xe có nhiều lịch trình, tránh trùng lặp
  }

  // Lấy danh sách ghế trống theo xe
  async getAvailableSeats(busId: number): Promise<Seat[]> {
    const schedules = await db("schedules")
      .where({ bus_id: busId, is_active: true })
      .andWhere("departure_time", ">", new Date())
      .select("id");

    const scheduleIds = schedules.map(schedule => schedule.id);

    let bookedSeats: number[] = [];
    if (scheduleIds.length > 0) {
      bookedSeats = await db("tickets")
        .whereIn("schedule_id", scheduleIds)
        .andWhere("status", "BOOKED") // Chỉ lấy các vé chưa bị hủy
        .pluck("seat_id");
    }

    return db<Seat>("seats")
      .where({ bus_id: busId }) // Lọc theo bus_id
      .whereNotIn("id", bookedSeats)
      .andWhere("status", "AVAILABLE")
      .select("*");
  }

  // Lấy thông tin schedule
  async getSchedule(routeId: number, busId: number): Promise<Schedule | null | undefined> {
    return await db<Schedule>("schedules")
      .where("route_id", routeId)
      .andWhere("bus_id", busId)
      .andWhere("is_active", true)
      .andWhere("departure_time", ">", new Date())
      .orderBy("departure_time", "asc")
      .first();
  }

  // Đặt vé
  async bookTicket(ticketData: {
    seat_id: number;
    schedule_id: number;
    user_id: number;
    // ticket_number: string;
    total_price: number;
  }): Promise<Ticket> {
    const newTicket = {
      seat_id: ticketData.seat_id,
      schedule_id: ticketData.schedule_id,
      user_id: ticketData.user_id,
      // ticket_number: ticketData.ticket_number,
      total_price: ticketData.total_price,
      status: "PENDING" as "PENDING",
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Insert vào cơ sở dữ liệu
    const [id] = await db<Ticket>("tickets").insert(newTicket);

    // Trả về đối tượng ticket với id
    return { id, ...newTicket };
  }

  // Cập nhật trạng thái ghế
  async updateSeatStatus(seatId: number, status: "AVAILABLE" | "BOOKED"): Promise<void> {
    await db<Seat>("seats").where({ id: seatId }).update({ status });
  }

  // Cập nhật trạng thái schedule
  async updateScheduleStatus(scheduleId: number, isActive: boolean): Promise<void> {
    await db<Schedule>("schedules")
      .where({ id: scheduleId })
      .update({ is_active: isActive, updated_at: new Date() });
  }

  // Hủy vé
  async cancelTicket(ticketId: number, reason: string): Promise<void> {
    await db<Ticket>("tickets")
      .where({ id: ticketId })
      .update({ status: "CANCELED", reason: reason, updated_at: new Date() });
  }

  // Hiển thị lịch sử đặt vé theo trạng thái
  async getTicketsByStatus(status: "BOOKED" | "CANCELED"): Promise<Ticket[]> {
    return await db("tickets")
      .where("status", status)
      .select("*");
  }

  // Hiển thị lịch sử đặt vé theo nhà xe (companyId)
  async getTicketsByCompany(companyId: number): Promise<Ticket[]> {
    return await db("tickets")
      .join("schedules", "tickets.schedule_id", "schedules.id")
      .join("cars", "schedules.bus_id", "cars.id")
      .where("cars.company_id", companyId)
      .select("tickets.*");
  }

  // Xem lại tất cả lịch sử đặt vé với pagination
  async getAllTickets(page: number = 1, limit: number = 10): Promise<{ tickets: Ticket[]; total: number }> {
    const offset = (page - 1) * limit;
    console.log("offset", offset)
    const [tickets, totalResult] = await Promise.all([
      db("tickets")
        .select("*")
        .limit(limit)
        .offset(offset)
        .orderBy("created_at", "desc"),
      db("tickets").count("* as count").first()
    ]);
    console.log("tickets", tickets)
    console.log("totalResult", totalResult)
    return {
      tickets,
      total: Number(totalResult?.count || 0)
    };
  }

  // Lấy lịch sử đặt vé theo user_id với pagination
  async getTicketsByUserId(userId: number, page: number = 1, limit: number = 10): Promise<{ tickets: Ticket[]; total: number }> {
    const offset = (page - 1) * limit;

    const [tickets, totalResult] = await Promise.all([
      db("tickets")
        .where("user_id", userId)
        .select("*")
        .limit(limit)
        .offset(offset)
        .orderBy("created_at", "desc"),
      db("tickets")
        .where("user_id", userId)
        .count("* as count")
        .first()
    ]);

    return {
      tickets,
      total: Number(totalResult?.count || 0)
    };
  }

  // Chọn phương thức thanh toán
  async createOrUpdatePayment(paymentData: Omit<Payment, "id" | "created_at" | "updated_at">): Promise<Payment> {
    const [payment] = await db("payments")
      .insert({
        ...paymentData,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .onConflict("ticket_id")
      .merge()
      .returning("*");
    return payment;
  }
  async getPaymentByTicketId(ticketId: number): Promise<Payment | undefined> {
    return await db("payments")
      .where({ ticket_id: ticketId })
      .first();
  }

  async getTicketById(ticketId: number): Promise<Ticket | undefined> {
    return await db("tickets")
      .where({ id: ticketId })
      .first();
  }

  // Xóa thông tin hủy vé xe
  async deleteCancelledTicket(ticketId: number, reason: string): Promise<void> {
    await db("tickets")
      .where({ id: ticketId })
      .update({
        status: "BOOKED",
        reason: reason,
        updated_at: new Date(),
      });
  }

  // Thêm mới thông tin hủy vé xe dành cho admin
  async createCancelTicket(ticketId: number, reason: string): Promise<void> {
    await db("tickets")
      .where({ id: ticketId })
      .update({
        status: "CANCELED",
        reason: reason,
        updated_at: new Date(),
      });
  }

  // Hiển thi danh sách thông tin hủy theo vé xe
  async getCancelledTickets(ticketId: number): Promise<void> {
    await db("tickets")
      .where({ id: ticketId })
      .update({
        status: "CANCELED",
        updated_at: db.fn.now(),
      });
  }

  //  Tra cứu vé xe bằng mã vé với số điện thoại
  async searchTicketByIdAndPhone(ticketId: number, phoneNumber: string): Promise<Ticket | null> {
    const ticket = await db("tickets")
      .join("users", "tickets.user_id", "users.id")
      .where("tickets.id", ticketId)
      .andWhere("users.phone", phoneNumber)
      .select("tickets.*")
      .first();

    if (!ticket) return null;

    return ticket;
  }

  // Lấy user_id của vé trực tiếp từ bảng tickets
  async getTicketUserId(ticketId: number): Promise<number | null> {
    const ticket = await db("tickets")
      .where({ id: ticketId })
      .select("user_id")
      .first();
    return ticket ? ticket.user_id : null;
  }

  // Lấy vé theo ID với thông tin chi tiết
  async getTicketByIdWithDetails(ticketId: number): Promise<any | null> {
    const ticket = await db("tickets")
      .join("schedules", "tickets.schedule_id", "schedules.id")
      .join("routes", "schedules.route_id", "routes.id")
      .join("cars", "schedules.bus_id", "cars.id")
      .join("bus_companies", "cars.company_id", "bus_companies.id")
      .join("seats", "tickets.seat_id", "seats.id")
      .join("stations as departure_station", "routes.departure_station_id", "departure_station.id")
      .join("stations as arrival_station", "routes.arrival_station_id", "arrival_station.id")
      .where("tickets.id", ticketId)
      .select(
        "tickets.*",
        "schedules.departure_time",
        // "routes.duration",
        "routes.distance_km as distance",
        "cars.name as bus_name",
        "cars.license_plate",
        "cars.capacity",
        "bus_companies.company_name",
        "seats.seat_number",
        "seats.seat_type",
        "seats.price_for_type_seat",
        "departure_station.name as departure_station_name",
        "departure_station.location as departure_station_address",
        "arrival_station.name as arrival_station_name",
        "arrival_station.location as arrival_station_address"
      )
      .first();

    return ticket || null;
  }

  // Lấy tất cả vé của user theo ID với thông tin chi tiết (tách nhiều truy vấn)
  async getTicketsByUserIdWithDetails(userId: number): Promise<any[]> {
    // 1) Lấy vé của user
    const tickets = await db("tickets")
      .where("user_id", userId)
      .orderBy("created_at", "desc");

    if (tickets.length === 0) return [];

    // 2) Gom các id cần thiết
    const scheduleIds = Array.from(new Set(tickets.map((t: any) => t.schedule_id).filter(Boolean)));
    const seatIds = Array.from(new Set(tickets.map((t: any) => t.seat_id).filter(Boolean)));

    // 3) Tải schedules và seats
    const [schedules, seats] = await Promise.all([
      scheduleIds.length ? db("schedules").whereIn("id", scheduleIds) : Promise.resolve([]),
      seatIds.length ? db("seats").whereIn("id", seatIds) : Promise.resolve([]),
    ]);


    const scheduleById = new Map<number, any>(schedules.map((s: any) => [s.id, s]));
    const seatById = new Map<number, any>(seats.map((s: any) => [s.id, s]));

    // 4) Từ schedules gom route_id và bus_id
    const routeIds = Array.from(new Set(schedules.map((s: any) => s.route_id).filter(Boolean)));
    const busIds = Array.from(new Set(schedules.map((s: any) => s.bus_id).filter(Boolean)));

    // 5) Tải routes và cars
    const [routes, cars] = await Promise.all([
      routeIds.length ? db("routes").whereIn("id", routeIds) : Promise.resolve([]),
      busIds.length ? db("cars").whereIn("id", busIds) : Promise.resolve([]),
    ]);

    const routeById = new Map<number, any>(routes.map((r: any) => [r.id, r]));
    const carById = new Map<number, any>(cars.map((c: any) => [c.id, c]));

    // 6) Từ cars gom company_id, từ routes gom station ids
    const companyIds = Array.from(new Set(cars.map((c: any) => c.company_id).filter(Boolean)));
    const departureStationIds = Array.from(new Set(routes.map((r: any) => r.departure_station_id).filter(Boolean)));
    const arrivalStationIds = Array.from(new Set(routes.map((r: any) => r.arrival_station_id).filter(Boolean)));
    const stationIds = Array.from(new Set([...departureStationIds, ...arrivalStationIds]));

    // 7) Tải companies và stations
    const [companies, stations] = await Promise.all([
      companyIds.length ? db("bus_companies").whereIn("id", companyIds) : Promise.resolve([]),
      stationIds.length ? db("stations").whereIn("id", stationIds) : Promise.resolve([]),
    ]);

    const companyById = new Map<number, any>(companies.map((bc: any) => [bc.id, bc]));
    const stationById = new Map<number, any>(stations.map((st: any) => [st.id, st]));

    // 8) Kết hợp dữ liệu
    const detailed = tickets.map((t: any) => {
      const s = scheduleById.get(t.schedule_id);
      const r = s ? routeById.get(s.route_id) : undefined;
      const c = s ? carById.get(s.bus_id) : undefined;
      const bc = c ? companyById.get(c.company_id) : undefined;
      const se = seatById.get(t.seat_id);
      const ds = r ? stationById.get(r.departure_station_id) : undefined;
      const as = r ? stationById.get(r.arrival_station_id) : undefined;


      return {
        ...t,
        departure_time: s?.departure_time,
        distance_km: r?.distance_km,
        // estimated_duration_hours: r?.estimated_duration_hours, // bật nếu cần
        bus_name: c?.name,
        license_plate: c?.license_plate,
        capacity: c?.capacity,
        company_name: bc?.company_name,
        seat_number: se?.seat_number,
        seat_type: se?.seat_type,
        price_for_type_seat: se?.price_for_type_seat,
        departure_station_name: ds?.name,
        departure_station_address: ds?.location,
        arrival_station_name: as?.name,
        arrival_station_address: as?.location,
      };
    });

    // console.log('detailed', detailed)

    return detailed;
  }

}