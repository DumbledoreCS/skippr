const axios = require('axios');
const pgClient = require('../models/database');


function nearbyRests(req, res) {
  // grab current coordinates of user
  let lat;
  let lng;
  let restCoords;
  let nearby;
  axios.post('https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyAIDCvHRxSebeeGzY38HO1fFBCUY111onc')
    .then((response) => {
      lat = response.data.location.lat;
      lng = response.data.location.lng;
      const allRestCoordsStr = 'SELECT id, latitude, longitude FROM restaurants;';
      pgClient.query(allRestCoordsStr, (err, result) => {
        if (err) {
          return res.send(err);
        }
        restCoords = result.rows;
      });
    })
    .then(() => {
      const dist = [];
      restCoords.forEach((elem) => {
        axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${lat},${lng}&destinations=`)
      })
    })
  // grabs all shops in database
  // filter list of shops by proximity to user
  // return filtered list of shops
}

// STRETCH FEATURE: write new user to users table
function createUser(req, res) {
  const { firstName, lastName, email, password, phoneNumber } = req.body;
  const values = [firstName, lastName, email, password, phoneNumber];
  const createUserStr = 'INSERT INTO users (user_firstname, user_lastname, user_email, user_password, user_phone) VALUES ($1, $2, $3, $4, $5) RETURNING *;';
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

// fetch user email and password match from users table
function verifyUser(req, res) {
  const { email, password } = req.body;
  // console.log(req.body);
  const values = [email, password];
  // console.log(values);
  const verifyUserStr = 'SELECT * FROM users WHERE user_email = $1 AND user_password = $2;';
  pgClient.query(verifyUserStr, values, (err, result) => {
    if (err) res.status(500).json({ error: 'error' });
    else if (result.rows.length === 0) res.status(400).json({ error: 'Incorrect email or password' });
    else res.status(200).json(result.rows[0]);
  });
}

module.exports = { createUser, verifyUser, nearbyRests };
