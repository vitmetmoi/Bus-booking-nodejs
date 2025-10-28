import { StatusCodes } from "http-status-codes";

import type { User } from "@/api/auth/authModel";
import { AuthRepository } from "@/api/auth/authRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import bcrypt from "bcrypt";
import * as crypto from "crypto";
import { sendResetEmail } from "@/common/utils/emailUtil";
import jwt from 'jsonwebtoken';

export class AuthService {
	private authRepository: AuthRepository;

	constructor(repository: AuthRepository = new AuthRepository()) {
		this.authRepository = repository;
	}

	// Retrieves a single user by their ID
	async findById(id: number): Promise<ServiceResponse<User | null>> {
		try {
			const user = await this.authRepository.findByIdAsync(id);
			if (!user) {
				return ServiceResponse.failure("Không tìm thấy người dùng", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success<User>("Người dùng đã tìm thấy", user);
		} catch (ex) {
			const errorMessage = `Lỗi tìm người dùng có id ${id}:, ${(ex as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Đã xảy ra lỗi khi tìm người dùng." + errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async register({ email, phone, password, age }: { email: string; phone: string; password: string; age: number }) {
		try {
			const existingUser = await this.authRepository.findOne({ email });
			if (existingUser) {
				return ServiceResponse.failure("Email đã tồn tại", null, StatusCodes.CONFLICT);
			}
			const hashedPassword = await bcrypt.hash(password, 10);
			await this.authRepository.createAsync({ email, phone, password: hashedPassword, age: 0 });

			return { statusCode: 201, message: "Người dùng đã đăng ký thành công" };
		} catch (error) {
			return ServiceResponse.failure("Đã xảy ra lỗi khi tìm người dùng." + error, null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async resetPassword(email: string) {
		const user = await this.authRepository.findOne({ email });
		if (!user) {
			return ServiceResponse.failure("Email không tồn tại", null, 404);
		}

		const token = crypto.randomBytes(32).toString("hex");
		const expiry = Date.now() + 1000 * 60 * 30; // 30 phút

		await this.authRepository.updateResetToken(email, token, expiry);

		const link = `http://localhost:5000/reset-password?token=${token}`;
		await sendResetEmail(email, link);

		return ServiceResponse.success("Link đặt lại mật khẩu đã được gửi qua email", null, 200);
	}

	async confirmResetPassword(token: string, newPassword: string) {
		try {
			const user = await this.authRepository.findByResetToken(token);
			if (!user || user.reset_token_expiry! < Date.now()) {
				return ServiceResponse.failure("Token không hợp lệ hoặc đã hết hạn", null, 400);
			}

			const hashed = await bcrypt.hash(newPassword, 10);
			await this.authRepository.resetPasswordByToken(token, hashed);
			return ServiceResponse.success("Mật khẩu đã được đặt lại thành công", null, 200);
		} catch (error) {
			throw new Error("Đã xảy ra lỗi khi đặt lại mật khẩu: " + (error as Error).message);
		}
	}

	async logout(token: string) {
		try {
			const decoded = jwt.decode(token) as { exp?: number };
			if (!decoded?.exp) throw new Error("Invalid token");

			const expiresAt = decoded.exp * 1000; // convert to ms
			await this.authRepository.addTokenToBlacklist(token, expiresAt);
		} catch (error) {
			throw new Error("Token không hợp lệ hoặc đã hết hạn");
		}
	}

	async isTokenBlacklisted(token: string) {
		return await this.authRepository.isTokenBlacklisted(token);
	}
}

export const authService = new AuthService();
