import { RouteRepository, } from '@/api/routes/routesRepository';
import { Routes } from '@/api/routes/routesModel';
import { StatusCodes } from "http-status-codes";

import type { User } from "@/api/user/userModel";
import { UserRepository } from "@/api/user/userRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { embed } from "@/common/utils/embedding";


interface GetRoutesOptions {
    page?: number;
    limit?: number;
    departure_station_id?: number;
    arrival_station_id?: number;
    sortBy?: 'distance_km' | 'estimated_duration_hours' | 'created_at';
    order?: 'asc' | 'desc';
}
interface PaginatedResult<T> {
    results: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export class RouteService {
    private routeRepository: RouteRepository;

    constructor() {
        this.routeRepository = new RouteRepository();
    }

    // Lấy danh sách các tuyến đường với phân trang, tìm kiếm, sắp xếp
    async getAllRoutes(options: GetRoutesOptions): Promise<PaginatedResult<Routes>> {
        return await this.routeRepository.findAllAsync(options);
    }

    //Tao 1 tuyen duong moi
    async createRoutes(data: Omit<Routes, "id" | "created_at" | "updated_at">): Promise<ServiceResponse<Routes | null>> {
        try {
            const text = `Route from ${data.departure_station_id} to ${data.arrival_station_id}, distance ${data.distance_km}km, duration ${data.estimated_duration_hours}h`;
            const vector = await embed(text);
            const newRoutes = await this.routeRepository.createRoutesAsync({ ...(data as any), embedding: vector as number[] });
            return ServiceResponse.success<Routes>("Route created successfully", newRoutes, StatusCodes.CREATED);
        } catch (ex) {
            const errorMessage = `Error creating Route: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return ServiceResponse.failure("An error occurred while creating Route.", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
    //cap nhat tuyen duong
    // Cập nhật tuyến đường
    async updateRoutes(data: Omit<Routes, "id" | "created_at" | "updated_at">, id: number): Promise<ServiceResponse<Routes | null>> {
        try {
            // Gọi phương thức cập nhật trong repository
            let payload: Partial<Routes> = { ...(data as any) };
            const text = `Route from ${data.departure_station_id} to ${data.arrival_station_id}, distance ${data.distance_km}km, duration ${data.estimated_duration_hours}h`;
            const vector = await embed(text);
            (payload as any).embedding = vector as number[];
            const updatedRoute = await this.routeRepository.updateRoutesAsync(payload as any, id);

            if (!updatedRoute) {
                // Nếu không tìm thấy tuyến đường cần cập nhật
                return ServiceResponse.failure("Route not found.", null, StatusCodes.NOT_FOUND);
            }

            return ServiceResponse.success<Routes>("Route updated successfully", updatedRoute, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error updating Route: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return ServiceResponse.failure("An error occurred while updating Route.", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
    //xoa tuyen duong 
    async deleteRoutes(id: number): Promise<ServiceResponse<Routes | null>> {
        try {
            // Gọi phương thức xóa tuyến đường trong repository
            const deletedRoute = await this.routeRepository.deleteRoutesAsync(id);

            if (!deletedRoute) {
                // Nếu không tìm thấy tuyến đường cần xóa
                return ServiceResponse.failure("Route not found.", null, StatusCodes.NOT_FOUND);
            }

            // Nếu xóa thành công
            return ServiceResponse.success<Routes>("Route deleted successfully", deletedRoute, StatusCodes.OK);
        } catch (ex) {
            const errorMessage = `Error deleting Route: ${(ex as Error).message}`;
            logger.error(errorMessage);
            return ServiceResponse.failure("An error occurred while deleting Route.", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }


}
