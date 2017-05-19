const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const config = require('dotenv').config().parsed;

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('secretKey', config.CLIENT_SECRET);
app.set('port', process.env.PORT || 3000);

if (!config.CLIENT_SECRET || !config.USERNAME || !config.PASSWORD) {
  throw { error: 'Make sure you have a CLIENT_SECRET, USERNAME, and PASSWORD in your .env file' };
}

app.listen(app.get('port'), () => {
  console.log(`port is running on ${app.get('port')}.`);
});

const checkAuth = (request, response, next) => {
  const token = request.body.token ||
                request.params.token ||
                request.headers.authorization;

  if (token) {
    jwt.verify(token, app.get('secretKey'), (error, decoded) => {
      if (error) {
        return response.status(403).send({
          success: false,
          message: 'Invalid authorization token.'
        });
      }
      request.decoded = decoded;
      next();
    });
  } else {
    return response.status(403).send({
      success: false,
      message: 'You must be authorized to hit this endpoint',
    });
  }
};

const insertNewMountain = (mountain, rangeId, res) => {
  if (!mountain || !rangeId) {
    res.status(403).send({
      success: false,
      message: 'Please provide both a mountain and a rangeId',
    });
  }
  const newMountain = Object.assign({}, mountain, { range_id: rangeId });
  database('mountains').insert(newMountain, 'id')
    .then(mountainId => res.status(201).json({ id: mountainId[0] }))
    .catch(error => res.status(422).send({
      success: false,
      message: error.message,
    }));
};

app.get('/api/v1/mountains', (req, res) => {
  const heightQuery = req.query.height_ft;
  if (heightQuery) {
    database('mountains').where('height_ft', heightQuery).orWhere('height_ft', '>', heightQuery).select()
      .then(mountains => res.status(200).json(mountains))
      .catch(error => res.status(422).send({
        success: false,
        message: error.message,
      }));
  } else {
    database('mountains').select()
      .then(mountains => res.status(200).json(mountains))
      .catch(error => res.status(422).send({
        success: false,
        message: error.message,
      }));
  }
});

app.get('/api/v1/ranges', (req, res) => {
  database('range').select()
  .then(range => res.status(200).json(range))
  .catch(error => res.status(422).send({
    success: false,
    message: error.message,
  }));
});

app.get('/api/v1/:id/mountain', (req, res) => {
  database('mountains').where('id', req.params.id).select()
    .then(mountain => res.status(200).json(mountain))
    .catch(error => res.status(422).send({
      success: false,
      message: error.message,
    }));
});

app.get('/api/v1/:id/mountain_range', (req, res) => {
  database('mountains').where('range_id', req.params.id).select()
    .then(range => res.status(200).json(range))
    .catch(error => res.status(422).send({
      success: false,
      message: error.message,
    }));
});

app.post('/authenticate', (request, response) => {
  const user = request.body;

  if (user.username !== config.USERNAME || user.password !== config.PASSWORD) {
    response.status(403).send({
      success: false,
      message: 'Invalid Credentials',
    });
  } else {
    const token = jwt.sign(user, app.get('secretKey'), {
      expiresIn: 172800,
    });

    response.json({
      success: true,
      username: user.username,
      token,
    });
  }
});

app.post('/api/v1/mountains', checkAuth, (req, res) => {
  const { mountain } = req.body;
  if (mountain.mountain && mountain.range) {
    database('range').whereRaw('LOWER(range) LIKE ?', mountain.range.toLowerCase()).select()
      .then((rangeSelect) => {
        if (rangeSelect.length) {
          insertNewMountain(mountain, rangeSelect[0].id, res);
        } else {
          throw 'Please post the mountain range before posting the mountain';
        }
      });
  } else {
    res.status(422).send({
      success: false,
      message: 'Please include at least a mountain and a mountain range'
    });
  }
});

app.post('/api/v1/ranges', checkAuth, (req, res) => {
  const { range } = req.body;
  if (range.range) {
    database('range').insert(range, 'id')
      .then(rangeId => res.status(201).json({ id: rangeId[0] }))
      .catch(error => console.log(error));
  } else {
    res.status(422).send({
      success: false,
      message: 'Please enter a mountain range value'
    });
  }
});

app.patch('/api/v1/mountains', checkAuth, (req, res) => {
  const { mountain, id } = req.body;
  database('mountains').where('id', id).update({ mountain })
    .then(mountainObj => res.status(202).json(mountainObj))
    .catch(error => res.status(422).send({
      success: false,
      message: error.message,
    }));
});

app.patch('/api/v1/ranges', checkAuth, (req, res) => {
  const { range, id } = req.body;
  database('range').where('id', id).update({ range })
    .then(rangeObj => res.status(202).json(rangeObj))
    .catch(error => res.status(422).send({
      success: false,
      message: error.message,
    }));
});


app.delete('/api/v1/mountains', checkAuth, (req, res) => {
  database('mountains').where('id', req.body.id).del()
  .catch(error => res.status(422).send({
    success: false,
    message: error.message,
  }));
});


module.exports = app;
