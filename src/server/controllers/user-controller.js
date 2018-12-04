const pgClient = require('../models/database');

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

module.exports = { createUser, verifyUser };
