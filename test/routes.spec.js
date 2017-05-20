/* eslint-disable */
process.env.NODE_ENV = 'test';


const stubData = require('./stub.json');
const cleanArray = require('../helpers/data_cleaner.js');
const chai = require('chai');

const should = chai.should();
const chaiHttp = require('chai-http');
const config = require('dotenv').config().parsed;

const server = require('../server');

const configuration = require('../knexfile').test;
const database = require('knex')(configuration);

chai.use(chaiHttp);

const token = process.env.TOKEN || config.TOKEN;

describe('test data_cleaner functions', () => {

  it('should alphabatize the mountains array by reduce by mountain range', () => {
    stubData.mountains[0].should.have.property('Range');
    stubData.mountains[0].Range.should.equal("Mahalangur Himalaya");
    const cleanMountainObject = cleanArray(stubData);
    Object.keys(cleanMountainObject).length.should.equal(3);

    const firstKey = Object.keys(cleanMountainObject)[0];
    cleanMountainObject[firstKey][0].should.have.property('range');
    cleanMountainObject[firstKey].should.have.length(2);
  });
});

describe('test server side routes', () => {

  beforeEach((done) => {
    database.migrate.latest()
    .then(() => database.seed.run())
    .then(() => {
      done();
    });
  });

  afterEach((done) => {
    database.seed.run()
    .then(() => {
      done();
    });
  });

  describe('Client Routes', () => {
    it('should return a 404 for a non existent route', (done) => {
      chai.request(server)
        .get('/sad/panda')
        .end((err, response) => {
          response.should.have.status(404);
          done();
        });
    });
  });

  describe('GET Routes', () => {
    it('GET /api/v1/mountains', (done) => {
      chai.request(server)
        .get('/api/v1/mountains')
        .end((err, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.an.array;
          response.body.length.should.equal(1);
          Object.keys(response.body[0]).length.should.equal(13);
          done();
        });
    });

    it('GET /api/v1/ranges', (done) => {
      chai.request(server)
        .get('/api/v1/ranges')
        .end((err, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.an.array;
          response.body.length.should.equal(1);
          Object.keys(response.body[0]).length.should.equal(2);
          response.body[0].should.have.property('range');
          response.body[0].should.have.property('id');
          done();
        });
    });

    it('GET /api/v1/:id/mountain_range', (done) => {
      chai.request(server)
        .get('/api/v1/1/mountain_range')
        .end((err, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.an.array;
          response.body.length.should.equal(1);
          Object.keys(response.body[0]).length.should.equal(13);
          response.body[0].should.have.property('range');
          response.body[0].should.have.property('id');
          response.body[0].should.have.property('mountain');
          response.body[0].should.have.property('height_ft');
          done();
        });
    });

    it('GET /api/v1/:id/mountain', (done) => {
      chai.request(server)
        .get('/api/v1/123/mountain')
        .end((err, response) => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.an.array;
          response.body.length.should.equal(1);
          Object.keys(response.body[0]).length.should.equal(13);
          response.body[0].should.have.property('range');
          response.body[0].should.have.property('id');
          response.body[0].should.have.property('mountain');
          response.body[0].should.have.property('height_ft');
          done();
        });
    });
  });

  describe('POST Routes', () => {

    it('HAPPY POST /api/v1/mountains', (done) => {
      console.log(token);
        chai.request(server)
          .post('/api/v1/mountains')
          .send({
            mountain: {
              mountain: 'test mountain',
              range: 'Mahalangur Himalaya'
            },
            token
          })
          .end((err, response) => {
            response.should.have.status(201);
            response.body.should.be.a('object');
            response.body.should.have.property('id');
            chai.request(server)
            .get('/api/v1/mountains')
            .end((err, response) => {
              response.should.have.status(200);
              response.should.be.json;
              response.body.should.be.a('array');
              response.body.length.should.equal(2);
              response.body[1].should.have.property('mountain');
              response.body[1].mountain.should.equal('test mountain');
              response.body[1].should.have.property('range');
              response.body[1].range.should.equal('Mahalangur Himalaya');
              done();
            });
          });
    });

    it('SAD POST /api/v1/mountains', (done) => {
        chai.request(server)
          .post('/api/v1/mountains')
          .send({
            mountain: {
              mountain: 'test mountain'
            },
            token
          })
          .end((err, response) => {
            response.should.have.status(422);
            response.body.should.be.a('object');
            response.body.should.have.property('success');
            response.body.success.should.equal(false);
            response.body.should.have.property('message');
            response.body.message.should.equal('Please include at least a mountain and a mountain range');
            done();
          });
    });

    it('HAPPY POST /api/v1/ranges', (done) => {
        chai.request(server)
          .post('/api/v1/ranges')
          .send({
            range: {
              range: 'Gumdrops'
            },
            token
          })
          .end((err, response) => {
            response.should.have.status(201);
            response.body.should.be.a('object');
            response.body.should.have.property('id');
            chai.request(server)
            .get('/api/v1/ranges')
            .end((err, response) => {
              response.should.have.status(200);
              response.should.be.json;
              response.body.should.be.a('array');
              response.body.length.should.equal(2);
              response.body[1].should.have.property('range');
              response.body[1].range.should.equal('Gumdrops');
              done();
            });
          });
    });

    it('SAD POST /api/v1/ranges', (done) => {
        chai.request(server)
          .post('/api/v1/ranges')
          .send({
            range: {
              range: ''
            },
            token
          })
          .end((err, response) => {
            response.should.have.status(422);
            response.body.should.be.a('object');
            response.body.should.have.property('success');
            response.body.success.should.equal(false);
            response.body.should.have.property('message');
            response.body.message.should.equal('Please enter a mountain range value');
            done();
          });
    });
  });
});
