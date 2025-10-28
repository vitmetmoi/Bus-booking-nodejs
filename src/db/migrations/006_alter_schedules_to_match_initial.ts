import type { Knex } from 'knex';

// Align schedules table with 001_initial_schema.ts definition
// Fields: id (PK), route_id (uint, not null), bus_id (uint, not null),
// price (decimal 10,2 not null), is_active (boolean default true),
// created_at (timestamp default now), updated_at (timestamp default now)

export async function up(knex: Knex): Promise<void> {
    const hasSchedules = await knex.schema.hasTable('schedules');
    if (!hasSchedules) return;

    const hasRouteId = await knex.schema.hasColumn('schedules', 'route_id');
    const hasBusId = await knex.schema.hasColumn('schedules', 'bus_id');
    const hasPrice = await knex.schema.hasColumn('schedules', 'price');
    const hasIsActive = await knex.schema.hasColumn('schedules', 'is_active');
    const hasCreatedAt = await knex.schema.hasColumn('schedules', 'created_at');
    const hasUpdatedAt = await knex.schema.hasColumn('schedules', 'updated_at');

    // Add any missing columns
    await knex.schema.alterTable('schedules', (table) => {
        if (!hasRouteId) table.integer('route_id').unsigned().notNullable();
        if (!hasBusId) table.integer('bus_id').unsigned().notNullable();
        if (!hasPrice) table.decimal('price', 10, 2).notNullable().defaultTo(0);
        if (!hasIsActive) table.boolean('is_active').defaultTo(true);
        if (!hasCreatedAt) table.timestamp('created_at').defaultTo(knex.fn.now());
        if (!hasUpdatedAt) table.timestamp('updated_at').defaultTo(knex.fn.now());
    });

    // Tighten types/constraints for existing columns where safe
    await knex.schema.alterTable('schedules', (table) => {
        if (hasRouteId) table.integer('route_id').unsigned().notNullable().alter();
        if (hasBusId) table.integer('bus_id').unsigned().notNullable().alter();
        if (hasPrice) table.decimal('price', 10, 2).notNullable().alter();
    });

    // Add foreign keys best-effort (ignore if already present or incompatible)
    try {
        await knex.schema.alterTable('schedules', (table) => {
            table.foreign('route_id').references('id').inTable('routes');
        });
    } catch (_) { }

    try {
        await knex.schema.alterTable('schedules', (table) => {
            table.foreign('bus_id').references('id').inTable('cars');
        });
    } catch (_) { }
}

export async function down(knex: Knex): Promise<void> {
    const hasSchedules = await knex.schema.hasTable('schedules');
    if (!hasSchedules) return;

    // Best-effort: drop FKs if present
    try {
        await knex.schema.alterTable('schedules', (table) => {
            table.dropForeign(['route_id']);
        });
    } catch (_) { }
    try {
        await knex.schema.alterTable('schedules', (table) => {
            table.dropForeign(['bus_id']);
        });
    } catch (_) { }

    // We will not drop columns to avoid data loss in down; no-op
}


