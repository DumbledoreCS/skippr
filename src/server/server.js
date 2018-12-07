require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userController = require('./controllers/user-controller');
const orderController = require('./controllers/order-controller');
const restaurantController = require('./controllers/restaurant-controller');
const pgClient = require('./models/database');
const cookieSession = require('cookie-session');
const session = require('express-session');


const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days, converted to milliseconds
    keys: [process.env.cookieKey] // encryption for cookie
  })
)

// -----------------Start of Google OAUTH----------------------------------------------------
// Oauth by Dumbodore
const passport = require('passport'); // TEST
const GoogleStrategy = require('passport-google-oauth20').Strategy; // TEST
const keys = require('./config/keys'); // TEST


app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser((user, done) => {
  // console.log('in serializeUser, user is: ', user);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // console.log('starting deserialize user');
  const googleUserStr = 'SELECT * FROM users WHERE google_id = $1';
  const values = [google_id]

  pgClient.query(googleUserStr, values).then(result => {
    const user = result.rows[0];
    // console.log('deserialize main result: ');
    // console.log(user.id);   
    done(null, user);
  });
});

passport.use(new GoogleStrategy({
  clientID: keys.googleClientID,
  clientSecret: keys.googleClientSecret,
  callbackURL: 'http://localhost:3000/auth/google/callback',
},
  (accessToken, refreshToken, profile, done) => {
    const google_id = profile.id;
    const firstname = profile.name.givenName;
    const lastname = profile.name.familyName;
    const email = profile.emails[0].value;

    const existingUserQuery = 'SELECT * FROM users WHERE google_id= $1';
    const existingUserValues = [google_id]
    pgClient.query(existingUserQuery, existingUserValues, (res) => {
      // console.log('hitting existing user block!!!!');
      if (res.rowCount > 0) {
        // console.log('existing user: ', res);
        const existingUser = res.rows[0];
        return done(null, existingUser);
      } else {
        // console.log('hitting new user block!!!!')
          const newUserQuery = 'INSERT INTO users (google_id, firstname, lastname, email) VALUES ($1, $2, $3, $4) returning *;';
          const newUserValues = [google_id, firstname, lastname, email];

          pgClient.query(newUserQuery, newUserValues, (err, res) => { 
        // console.log(result.rows);
            if (err) {
              return done(err);
            } else {
        // console.log('result is ', res);
              const newUser = res.rows[0];
        // console.log("newUser's first name: ", newUser.firstname);
              return done(null, newUser);
            }
          })
        }
    })
  })
); 


app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// oauth callback route
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/user/login'}),
  (req, res) => {
    // console.log('hitting callback');
    req.session.user = req.user;
    res.redirect('/test');
  }
);

// --------------------------------------------------------------------------
app.get('/api/logout', (req, res) => {
  req.logout();
  req.session = null; // this is actually needed to clear the cookie session 
  res.redirect('/');
});

app.get('/api/current_user', (req, res) => {
  console.log('current user');
  console.log(req.user);
  res.send(req.user); // req.user generated from cookie session and passport
});

// -----------------End of Google OAUTH----------------------------------------------------

// Testing Route
app.get('/test', (req, res) => {
  res.send('yay!');
});

app.get('/user/restaurants', restaurantController.displayRests); // checked by Dumbodore
app.get('/user/restaurants/:fkRestId', restaurantController.getRestMenu); // checked by Dumbodore
app.get('/restaurant/orders/:restId', orderController.displayOrders); 
app.get('/user/nearby', userController.nearbyRests); // added by Dumbodore

app.post('/user/login', userController.verifyUser); // checked by Dumbodore
app.post('/restaurant/login', restaurantController.verifyRest); // checked by Dumbodore
app.post('/user/signup', userController.createUser); // checked by Dumbodore
app.post('/user/order', orderController.submitOrder);
app.post('/restaurant/signup', restaurantController.createRest); // checked by Dumbodore
app.post('/restaurant/menu', restaurantController.createMenu); // created by Dumbodore



app.post('/user/orderdetails', orderController.createOrderPerItem);

app.put('/restaurant/orders/:orderId', orderController.completeOrder);

// Dynamic Port Binding
// Heroku defined PORT or localhost:3000
const PORT = process.env.PORT || 3000;
// app.listen(process.env.PORT || 3000);
app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log(`Server listening on ${PORT}`);
});
