const pgClient = require('../models/database');
const axios = require('axios');


// STRETCH FEATURE: write new restaurant row to restaurants table
function createRest(req, res) {
  // deconstructs properties stored in request body
  const { name, email, password, address, city, state, zipCode, phone, yelpLink, imageLink } = req.body;
  // create correctly formatted address for request
  let formatAddress = `${address}, ${city}, ${state}, ${zipCode}`;
  // send request to google api
  // when request returns, store longitude and latitude into respective labels
  // include long and lat as input to store into via values array
  // insert data into database
  axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
    params: {
      address: formatAddress,
      key: 'AIzaSyAIDCvHRxSebeeGzY38HO1fFBCUY111onc',
    },
  })
    .then((response) => {
      const lat = response.data.results[0].geometry.location.lat;
      const lng = response.data.results[0].geometry.location.lng;
      const values = [name, email, password, lat, lng, address, city, state, zipCode, phone, yelpLink, imageLink];
      const createRestStr = 'INSERT INTO restaurants (name, email, password, latitude, longitude, address, city, state, zipcode, phone, yelp_link, image_link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *;';
      pgClient.query(createRestStr, values, (err, result) => {
        if (err) res.status(400).json({ error: 'Unable to create a restaurant account' });
        else {
          res.status(200).json({
            message: 'New restaurant account has been successfully create',
            restaurant: result.rows[0],
          });
        }
      });
    })
    .catch(err => res.send(err));
}

// fetch restaurant email and password match from restaurants table
function verifyRest(req, res) {
  const { email, password } = req.body;
  // console.log(req.body);
  const values = [email, password];
  // console.log(values);
  const verifyRestStr = 'SELECT * FROM restaurants WHERE rest_email = $1 AND rest_password = $2;';
  pgClient.query(verifyRestStr, values, (err, result) => {
    if (err) res.status(400).json({ error: 'Error' });
    else if (result.rows.length === 0) res.status(400).json({ error: 'Incorrect email or password'});
    else res.status(200).json(result.rows[0]);
  });
}

// fetch list of restaurants from restaurants table
function displayRests(req, res) {
  const displayRestsStr = 'SELECT * FROM restaurants;';
  pgClient.query(displayRestsStr, (err, result) => {
    if (err) res.status(400).json({ error: 'Could not retrieve restaurants' });
    else res.status(200).json(result.rows);
  });
}

// fetch list of menu items from menu items table
function getRestMenu(req, res) {
  const { fkRestId } = req.params;
  const values = [fkRestId];
  const getMenuStr = 'SELECT * FROM menu_items WHERE fk_rest_id = $1;';
  pgClient.query(getMenuStr, values, (err, result) => {
    if (err) res.status(400).json({ error: 'Could not retrieve this menu' });
    else res.status(200).json(result.rows);
  });
}

module.exports = { createRest, verifyRest, displayRests, getRestMenu };
