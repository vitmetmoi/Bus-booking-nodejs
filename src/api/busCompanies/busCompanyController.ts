import type { RequestHandler } from "express";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { busCompanyService } from "./busCompanyService";

class BusCompanyController {
  public getCompanies: RequestHandler = async (req, res) => {
    const { page, limit, search, sortBy, order } = req.query;
    const response = await busCompanyService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
      search as string,
      sortBy as string,
      order as string
    );
    res.status(response.statusCode).send(response);
  };

  public getCompany: RequestHandler = async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) throw new Error("ID không hợp lệ");

      const response = await busCompanyService.findById(id);
      res.status(response.statusCode).send(response);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
      res.status(400).send({ message: errorMessage });
    }
  };

  public createCompany: RequestHandler = async (req, res) => {
    try {
      const { company_name, descriptions } = req.body;

      // Thay đổi cách lấy file:
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const imageFile = files["image"] ? files["image"][0] : undefined;

      // Tạo đường dẫn đầy đủ cho ảnh
      const imagePath = imageFile ? `/uploads/bus_company/${imageFile.filename}` : undefined;
      console.log('bus', imagePath)
      const newbusCompany = {
        company_name,
        descriptions,
        image: imagePath,
      };

      const serviceResponse = await busCompanyService.create(newbusCompany);
      res.status(serviceResponse.statusCode).send(serviceResponse);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
      res.status(500).send({ message: errorMessage });
    }
  };

  public updateCompany: RequestHandler = async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) throw new Error("ID không hợp lệ");

      const { company_name, descriptions, markdown_content, markdown_html } = req.body;

      // Xử lý file ảnh nếu có
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const imageFile = files["image"] ? files["image"][0] : undefined;

      // Tạo đường dẫn đầy đủ cho ảnh nếu có file mới
      const imagePath = imageFile ? `/uploads/bus_company/${imageFile.filename}` : undefined;

      const updateData: any = {
        company_name,
        descriptions,
        markdown_content,
        markdown_html,

      };

      // Chỉ cập nhật image nếu có file mới
      if (imagePath) {
        updateData.image = imagePath;
      }

      const response = await busCompanyService.update(id, updateData);
      res.status(response.statusCode).send(response);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
      res.status(400).send({ message: errorMessage });
    }
  };

  public deleteCompany: RequestHandler = async (req, res) => {
    const id = Number(req.params.id);
    const response = await busCompanyService.delete(id);
    res.status(response.statusCode).send(response);
  };

  public uploadFeaturedImage: RequestHandler = async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id as string, 10);
    // @ts-ignore multer adds file
    const file = req.file as Express.Multer.File | undefined;

    if (!file) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "No image uploaded" });
      return;
    }

    // Build public path to serve via /uploads
    const publicPath = `/uploads/bus_company/${file.filename}`;

    const serviceResponse = await busCompanyService.update(id, { featured_image: publicPath } as any);
    res.status(serviceResponse.statusCode).send({
      ...serviceResponse,
      featured_image: publicPath
    });
  };
}

export const busCompanyController = new BusCompanyController();
