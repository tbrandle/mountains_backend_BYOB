exports.seed = function (knex, Promise) {
  return knex('mountains').del()
    .then(() => knex('range').del())
    .then(() => Promise.all([
      knex('range').insert({
        range: 'Mahalangur Himalaya',
        id: 1,
      }, 'id')
        .then(rangeId => knex('mountains').insert(
          {
            id: 123,
            rank: "1",
            mountain: "Mount Everest / Sagarmatha / Chomolungma",
            height_m: "8848",
            height_ft: "29029",
            prominence_m: "8848",
            range: "Mahalangur Himalaya",
            range_id: 1,
            coordinates: "27°59′17″N 86°55′31″E",
            parent_mountain: "1953",
            first_ascent: "145",
            ascents_bef_2004: "121"
          }
        )),
    ]));
};
