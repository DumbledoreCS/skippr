const axios = require('axios');
const pgClient = require('../models/database');

// UPDATED createRest by Dumbodore POST 'restaurant/signup'
// STRETCH FEATURE: write new restaurant row to restaurants table
function createRest(req, res) {
  // deconstructs properties stored in request body
  const { name, email, password, address, city, state, zipcode, phone, yelp_link, image_link } = req.body;
  // create correctly formatted address for request
  const formatAddress = `${address}, ${city}, ${state}, ${zipcode}`;
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
      const values = [name, email, password, lat, lng, address, city, state, zipcode, phone, yelp_link, image_link];
      const createRestStr = 'INSERT INTO restaurants (name, email, password, latitude, longitude, address, city, state, zipcode, phone, yelp_link, image_link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *;';
      pgClient.query(createRestStr, values, (err, result) => {
        if (err) res.status(400).json({ error: 'Unable to create a restaurant account' });
        else {
          res.status(200).json({
            message: 'New restaurant account has been successfully created',
            restaurant: result.rows[0],
          });
        }
      })
    })
    .catch(err => res.send(err));
}

// UPDATED verifyRest by Dumbodore POST '/restaurant/login'
// fetch restaurant email and password match from restaurants table 
function verifyRest(req, res) {
  const { email, password } = req.body;
  const values = [email, password];
  const verifyRestStr = 'SELECT * FROM restaurants WHERE email = $1 AND password = $2;';
  pgClient.query(verifyRestStr, values, (err, result) => {
    if (err) res.status(400).json({ error: 'Error' });
    else if (result.rows.length === 0) res.status(400).json({ error: 'Incorrect email or password' });
    else res.status(200).json(result.rows[0]);
  });
}

// UPDATED displayRests by Dumbodore GET '/user/restaurants'
// fetch list of restaurants from restaurants table
function displayRests(req, res) {
  const displayRestsStr = 'SELECT * FROM restaurants;';
  pgClient.query(displayRestsStr, (err, result) => {
    if (err) res.status(400).json({ error: 'Could not retrieve restaurants' });
    else res.status(200).json(result.rows);
  });
}

// CREATED createMenu by Dumbodore POST '/restaurant/menu' 
function createMenu(req, res) {
  const { name, price, desc, calories, fk_rest_id } = req.body;
  const values = [name, price, desc, calories, fk_rest_id];
  const createMenuStr = 'INSERT INTO menu_items (name, price, "desc", calories, fk_rest_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;';
  pgClient.query(createMenuStr, values, (err, result) => {
    if (err) res.status(400).json({ error: 'Unable to create menu for your restaurant' });
    else {
      res.status(200).json({
        message: 'New menu item has been successfully added',
        menu_item: result.rows[0],
      });
    }
  });
}

// UPDATED getRestMenu by Dumbodore GET '/user/restaurants/:fk_rest_id'
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

module.exports = { createRest, verifyRest, displayRests, getRestMenu, createMenu };
