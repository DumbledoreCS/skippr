const axios = require('axios');
const pgClient = require('../models/database');

function nearbyRests(req, res) {
  // grab current coordinates of user
  // grabs all shops in database
  // filter list of shops by proximity to user
  // return filtered list of shops
  let lat;
  let lng;
  let restInfo;
  let nearby;
  axios.post('https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyAIDCvHRxSebeeGzY38HO1fFBCUY111onc')
    .then((response) => {
      lat = response.data.location.lat;
      lng = response.data.location.lng;
      const allRestCoordsStr = 'SELECT * FROM restaurants;';
      pgClient.query(allRestCoordsStr, (err, result) => {
        restInfo = result.rows;
        const destStr = result.rows.reduce((accum, curr) => {
          accum.push(`${curr.latitude}%2C${curr.longitude}%7C`);
          return accum;
        }, []).join('');
        axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${lat},${lng}&destinations=${destStr}&key=AIzaSyAIDCvHRxSebeeGzY38HO1fFBCUY111onc`)
          .then((response2) => {
            for (let i = 0; i < response2.data.rows[0].elements.length; i += 1) {
              restInfo[i].distance = response2.data.rows[0].elements[i].distance;
            }
            nearby = restInfo.sort((a, b) => a.distance.value - b.distance.value).slice(0,4);
            nearby.forEach((curr, ind) => {
              const getMenuStr = `SELECT id, name, price, "desc", calories FROM menu_items WHERE fk_rest_id = ${curr.id};`;
              pgClient.query(getMenuStr, (err2, result2) => {
                curr.menu = result2.rows;
                if (ind === nearby.length - 1) {
                  res.send(nearby);
                }
              });
            })
            // res.send(nearby);
          })
      });
    }).catch(err => res.send(err));
}

// UPDATED createUser by Dumbodore POST 'user/signup'
// STRETCH FEATURE: write new user to users table
function createUser(req, res) {
  const { firstname, lastname, email, password, phone } = req.body;
  const values = [firstname, lastname, email, password, phone];
  const createUserStr = 'INSERT INTO users (firstname, lastname, email, password, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *;';
  pgClient.query(createUserStr, values, (err, result) => {
    if (err) res.status(400).json({ error: 'Unable to create a new user' });
    else {
      res.status(200).json({
        message: 'New user has been successfully created',
        user: result.rows[0],
      });
    }
  });
}

// UPDATED verifyUser by Dumbodore POST '/user/login'
// fetch user email and password match from users table
function verifyUser(req, res) {
  const { email, password } = req.body;
  const values = [email, password];

  const verifyUserStr = 'SELECT * FROM users WHERE email = $1 AND password = $2;';
  pgClient.query(verifyUserStr, values, (err, result) => {
    if (err) res.status(500).json({ error: 'error' });
    else if (result.rows.length === 0) res.status(400).json({ error: 'Incorrect email or password' });
    else res.status(200).json(result.rows[0]);
  });
}

module.exports = { createUser, verifyUser, nearbyRests };
