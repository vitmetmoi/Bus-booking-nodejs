import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

// Schema cho Route
export const RouteSchema = z.object({
  id: z.number(),
  departure_station_id: z.number(),
  arrival_station_id: z.number(),
  price: z.number(),
  duration: z.number(),
  distance: z.number(),
  created_at: z.date(),
  updated_at: z.date(),
});
export type Route = z.infer<typeof RouteSchema>;

// Schema cho Bus
export const BusSchema = z.object({
  id: z.number(),
  name: z.string(),
  license_plate: z.string(),
  capacity: z.number(),
  company_id: z.number(),
  created_at: z.date(),
  updated_at: z.date(),
});
export type Bus = z.infer<typeof BusSchema>;

// Schema cho Seat
export const SeatSchema = z.object({
  id: z.number(),
  bus_id: z.number(),
  seat_number: z.string(),
  seat_type: z.enum(["LUXURY", "VIP", "STANDARD"]),
  status: z.enum(["AVAILABLE", "BOOKED"]),
  price_for_type_seat: z.number(),
  created_at: z.date(),
  updated_at: z.date(),
});
export type Seat = z.infer<typeof SeatSchema>;

// Schema cho Schedule
export const ScheduleSchema = z.object({
  id: z.number(),
  route_id: z.number(),
  bus_id: z.number(),
  departure_time: z.date(),
  is_active: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
});
export type Schedule = z.infer<typeof ScheduleSchema>;

// Schema cho Ticket
export const TicketSchema = z.object({
  id: z.number(),
  seat_id: z.number(),
  schedule_id: z.number(),
  user_id: z.number(),
  // ticket_number: z.string(),
  total_price: z.number(),
  status: z.enum(["BOOKED", "CANCELED", "PENDING"]),
  reason: z.string().nullable().optional(),
  embedding: z.array(z.number()).optional(),
  created_at: z.date(),
  updated_at: z.date(),
});
export type Ticket = z.infer<typeof TicketSchema>;

// Validation cho các endpoint
export const BookTicketInputSchema = z.object({
  schedule_id: z.number().int().positive(),
  seat_id: z.number().int().positive(),
  payment_method: z.enum(["ONLINE", "CASH"]),
});
export type BookTicketInput = z.infer<typeof BookTicketInputSchema>;

// Schema cho request hủy vé (PUT)
export const CancelTicketInputSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
});
export type CancelTicketInput = z.infer<typeof CancelTicketInputSchema>;

export const CancelTicketSchema = z.object({
  params: z.object({ ticketId: commonValidations.id }),
  body: CancelTicketInputSchema,
});

export const TicketSearchQueryOnly = z.object({
  ticketId: z.string().regex(/^\d+$/, "The ticket code must be a number."),
  phoneNumber: z.string().regex(/^0\d{9}$/, "The phone number must be a 10-digit number starting with 0."),
});
export const TicketSearchSchema = z.object({
  query: TicketSearchQueryOnly,
  body: z.any().optional(),
  params: z.any().optional(),
});

// Schema cho Payment
export const PaymentSchema = z.object({
  id: z.number(),
  payment_provider_id: z.number().optional(),
  user_id: z.number().optional(),
  ticket_id: z.number(),
  payment_method: z.enum(["ONLINE", "CASH"]),
  amount: z.number(),
  status: z.enum(["PENDING", "COMPLETED", "FAILED"]),
  created_at: z.date(),
  updated_at: z.date(),
});
export type Payment = z.infer<typeof PaymentSchema>;

export type TicketSearchQuery = z.infer<typeof TicketSearchQueryOnly>;