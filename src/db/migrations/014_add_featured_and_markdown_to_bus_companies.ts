/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    // Add featured image and markdown fields to bus_companies table
    await knex.schema.alterTable('bus_companies', (table) => {
        table.string('featured_image', 500).nullable().comment('Featured image path for bus company');
        table.text('markdown_content').nullable().comment('Raw markdown content for bus company details');
        table.text('markdown_html').nullable().comment('Rendered HTML from markdown content');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    // Remove the added fields
    await knex.schema.alterTable('bus_companies', (table) => {
        table.dropColumn('featured_image');
        table.dropColumn('markdown_content');
        table.dropColumn('markdown_html');
    });
};
