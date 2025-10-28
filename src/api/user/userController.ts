import type { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { userService } from "@/api/user/userService";
import { pick } from "@/common/utils/pick";

class UserController {

	public getUsers: RequestHandler = async (_req: Request, res: Response) => {
		const filter = pick(_req.query, ['email']);
		const options = pick(_req.query, ['sortBy', 'limit', 'page']);
		const serviceResponse = await userService.findAll(filter, options);

		res.status(serviceResponse.statusCode).json(serviceResponse);
	};

	public getUser: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await userService.findById(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public createUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
		const userData = req.body;
		try {
			if (!userData) {
				res.status(StatusCodes.BAD_REQUEST).json({ message: "User data is required." });
				return;
			}

			const response = await userService.createUser(userData);

			if (response.statusCode === StatusCodes.CREATED) {
				res.status(StatusCodes.CREATED).json({
					user: response.responseObject,

					message: response.message,
				});

			} else {
				res.status(response.statusCode).json({ message: response.message });
			}
		} catch (ex) {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: "An error occurred while creating user.",
			});
		}
	};

	public updateUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
		const id = Number.parseInt(req.params.id as string, 10);
		const userData = req.body;

		try {
			if (!userData) {
				res.status(StatusCodes.BAD_REQUEST).json({ message: "User data is required." });
				return;
			}

			const response = await userService.update(id, userData);

			if (response.statusCode === StatusCodes.OK) {
				res.status(StatusCodes.OK).json({
					user: response.responseObject,
					message: response.message,
				});
			} else {
				res.status(response.statusCode).json({ message: response.message });
			}
		} catch (ex) {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: "An error occurred while updating user.",
			});
		}
	};

	public deleteUser: RequestHandler = async (req, res) => {
		const id = Number(req.params.id);
		const serviceResponse = await userService.delete(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

}

export const userController = new UserController();
