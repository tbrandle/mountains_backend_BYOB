const mountains = require('../../../json/mountains.json')
const cleanArray = require('../../../helpers/data_cleaner.js')

const cleanMountainObject = cleanArray(mountains)

const insertMountain = (knex, mountain, range_id) =>{
  const updatedMountain = Object.assign({}, mountain, { range_id: range_id })
  return knex('mountains').insert(updatedMountain)
}

const createMountainPromise = (knex, mountains) => {
  let rangeObject = { range: mountains[0].range };
  return knex.table('range')
    .insert(rangeObject)
    .returning('id')
    .then(rangeId => {
      let insertionPromises = [];

      mountains.forEach(mountain => insertionPromises.push(insertMountain(knex, mountain, rangeId[0])))

      return Promise.all(insertionPromises);
    })
    .catch(error => console.log(error))
}

exports.seed = function (knex, Promise) {

  return knex('mountains').del()
    .then(() => knex('range').del())
    .then(() => {
      let mountainPromises = []

      Object.keys(cleanMountainObject).forEach( range => {
        mountainPromises.push(createMountainPromise(knex, cleanMountainObject[range]))
      })

      return Promise.all(mountainPromises);
    })
    .then(() => console.log('done'))
    .catch(error => console.log(error))
}
