import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { chatbotController } from "@/api/chatbot/chatbotController";

export const chatbotRegistry = new OpenAPIRegistry();
export const chatbotRouter: Router = express.Router();

chatbotRegistry.registerPath({
    method: "post",
    path: "/chatbot/message",
    tags: ["Chatbot"],
    summary: "Gửi tin nhắn tới chatbot",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                        userId: z.number()
                    })
                }
            }
        }
    },
    responses: createApiResponse(z.object({ intent: z.string().optional(), reply: z.string().optional() }), "Phản hồi chatbot"),
});

chatbotRegistry.registerPath({
    method: "delete",
    path: "/chatbot/conversation-state/{userId}",
    tags: ["Chatbot"],
    summary: "Xóa trạng thái hội thoại của người dùng",
    request: {
        params: z.object({
            userId: z.string().transform(Number)
        })
    },
    responses: createApiResponse(z.object({ success: z.boolean(), message: z.string() }), "Kết quả xóa trạng thái hội thoại"),
});

chatbotRouter.post("/message", chatbotController.message);
chatbotRouter.delete("/conversation-state/:userId", chatbotController.clearConversationState);


