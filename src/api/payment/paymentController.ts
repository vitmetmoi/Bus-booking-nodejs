import type { Request, RequestHandler, Response } from "express";
import { ticketOrderService } from "@/api/ticketOrder/ticketOrderService";

class TicketOrderController {
  public getTicketOrders: RequestHandler = async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10, sortBy = "id", order = "asc", search = "" } = req.query;

      const serviceResponse = await ticketOrderService.getAllTicketOrders({
        page: Number(page),
        limit: Number(limit),
        sortBy: String(sortBy),
        order: String(order) as "asc" | "desc",
        search: String(search),
      });
      res.status(serviceResponse.statusCode).send(serviceResponse);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).send({
          statusCode: 500,
          message: "An error occurred while retrieving ticket orders.",
          error: error.message,
        });
      } else {
        res.status(500).send({
          statusCode: 500,
          message: "An unexpected error occurred.",
        });
      }
    }
  };

  public getTicketOrdersByCompany: RequestHandler = async (req: Request, res: Response) => {
    try {
      const companyId = Number(req.params.companyId);
      console.log("companyId", companyId);

      const { page = 1, limit = 10, sortBy = "ticketNumber", order = "asc", search = "" } = req.query;
      const serviceResponse = await ticketOrderService.getTicketOrdersByCompany(companyId, {
        page: Number(page),
        limit: Number(limit),
        sortBy: String(sortBy),
        order: String(order) as "asc" | "desc",
        search: String(search),
      });
      res.status(serviceResponse.statusCode).send(serviceResponse);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).send({
          statusCode: 500,
          message: `An error occurred while retrieving ticket orders for company ID ${req.params.companyId}.`,
          error: error.message,
        });
      } else {
        res.status(500).send({
          statusCode: 500,
          message: "An unexpected error occurred.",
        });
      }
    }
  };

  public getTicketOrdersByStatus: RequestHandler = async (req: Request, res: Response) => {
    try {
      const status = String(req.params.status);
      console.log("status", status);

      const { page = 1, limit = 10, sortBy = "ticketNumber", order = "asc", search = "" } = req.query;
      const serviceResponse = await ticketOrderService.getTicketOrdersByStatus(status, {
        page: Number(page),
        limit: Number(limit),
        sortBy: String(sortBy),
        order: String(order) as "asc" | "desc",
        search: String(search),
      });
      res.status(serviceResponse.statusCode).send(serviceResponse);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).send({
          statusCode: 500,
          message: `An error occurred while retrieving ticket orders with status ${req.params.status}.`,
          error: error.message,
        });
      } else {
        res.status(500).send({
          statusCode: 500,
          message: "An unexpected error occurred.",
        });
      }
    }
  };
}

export const ticketOrderController = new TicketOrderController();