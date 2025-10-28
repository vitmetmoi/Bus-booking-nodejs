// src/controllers/station.controller.ts
import type { Request, RequestHandler, Response } from "express";
import { stationService } from "@/api/station/stationService";


class StationController {
  public getStations: RequestHandler = async (req, res) => {
    try {
      const { page, limit, search, sortBy, order } = req.query;
      const serviceResponse = await stationService.findAll(
        Number(page) || 1,
        Number(limit) || 10,
        search as string,
        sortBy as string,
        order as string
      );
      res.status(serviceResponse.statusCode).send(serviceResponse);
    } catch (error) {
      res.status(500).send({ message: "Lỗi khi lấy danh sách bến xe", error });
    }
  };

  public getStation: RequestHandler = async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) throw new Error("ID không hợp lệ");

      const serviceResponse = await stationService.findById(id);
      res.status(serviceResponse.statusCode).send(serviceResponse);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
      res.status(400).send({ message: errorMessage });
    }
  };

  // public createStation: RequestHandler = async (req, res) => {
  //   try {
  //     const { name, descriptions, location } = req.body;

  //     // Thay đổi cách lấy file:
  //     const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  //     // const image = files["image"] ? files["image"][0]?.path : undefined;
  //     // const wallpaper = files["wallpaper"] ? files["wallpaper"][0]?.path : undefined;

  //     const image = files["image"] ? files["image"][0]?.filename : undefined;
  //     const wallpaper = files["wallpaper"] ? files["wallpaper"][0]?.filename : undefined;


  //     // console.log(image);
  //     // console.log(wallpaper);


  //     const newStation = {
  //       name,
  //       descriptions,
  //       location,
  //       image,
  //       wallpaper,
  //     };

  //     const serviceResponse = await stationService.create(newStation);
  //     res.status(serviceResponse.statusCode).send(serviceResponse);
  //   } catch (error: unknown) {
  //     const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
  //     res.status(500).send({ message: errorMessage });
  //   }
  // };
  public createStation: RequestHandler = async (req, res) => {
    try {
      const { name, descriptions, location } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      let image: string | undefined;
      let wallpaper: string | undefined;

      // Xử lý ảnh đại diện - tạo đường dẫn đầy đủ
      if (files["image"] && files["image"][0]) {
        const imageFile = files["image"][0];
        image = `/uploads/station/image/${imageFile.filename}`;
      }

      // Xử lý ảnh nền - tạo đường dẫn đầy đủ
      if (files["wallpaper"] && files["wallpaper"][0]) {
        const wallpaperFile = files["wallpaper"][0];
        wallpaper = `/uploads/station/wallpaper/${wallpaperFile.filename}`;
      }

      const newStation = {
        name,
        descriptions,
        location,
        image,
        wallpaper,
      };

      const serviceResponse = await stationService.create(newStation);
      res.status(serviceResponse.statusCode).send(serviceResponse);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
      res.status(500).send({ message: errorMessage });
    }
  };

  public updateStation: RequestHandler = async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) throw new Error("ID không hợp lệ");

      const { name, descriptions, location } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      const updateData: any = {
        name,
        descriptions,
        location,
      };

      // Xử lý ảnh đại diện - chỉ cập nhật nếu có file mới
      if (files["image"] && files["image"][0]) {
        const imageFile = files["image"][0];
        updateData.image = `/uploads/station/image/${imageFile.filename}`;
      }

      // Xử lý ảnh nền - chỉ cập nhật nếu có file mới
      if (files["wallpaper"] && files["wallpaper"][0]) {
        const wallpaperFile = files["wallpaper"][0];
        updateData.wallpaper = `/uploads/station/wallpaper/${wallpaperFile.filename}`;
      }

      const serviceResponse = await stationService.update(id, updateData);
      res.status(serviceResponse.statusCode).send(serviceResponse);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
      res.status(400).send({ message: errorMessage });
    }
  };

  public deleteStation: RequestHandler = async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) throw new Error("ID không hợp lệ");

      const serviceResponse = await stationService.delete(id);
      res.status(serviceResponse.statusCode).send(serviceResponse);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
      res.status(400).send({ message: errorMessage });
    }
  };
}

export const stationController = new StationController();
