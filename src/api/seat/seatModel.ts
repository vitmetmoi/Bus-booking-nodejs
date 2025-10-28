import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type Seat = z.infer<typeof SeatSchema>;
export const SeatSchema = z.object({
	id: z.number().int().optional(), 
	bus_id: z.number().int(),
	seat_number: z.string().max(20),
	seat_type: z.enum(["LUXURY", "VIP", "STANDARD"]),
	status: z.enum(["AVAILABLE", "BOOKED"]),
	price_for_type_seat: z.number(),
	created_at: z.date().optional(),
	updated_at: z.date().optional(),
});

// Input Validation for 'GET users/:id' endpoint
export const GetSeatSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});

