import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    const hasTable = await knex.schema.hasTable('schedules');
    if (!hasTable) return;

    const hasDepartureTime = await knex.schema.hasColumn('schedules', 'departure_time');
    if (!hasDepartureTime) {
        await knex.schema.alterTable('schedules', (table) => {
            table.dateTime('departure_time').nullable().index();
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    const hasTable = await knex.schema.hasTable('schedules');
    if (!hasTable) return;

    const hasDepartureTime = await knex.schema.hasColumn('schedules', 'departure_time');
    if (hasDepartureTime) {
        await knex.schema.alterTable('schedules', (table) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            (table as any).dropColumn('departure_time');
        });
    }
}




