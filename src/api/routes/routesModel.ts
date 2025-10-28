import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type Routes = z.infer<typeof RoutesSchema>;
export const RoutesSchema = z.object({
  id: z.number(),
  departure_station_id: z.number(),
  arrival_station_id: z.number(),
  distance_km: z.number(),
  estimated_duration_hours: z.number(),
  is_active: z.boolean(),
  embedding: z.array(z.number()).optional(),
  created_at: z.date(),
  updated_at: z.date(),
  // Station information from joins
  departure_name: z.string().optional(),
  departure_address: z.string().optional(),
  departure_city: z.string().optional(),
  departure_province: z.string().optional(),
  arrival_name: z.string().optional(),
  arrival_address: z.string().optional(),
  arrival_city: z.string().optional(),
  arrival_province: z.string().optional()
});

export const CreateRoutesSchema = z.object({
  body: z.object({
    departure_station_id: z.number(),
    arrival_station_id: z.number(),
    distance_km: z.number().min(0, "Khoảng cách phải >= 0"),
    estimated_duration_hours: z.number().min(0, "Thời gian phải >= 0"),
  }).refine(
    (data) => data.departure_station_id !== data.arrival_station_id,
    {
      path: ["arrival_station_id"], // chỉ ra lỗi nằm ở arrival_station_id
      message: "Điểm đi và điểm đến không được trùng nhau",
    }
  ),
});
export const PaginatedRoutesResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  responseObject: z.object({
    results: z.array(RoutesSchema),
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),

});

// Input Validation for 'GET users/:id' endpoint
export const GetRoutesSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});
