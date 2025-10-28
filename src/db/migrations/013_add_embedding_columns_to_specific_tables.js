/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // Check and add embedding column to stations
    const hasStationsEmbedding = await knex.schema.hasColumn('stations', 'embedding').catch(() => false);
    if (!hasStationsEmbedding) {
        await knex.schema.alterTable('stations', (table) => {
            table.json('embedding').nullable();
        });
    }

    // Check and add embedding column to routes
    const hasRoutesEmbedding = await knex.schema.hasColumn('routes', 'embedding').catch(() => false);
    if (!hasRoutesEmbedding) {
        await knex.schema.alterTable('routes', (table) => {
            table.json('embedding').nullable();
        });
    }

    // Check and add embedding column to cars
    const hasCarsEmbedding = await knex.schema.hasColumn('cars', 'embedding').catch(() => false);
    if (!hasCarsEmbedding) {
        await knex.schema.alterTable('cars', (table) => {
            table.json('embedding').nullable();
        });
    }

    // Check and add embedding column to tickets
    const hasTicketsEmbedding = await knex.schema.hasColumn('tickets', 'embedding').catch(() => false);
    if (!hasTicketsEmbedding) {
        await knex.schema.alterTable('tickets', (table) => {
            table.json('embedding').nullable();
        });
    }

    // Check and add embedding column to bus_companies
    const hasBusCompaniesEmbedding = await knex.schema.hasColumn('bus_companies', 'embedding').catch(() => false);
    if (!hasBusCompaniesEmbedding) {
        await knex.schema.alterTable('bus_companies', (table) => {
            table.json('embedding').nullable();
        });
    }

    // Check and add embedding column to chatbot_history
    const hasChatbotHistoryEmbedding = await knex.schema.hasColumn('chatbot_history', 'embedding').catch(() => false);
    if (!hasChatbotHistoryEmbedding) {
        await knex.schema.alterTable('chatbot_history', (table) => {
            table.json('embedding').nullable();
        });
    }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    // Check and remove embedding column from stations
    const hasStationsEmbedding = await knex.schema.hasColumn('stations', 'embedding').catch(() => false);
    if (hasStationsEmbedding) {
        await knex.schema.alterTable('stations', (table) => {
            table.dropColumn('embedding');
        });
    }

    // Check and remove embedding column from routes
    const hasRoutesEmbedding = await knex.schema.hasColumn('routes', 'embedding').catch(() => false);
    if (hasRoutesEmbedding) {
        await knex.schema.alterTable('routes', (table) => {
            table.dropColumn('embedding');
        });
    }

    // Check and remove embedding column from cars
    const hasCarsEmbedding = await knex.schema.hasColumn('cars', 'embedding').catch(() => false);
    if (hasCarsEmbedding) {
        await knex.schema.alterTable('cars', (table) => {
            table.dropColumn('embedding');
        });
    }

    // Check and remove embedding column from tickets
    const hasTicketsEmbedding = await knex.schema.hasColumn('tickets', 'embedding').catch(() => false);
    if (hasTicketsEmbedding) {
        await knex.schema.alterTable('tickets', (table) => {
            table.dropColumn('embedding');
        });
    }

    // Check and remove embedding column from bus_companies
    const hasBusCompaniesEmbedding = await knex.schema.hasColumn('bus_companies', 'embedding').catch(() => false);
    if (hasBusCompaniesEmbedding) {
        await knex.schema.alterTable('bus_companies', (table) => {
            table.dropColumn('embedding');
        });
    }

    // Check and remove embedding column from chatbot_history
    const hasChatbotHistoryEmbedding = await knex.schema.hasColumn('chatbot_history', 'embedding').catch(() => false);
    if (hasChatbotHistoryEmbedding) {
        await knex.schema.alterTable('chatbot_history', (table) => {
            table.dropColumn('embedding');
        });
    }
};
