// src/middlewares/stationUploadMiddleware.ts
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";

// Định nghĩa nơi lưu trữ file cho station
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Xác định thư mục dựa trên fieldname
        let uploadPath: string;

        if (file.fieldname === 'image') {
            uploadPath = "src/public/uploads/station/image/"; // Thư mục cho ảnh đại diện
        } else if (file.fieldname === 'wallpaper') {
            uploadPath = "src/public/uploads/station/wallpaper/"; // Thư mục cho ảnh nền
        } else {
            uploadPath = "src/public/uploads/station/"; // Thư mục mặc định
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        // Chuẩn hoá đuôi file theo MIME type để tránh lưu .jfif
        const mimeToExt: Record<string, string> = {
            "image/jpeg": ".jpg",
            "image/jpg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
            "image/pjpeg": ".jpg",
        };
        const normalizedExt = mimeToExt[file.mimetype] || path.extname(file.originalname) || ".jpg";
        const fileName = `${uniqueSuffix}${normalizedExt.toLowerCase()}`;
        cb(null, fileName);
    },
});

// Kiểm tra định dạng file
const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Chỉ chấp nhận file ảnh (JPEG, PNG, JPG, WEBP)"));
    }
};

// Cấu hình multer với giới hạn kích thước file
export const stationUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 2 // Maximum 2 files (image + wallpaper)
    }
});
