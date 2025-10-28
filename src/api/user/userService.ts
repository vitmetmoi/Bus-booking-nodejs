import { StatusCodes } from "http-status-codes";

import type { User } from "@/api/user/userModel";
import { UserRepository } from "@/api/user/userRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

export class UserService {
	private userRepository: UserRepository;

	constructor(repository: UserRepository = new UserRepository()) {
		this.userRepository = repository;
	}

	// Retrieves all users from the database
	async findAll(filter: any, options: any) {
		try {
			const result = await this.userRepository.findAllAsync(filter, options);
			return ServiceResponse.success("Người dùng đã được tải thành công", result);
		} catch (error) {
			return ServiceResponse.failure(`Không thể tìm nạp người dùng${error}`, null);
		}
	}

	// Retrieves a single user by their ID
	async findById(id: number): Promise<ServiceResponse<User | null>> {
		try {
			const user = await this.userRepository.findByIdAsync(id);
			if (!user) {
				return ServiceResponse.failure("Không tìm thấy người dùng", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<User>("Người dùng đã tìm thấy", user);
		} catch (ex) {
			const errorMessage = `Lỗi tìm người dùng có id ${id}:, ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(`Đã xảy ra lỗi khi tìm kiếm người dùng: ${errorMessage}`, null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async createUser(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<ServiceResponse<User | null>> {
		try {
			const newUser = await this.userRepository.createUserAsync(data);
			return ServiceResponse.success<User>("Người dùng đã được tạo thành công", newUser, StatusCodes.CREATED);
		} catch (ex) {
			const errorMessage = `Lỗi khi tạo người dùng: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(`Đã xảy ra lỗi khi tạo người dùng: ${errorMessage}`, null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async update(id: number, data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>): Promise<ServiceResponse<User | null>> {
		try {
			const updatedUser = await this.userRepository.updateAsync(id, data);

			if (!updatedUser) {
				return ServiceResponse.failure("Người dùng không tồn tại hoặc không thể cập nhật", null, StatusCodes.NOT_FOUND);
			}

			return ServiceResponse.success<User>("Người dùng đã được cập nhật thành công", updatedUser);
		} catch (error: any) {
			const errorMessage = `Lỗi khi cập nhật người dùng ${id}: ${error.message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(`Đã xảy ra lỗi khi cập nhật người dùng: ${errorMessage}`, null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async delete(id: number): Promise<ServiceResponse<boolean>> {
		try {
			const isDeleted = await this.userRepository.deleteAsync(id);

			if (!isDeleted) {
				return ServiceResponse.failure("Người dùng không tồn tại hoặc không thể xóa", false, StatusCodes.NOT_FOUND);
			}

			return ServiceResponse.success<boolean>("Người dùng đã bị xóa thành công", true);
		} catch (error: any) {
			const errorMessage = `Lỗi khi xóa người dùng ${id}: ${error.message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(errorMessage, false);
		}
	}

}



export const userService = new UserService();
