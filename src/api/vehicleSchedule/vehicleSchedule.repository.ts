import type { VehicleSchedule } from "./vehicleSchedule.model";
import { db } from "@/common/config/database";

export class VehicleScheduleRepository {
  // Kiểm tra xung đột lịch trình
  // Simplified: no time-based conflict in new schema
  async isScheduleConflict(): Promise<boolean> { return false; }

  async findAll(
    filter: { route_id?: number; bus_id?: number; status?: string; departure?: number; destination?: number; departureDate?: string },
    options: { sortBy?: string; limit?: number; page?: number }
  ) {
    const { sortBy = "id:asc", limit = 10, page = 1 } = options;
    const [sortField, sortOrder] = sortBy.split(":");

    const query = db("schedules as s")
      .leftJoin("routes as r", "s.route_id", "r.id")
      .leftJoin("cars as b", "s.bus_id", "b.id")
      .leftJoin('seats as se', "se.bus_id", "s.bus_id")
      .select(
        "s.*",
        db.raw("r.departure_station_id as route_departure_station_id"),
        db.raw("r.arrival_station_id as route_arrival_station_id"),
        db.raw("b.name as bus_name"),
        db.raw("b.featured_image as bus_featured_image"),
        db.raw("COUNT(CASE WHEN se.status = 'AVAILABLE' THEN 1 END) as available_seats"),
        db.raw("COUNT(se.id) as total_seats")
      )
      .groupBy("s.id", "r.departure_station_id", "r.arrival_station_id", "b.name", "b.featured_image");

    if (filter.route_id !== undefined) {
      query.where("s.route_id", filter.route_id);
    }
    if (filter.bus_id !== undefined) {
      query.where("s.bus_id", filter.bus_id);
    }
    if (filter.status !== undefined) {
      query.where("s.status", filter.status);
    }
    if (filter.departure !== undefined) {
      // match by route's departure station
      query.where("r.departure_station_id", filter.departure);
    }
    if (filter.destination !== undefined) {
      // match by route's arrival station
      query.where("r.arrival_station_id", filter.destination);
    }
    if (filter.departureDate !== undefined) {
      const startOfDay = `${filter.departureDate} 00:00:00`;
      const endOfDay = `${filter.departureDate} 23:59:59`;
      query.whereBetween("s.departure_time", [startOfDay, endOfDay]);
    }

    const offset = (page - 1) * limit;

    const data = await query.orderBy(sortField, sortOrder).limit(limit).offset(offset);

    // Count query - use distinct count to avoid duplicates from joins
    const countResult = await db("schedules as s")
      .leftJoin("routes as r", "s.route_id", "r.id")
      .modify((qb) => {
        if (filter.route_id !== undefined) {
          qb.where("s.route_id", filter.route_id);
        }
        if (filter.bus_id !== undefined) {
          qb.where("s.bus_id", filter.bus_id);
        }
        if (filter.status !== undefined) {
          qb.where("s.status", filter.status);
        }
        if (filter.departure !== undefined) {
          qb.where("r.departure_station_id", filter.departure);
        }
        if (filter.destination !== undefined) {
          qb.where("r.arrival_station_id", filter.destination);
        }
        if (filter.departureDate !== undefined) {
          const startOfDay = `${filter.departureDate} 00:00:00`;
          const endOfDay = `${filter.departureDate} 23:59:59`;
          qb.whereBetween("s.departure_time", [startOfDay, endOfDay]);
        }
      })
      .countDistinct("s.id as count");

    const totalCount = Number((countResult[0] as { count: string }).count);

    return {
      results: data,
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async findByIdAsync(id: number): Promise<VehicleSchedule | null> {
    const rows = await db<VehicleSchedule>("schedules").select("*").where("id", id);
    if (rows.length === 0) {
      return null;
    }
    return rows[0];
  }


  async createAsync(data: Omit<VehicleSchedule, "id" | "created_at" | "updated_at">): Promise<VehicleSchedule> {
    // ensure bus exists
    const bus = await db("cars").where("id", data.bus_id).first();
    if (!bus) throw new Error("Không tìm thấy xe buýt.");

    const currentTime = new Date();

    const formatToMySQLDateTime = (value: unknown): string | null => {
      if (!value) return null;
      const date = value instanceof Date ? value : new Date(String(value));
      if (Number.isNaN(date.getTime())) return null;
      const pad = (n: number) => String(n).padStart(2, "0");
      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate());
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      const seconds = pad(date.getSeconds());
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const insertPayload: Record<string, unknown> = {
      ...data,
      created_at: currentTime,
      updated_at: currentTime,
    };

    if (data && (data as any).departure_time !== undefined) {
      insertPayload["departure_time"] = formatToMySQLDateTime((data as any).departure_time);
    }

    const [id] = await db("schedules").insert(insertPayload);

    const [newSchedule] = await db("schedules").where({ id }).select("*");
    return newSchedule;
  }

  async updateAsync(id: number, data: Partial<VehicleSchedule>): Promise<VehicleSchedule | null> {
    const existing = await db<VehicleSchedule>("schedules").where("id", id).first();
    if (!existing) return null;

    const updatePayload: Record<string, unknown> = {
      ...data,
      updated_at: new Date(),
    };

    if (data.departure_time !== undefined) {
      const pad = (n: number) => String(n).padStart(2, "0");
      const d = data.departure_time instanceof Date ? data.departure_time : new Date(String(data.departure_time));
      if (!Number.isNaN(d.getTime())) {
        const fmt = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        updatePayload["departure_time"] = fmt;
      } else {
        // If invalid date, set to null or omit; here we omit to avoid breaking updates
        delete updatePayload["departure_time"];
      }
    }

    const affectedRows = await db("schedules").where("id", id).update(updatePayload);
    if (affectedRows === 0) return null;

    const updatedRows = await db("schedules").where("id", id).select("*").first();
    return updatedRows ?? null;
  }

  async deleteAsync(id: number): Promise<VehicleSchedule | null> {
    return await db.transaction(async trx => {
      // Lấy danh sách ticket_id thuộc schedule
      const ticketIds = await trx("tickets")
        .where("cars_chedule_id", id)
        .pluck("id");

      if (ticketIds.length > 0) {
        // Xoá tất cả payments liên quan tới các ticket này
        await trx("payments").whereIn("ticket_id", ticketIds).del();
      }

      // Xóa tickets
      await trx("tickets").where("schedule_id", id).del();

      // Xóa schedule
      const rows = await trx("schedules").where("id", id).del().returning("*");

      if (rows.length === 0) return null;
      return rows[0];
    });
  }
}