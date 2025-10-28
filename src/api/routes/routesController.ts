import { Request, Response, RequestHandler } from 'express';
import { RouteService } from '@/api/routes/routesService';
import { StatusCodes } from "http-status-codes";  // Đảm bảo import StatusCodes
import { error } from 'node:console';

export const routeService = new RouteService();

export class RoutesController {
  async getAllRoutes(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const allowedSortBy = ['created_at', 'distance_km', 'estimated_duration_hours'] as const;
      type SortBy = typeof allowedSortBy[number];

      const sortByParam = req.query.sortBy as string;
      const sortBy: SortBy = allowedSortBy.includes(sortByParam as SortBy)
        ? (sortByParam as SortBy)
        : 'created_at';

      const order = (req.query.order as string) === 'asc' ? 'asc' : 'desc';

      const departure_station_id = req.query.departure_station_id
        ? parseInt(req.query.departure_station_id as string)
        : undefined;

      const arrival_station_id = req.query.arrival_station_id
        ? parseInt(req.query.arrival_station_id as string)
        : undefined;



      const routes = await routeService.getAllRoutes({
        page,
        limit,
        sortBy,
        order,
        departure_station_id,
        arrival_station_id,
      });


      res.json({
        success: true,
        message: "Lấy dữ liệu thành công",

        responseObject: {
          results: routes.results,
          page: routes.page,
          limit: routes.limit,
          total: routes.total,
          totalPages: routes.totalPages,

        },
        statusCode: 200
      });





    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  }
  //Them moi tuyen duong
  public createRoutes: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const routesData = req.body;
    try {
      if (!routesData) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "route data is required." });
        return;
      }

      const response = await routeService.createRoutes(routesData);

      if (response.statusCode === StatusCodes.CREATED) {
        res.status(StatusCodes.CREATED).json({
          suscess: 'true',
          message: response.message,
          responseObject: [
            response.responseObject
          ],
          statusCode: response.statusCode,
        })






      } else {
        res.status(response.statusCode).json({ message: response.message });
      }
    } catch (ex) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "An error occurred while creating user.",
      });
    }
  };

  // Cập nhật tuyến đường
  public updateRoutes: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const routesData = req.body;
    const { id } = req.params;  // Lấy id từ tham số đường dẫn (URL)

    try {
      if (!routesData) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "Route data is required." });
        return;
      }

      // Gọi hàm cập nhật trong service
      const response = await routeService.updateRoutes(routesData, parseInt(id));  // Đảm bảo id là số

      if (response.statusCode === StatusCodes.OK) {
        res.status(StatusCodes.OK).json({
          suscess: 'true',
          message: response.message,
          responseObject: [
            response.responseObject
          ],
          statusCode: response.statusCode,
        });
      } else {
        res.status(response.statusCode).json({ message: response.message });
      }
    } catch (ex) {
      const errorMessage = (ex instanceof Error) ? ex.message : "An unexpected error occurred.";
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: `An error occurred while updating the route: ${errorMessage}`,
      });
    }
  };
  //xoa 1 tuyen duong
  public deleteRoutes: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;  // Lấy id từ tham số đường dẫn (URL)

    try {
      // Kiểm tra xem id có hợp lệ không
      if (!id) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "Route id is required." });
        return;
      }

      // Gọi hàm xóa tuyến đường trong service
      const response = await routeService.deleteRoutes(parseInt(id));  // Đảm bảo id là số

      if (response.statusCode === StatusCodes.OK) {
        res.status(StatusCodes.OK).json({
          success: 'true',
          message: `route  with id ${id} deleted successfully`,
          statusCode: response.statusCode,

        });
      } else {
        res.status(response.statusCode).json({ message: response.message });
      }
    } catch (ex) {
      console.log(error)
      const errorMessage = (ex instanceof Error) ? ex.message : "An unexpected error occurred.";
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: `An error occurred while deleting the route: ${errorMessage}`,
      });
    }
  };




}

export const routesController = new RoutesController();
