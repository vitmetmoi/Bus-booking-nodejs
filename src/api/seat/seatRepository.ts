import type { Seat } from "@/api/seat/seatModel";
import { db } from "@/common/config/database";

export const seats: Seat[] = [
	{
		id: 1,
		bus_id: 101,
		seat_number: "A1",
		seat_type: "LUXURY",
		status: "AVAILABLE",
		price_for_type_seat: 250000,
		created_at: new Date("2025-05-01T08:00:00"),
		updated_at: new Date("2025-05-01T08:00:00"),
	},
	{
		id: 2,
		bus_id: 101,
		seat_number: "A2",
		seat_type: "LUXURY",
		status: "BOOKED",
		price_for_type_seat: 250000,
		created_at: new Date("2025-05-01T08:00:00"),
		updated_at: new Date("2025-05-05T12:00:00"),
	},
	{
		id: 3,
		bus_id: 101,
		seat_number: "B1",
		seat_type: "VIP",
		status: "AVAILABLE",
		price_for_type_seat: 200000,
		created_at: new Date("2025-05-01T08:00:00"),
		updated_at: new Date("2025-05-01T08:00:00"),
	},
	{
		id: 4,
		bus_id: 102,
		seat_number: "C1",
		seat_type: "STANDARD",
		status: "BOOKED",
		price_for_type_seat: 150000,
		created_at: new Date("2025-05-01T08:00:00"),
		updated_at: new Date("2025-05-03T15:30:00"),
	}
];
export class SeatRepository {
	async findAllAsync(): Promise<Seat[]> {
		try {
			const rows = await db<Seat>('seats').select('*');
			return rows as Seat[];
		} catch (error) {
			throw error;
		}
	}

	async findSeatsByBusIdAsync(busId: number): Promise<Seat[]> {
		try {
			const seats = await db<Seat>('seats')
				.join('cars ', 'seats.bus_id', '=', 'cars .id')
				.select(
					'seats.*',
					'cars .name as bus_name',
					'cars .license_plate as bus_license_plate'
				)
				.where('seats.bus_id', busId);

			return seats;
		} catch (error) {
			throw error;
		}
	}

	// async deleteSeatsByBusIdAsync(busId: number): Promise<void> {
	// 	try {
	// 		await db<Seat>('seats')
	// 			.where('bus_id', busId)
	// 			.del();

	// 		console.log(`Deleted seats for bus with id: ${busId}`);
	// 	} catch (error) {
	// 		throw error;
	// 	}
	// }
	async deleteSeatsByBusIdAsync(busId: number): Promise<void> {
		try {
			// Bước 1: Lấy seat IDs theo busId
			const seatIdsResult = await db('seats')
				.where('bus_id', busId)
				.select('id');

			const seatIds = seatIdsResult.map((row: { id: number }) => row.id);

			// Nếu không có seat nào thì thoát
			if (seatIds.length === 0) {
				console.log('No seats found for this bus.');
				return;
			}

			// Bước 2: Lấy ticket IDs liên quan đến những seat_ids
			const ticketIdsResult = await db('tickets')
				.whereIn('seat_id', seatIds)
				.select('id');

			const ticketIds = ticketIdsResult.map((row: { id: number }) => row.id);

			// Bước 3: Xóa payments liên quan
			if (ticketIds.length > 0) {
				await db('payments')
					.whereIn('ticket_id', ticketIds)
					.del();
			}

			// Bước 4: Xóa tickets
			if (ticketIds.length > 0) {
				await db('tickets')
					.whereIn('id', ticketIds)
					.del();
			}

			// Bước 5: Xóa seats
			await db('seats')
				.whereIn('id', seatIds)
				.del();

			console.log(`Deleted payments, tickets, and seats for bus with id: ${busId}`);
		} catch (error) {
			console.error('Error during cascading delete:', error);
			throw error;
		}
	}
}


