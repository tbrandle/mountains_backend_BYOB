
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('mountains', (table) => {
      table.increments('id').primary();
      table.integer('rank');
      table.string('mountain');
      table.integer('height_m');
      table.integer('height_ft');
      table.integer('prominence_m');
      table.integer('range_id').unsigned();
      table.foreign('range_id')
           .references('range.id');
      table.string('coordinates');
      table.string('range');
      table.string('parent_mountain');
      table.string('first_ascent');
      table.string('ascents_bef_2004');
      table.string('failed_attempts_bef_2004');
    }),
    knex.schema.createTable('range', (table) => {
      table.increments('id').primary();
      table.string('range');
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('mountains'),
    knex.schema.dropTable('range')
  ]);
};
