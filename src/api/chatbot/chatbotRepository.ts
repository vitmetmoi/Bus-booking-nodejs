import { db } from "@/common/config/database";
import type { UserConversationState } from "./chatbotModel";

export class ChatbotRepository {
    async saveHistory(entry: { user_id?: number | null; intent: string; message: string; response: string; embedding: number[] }) {
        const [id] = await db("chatbot_history").insert({
            user_id: entry.user_id ?? null,
            intent: entry.intent,
            message: entry.message,
            response: entry.response,
            embedding: JSON.stringify(entry.embedding),
            created_at: new Date(),
            updated_at: new Date(),
        });
        return id;
    }

    async getUserConversationState(userId: number): Promise<UserConversationState | null> {
        const result = await db("user_conversation_state")
            .where("user_id", userId)
            .first();

        if (!result) return null;

        console.log('🔥 result:', result);

        return {
            user_id: result.user_id,
            collected: typeof result.collected === "string" ? JSON.parse(result.collected) : (result.collected ?? {}),
            pending: typeof result.pending === "string" ? JSON.parse(result.pending) : (result.pending ?? {}),
            created_at: result.created_at,
            updated_at: result.updated_at,
        };
    }

    async updateUserConversationState(userId: number, data: { collected?: any; pending?: any }): Promise<void> {
        const existing = await this.getUserConversationState(userId);

        if (existing) {
            await db("user_conversation_state")
                .where("user_id", userId)
                .update({
                    collected: data.collected ? JSON.stringify(data.collected) : undefined,
                    pending: data.pending ? JSON.stringify(data.pending) : undefined,
                    updated_at: new Date(),
                });
        } else {
            await db("user_conversation_state").insert({
                user_id: userId,
                collected: data.collected ? JSON.stringify(data.collected) : JSON.stringify({}),
                pending: data.pending ? JSON.stringify(data.pending) : JSON.stringify({}),
                created_at: new Date(),
                updated_at: new Date(),
            });
        }
    }

    async clearUserConversationState(userId: number): Promise<void> {
        await db("user_conversation_state")
            .where("user_id", userId)
            .del();
    }
}


