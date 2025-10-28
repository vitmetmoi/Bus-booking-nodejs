import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

// Storage for car featured images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "src/public/uploads/car/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

// Accept only image files
const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed (JPEG, PNG, JPG, WEBP)"));
    }
};

export const carUpload = multer({ storage, fileFilter });



