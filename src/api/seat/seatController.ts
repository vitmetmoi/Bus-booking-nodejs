import type { Request, RequestHandler, Response } from "express";

import { seatService } from "@/api/seat/seatService";

class SeatController {
	public getSeats: RequestHandler = async (_req: Request, res: Response) => {
		const serviceResponse = await seatService.findAll();
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public getSeat: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		console.log(id);
		
		const serviceResponse = await seatService.findSeatsByBusId(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};

	public deleteSeat: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await seatService.deleteSeatsByBusId(id);
		res.status(serviceResponse.statusCode).send(serviceResponse);
	};
}

export const seatController = new SeatController();
