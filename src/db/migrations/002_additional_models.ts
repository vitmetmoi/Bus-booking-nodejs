import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // Payment providers table - Updated to match paymentProvider.model.ts
    await knex.schema.createTable('payment_providers', (table) => {
        table.increments('id').primary();
        table.string('provider_name', 255).notNullable();
        table.enum('provider_type', ['CARD', 'E_WALLET', 'BANK_TRANSFER', 'QR_CODE']).notNullable();
        table.string('api_endpoint', 500).notNullable();
        table.boolean('is_active').defaultTo(true);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });

    // Popular routes table (for analytics) - Updated to match popularRoute model
    await knex.schema.createTable('popular_routes', (table) => {
        table.increments('id').primary();
        table.integer('route_id').unsigned().notNullable();
        table.integer('booking_count').unsigned().defaultTo(0);
        table.decimal('average_rating', 3, 2).defaultTo(0);
        table.integer('total_revenue').unsigned().defaultTo(0);
        table.date('period_start').notNullable();
        table.date('period_end').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        table.foreign('route_id').references('id').inTable('routes');
        table.unique(['route_id', 'period_start', 'period_end']);
    });

    // Ticket orders table (for order management) - Updated to match ticketOrder model
    await knex.schema.createTable('payments', (table) => {
        table.increments('id').primary();
        table.integer('ticket_id').unsigned().notNullable();
        table.enum('status', ['BOOKED', 'CANCELED', 'COMPLETED', 'REFUNDED']).defaultTo('BOOKED');
        table.decimal('order_amount', 10, 2).notNullable();
        table.string('payment_method', 100);
        table.string('payment_reference', 255);
        table.integer('payment_provider_id').unsigned();
        table.text('notes');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        table.foreign('ticket_id').references('id').inTable('tickets');
        table.foreign('payment_provider_id').references('id').inTable('payment_providers');
    });

    // Discount banners table (for promotions) - Updated to match discountBanner model
    await knex.schema.createTable('discount_banners', (table) => {
        table.increments('id').primary();
        table.string('title', 255).notNullable();
        table.text('description');
        table.string('image_url', 500);
        table.string('link_url', 500);
        table.decimal('discount_percentage', 5, 2);
        table.decimal('discount_amount', 10, 2);
        table.date('valid_from').notNullable();
        table.date('valid_until').notNullable();
        table.boolean('is_active').defaultTo(true);
        table.integer('display_order').defaultTo(0);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });

    // Add embedding column to bus_companies
    const hasBusCompanies = await knex.schema.hasTable('bus_companies');
    if (hasBusCompanies) {
        // Use raw check due to typings
        const hasEmbedding = await knex.schema.hasColumn('bus_companies' as any, 'embedding' as any).catch(() => false as unknown as boolean);
        if (!hasEmbedding) {
            await knex.schema.alterTable('bus_companies', (table) => {
                table.json('embedding');
            });
        }
    }

    // Chatbot history table
    await knex.schema.createTable('chatbot_history', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().nullable();
        table.string('intent', 100).nullable();
        table.text('message').notNullable();
        table.text('response').notNullable();
        table.json('embedding');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('station_analytics');
    await knex.schema.dropTableIfExists('route_analytics');
    await knex.schema.dropTableIfExists('discount_banners');
    await knex.schema.dropTableIfExists('payments');
    await knex.schema.dropTableIfExists('popular_routes');
    await knex.schema.dropTableIfExists('payment_providers');
    await knex.schema.dropTableIfExists('chatbot_history');
    const hasBusCompanies = await knex.schema.hasTable('bus_companies');
    if (hasBusCompanies) {
        const hasEmbedding = await knex.schema.hasColumn('bus_companies' as any, 'embedding' as any).catch(() => false as unknown as boolean);
        if (hasEmbedding) {
            await knex.schema.alterTable('bus_companies', (table) => {
                table.dropColumn('embedding');
            });
        }
    }
}
