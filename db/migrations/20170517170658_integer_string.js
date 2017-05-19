exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.alterTable('mountains', (table) => {
      table.string('rank').alter();
      table.string('height_m').alter();
      table.string('height_ft').alter();
      table.string('prominence_m').alter();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.alterTable('mountains', (table) => {
      table.integer('rank').alter();
      table.integer('height_m').alter();
      table.integer('height_ft').alter();
      table.integer('prominence_m').alter();
    })
  ]);
};
