import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

//  Định nghĩa type cho BusCompany
export type BusCompany = z.infer<typeof BusCompanySchema>;

//  Schema tổng thể của BusCompany
export const BusCompanySchema = z.object({
  id: z.number(),
  company_name: z.string().nonempty("Tên nhà xe không được để trống"),
  image: z.string().optional(),
  descriptions: z.string().optional(),
  featured_image: z.string().url().optional().openapi({ example: "https://example.com/bus-company-featured.jpg" }),
  markdown_content: z.string().optional().openapi({ example: "# Nhà xe ABC\n\n## Thông tin chi tiết\n- Địa chỉ: 123 Đường ABC\n- Hotline: 0123456789" }),
  markdown_html: z.string().optional().openapi({ example: "<h1>Nhà xe ABC</h1><h2>Thông tin chi tiết</h2><ul><li>Địa chỉ: 123 Đường ABC</li><li>Hotline: 0123456789</li></ul>" }),
  embedding: z.array(z.number()).optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

//  Schema cho GET /bus-companies/:id
export const GetBusCompanySchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

//  Schema cho POST / PUT (tạo mới / cập nhật)
export const CreateBusCompanySchema = z.object({
  body: z.object({
    company_name: z.string().nonempty("Tên nhà xe không được để trống"),
    image: z.string().optional(),
    descriptions: z.string().optional(),
    featured_image: z.string().url().optional(),
    markdown_content: z.string().optional(),
    markdown_html: z.string().optional(),
  }),
});

export const UpdateBusCompanySchema = z.object({
  params: z.object({ id: commonValidations.id }),
  body: CreateBusCompanySchema.shape.body,
});

//  Schema cho phân trang, tìm kiếm và sắp xếp
export const BusCompanyQuerySchema = z.object({
  query: z.object({
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
      .describe("Tìm kiếm thông tin nhà xe theo tên nhà xe(company_name)"),

    sortBy: z
      .enum(["company_name", "created_at"])
      .default("company_name")
      .describe(
        "Sắp xếp kết quả theo các trường :\n" +
        "- name: Tên nhà xe\n" +
        "- create_at: Thời gian tạo mới nhà xe\n"
      ),
    order: z
      .enum(["asc", "desc"])
      .default("asc")
      .describe(
        "thứ tự 'tăng dần' hay 'giảm dần'\n"
      ),
  }),
});
