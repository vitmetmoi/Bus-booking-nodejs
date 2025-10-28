import { StatusCodes } from "http-status-codes";
import type { BusCompany } from "./busCompanyModel";
import { BusCompanyRepository } from "./busCompanyRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { embed } from "@/common/utils/embedding";

export class BusCompanyService {
  private repository = new BusCompanyRepository();

  // Lấy danh sách nhà xe
  async findAll(
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    order?: string
  ): Promise<ServiceResponse<BusCompany[] | null>> {
    try {
      const data = await this.repository.findAllAsync(page, limit, search, sortBy, order);

      if (!data || data.length === 0) {
        return ServiceResponse.failure("Không tìm thấy nhà xe nào", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success("Danh sách nhà xe", data);
    } catch (error) {
      logger.error(`Lỗi lấy danh sách nhà xe: ${(error as Error).message}`);
      console.log(error);
      return ServiceResponse.failure("Lỗi hệ thống", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Lấy chi tiết theo ID
  async findById(id: number): Promise<ServiceResponse<BusCompany | null>> {
    try {
      const company = await this.repository.findByIdAsync(id);
      if (!company) {
        return ServiceResponse.failure("Không tìm thấy nhà xe", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success("Thông tin nhà xe", company);
    } catch (error) {
      logger.error(`Lỗi lấy nhà xe ID ${id}: ${(error as Error).message}`);
      return ServiceResponse.failure("Lỗi hệ thống", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Tạo mới
  async create(data: Omit<BusCompany, "id">): Promise<ServiceResponse<number | null>> {
    try {
      const text = [data.company_name, data.descriptions ?? ""].filter(Boolean).join(". ");
      const vector = await embed(text);
      const newId = await this.repository.createAsync({ ...data, embedding: vector as number[] });
      return ServiceResponse.success("Tạo nhà xe thành công", newId);
    } catch (error) {
      logger.error(`Lỗi tạo nhà xe: ${(error as Error).message}`);
      return ServiceResponse.failure("Lỗi hệ thống", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Cập nhật
  async update(id: number, data: Partial<BusCompany>): Promise<ServiceResponse<boolean>> {
    try {
      let payload: Partial<BusCompany> = { ...data };
      if (data.company_name || data.descriptions) {
        const text = [data.company_name, data.descriptions].filter(Boolean).join(". ");
        if (text) {
          const vector = await embed(text);
          payload.embedding = vector as number[];
        }
      }
      const updated = await this.repository.updateAsync(id, payload);
      if (!updated) {
        return ServiceResponse.failure("Không tìm thấy hoặc không thể cập nhật nhà xe", false, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success("Cập nhật thành công", true);
    } catch (error) {
      logger.error(`Lỗi cập nhật nhà xe ID ${id}: ${(error as Error).message}`);
      return ServiceResponse.failure("Lỗi hệ thống", false, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Xóa
  async delete(id: number): Promise<ServiceResponse<boolean>> {
    try {
      // Kiểm tra xem nhà xe có tồn tại không
      const existingCompany = await this.repository.findByIdAsync(id);
      if (!existingCompany) {
        return ServiceResponse.failure("Nhà xe không tồn tại", false, StatusCodes.NOT_FOUND);
      }

      // Kiểm tra các bản ghi phụ thuộc
      const dependencies = await this.repository.checkDependentRecords(id);

      let warningMessage = "";
      if (dependencies.cars > 0 || dependencies.revenue > 0 || dependencies.totalRelatedRecords > 0) {
        const dependentItems = [];
        if (dependencies.cars > 0) {
          dependentItems.push(`${dependencies.cars} xe`);
        }
        if (dependencies.revenue > 0) {
          dependentItems.push(`${dependencies.revenue} bản ghi doanh thu`);
        }
        if (dependencies.totalRelatedRecords > 0) {
          dependentItems.push(`${dependencies.totalRelatedRecords} bản ghi liên quan khác (lịch trình, ghế, đánh giá, vé)`);
        }
        warningMessage = ` Đã xóa kèm theo ${dependentItems.join(", ")}.`;
      }

      const deleted = await this.repository.deleteAsync(id);
      if (!deleted) {
        return ServiceResponse.failure("Không thể xóa nhà xe", false, StatusCodes.INTERNAL_SERVER_ERROR);
      }

      return ServiceResponse.success(`Xóa nhà xe thành công.${warningMessage}`, true);
    } catch (error) {
      console.log(`Lỗi xóa nhà xe ID ${id}: ${(error as Error).message}`);
      return ServiceResponse.failure("Lỗi hệ thống", false, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export const busCompanyService = new BusCompanyService();
