import type { Request, RequestHandler, Response } from "express";

import { carService } from "@/api/car/carService";
import { pick } from "@/common/utils/pick";
import { StatusCodes } from "http-status-codes";

class CarController {
  public getCars: RequestHandler = async (_req: Request, res: Response) => {
    const filter = pick(_req.query, ['name', 'license_plate']);
    const options = pick(_req.query, ['sortBy', 'limit', 'page']);
    const serviceResponse = await carService.findAll(filter, options);

    res.status(serviceResponse.statusCode).json(serviceResponse);
  };

  public getCar: RequestHandler = async (req: Request, res: Response) => {
    try {

      const id = Number.parseInt(req.params.id as string, 10);

      const serviceResponse = await carService.findById(id);
      res.status(serviceResponse.statusCode).send(serviceResponse);
    } catch (error) {
      console.error("Error:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "An error occurred while getting car.",
      });
    }
  };

  public deleteCar: RequestHandler = async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id as string, 10);
    const serviceResponse = await carService.delete(id);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  public createCar: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const carData = req.body;

    try {
      if (!carData) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "Car data is required." });
        return;
      }

      const response = await carService.createCar(carData);

      if (response.statusCode === StatusCodes.CREATED) {
        res.status(StatusCodes.CREATED).json({
          car: response.responseObject,
          message: response.message,
        });
      } else {
        res.status(response.statusCode).json({ message: response.message });
      }

    } catch (ex) {
      console.error("Error:", ex);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "An error occurred while creating car.",
      });
    }
  };

  public updateCar: RequestHandler = async (req: Request, res: Response) => {
    try {
      const id = Number.parseInt(req.params.id as string, 10);
      const carData = req.body;

      const serviceResponse = await carService.updateCar(id, carData);
      res.status(serviceResponse.statusCode).send(serviceResponse);
    } catch (error) {
      console.error("Error:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "An error occurred while updating car.",
      });
    }

  }

  public uploadFeaturedImage: RequestHandler = async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id as string, 10);
    // @ts-ignore multer adds file
    const file = req.file as Express.Multer.File | undefined;

    if (!file) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "No image uploaded" });
      return;
    }

    // Build public path to serve via /uploads
    const publicPath = `/uploads/car/${file.filename}`;

    const serviceResponse = await carService.updateCar(id, { featured_image: publicPath } as any);
    res.status(serviceResponse.statusCode).send({
      ...serviceResponse,
      featured_image: publicPath
    });
  }

  public generateSeatByCarId = async (req: Request, res: Response): Promise<void> => {
    const carId = Number(req.params.id);
    const seatData = req.body;

    try {
      const result = await carService.generateSeatByCarId(carId, seatData);
      res.status(result.statusCode).json({
        message: result.message,
        ...(result.responseObject && { seats: result.responseObject })
      });
    } catch (err) {
      console.error("Error:", err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Internal server error"
      });
    }
  };

  public PopularGarage: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await carService.PopularGarage();
    res.status(serviceResponse.statusCode).send(serviceResponse);
  }

  public getCarsByCompanyId: RequestHandler = async (req: Request, res: Response) => {
    try {
      const companyId = Number.parseInt(req.params.companyId as string, 10);
      const filter = pick(req.query, ['name', 'license_plate']);
      const options = pick(req.query, ['sortBy', 'limit', 'page']);

      // Add company_id to filter
      const filterWithCompany = { ...filter, company_id: companyId };

      const serviceResponse = await carService.findAll(filterWithCompany, options);
      res.status(serviceResponse.statusCode).json(serviceResponse);
    } catch (error) {
      console.error("Error:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "An error occurred while getting cars by company ID.",
      });
    }
  }
}

export const carController = new CarController();
