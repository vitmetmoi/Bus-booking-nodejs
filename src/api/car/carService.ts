import { StatusCodes } from "http-status-codes";

import type { Car } from "@/api/car/carModel";
import { CarRepository } from "@/api/car/carRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { json } from "express";
import {
	GenerateSeatsDto,
} from "@/api/car/carModel";
import { embed } from "@/common/utils/embedding";

export class CarService {
	private carRepository: CarRepository;

	constructor(repository: CarRepository = new CarRepository()) {
		this.carRepository = repository;
	}

	async findAll(filter: any, options: any) {
		try {
			const result = await this.carRepository.findAll(filter, options);
			return ServiceResponse.success("Xe buýt đã được lấy thành công", result);
		} catch (error) {
			return ServiceResponse.failure("Không thể lấy xe buýt" + error, null);
		}
	}

	async findCarsByCompanyId(companyId: number, filter: any, options: any) {
		try {
			const filterWithCompany = { ...filter, company_id: companyId };
			const result = await this.carRepository.findAll(filterWithCompany, options);
			return ServiceResponse.success("Xe buýt của nhà xe đã được lấy thành công", result);
		} catch (error) {
			return ServiceResponse.failure("Không thể lấy xe buýt của nhà xe: " + error, null);
		}
	}

	// Retrieves a single Car by their ID
	async findById(id: number): Promise<ServiceResponse<Car | null>> {
		try {
			const Car = await this.carRepository.findByIdAsync(id);
			if (!Car) {
				return ServiceResponse.failure("Không tìm thấy xe", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<Car>("Xe đã tìm thấy", Car);
		} catch (ex) {
			const errorMessage = `Lỗi khi tìm Xe có ID ${id}:, ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Đã xảy ra lỗi khi tìm xe." + errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Deletes a Car by their ID
	async delete(id: number): Promise<ServiceResponse<Car | null>> {
		try {
			const car = await this.carRepository.findByIdAsync(id);
			if (!car) {
				return ServiceResponse.failure("Không tìm thấy xe", null, StatusCodes.NOT_FOUND);
			}

			await this.carRepository.deleteAsync(id);
			return ServiceResponse.success<Car>("Xe đã xóa", car);
		} catch (ex) {
			const errorMessage = `Lỗi khi xóa Xe có ID ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Đã xảy ra lỗi khi xóa Car." + errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// async createCar(data: Omit<Car, "id" | "created_at" | "updated_at">): Promise<ServiceResponse<Car | null>> {
	// 	try {
	// 		const newCar = await this.carRepository.createCarAsync(data);

	// 		return ServiceResponse.success<Car>("Car created successfully", newCar, StatusCodes.CREATED);
	// 	} catch (ex) {
	// 		const errorMessage = `Error creating car: ${(ex as Error).message}`;
	// 		console.error("Full error object:", ex);
	// 		logger.error(errorMessage);
	// 		return ServiceResponse.failure("An error occurred while creating car.", null, StatusCodes.INTERNAL_SERVER_ERROR);
	// 	}
	// }

	async createCar(data: Omit<Car, "id" | "created_at" | "updated_at">): Promise<ServiceResponse<Car | null>> {
		try {
			// Kiểm tra xem đã có xe trùng tên chưa
			const existingCar = await this.carRepository.findByNameAsync(data.name);
			if (existingCar) {
				return ServiceResponse.failure(
					`Xe có tên ${data.name} đã tồn tại.`,
					null,
					StatusCodes.CONFLICT
				);
			}

			// Tạo xe mới nếu không bị trùng tên
			const text = [data.name, data.description ?? "", data.license_plate].filter(Boolean).join(". ");
			const vector = await embed(text);
			const newCar = await this.carRepository.createCarAsync({ ...data, embedding: vector as number[] });
			return ServiceResponse.success<Car>(
				"Xe đã được tạo thành công",
				newCar,
				StatusCodes.CREATED
			);
		} catch (ex) {
			const errorMessage = `Error creating car: ${(ex as Error).message}`;
			console.error("Full error object:", ex);
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"Đã xảy ra lỗi khi tạo xe.",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR
			);
		}
	}


	async updateCar(id: number, data: Partial<Car>): Promise<ServiceResponse<Car | null>> {
		try {
			const car = await this.carRepository.findByIdAsync(id);

			if (!car) {
				return ServiceResponse.failure("Không tìm thấy xe", null, StatusCodes.NOT_FOUND);
			}

			let payload: Partial<Car> = { ...data };
			if (data.name || data.description || data.license_plate) {
				const text = [data.name, data.description, data.license_plate].filter(Boolean).join(". ");
				if (text) {
					const vector = await embed(text);
					(payload as any).embedding = vector as number[];
				}
			}
			const updatedCar = await this.carRepository.updateAsync(id, payload);

			if (!updatedCar) {
				return ServiceResponse.failure("Không cập nhật được xe", null, StatusCodes.BAD_REQUEST);
			}

			return ServiceResponse.success<Car>("Xe đã được cập nhật", updatedCar);
		} catch (ex) {
			const errorMessage = `Lỗi khi cập nhật Xe có ${id}: ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Đã xảy ra lỗi khi cập nhật Car.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async generateSeatByCarId(
		carId: number,
		payload: GenerateSeatsDto
	): Promise<ServiceResponse<any>> {
		const car = await this.carRepository.findByIdAsync(carId);
		if (!car) {
			return ServiceResponse.failure("Không tìm thấy xe", null, StatusCodes.NOT_FOUND);
		}

		const exists = await this.carRepository.existingSeats(carId);
		if (exists) {
			return ServiceResponse.failure("Ghế đã có sẵn", null, StatusCodes.CONFLICT);
		}

		// 👇 Tính tổng số ghế cấu hình
		const totalSeats = payload.seat_config.reduce((sum, config) => sum + config.quantity, 0);

		// 👇 So sánh với capacity
		if (totalSeats !== car.capacity) {
			return ServiceResponse.failure(
				`Cấu hình ghế không khớp: dự kiến ${car.capacity} ghế nhưng đã có ${totalSeats}`,
				null,
				StatusCodes.BAD_REQUEST
			);
		}

		let seatNumber = 1;
		const now = new Date();
		const seatsToInsert = [];

		for (const config of payload.seat_config) {
			for (let i = 0; i < config.quantity; i++) {
				seatsToInsert.push({
					bus_id: carId,
					seat_number: `S${seatNumber++}`,
					seat_type: config.seat_type,
					price_for_type_seat: config.price,
					status: "AVAILABLE",
					created_at: now,
					updated_at: now
				});
			}
		}

		await this.carRepository.insertSeats(seatsToInsert);
		return ServiceResponse.success("Ghế đã được tạo thành công", seatsToInsert);
	}


	async PopularGarage(): Promise<ServiceResponse<Car[] | null>> {
		try {
			const car = await this.carRepository.getTopBusCompanies();
			if (!car) {
				return ServiceResponse.failure("Không tìm thấy xe", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success("Các công ty xe buýt hàng đầu đã được khôi phục thành công", car);
		} catch (ex) {
			return ServiceResponse.failure("Đã xảy ra lỗi khi tìm Xe.", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const carService = new CarService();
