import { StatusCodes } from "http-status-codes";
import type { VehicleSchedule } from "./vehicleSchedule.model";
import { VehicleScheduleRepository } from "./vehicleSchedule.repository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

export class VehicleScheduleService {
  private vehicleScheduleRepository: VehicleScheduleRepository;

  constructor(repository: VehicleScheduleRepository = new VehicleScheduleRepository()) {
    this.vehicleScheduleRepository = repository;
  }

  // Hiển thị tất cả lịch trình xe
  async findAll(
    filter: { route_id?: number; bus_id?: number; status?: string; departure?: number; destination?: number; departureDate?: string },
    options: { sortBy?: string; limit?: number; page?: number }
  ): Promise<ServiceResponse<any>> {
    try {
      const result = await this.vehicleScheduleRepository.findAll(filter, options);
      return ServiceResponse.success("Lấy danh sách lịch trình xe thành công", result);
    } catch (ex) {
      logger.error(`Lỗi khi tìm lịch trình xe: ${(ex as Error).message}`);
      return ServiceResponse.failure("Không thể lấy danh sách lịch trình xe", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Thêm mới lịch trình xe
  async createSchedule(
    data: Omit<VehicleSchedule, "id" | "created_at" | "updated_at">
  ): Promise<ServiceResponse<VehicleSchedule | null>> {
    try {
      const newSchedule = await this.vehicleScheduleRepository.createAsync(data);
      console.log("DEBUG: newSchedule created", newSchedule);
      return ServiceResponse.success(" Tạo lịch trình xe thành công", newSchedule, StatusCodes.CREATED);
    } catch (ex) {
      const errorMessage = (ex as Error).message;
      logger.error(`Lỗi khi tạo lịch trình xe: ${errorMessage}`);

      if (errorMessage.includes("Schedule conflict")) {
        return ServiceResponse.failure(
          "Xung đột lịch trình: Xe buýt đã có lịch trình vào thời gian này.",
          null,
          StatusCodes.CONFLICT
        );
      }

      if (errorMessage.includes("Số ghế có sẵn không được vượt quá tổng số ghế của xe buýt")) {
        return ServiceResponse.failure(
          errorMessage,
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      if (errorMessage.includes("Không tìm thấy xe buýt")) {
        return ServiceResponse.failure("Không tìm thấy xe buýt", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.failure("Không tạo được lịch trình xe", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Cập nhật lịch trình xe
  async updateSchedule(
    id: number,
    data: Partial<VehicleSchedule>
  ): Promise<ServiceResponse<VehicleSchedule | null>> {
    try {
      const schedule = await this.vehicleScheduleRepository.findByIdAsync(id);
      if (!schedule) {
        return ServiceResponse.failure("Không tìm thấy lịch trình xe", null, StatusCodes.NOT_FOUND);
      }

      const updatedSchedule = await this.vehicleScheduleRepository.updateAsync(id, data);
      if (!updatedSchedule) {
        return ServiceResponse.failure("Không cập nhật được lịch trình xe", null, StatusCodes.BAD_REQUEST);
      }

      return ServiceResponse.success("Lịch trình xe được cập nhật thành công", updatedSchedule);
    } catch (ex) {
      const errorMessage = (ex as Error).message;
      logger.error(`Lỗi khi cập nhật lịch trình xe với id ${id}: ${errorMessage}`);

      if (errorMessage.includes("Schedule conflict")) {
        return ServiceResponse.failure(
          "Xung đột lịch trình: Xe buýt đã có lịch trình vào thời gian này.",
          null,
          StatusCodes.CONFLICT
        );
      }

      if (errorMessage.includes("Số ghế có sẵn không được vượt quá tổng số ghế của xe buýt")) {
        return ServiceResponse.failure(
          errorMessage,
          null,
          StatusCodes.BAD_REQUEST
        );
      }

      if (errorMessage.includes("Không tìm thấy xe buýt")) {
        return ServiceResponse.failure("Không tìm thấy xe buýt", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.failure("Không cập nhật được lịch trình xe", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Xóa lịch trình xe
  async deleteSchedule(id: number): Promise<ServiceResponse<VehicleSchedule | null>> {
    try {
      const schedule = await this.vehicleScheduleRepository.findByIdAsync(id);
      if (!schedule) {
        return ServiceResponse.failure("Không tìm thấy lịch trình xe", null, StatusCodes.NOT_FOUND);
      }

      const deletedSchedule = await this.vehicleScheduleRepository.deleteAsync(id);
      return ServiceResponse.success("Lịch trình xe xóa thành công", deletedSchedule);
    } catch (ex) {
      logger.error(`Lỗi khi xóa lịch trình xe có id ${id}: ${(ex as Error).message}`);
      return ServiceResponse.failure("Không xóa được lịch trình xe", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export const vehicleScheduleService = new VehicleScheduleService();