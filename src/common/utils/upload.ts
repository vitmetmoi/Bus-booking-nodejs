


import { v2 as cloudinary } from "cloudinary";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const uploadImage = async (filePath: string): Promise<string | null> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "test_uploads",
    });
    console.log("Upload successful:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error("Upload failed:", error);
    return null;
  }
};

// (Tuỳ chọn) test trực tiếp khi chạy file này
if (require.main === module) {
  const uploadDir = path.join(__dirname, '../../public/uploads');
  const imagePath = path.join(uploadDir, "../uploads/1747580637646-employee-1 - Copy.png");
  uploadImage(imagePath);
}
