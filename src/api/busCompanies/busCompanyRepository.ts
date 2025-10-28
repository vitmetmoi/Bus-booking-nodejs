import type { BusCompany } from "./busCompanyModel";
import { db } from "@/common/config/database";

export class BusCompanyRepository {
  // 🔍 Tìm tất cả nhà xe với phân trang, tìm kiếm và sắp xếp
  async findAllAsync(
    page: number,
    limit: number,
    search?: string,
    sortBy: string = "company_name",
    order: string = "asc"
  ): Promise<BusCompany[]> {
    const query = db<BusCompany>("bus_companies");

    if (search) {
      query.where("company_name", "like", `%${search}%`);
    }

    const validSortFields = ["company_name", "created_at", "updated_at"];
    if (validSortFields.includes(sortBy) && ["asc", "desc"].includes(order)) {
      query.orderBy(sortBy, order);
    }

    query.offset((page - 1) * limit).limit(limit);

    return await query.select("*");
  }

  // Tìm một nhà xe theo ID
  async findByIdAsync(id: number): Promise<BusCompany | null> {
    return await db<BusCompany>("bus_companies").where({ id }).first() || null;
  }

  // Tạo mới một nhà xe
  async createAsync(data: Omit<BusCompany, "id">): Promise<number> {
    // Handle embedding field separately to ensure proper JSON serialization
    const { embedding, ...otherData } = data;
    const insertData: any = { ...otherData };

    if (embedding !== undefined) {
      insertData.embedding = JSON.stringify(embedding);
    }

    const [newId] = await db<BusCompany>("bus_companies").insert(insertData);
    return newId;
  }

  // Cập nhật nhà xe
  async updateAsync(id: number, data: Partial<BusCompany>): Promise<boolean> {
    // Handle embedding field separately to ensure proper JSON serialization
    const { embedding, ...otherData } = data;
    const updateData: any = { ...otherData };

    if (embedding !== undefined) {
      updateData.embedding = JSON.stringify(embedding);
    }

    const updatedRows = await db<BusCompany>("bus_companies").where({ id }).update(updateData);
    return updatedRows > 0;
  }

  // Kiểm tra các bản ghi phụ thuộc
  async checkDependentRecords(id: number): Promise<{ cars: number; revenue: number; totalRelatedRecords: number }> {
    const carsCount = await db("cars")
      .where("company_id", id)
      .count("* as count")
      .first();



    // Lấy danh sách car IDs của company này
    const cars = await db("cars").where("company_id", id).select("id");
    const carIds = cars.map(car => car.id);

    let totalRelatedRecords = 0;

    if (carIds.length > 0) {
      // Đếm schedules
      const schedulesCount = await db("schedules")
        .whereIn("bus_id", carIds)
        .count("* as count")
        .first();

      // Đếm seats
      const seatsCount = await db("seats")
        .whereIn("bus_id", carIds)
        .count("* as count")
        .first();

      // Đếm bus_reviews
      const reviewsCount = await db("bus_reviews")
        .whereIn("bus_id", carIds)
        .count("* as count")
        .first();

      // Đếm car_schedules
      const carSchedulesCount = await db("car_schedules")
        .whereIn("car_id", carIds)
        .count("* as count")
        .first();

      // Đếm tickets thông qua schedules
      const ticketsCount = await db("tickets as t")
        .join("schedules as s", "t.schedule_id", "s.id")
        .whereIn("s.bus_id", carIds)
        .count("t.id as count")
        .first();

      // Đếm ticket_orders thông qua tickets
      const ticketOrdersCount = await db("ticket_orders as to")
        .join("tickets as t", "to.ticket_id", "t.id")
        .join("schedules as s", "t.schedule_id", "s.id")
        .whereIn("s.bus_id", carIds)
        .count("to.id as count")
        .first();

      totalRelatedRecords =
        Number(schedulesCount?.count || 0) +
        Number(seatsCount?.count || 0) +
        Number(reviewsCount?.count || 0) +
        Number(carSchedulesCount?.count || 0) +
        Number(ticketsCount?.count || 0) +
        Number(ticketOrdersCount?.count || 0);
    }

    return {
      cars: Number(carsCount?.count || 0),
      revenue: 0,
      totalRelatedRecords
    };
  }

  // Xóa nhà xe với cascade logic
  async deleteAsync(id: number): Promise<boolean> {
    return await db.transaction(async (trx) => {
      // Lấy danh sách cars của company này
      const cars = await trx("cars").where("company_id", id).select("id");
      const carIds = cars.map(car => car.id);

      if (carIds.length > 0) {
        // Lấy danh sách schedule IDs để xử lý ticket_orders và tickets
        const schedules = await trx("schedules")
          .whereIn("bus_id", carIds)
          .select("id");
        const scheduleIds = schedules.map(s => s.id);

        if (scheduleIds.length > 0) {
          // Lấy ticket IDs để xóa ticket_orders
          const tickets = await trx("tickets")
            .whereIn("schedule_id", scheduleIds)
            .select("id");
          const ticketIds = tickets.map(t => t.id);

          if (ticketIds.length > 0) {
            // Xóa ticket_orders trước (vì nó phụ thuộc vào tickets)
            await trx("ticket_orders").whereIn("ticket_id", ticketIds).del();

            // Xóa tickets
            await trx("tickets").whereIn("id", ticketIds).del();
          }
        }

        // Xóa car_schedules (vì nó phụ thuộc vào cả cars và schedules)
        await trx("car_schedules").whereIn("car_id", carIds).del();

        // Xóa schedules
        await trx("schedules").whereIn("bus_id", carIds).del();

        // Xóa seats
        await trx("seats").whereIn("bus_id", carIds).del();

        // Xóa bus_reviews
        await trx("bus_reviews").whereIn("bus_id", carIds).del();

        // Xóa cars
        await trx("cars").whereIn("id", carIds).del();
      }

      // Xóa revenue_tracking
      // await trx("revenue_tracking").where("bus_company_id", id).del();

      // Cuối cùng xóa bus_company
      const deletedRows = await trx<BusCompany>("bus_companies").where({ id }).del();
      return deletedRows > 0;
    });
  }
}
