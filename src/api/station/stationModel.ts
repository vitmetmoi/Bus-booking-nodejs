import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type Station = z.infer<typeof StationSchema>;
export const StationSchema = z.object({
  id: z.number(),
  name: z.string().nonempty("Tên bến xe không được để trống"),
  image: z.string().url().optional(),
  wallpaper: z.string().url().optional(),
  descriptions: z.string().optional(),
  location: z.string().nonempty("Vị trí bến xe không được để trống"),
  embedding: z.array(z.number()).optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

// Schema cho endpoint GET /stations/:id
export const GetStationSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

// Schema cho Create và Update
export const CreateStationSchema = z.object({
  body: z.object({
    name: z.string().nonempty("Tên bến xe không được để trống"),
    image: z.string().url().optional(),
    wallpaper: z.string().url().optional(),
    descriptions: z.string().optional(),
    location: z.string().nonempty("Vị trí bến xe không được để trống"),
  }),
});

export const UpdateStationSchema = z.object({
  params: z.object({ id: commonValidations.id }),
  body: z.object({
    name: z.string().nonempty("Tên bến xe không được để trống"),
    image: z.string().url().optional(),
    wallpaper: z.string().url().optional(),
    descriptions: z.string().optional(),
    location: z.string().nonempty("Vị trí bến xe không được để trống"),
  }),
});

// Schema cho phân trang, tìm kiếm và sắp xếp
export const StationQuerySchema = z.object({
  query: z.object({
    // page: z.coerce.number().min(1).default(1),
    // limit: z.coerce.number().min(1).default(10),
    // search: z.string().optional(),
    // sortBy: z.enum(["name", "location", "created_at"]).default("name"),
    // order: z.enum(["asc", "desc"]).default("asc"),

    page: z
      .coerce.number()
      .min(1)
      .default(1)
      .describe("Số trang hiện tại (bắt đầu từ 1), dùng để phân trang"),

    limit: z
      .coerce.number()
      .min(1)
      .default(10)
      .describe("Số lượng bản ghi trên mỗi trang, dùng để phân trang"),

    search: z
      .string()
      .optional()
      .describe("Tìm kiếm thông tin bến xe theo tên bến xe(name), địa chỉ(location)"),

    sortBy: z
      .enum(["name", "location", "created_at"])
      .default("name")
      .describe(
        "Sắp xếp kết quả theo các trường :\n" +
        "- name: Tên bến xe\n" +
        "- location: Vị trí\n" +
        "- create_at: Thời gian tạo mới bến xe\n"
      ),
    order: z
      .enum(["asc", "desc"])
      .default("asc")
      .describe(
        "thứ tự 'tăng dần' hay 'giảm dần'\n"
      ),
  }),
});
