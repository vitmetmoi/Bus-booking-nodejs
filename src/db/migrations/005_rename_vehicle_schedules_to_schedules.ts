import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    const hasVehicleSchedules = await knex.schema.hasTable('vehicle_schedules');
    const hasSchedules = await knex.schema.hasTable('schedules');
    if (hasVehicleSchedules && !hasSchedules) {
        await knex.schema.renameTable('vehicle_schedules', 'schedules');
    }
}

export async function down(knex: Knex): Promise<void> {
    const hasSchedules = await knex.schema.hasTable('schedules');
    const hasVehicleSchedules = await knex.schema.hasTable('vehicle_schedules');
    if (hasSchedules && !hasVehicleSchedules) {
        await knex.schema.renameTable('schedules', 'vehicle_schedules');
    }
}


