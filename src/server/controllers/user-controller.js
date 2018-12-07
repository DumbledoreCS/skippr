const pgClient = require('../models/database');

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
  // console.log(req.body);
  const values = [email, password];
  // console.log(values);
  const verifyUserStr = 'SELECT * FROM users WHERE email = $1 AND password = $2;';
  pgClient.query(verifyUserStr, values, (err, result) => {
    if (err) res.status(500).json({ error: 'error' });
    else if (result.rows.length === 0) res.status(400).json({ error: 'Incorrect email or password' });
    else res.status(200).json(result.rows[0]);
  });
}

module.exports = { createUser, verifyUser };
