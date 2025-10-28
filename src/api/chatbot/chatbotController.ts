import type { Request, Response } from "express";
import { chatbotService } from "@/api/chatbot/chatbotService";
import { StatusCodes } from "http-status-codes";

class ChatbotController {
    async message(req: Request, res: Response) {
        try {
            const { message, userId } = req.body || {};

            if (!message || typeof message !== "string") {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "message is required"
                });
            }

            if (!userId || typeof userId !== "number") {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "userId is required"
                });
            }

            const result = await chatbotService.handleMessage(message, userId);
            return res.status(result.statusCode || StatusCodes.OK).json(result);
        } catch (error) {
            console.error("Chatbot controller error:", error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    async clearConversationState(req: Request, res: Response) {
        try {
            const { userId } = req.params;

            if (!userId || isNaN(Number(userId))) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "Valid userId is required"
                });
            }

            await chatbotService.clearUserConversationState(Number(userId));
            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Conversation state cleared successfully"
            });
        } catch (error) {
            console.error("Clear conversation state error:", error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}

export const chatbotController = new ChatbotController();


