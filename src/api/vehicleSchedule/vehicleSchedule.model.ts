import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

const ScheduleStatusEnum = z.enum(["AVAILABLE", "FULL", "CANCELLED"]);

export type VehicleSchedule = z.infer<typeof VehicleScheduleSchema>;

export const VehicleScheduleSchema = z.object({
  id: z.number().int().optional(),
  route_id: z.number().int().optional(),
  bus_id: z.number().int().optional(),
  departure_time: z.coerce.date().optional(),
  status: ScheduleStatusEnum.optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const CreateVehicleScheduleBodySchema = VehicleScheduleSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  route_id: z.number().int(),
  bus_id: z.number().int(),
  departure_time: z.coerce.date(),
});

export const CreateVehicleScheduleSchema = z.object({
  body: CreateVehicleScheduleBodySchema,
});

export const UpdateVehicleScheduleBodySchema = CreateVehicleScheduleBodySchema.partial();

export const UpdateVehicleScheduleSchema = z.object({
  params: z.object({
    id: commonValidations.id,
  }),
  body: UpdateVehicleScheduleBodySchema,
});

export const VehicleScheduleQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).default(10),
    route_id: z.coerce.number().optional(),
    bus_id: z.coerce.number().optional(),
    departure: z.coerce.number().optional(),
    destination: z.coerce.number().optional(),
    departureDate: z.string().optional(),
    sortBy: z.enum([
      "id:asc",
      "id:desc",
      "departure_time:asc",
      "departure_time:desc",
    ]).default("id:asc"),
  }),
});

export const DeleteVehicleScheduleSchema = z.object({
  params: z.object({
    id: commonValidations.id,
  }),
});

export const GetVehicleScheduleSchema = z.object({
  params: z.object({
    id: commonValidations.id,
  }),
});