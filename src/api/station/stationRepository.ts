import type { Station } from "@/api/station/stationModel";
import { db } from "@/common/config/database";

export class StationRepository {
  // Tìm tất cả Station với phân trang, tìm kiếm và sắp xếp
  async findAllAsync(
    page: number,
    limit: number,
    search?: string,
    sortBy: string = "name",
    order: string = "asc"
  ): Promise<Station[]> {
    const query = db<Station>("stations");

    // Nếu có tìm kiếm, áp dụng điều kiện
    if (search) {
      query.where((qb) => {
        qb.where("name", "like", `%${search}%`)
          .orWhere("location", "like", `%${search}%`);
      });
    }

    // Xác thực trường sắp xếp hợp lệ
    const validSortFields = ["name", "location", "created_at", "updated_at"];
    if (validSortFields.includes(sortBy) && ["asc", "desc"].includes(order)) {
      query.orderBy(sortBy, order);
    }

    // Phân trang
    query.offset((page - 1) * limit).limit(limit);

    return await query.select("*");
  }

  // Tìm một Station theo ID
  async findByIdAsync(id: number): Promise<Station | null> {
    return await db<Station>("stations").where({ id }).first() || null;
  }

  // Tạo mới một Station
  async createAsync(station: Omit<Station, "id">): Promise<number> {
    // Handle embedding field separately to ensure proper JSON serialization
    const { embedding, ...otherData } = station;
    const insertData: any = { ...otherData };

    if (embedding !== undefined) {
      insertData.embedding = JSON.stringify(embedding);
    }

    const [newId] = await db<Station>("stations").insert(insertData);
    return newId;
  }

  // Cập nhật một Station
  async updateAsync(id: number, station: Partial<Station>): Promise<boolean> {
    // Handle embedding field separately to ensure proper JSON serialization
    const { embedding, ...otherData } = station;
    const updateData: any = { ...otherData };

    if (embedding !== undefined) {
      updateData.embedding = JSON.stringify(embedding);
    }

    const updatedRows = await db<Station>("stations").where({ id }).update(updateData);
    return updatedRows > 0;
  }

  // Kiểm tra xem station có đang được sử dụng trong routes không
  async checkDependentRecords(id: number): Promise<{ routes: number; analytics: number; popularRoutes: number }> {
    const routeCount = await db("routes")
      .where("departure_station_id", id)
      .orWhere("arrival_station_id", id)
      .count("* as count")
      .first();

    const analyticsCount = await db("station_analytics")
      .where("station_id", id)
      .count("* as count")
      .first();

    // Kiểm tra popular_routes thông qua routes
    const popularRoutesCount = await db("popular_routes as pr")
      .join("routes as r", "pr.route_id", "r.id")
      .where("r.departure_station_id", id)
      .orWhere("r.arrival_station_id", id)
      .count("pr.id as count")
      .first();

    return {
      routes: Number(routeCount?.count || 0),
      analytics: Number(analyticsCount?.count || 0),
      popularRoutes: Number(popularRoutesCount?.count || 0)
    };
  }

  // Xóa một Station với cascade logic
  async deleteAsync(id: number): Promise<boolean> {
    return await db.transaction(async (trx) => {
      // Lấy danh sách route IDs mà station này tham gia
      const routes = await trx("routes")
        .where("departure_station_id", id)
        .orWhere("arrival_station_id", id)
        .select("id");
      const routeIds = routes.map(r => r.id);

      if (routeIds.length > 0) {
        // Xóa popular_routes trước (vì nó phụ thuộc vào routes)
        await trx("popular_routes").whereIn("route_id", routeIds).del();

        // Xóa route_analytics
        await trx("route_analytics").whereIn("route_id", routeIds).del();
      }

      // Xóa station_analytics
      await trx("station_analytics").where("station_id", id).del();

      // Xóa routes có sử dụng station này
      if (routeIds.length > 0) {
        await trx("routes").whereIn("id", routeIds).del();
      }

      // Cuối cùng xóa station
      const deletedRows = await trx<Station>("stations").where({ id }).del();
      return deletedRows > 0;
    });
  }
}
