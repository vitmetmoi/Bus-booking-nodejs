import { db } from "@/common/config/database";

export class TicketOrderRepository {
  async getAllTicketOrders({
    page = 1,
    limit = 10,
    sortBy = "tickets.id",
    order = "desc",
    search = "",
  }: {
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: "asc" | "desc";
    search?: string;
  }) {
    const offset = (page - 1) * limit;

    if (!sortBy.includes(".")) {
      sortBy = `tickets.id`;
      sortBy = `tickets.status`;
      // sortBy = `users.first_name`;
      sortBy = `users.email`;
      // sortBy = `schedules.departure_time`;
      // sortBy = `routes.price`;
      // sortBy = `buses.license_plate`;
      sortBy = `bus_companies.company_name`;
      sortBy = `seats.seat_number`;
    }


    const query = db("tickets")
      .select(
        "tickets.id as ticketId",
        "tickets.status",
        // "users.first_name as first_name",
        "users.email as userEmail",
        "schedules.departure_time",
        "routes.price as price",
        "buses.license_plate",
        "seats.seat_number",
        "buses.name as busName",
        "bus_companies.company_name as busCompanyName",
        "departure_station.name as departureStation",
        "arrival_station.name as arrivalStation",
        // "buses.id as busId",
        // "routes.id as routeId",
      )
      .join("payments", "tickets.id", "payments.ticket_id")
      .join("users", "payments.user_id", "users.id")
      .join("schedules", "tickets.schedule_id", "schedules.id")
      .join("routes", "schedules.route_id", "routes.id")
      .join("buses", "schedules.bus_id", "buses.id")
      .join("bus_companies", "buses.company_id", "bus_companies.id")
      .join("seats", "tickets.seat_id", "seats.id")
      .join("stations as departure_station", "routes.departure_station_id", "departure_station.id")
      .join("stations as arrival_station", "routes.arrival_station_id", "arrival_station.id");

    if (search) {
      query.where(function () {
        this
          // .where("users.first_name", "like", `%${search}%`)
          // .orWhere("users.email", "like", `%${search}%`);
          .where("users.email", "like", `%${search}%`)
        // .orWhere("buses.id", "like", `${search}`);
      });
    }
    query.orderBy(sortBy, order)
      .limit(limit)
      .offset(offset);
    console.log("Query:", query.toSQL().sql);

    return await query;
  }

  async getTicketOrdersByCompany(companyId: number) {

    try {
      const query = db("tickets")
        .select(
          "tickets.id as ticketId",
          "tickets.status",
          // "users.first_name as first_name",
          "users.email as userEmail",
          "schedules.departure_time",
          "routes.price as price",
          "buses.license_plate",
          "bus_companies.company_name as busCompanyName",
          "seats.seat_number"
        )
        .join("payments", "tickets.id", "payments.ticket_id")
        .join("users", "payments.user_id", "users.id")
        .join("schedules", "tickets.schedule_id", "schedules.id")
        .join("routes", "schedules.route_id", "routes.id")
        .join("buses", "schedules.bus_id", "buses.id")
        .join("bus_companies", "buses.company_id", "bus_companies.id")
        .join("seats", "tickets.seat_id", "seats.id")
        .where("bus_companies.id", companyId)

      return await query;
    } catch (error) {
      throw error;
    }
  }

  async getTicketOrdersByStatus(status: string) {

    try {
      const query = db("tickets")
        .select(
          "tickets.id as ticketId",
          "tickets.status",
          // "users.first_name as first_name",
          "users.email as userEmail",
          "schedules.departure_time",
          "routes.price as price",
          "buses.license_plate",
          "bus_companies.company_name as busCompanyName",
          "seats.seat_number"
        )
        .leftJoin("payments", "tickets.id", "payments.ticket_id")
        .leftJoin("users", "payments.user_id", "users.id")
        .leftJoin("schedules", "tickets.schedule_id", "schedules.id")
        .leftJoin("routes", "schedules.route_id", "routes.id")
        .leftJoin("buses", "schedules.bus_id", "buses.id")
        .leftJoin("bus_companies", "buses.company_id", "bus_companies.id")
        .leftJoin("seats", "tickets.seat_id", "seats.id")
        .where("tickets.status", status)

      console.log("Query:", query.toSQL().sql);

      return await query;
    } catch (error) {
      throw error;
    }
  }
}