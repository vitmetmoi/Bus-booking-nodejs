import type { Request, RequestHandler, Response } from "express";
import { vehicleScheduleService } from "./vehicleSchedule.service";
import { StatusCodes } from "http-status-codes";

class VehicleScheduleController {
  public getSchedules: RequestHandler = async (req: Request, res: Response) => {
    try {
      const { route_id, bus_id, status, sortBy, limit, page, departure, destination, departureDate } = req.query;

      const filter = {
        route_id: route_id ? Number(route_id) : undefined,
        bus_id: bus_id ? Number(bus_id) : undefined,
        status: status ? String(status) : undefined,
        // New filters for vehicleSchedule
        departure: departure ? Number(departure) : undefined,
        destination: destination ? Number(destination) : undefined,
        departureDate: departureDate ? String(departureDate) : undefined,
      };

      const options = {
        sortBy: sortBy ? String(sortBy) : undefined,
        limit: limit ? Number(limit) : undefined,
        page: page ? Number(page) : undefined,
      };

      const serviceResponse = await vehicleScheduleService.findAll(filter, options);
      res.status(serviceResponse.statusCode).json(serviceResponse);
    } catch (error) {
      console.error("Lỗi trong getSchedules:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Lỗi máy chủ nội bộ." });
    }
  };

  public createSchedule: RequestHandler = async (req: Request, res: Response) => {
    try {
      const scheduleData = req.body;

      if (!scheduleData) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "Dữ liệu lịch trình là bắt buộc." });
        return;
      }

      const serviceResponse = await vehicleScheduleService.createSchedule(scheduleData);
      res.status(serviceResponse.statusCode).json(serviceResponse);
    } catch (error) {
      console.error("Lỗi trong createSchedule:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Lỗi máy chủ nội bộ." });
    }
  };

  public updateSchedule: RequestHandler = async (req: Request, res: Response) => {
    try {
      const id = Number.parseInt(req.params.id as string, 10);
      const scheduleData = req.body;

      const serviceResponse = await vehicleScheduleService.updateSchedule(id, scheduleData);
      res.status(serviceResponse.statusCode).json(serviceResponse);
    } catch (error) {
      console.error("Lỗi trong updateSchedule:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Lỗi máy chủ nội bộ." });
    }
  };

  public deleteSchedule: RequestHandler = async (req: Request, res: Response) => {
    try {
      const id = Number.parseInt(req.params.id as string, 10);

      const serviceResponse = await vehicleScheduleService.deleteSchedule(id);
      res.status(serviceResponse.statusCode).json(serviceResponse);
    } catch (error) {
      console.error("Lỗi trong deleteSchedule:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Lỗi máy chủ nội bộ." });
    }
  };
}

export const vehicleScheduleController = new VehicleScheduleController();