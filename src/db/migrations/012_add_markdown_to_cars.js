/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('cars', (table) => {
        table.text('markdown_content').nullable();
        table.text('markdown_html').nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('cars', (table) => {
        table.dropColumn('markdown_content');
        table.dropColumn('markdown_html');
    });
};

