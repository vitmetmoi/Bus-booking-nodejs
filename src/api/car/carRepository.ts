import type { Car } from "@/api/car/carModel";
import { db } from "@/common/config/database";

export const cars: Car[] = [
    {
        id: 1,
        name: "Bus A",
        description: "City route bus",
        license_plate: "ABC-1234",
        capacity: 50,
        company_id: 1,
        created_at: new Date(),
        updated_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days later
    },
    {
        id: 2,
        name: "Bus B",
        description: "Suburban route bus",
        license_plate: "XYZ-5678",
        capacity: 40,
        company_id: 2,
        created_at: new Date(),
        updated_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days later
    },
];

export class CarRepository {

    async findAll(filter: any, options: { sortBy?: string; limit?: number; page?: number }) {
        try {
            const { sortBy = "id:asc", limit = 10, page = 1 } = options;
            const [sortField, sortOrder] = sortBy.split(":");

            const query = db<Car>("cars");

            if (filter.name) {
                query.where("name", "like", `%${filter.name}%`);
            }

            if (filter.license_plate) {
                query.where("license_plate", "like", `%${filter.license_plate}%`);
            }

            if (filter.company_id) {
                query.where("company_id", filter.company_id);
            }

            const offset = (page - 1) * limit;

            const data = await query.orderBy(sortField, sortOrder).limit(limit).offset(offset);

            const countResult = await db<Car>("cars")
                .modify((qb) => {
                    if (filter.name) {
                        qb.where("name", "like", `%${filter.name}%`);
                    }
                    if (filter.license_plate) {
                        qb.where("license_plate", "like", `%${filter.license_plate}%`);
                    }
                    if (filter.company_id) {
                        qb.where("company_id", filter.company_id);
                    }
                })
                .count("id as count");

            const totalCount = Number((countResult[0] as { count: string }).count);

            return {
                results: data,
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit),
            };
        } catch (error) {
            throw error;
        }
    }

    async findByIdAsync(id: number): Promise<Car | null> {
        try {
            const rows = await db<Car>('cars').select('*').where('id', id);
            if (rows.length === 0) {
                return null;
            }
            return rows[0] as Car;
        } catch (error) {
            throw error;
        }
    }

    async findByNameAsync(name: string): Promise<Car | null> {
        try {
            const rows = await db<Car>('cars').select('*').where('name', name);
            if (rows.length === 0) {
                return null;
            }
            return rows[0] as Car;
        } catch (error) {
            throw error;
        }
    }



    async deleteAsync(id: number): Promise<Car | null> {
        try {
            return await db.transaction(async (trx) => {
                // Lấy schedule IDs của bus
                const schedules = await trx('schedules').select('id').where({ bus_id: id });
                const scheduleIds = schedules.map(s => s.id);

                // Lấy ticket IDs thuộc các schedules
                let ticketIds: number[] = [];
                if (scheduleIds.length > 0) {
                    const tickets = await trx('tickets').select('id').whereIn('schedule_id', scheduleIds);
                    ticketIds = tickets.map(t => t.id);
                }

                // Xóa payments liên quan đến ticket
                if (ticketIds.length > 0) {
                    await trx('payments').whereIn('ticket_id', ticketIds).del();
                }

                // Xóa tickets liên quan đến schedules
                if (ticketIds.length > 0) {
                    await trx('tickets').whereIn('id', ticketIds).del();
                }

                // Xóa schedules
                if (scheduleIds.length > 0) {
                    await trx('schedules').whereIn('id', scheduleIds).del();
                }

                // Lấy seat IDs liên quan bus
                const seats = await trx('seats').select('id').where({ bus_id: id });
                const seatIds = seats.map(s => s.id);

                // Xóa payments liên quan đến tickets của seat
                if (seatIds.length > 0) {
                    const ticketsOfSeats = await trx('tickets').select('id').whereIn('seat_id', seatIds);
                    const ticketIdsOfSeats = ticketsOfSeats.map(t => t.id);

                    if (ticketIdsOfSeats.length > 0) {
                        await trx('payments').whereIn('ticket_id', ticketIdsOfSeats).del();
                        await trx('tickets').whereIn('id', ticketIdsOfSeats).del();
                    }
                }

                // Xóa seats
                await trx('seats').where({ bus_id: id }).del();

                // Xóa bus_image
                await trx('bus_image').where({ bus_id: id }).del();

                // Xóa station_bus
                await trx('station_bus').where({ bus_id: id }).del();

                // Xóa bus_reviews
                await trx('bus_reviews').where({ bus_id: id }).del();

                // Xóa bus
                const rows = await trx<Car>('cars').where('id', id).del().returning('*');

                if (rows.length === 0) {
                    return null;
                }

                return rows[0];
            });
        } catch (error: any) {
            throw new Error(`An error occurred while deleting Car with id ${id}: ${error.message}`);
        }
    }




    async createCarAsync(data: Omit<Car, "id" | "created_at" | "updated_at">): Promise<Car> {
        try {
            const currentTime = new Date();

            // Handle embedding field separately to ensure proper JSON serialization
            const { embedding, ...otherData } = data;
            const insertData: any = {
                ...otherData,
                created_at: currentTime,
                updated_at: currentTime,
            };

            if (embedding !== undefined) {
                insertData.embedding = JSON.stringify(embedding);
            }

            const [id] = await db('cars').insert(insertData);

            const [newCar] = await db('cars').where({ id }).select('*');

            return newCar;
        } catch (error) {
            throw error;
        }
    }

    async existingSeats(busId: number): Promise<Car | null> {
        try {
            const rows = await db<Car>('seats').select('*').where('bus_id', busId);
            if (rows.length === 0) {
                return null;
            }
            return rows[0] as Car;
        } catch (error) {
            throw error;
        }
    }

    async insertSeats(seats: any[]): Promise<void> {
        await db("seats").insert(seats);
    }

    async updateAsync(id: number, data: Partial<Car>): Promise<Car | null> {
        try {
            // Handle embedding field separately to ensure proper JSON serialization
            const { embedding, ...otherData } = data;
            const updateData: any = { ...otherData };

            if (embedding !== undefined) {
                updateData.embedding = JSON.stringify(embedding);
            }

            const affectedRows = await db<Car>('cars').where('id', id).update(updateData);

            if (affectedRows === 0) {
                return null;
            }

            const updatedRows = await db<Car>('cars').where('id', id).select('*').first();
            return updatedRows ?? null;
        } catch (error) {
            throw error;
        }
    }
    async getTopBusCompanies(): Promise<any[]> {
        try {
            const result = await db('bus_companies as bc')
                .leftJoin('cars as b', 'bc.id', 'b.company_id')
                .leftJoin('bus_reviews as br', 'b.id', 'br.bus_id')
                .select(
                    'bc.id as company_id',
                    'bc.company_name',
                    'bc.image',
                    'bc.description',
                    db.raw('COUNT(b.id) as total_cars'),
                    db.raw('ROUND(AVG(br.rating), 1) as avg_rating'),
                    db.raw('COUNT(br.id) as total_reviews')
                )
                .groupBy('bc.id', 'bc.company_name', 'bc.image', 'bc.description')
                .orderByRaw('total_reviews DESC, avg_rating DESC')
                .limit(10);

            return result;
        } catch (error) {
            throw error;
        }
    }

}
