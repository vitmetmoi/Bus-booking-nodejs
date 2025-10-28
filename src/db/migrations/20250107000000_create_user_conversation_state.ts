import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("user_conversation_state", (table) => {
        table.increments("id").primary();
        table.integer("user_id").notNullable().unique();
        table.json("collected").nullable().comment("Collected user data for booking");
        table.json("pending").nullable().comment("Pending fields to collect");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());

        // Add foreign key constraint if users table exists
        table.foreign("user_id").references("id").inTable("users").onDelete("CASCADE");
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("user_conversation_state");
}
