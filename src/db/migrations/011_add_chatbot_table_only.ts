const { Knex } = require('knex');

exports.up = async function (knex) {
    // Check if chatbot_history table already exists
    const hasChatbotHistory = await knex.schema.hasTable('chatbot_history');

    if (!hasChatbotHistory) {
        // Create chatbot history table
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

    // Add embedding column to bus_companies if it doesn't exist
    const hasBusCompanies = await knex.schema.hasTable('bus_companies');
    if (hasBusCompanies) {
        const hasEmbedding = await knex.schema.hasColumn('bus_companies', 'embedding').catch(() => false);
        if (!hasEmbedding) {
            await knex.schema.alterTable('bus_companies', (table) => {
                table.json('embedding');
            });
        }
    }
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('chatbot_history');

    // Remove embedding column from bus_companies if it exists
    const hasBusCompanies = await knex.schema.hasTable('bus_companies');
    if (hasBusCompanies) {
        const hasEmbedding = await knex.schema.hasColumn('bus_companies', 'embedding').catch(() => false);
        if (hasEmbedding) {
            await knex.schema.alterTable('bus_companies', (table) => {
                table.dropColumn('embedding');
            });
        }
    }
};
