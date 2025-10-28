import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const ChatbotMessageSchema = z.object({
    message: z.string().min(1, "Nội dung không được rỗng"),
});

export type ChatbotMessage = z.infer<typeof ChatbotMessageSchema>;

export const ChatbotResponseSchema = z.object({
    intent: z.string(),
    reply: z.string(),
    data: z.any().optional(),
});

export type ChatbotResponse = z.infer<typeof ChatbotResponseSchema>;

// Schema for user conversation state
export const UserConversationStateSchema = z.object({
    user_id: z.number(),
    collected: z.record(z.any()).optional(), // JSON object for collected data
    pending: z.record(z.any()).optional(), // JSON object for pending fields
    created_at: z.date().optional(),
    updated_at: z.date().optional(),
});

export type UserConversationState = z.infer<typeof UserConversationStateSchema>;

// Schema for booking requirements
export const BookingRequirementsSchema = z.object({
    departure_station: z.string().optional(),
    arrival_station: z.string().optional(),
    departure_date: z.string().optional(),
    departure_time: z.string().optional(),
});

export type BookingRequirements = z.infer<typeof BookingRequirementsSchema>;


