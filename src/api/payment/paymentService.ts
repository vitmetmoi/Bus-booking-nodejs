import { StatusCodes } from "http-status-codes";

import { TicketOrderRepository } from "@/api/ticketOrder/ticketOrderRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import { TicketOrder } from "@/api/ticketOrder/ticketOrderModel";

export class TicketOrderService {
  private ticketOrderRepository: TicketOrderRepository;

  constructor(repository: TicketOrderRepository = new TicketOrderRepository()) {
    this.ticketOrderRepository = repository;
  }

  // 1. Lấy tất cả đơn đặt vé
  async getAllTicketOrders(params: {
    page: number;
    limit: number;
    sortBy: string;
    order: "asc" | "desc";
    search: string;
  }): Promise<ServiceResponse<TicketOrder[] | null>> {
    try {
      const { page, limit, sortBy, order, search } = params;
      console.log("page", page);
      console.log("limit", limit);
      console.log("sortBy", sortBy);
      console.log("order", order);
      console.log("search", search);
      const ticketOrders = await this.ticketOrderRepository.getAllTicketOrders({
        page,
        limit,
        sortBy,
        order,
        search,
      });

      if (!ticketOrders || ticketOrders.length === 0) {
        return ServiceResponse.failure("No ticket orders found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<TicketOrder[]>("Ticket orders found", ticketOrders);
    } catch (ex) {
      const errorMessage = `Error finding all ticket orders: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving ticket orders." + errorMessage,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 2. Lấy đơn đặt vé theo nhà xe
  async getTicketOrdersByCompany(
    companyId: number,
    _params?: any
  ): Promise<ServiceResponse<TicketOrder[] | null>> {
    try {
      const ticketOrders = await this.ticketOrderRepository.getTicketOrdersByCompany(companyId);

      if (!ticketOrders || ticketOrders.length === 0) {
        return ServiceResponse.failure("No ticket orders found for this company", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<TicketOrder[]>("Ticket orders found for the company", ticketOrders);
    } catch (ex) {
      const errorMessage = `Error finding ticket orders for company ${companyId}: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving ticket orders for the company." + errorMessage,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 3. Lấy đơn đặt vé theo trạng thái
  async getTicketOrdersByStatus(
    status: string,
    _params?: any
  ): Promise<ServiceResponse<TicketOrder[] | null>> {
    try {
      const ticketOrders = await this.ticketOrderRepository.getTicketOrdersByStatus(status);

      if (!ticketOrders || ticketOrders.length === 0) {
        return ServiceResponse.failure("No ticket orders found with this status", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success<TicketOrder[]>("Ticket orders found with this status", ticketOrders);
    } catch (ex) {
      const errorMessage = `Error finding ticket orders with status ${status}: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving ticket orders with the specified status." + errorMessage,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

export const ticketOrderService = new TicketOrderService();