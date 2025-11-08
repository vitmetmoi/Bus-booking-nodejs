import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { embed } from "@/common/utils/embedding";
import { ChatbotRepository } from "@/api/chatbot/chatbotRepository";
import { stationService } from "@/api/station/stationService";
import { vehicleScheduleService } from "@/api/vehicleSchedule/vehicleSchedule.service";
import type { BookingRequirements, UserConversationState } from "./chatbotModel";

function cosineSimilarity(vecA: number[], vecB: number[]): number {
    const len = Math.min(vecA.length, vecB.length);
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < len; i++) {
        const a = vecA[i];
        const b = vecB[i];
        dot += a * b;
        normA += a * a;
        normB += b * b;
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB) || 1;
    return dot / denom;
}

const INTENTS = [
    { name: "book_ticket", description: "Đặt vé xe buýt,Tìm xe buýt phù hợp với yêu cầu của bạn, " },
    { name: "collect_information", description: "Thu thập thông tin đặt vé từ người dùng bao gồm địa điểm đi, địa điểm đến, thời gian khởi hành" },
    { name: "booking_help", description: "Hỗ trợ đặt vé, thanh toán và tra cứu thông tin vé" },
    { name: "contact_support", description: "Liên hệ bộ phận hỗ trợ khi gặp sự cố hoặc cần tư vấn" },
    { name: "greeting", description: "Chào hỏi và giới thiệu về trợ lý đặt xe" },
];

export class ChatbotService {
    private repository = new ChatbotRepository();
    private intentEmbeddings: Record<string, number[]> | null = null;

    // ChatGPT API integration
    private async callChatGPT(prompt: string): Promise<string> {
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "tngtech/deepseek-r1t2-chimera:free",
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    max_tokens: 1000,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`ChatGPT API error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0]?.message?.content || "";
        } catch (error) {
            console.error("Error calling ChatGPT:", error);
            return "";
        }
    }

    // Extract and format booking data using ChatGPT
    private async extractBookingData(userMessage: string): Promise<Partial<BookingRequirements>> {
        const prompt = `Extract booking information from this Vietnamese message and return as JSON. 
        Look for:
        - departure_station: departure city/station name (e.g., "Hà Nội", "TP.HCM")
        - arrival_station: arrival city/station name
        - departure_date: date in YYYY-MM-DD format (convert Vietnamese dates like "ngày 7 tháng 10 năm 2025" to "2025-10-07"),especially if user provide missing year,set default to 2025
        - departure_time: time in HH:MM format (24-hour format)

        Message: "${userMessage}"
        
        Return only valid JSON with found fields, omit missing ones.`;

        try {
            const response = await this.callChatGPT(prompt);
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (error) {
            console.error("Error extracting booking data:", error);
        }
        return {};
    }

    // Find station by name using embedding similarity
    private async findStationByName(stationName: string): Promise<{ id: number; name: string; similarity: number } | null> {
        try {
            // Get all stations with embeddings
            const stationsResponse = await stationService.findAll(1, 1000); // Get all stations
            if (!stationsResponse.success || !stationsResponse.responseObject) {
                return null;
            }

            const stations = stationsResponse.responseObject || [];
            const stationEmbedding = await embed(stationName) as number[];

            let bestMatch = null;
            let bestSimilarity = 0;

            for (const station of stations) {
                if (station.embedding && station.embedding.length > 0) {
                    const similarity = cosineSimilarity(stationEmbedding, station.embedding);
                    if (similarity > bestSimilarity && similarity > 0.7) { // Threshold for similarity
                        bestSimilarity = similarity;
                        bestMatch = {
                            id: station.id,
                            name: station.name,
                            similarity
                        };
                    }
                }
            }

            return bestMatch;
        } catch (error) {
            console.error("Error finding station:", error);
            return null;
        }
    }

    // Check if user has enough requirement fields
    private hasEnoughRequirements(collected: any): boolean {
        const requiredFields = ['departure_station', 'arrival_station', 'departure_date'];
        return requiredFields.every(field => collected && collected[field]);
    }

    // Get available schedules
    private async getAvailableSchedules(requirements: BookingRequirements): Promise<{ data: any[], departureStation: { id: number; name: string; similarity: number }, arrivalStation: { id: number; name: string; similarity: number } }> {
        try {
            const departureStation = await this.findStationByName(requirements.departure_station || "");
            const arrivalStation = await this.findStationByName(requirements.arrival_station || "");

            if (!departureStation || !arrivalStation) {
                return { data: [], departureStation: { id: 0, name: "", similarity: 0 }, arrivalStation: { id: 0, name: "", similarity: 0 } };
            }

            const schedulesResponse = await vehicleScheduleService.findAll(
                {
                    departure: departureStation.id,
                    destination: arrivalStation.id,
                    departureDate: requirements.departure_date
                },
                { limit: 10, page: 1 }
            );

            if (schedulesResponse.success && schedulesResponse.responseObject) {
                return {
                    data: (schedulesResponse.responseObject as any).results || [],
                    departureStation: departureStation,
                    arrivalStation: arrivalStation
                }
            }
            return { data: [], departureStation: { id: 0, name: "", similarity: 0 }, arrivalStation: { id: 0, name: "", similarity: 0 } };
        } catch (error) {
            console.error("Error getting schedules:", error);
            return { data: [], departureStation: { id: 0, name: "", similarity: 0 }, arrivalStation: { id: 0, name: "", similarity: 0 } };
        }
    }

    private async ensureIntentEmbeddings(): Promise<void> {
        if (this.intentEmbeddings) return;
        const descs = INTENTS.map((i) => i.description);
        const vectors = await embed(descs) as number[][];
        this.intentEmbeddings = {};
        vectors.forEach((v, idx) => {
            this.intentEmbeddings![INTENTS[idx].name] = v;
        });
    }

    async handleMessage(message: string, currentUserId?: number): Promise<ServiceResponse<any>> {
        try {
            await this.ensureIntentEmbeddings();
            const messageEmbedding = await embed(message) as number[];
            let bestIntent = "greeting";
            let bestScore = -1;

            for (const intent of INTENTS) {
                const target = this.intentEmbeddings![intent.name];
                const score = cosineSimilarity(messageEmbedding, target);
                if (score > bestScore) {
                    bestScore = score;
                    bestIntent = intent.name;
                }
            }

            // Get user conversation state
            let userState: UserConversationState | null = null;
            if (currentUserId) {
                userState = await this.repository.getUserConversationState(currentUserId);
            }

            const result = await this.executeIntent(bestIntent, message, currentUserId, userState);

            await this.repository.saveHistory({
                user_id: currentUserId ?? null,
                intent: bestIntent,
                message,
                response: result.reply,
                embedding: messageEmbedding,
            });

            return ServiceResponse.success("OK", { intent: bestIntent, ...result }, StatusCodes.OK);
        } catch (ex) {
            console.log(ex);
            return ServiceResponse.failure("Chatbot error", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    private async executeIntent(intent: string, message: string, userId?: number, userState?: UserConversationState | null): Promise<{ reply: string; data?: any }> {
        switch (intent) {
            case "book_ticket":
                return await this.handleBookTicketIntent(message, userId, userState);
            case "collect_information":
                return await this.handleCollectInformationIntent(message, userId, userState);
            case "booking_help":
                return {
                    reply: "Tôi có thể giúp bạn với quy trình đặt vé:\n\n1️⃣ Tìm xe buýt phù hợp\n2️⃣ Chọn ghế và thông tin hành khách\n3️⃣ Thanh toán an toàn\n4️⃣ Nhận vé qua email/SMS\n\nBạn gặp khó khăn ở bước nào?",
                    data: { intent: "booking_help" }
                };
            case "contact_support":
                return {
                    reply: "Để được hỗ trợ trực tiếp, bạn có thể:\n\n📞 Gọi hotline: 1900 0152\n📧 Email: support@datxekhach.com\n💬 Chat trực tiếp với nhân viên\n\nHoặc để lại thông tin, tôi sẽ chuyển yêu cầu của bạn đến bộ phận hỗ trợ.",
                    data: { intent: "contact_support" }
                };
            case "greeting":
            default:
                return {
                    reply: "Xin chào! Tôi là trợ lý đặt xe của bạn. Tôi có thể giúp bạn:\n\n🚌 Tìm xe buýt theo tuyến đường\n💺 Kiểm tra ghế trống\n🎫 Hủy hoặc thay đổi vé\n❓ Giải đáp thắc mắc về dịch vụ\n\nBạn cần hỗ trợ gì?",
                    data: { intent: "greeting" }
                };
        }
    }

    private async handleBookTicketIntent(message: string, userId?: number, userState?: UserConversationState | null): Promise<{ reply: string; data?: any }> {
        if (!userId) {
            return {
                reply: "Vui lòng đăng nhập để sử dụng tính năng đặt vé. Bạn có thể đăng nhập và thử lại.",
                data: { intent: "book_ticket", requiresLogin: true }
            };
        }

        // Extract booking data from user message
        const extractedData = await this.extractBookingData(message);

        // Merge with existing collected data
        const currentCollected = userState?.collected || {};
        const updatedCollected = { ...currentCollected, ...extractedData };

        // Check if we have enough requirements
        if (this.hasEnoughRequirements(updatedCollected)) {
            // Get available schedules

            return await this.handleGetAvailableBus(updatedCollected as BookingRequirements, userId);

        } else {
            // Determine what information is still needed
            const missingFields = [];
            if (!updatedCollected.departure_station) missingFields.push("điểm đi");
            if (!updatedCollected.arrival_station) missingFields.push("điểm đến");
            if (!updatedCollected.departure_date) missingFields.push("ngày đi");

            // Update conversation state
            await this.repository.updateUserConversationState(userId, {
                collected: updatedCollected,
                pending: { missing_fields: missingFields }
            });

            return {
                reply: `Để đặt vé, tôi cần thêm thông tin về ${missingFields.join(", ")}. Bạn vui lòng cung cấp thông tin này.`,
                data: {
                    intent: "book_ticket",
                    missing_fields: missingFields,
                    collected: updatedCollected
                }
            };
        }
    }

    private async handleGetAvailableBus(updatedCollected: BookingRequirements, userId: number): Promise<{ reply: string; data?: any }> {
        console.log("updatedCollected", updatedCollected);
        const schedules = await this.getAvailableSchedules(updatedCollected);
        console.log("schedules", schedules);
        if (schedules.data.length > 0) {
            // Format schedules for display
            console.log(schedules);
            const formattedSchedules = schedules.data.map(schedule => ({
                id: schedule.id,
                bus_id: schedule.bus_id,
                bus_name: schedule.bus_name,
                bus_image: schedule.bus_featured_image,
                departure_time: schedule.departure_time,
                price: schedule.price,
                available_seats: schedule.available_seats,
                route_departure_station_id: schedule.route_departure_station_id,
                route_arrival_station_id: schedule.route_arrival_station_id
            }));

            // Clear conversation state after successful booking
            await this.repository.clearUserConversationState(userId);

            return {
                reply: `Tôi đã tìm thấy ${schedules.data.length} chuyến xe phù hợp với yêu cầu của bạn`,
                data: {
                    intent: "book_ticket",
                    schedules: formattedSchedules,
                    redirect_url: `bus-list?departure=${schedules.departureStation.id}&destination=${schedules.arrivalStation.id}&departureDate=${updatedCollected.departure_date}`
                }
            };
        } else {
            return {
                reply: "Xin lỗi, tôi không tìm thấy chuyến xe nào phù hợp với yêu cầu của bạn. Bạn có thể thử tìm kiếm với ngày khác hoặc tuyến đường khác.",
                data: { intent: "book_ticket", noResults: true }
            };
        }
    }

    private async handleCollectInformationIntent(message: string, userId?: number, userState?: UserConversationState | null): Promise<{ reply: string; data?: any }> {
        if (!userId) {
            return {
                reply: "Vui lòng đăng nhập để sử dụng tính năng này.",
                data: { intent: "collect_information", requiresLogin: true }
            };
        }

        // Extract booking data from user message
        const extractedData = await this.extractBookingData(message);

        // Get current state or create new one
        const currentCollected = userState?.collected || {};
        const currentPending = userState?.pending || {};

        // Merge extracted data with existing collected data
        const updatedCollected = { ...currentCollected, ...extractedData };

        // Update pending fields
        const requiredFields: (keyof BookingRequirements)[] = ['departure_station', 'arrival_station', 'departure_date'];
        const stillPending = requiredFields.filter(field => !updatedCollected[field]);
        const updatedPending = { ...currentPending, missing_fields: stillPending };

        // Update conversation state
        await this.repository.updateUserConversationState(userId, {
            collected: updatedCollected,
            pending: updatedPending
        });

        if (stillPending.length === 0) {
            return await this.handleGetAvailableBus(updatedCollected as BookingRequirements, userId);
        } else {
            return {
                reply: `Tôi đã lưu thông tin bạn cung cấp. Vẫn còn thiếu: ${stillPending.join(", ")}. Bạn có thể cung cấp thêm thông tin này.`,
                data: {
                    intent: "collect_information",
                    collected: updatedCollected,
                    pending: stillPending
                }
            };
        }
    }

    // Clear user conversation state
    async clearUserConversationState(userId: number): Promise<void> {
        await this.repository.clearUserConversationState(userId);
    }
}

export const chatbotService = new ChatbotService();


