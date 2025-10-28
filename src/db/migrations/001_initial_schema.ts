import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // Users table - Updated to match userModel.ts
    await knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('username', 255).notNullable(); // Changed from full_name to name
        table.string('email', 255).unique().notNullable();
        table.integer('age', 2).nullable();
        table.string('password', 255).notNullable(); // Keep password for auth
        table.string('phone', 20); // Keep phone for contact
        table.enum('role', ['admin', 'user', 'bus_company']).defaultTo('user'); // Keep role for permissions
        table.boolean('is_active').defaultTo(true); // Keep is_active for account status
        table.timestamp('createdAt').defaultTo(knex.fn.now()); // Changed from created_at to createdAt
        table.timestamp('updatedAt').defaultTo(knex.fn.now()); // Changed from updated_at to updatedAt
    });

    // Bus companies table - Updated to match busCompanyModel.ts
    await knex.schema.createTable('bus_companies', (table) => {
        table.increments('id').primary();
        table.string('company_name', 255).notNullable();
        table.text('descriptions'); // Changed from description to descriptions
        table.string('image', 500); // Keep image field
        table.string('logo_url', 500); // Added logo_url for branding
        table.string('contact_phone', 20); // Added contact phone
        table.string('contact_email', 255); // Added contact email
        table.text('address'); // Added address field
        table.boolean('is_active').defaultTo(true); // Added is_active
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });

    // Stations table - Updated to match stationModel.ts
    await knex.schema.createTable('stations', (table) => {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.string('image', 500); // Added image field
        table.string('wallpaper', 500); // Added wallpaper field
        table.text('descriptions'); // Added descriptions field
        table.text('location').notNullable(); // Changed from address to location
        table.string('city', 100); // Keep city for backward compatibility
        table.string('province', 100); // Keep province for backward compatibility
        table.json('embedding'); // Embedding vector for semantic search
        table.boolean('is_active').defaultTo(true);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });

    // Routes table - Updated to match routeModel.ts
    await knex.schema.createTable('routes', (table) => {
        table.increments('id').primary();
        table.integer('departure_station_id').unsigned().notNullable();
        table.integer('arrival_station_id').unsigned().notNullable();
        table.decimal('distance_km', 10, 2); // Changed from distance_km to distance
        table.decimal('estimated_duration_hours', 4, 2); // Changed from estimated_duration_hours to duration
        table.json('embedding'); // Embedding vector for semantic search
        table.boolean('is_active').defaultTo(true);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        table.foreign('departure_station_id').references('id').inTable('stations');
        table.foreign('arrival_station_id').references('id').inTable('stations');
    });

    // Buses table - aligned with repositories and UI needs
    await knex.schema.createTable('cars', (table) => {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.text('description'); // Keep description for car details
        table.string('license_plate', 20).unique().notNullable();
        table.integer('capacity').unsigned().notNullable();
        table.integer('company_id').unsigned().notNullable();
        table.string('featured_image', 500); // Featured image for displaying in UI
        table.json('embedding'); // Embedding vector for semantic search
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        table.foreign('company_id').references('id').inTable('bus_companies');
    });

    // Schedules table - reconstructed to remove redundant fields
    await knex.schema.createTable('schedules', (table) => {
        table.increments('id').primary();
        table.integer('route_id').unsigned().notNullable();
        table.integer('bus_id').unsigned().notNullable(); // bus_id references cars
        table.date('departure_time').notNullable();
        table.boolean('is_active').defaultTo(true);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

    });

    // Seats table - Updated to match seatModel.ts
    await knex.schema.createTable('seats', (table) => {
        table.increments('id').primary();
        table.integer('bus_id').unsigned().notNullable(); // bus reference
        table.string('seat_number', 10).notNullable();
        table.enum('seat_type', ['LUXURY', 'VIP', 'STANDARD']).defaultTo('STANDARD'); // Updated enum values
        table.enum('status', ['AVAILABLE', 'BOOKED']).defaultTo('AVAILABLE'); // Updated enum values
        table.decimal('price_for_type_seat', 10, 2).notNullable(); // Added price_for_type_seat
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        table.foreign('bus_id').references('id').inTable('cars');
        table.unique(['bus_id', 'seat_number']);
    });

    // Tickets table - Updated to match ticketModel.ts
    await knex.schema.createTable('tickets', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable();
        table.integer('schedule_id').unsigned().notNullable(); // reference schedules
        table.integer('seat_id').unsigned().notNullable();
        table.string('ticket_number', 50).unique().notNullable();
        table.enum('status', ['BOOKED', 'CANCELED', 'PENDING']).defaultTo('PENDING'); // Updated enum values
        table.decimal('total_price', 10, 2).notNullable();
        table.text('reason').nullable(); // Added reason field for cancellation
        table.json('embedding'); // Embedding vector for semantic search
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        table.foreign('user_id').references('id').inTable('users');
        table.foreign('schedule_id').references('id').inTable('schedules');
        table.foreign('seat_id').references('id').inTable('seats');
    });

    // Bus reviews table - Updated to match busReviewModel.ts
    await knex.schema.createTable('bus_reviews', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable();
        table.integer('bus_id').unsigned().notNullable(); // bus reference
        table.integer('rating').notNullable().checkBetween([1, 5]);
        table.text('review'); // Changed from comment to review
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        table.foreign('user_id').references('id').inTable('users');
        table.foreign('bus_id').references('id').inTable('cars');
    });

    // Banners table - Updated to match bannerModel.ts
    await knex.schema.createTable('banners', (table) => {
        table.increments('id').primary();
        table.string('title', 255).notNullable();
        table.text('description');
        table.string('image_url', 500);
        table.string('link_url', 500);
        table.boolean('is_active').defaultTo(true);
        table.integer('display_order').defaultTo(0);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('banners');
    await knex.schema.dropTableIfExists('bus_reviews');
    await knex.schema.dropTableIfExists('tickets');
    await knex.schema.dropTableIfExists('seats');
    await knex.schema.dropTableIfExists('vehicle_schedules');
    await knex.schema.dropTableIfExists('cars');
    await knex.schema.dropTableIfExists('routes');
    await knex.schema.dropTableIfExists('stations');
    await knex.schema.dropTableIfExists('bus_companies');
    await knex.schema.dropTableIfExists('users');
}
