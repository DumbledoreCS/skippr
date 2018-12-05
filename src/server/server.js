require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userController = require('./controllers/user-controller');
const orderController = require('./controllers/order-controller');
const restaurantController = require('./controllers/restaurant-controller');


const app = express();

app.use(cors());
app.use(bodyParser.json());

// Testing Route
// app.get('/test', (req, res) => {
//   res.send('yay!');
// });

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
  else console.log('Server listening on localhost:3000');
});
