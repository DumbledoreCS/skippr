require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userController = require('./controllers/user-controller');
const orderController = require('./controllers/order-controller');
const restaurantController = require('./controllers/restaurant-controller');
const pgClient = require('./models/database');
const cookieSession = require('cookie-session');


const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days, converted to milliseconds
    keys: [process.env.cookieKey] // encryption for cookie
  })
)

// -----------------Google OAUTH----------------------------------------------------
// Oauth by Dumbodore
const passport = require('passport'); // TEST
const GoogleStrategy = require('passport-google-oauth20').Strategy; // TEST
const keys = require('./config/keys'); // TEST


app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  console.log('starting deserialize user');

  const googleUserStr = 'SELECT * FROM users WHERE id = $1';

  pgClient.query(googleUserStr, [google_id]).then(result => {
    const user = result.rows[0];
    console.log('deserialize main result: ');
    console.log(user.id);
    
    done(null, user);
  });
});


passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback',
      proxy: true,
    },
    (accessToken, refreshToken, profile, done) => {
      // console.log('accessToken ', accessToken);
      // console.log('refreshToken ', refreshToken);
      const google_id = profile.id;
      const firstname = profile.name.givenName;
      const lastname = profile.name.familyName;
      const email = profile.emails[0].value;

      const queryText = 'INSERT INTO users (google_id, firstname, lastname, email)' + 'values ($1, $2, $3, $4) ' + 'on conflict (id) do update set firstname=$2, lastname=$3, email=$4 ' + 'returning *';
      
      console.log('googleId ', google_id)
      pgClient.query(queryText, [google_id, firstname, lastname, email], (result) => {
        // console.log(result.rows);
        console.log(result);

        const user = result.rows[0];
        console.log('google auth: ');
        console.log(user.id);

        done(null, user);
      })
    }
  )
); // TEST


app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// testing code
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/user/login'}),
  (req, res) => {
    console.log('hitting callback');
    res.redirect('/test');
  }
);

// working code 
// app.get('/auth/google/callback', 
//   passport.authenticate('google'));
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



// Testing Route
app.get('/test', (req, res) => {
  res.send('yay!');
});

app.get('/user/restaurants', restaurantController.displayRests); // checked by Dumbodore
app.get('/user/restaurants/:fkRestId', restaurantController.getRestMenu); // checked by Dumbodore
app.get('/restaurant/orders/:restId', orderController.displayOrders); 

app.post('/user/login', userController.verifyUser); // checked by Dumbodore
app.post('/restaurant/login', restaurantController.verifyRest); // checked by Dumbodore
app.post('/user/signup', userController.createUser); // checked by Dumbodore
app.post('/user/order', orderController.submitOrder);
app.post('/restaurant/signup', restaurantController.createRest); // checked by Dumbodore
app.post('/restaurant/menu', restaurantController.createMenu); // created by Dumbodore


app.put('/restaurant/orders/:orderId', orderController.completeOrder);

// Dynamic Port Binding
// Heroku defined PORT or localhost:3000
const PORT = process.env.PORT || 3000;
// app.listen(process.env.PORT || 3000);
app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log(`Server listening on ${PORT}`);
});
