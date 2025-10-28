// src/middlewares/busCompanyUploadMiddleware.ts
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";

// Định nghĩa nơi lưu trữ file cho bus company
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "src/public/uploads/bus_company/"); // Thư mục lưu trữ file cho bus company
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

// Kiểm tra định dạng file
const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Chỉ chấp nhận file ảnh (JPEG, PNG, JPG)"));
    }
};

export const busCompanyUpload = multer({ storage, fileFilter });
