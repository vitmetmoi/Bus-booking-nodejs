import type { Knex } from 'knex';

// Remove extra columns from schedules: departure_time, arrival_time,
// available_seats, total_seats, price, status (if they exist)

export async function up(knex: Knex): Promise<void> {
    const hasSchedules = await knex.schema.hasTable('schedules');
    if (!hasSchedules) return;

    const columns = [
        'departure_time',
        'arrival_time',
        'available_seats',
        'total_seats',
        'price',
        'status',
    ];

    const existence = await Promise.all(columns.map((c) => knex.schema.hasColumn('schedules', c)));

    await knex.schema.alterTable('schedules', (table) => {
        existence.forEach((exists, idx) => {
            if (exists) {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                (table as any).dropColumn(columns[idx]);
            }
        });
    });
}

export async function down(knex: Knex): Promise<void> {
    const hasSchedules = await knex.schema.hasTable('schedules');
    if (!hasSchedules) return;

    await knex.schema.alterTable('schedules', (table) => {
        // Best-effort to restore columns with generic types/defaults
        // Types chosen to be compatible with common previous schema
        if (!(table as any)._statements.find((s: any) => s.grouping === 'columns' && s.args && s.args[0] === 'departure_time')) {
            table.dateTime('departure_time').nullable();
        }
        if (!(table as any)._statements.find((s: any) => s.grouping === 'columns' && s.args && s.args[0] === 'arrival_time')) {
            table.dateTime('arrival_time').nullable();
        }
        if (!(table as any)._statements.find((s: any) => s.grouping === 'columns' && s.args && s.args[0] === 'available_seats')) {
            table.integer('available_seats').unsigned().nullable();
        }
        if (!(table as any)._statements.find((s: any) => s.grouping === 'columns' && s.args && s.args[0] === 'total_seats')) {
            table.integer('total_seats').unsigned().nullable();
        }
        if (!(table as any)._statements.find((s: any) => s.grouping === 'columns' && s.args && s.args[0] === 'price')) {
            table.decimal('price', 10, 2).nullable();
        }
        if (!(table as any)._statements.find((s: any) => s.grouping === 'columns' && s.args && s.args[0] === 'status')) {
            table.string('status', 50).nullable();
        }
    });
}


