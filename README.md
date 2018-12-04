# SKIPPR API Server
App that helps small businesses with online ordering

## Routes
### Restaurants
`GET /user/restaurants`

Retrieve a list of restaurants in the database.

Output:
```javascript
[
  {
    "rest_id": 1,
    "rest_name": "Menotti's Coffee Shop",
    "rest_email": "admin@menottis.com",
    "rest_password": "espresso424",
    "rest_address": "56 Windward Ave",
    "rest_city": "Venice",
    "rest_state": "CA",
    "rest_zipcode": "90291",
    "rest_phone": "(424) 205-7014",
    "rest_yelp_link": "https://www.yelp.com/biz/menottis-coffee-stop-venice",
    "rest_imagelink": "http://frshgrnd.com/wp-content/uploads/2015/10/menottis-coffee-shop-venice-FRSHGRND-1898-610x424.jpg"
  }
]
```


`GET /user/restaurants/:fkRestId`

Display list of menu items for a specific restaurant.

Output: 
```javascript
[
  {
    "menu_item_id": 1,
    "menu_item_name": "Chai",
    "menu_item_price": "5.00",
    "menu_item_desc": "A coffee drink consisting of espresso with microfoam",
    "fk_rest_id": 1
  },
]
```


`POST /restaurant/signup`

Create a new restaurant account.

Input: 
```javascript
{
  "name": "Menotti's Coffee Shop",
  "email": "admin@menottis.com",
  "password": "espresso424",
  "address": "56 Windward Ave",
  "city": "Venice",
  "state": "CA",
  "zipCode": "90291",
  "phone": "(424) 205-7014",
  "yelpLink": "https://www.yelp.com/biz/menottis-coffee-stop-venice",
  "imageLink": "http://frshgrnd.com/wp-content/uploads/2015/10/menottis-coffee-shop-venice-FRSHGRND-1898-610x424.jpg"
  },
```

Output:
```javascript
{
  "message": 'New restaurant account has been successfully created',
  "restaurant": {
    "rest_id": 1,
    "rest_name": "Menotti's Coffee Shop",
    "rest_email": "admin@menottis.com",
    "rest_password": "espresso424",
    "rest_address": "56 Windward Ave",
    "rest_city": "Venice",
    "rest_state": "CA",
    "rest_zipcode": "90291",
    "rest_phone": "(424) 205-7014",
    "rest_yelp_link": "https://www.yelp.com/biz/menottis-coffee-stop-venice",
    "rest_imagelink": "http://frshgrnd.com/wp-content/uploads/2015/10/menottis-coffee-shop-venice-FRSHGRND-1898-610x424.jpg"
  },
}
```


`POST /restaurant/login`

Verify a restaurants's login credentials.

Input: 
```javascript
{
	"email": "admin@menottis.com",
	"password": "espresso424"
}
```

Output:
```javascript
{
  "rest_id": 1,
  "rest_name": "Menotti's Coffee Shop",
  "rest_email": "admin@menottis.com",
  "rest_password": "espresso424",
  "rest_address": "56 Windward Ave",
  "rest_city": "Venice",
  "rest_state": "CA",
  "rest_zipcode": "90291",
  "rest_phone": "(424) 205-7014",
  "rest_yelp_link": "https://www.yelp.com/biz/menottis-coffee-stop-venice",
  "rest_imagelink": "http://frshgrnd.com/wp-content/uploads/2015/10/menottis-coffee-shop-venice-FRSHGRND-1898-610x424.jpg"
}
```

### Users

`POST /user/login`

Verify a user's email and login credentials.

Input: 
```javascript
{
  "email": "lolita@gmail.com",
  "password": 2001,
}
```

Output:
```javascript
{
  "user_id": 1,
  "user_firstname": "Stanley",
  "user_lastname": "Kubrick",
  "user_email": "lolita@gmail.com",
  "user_password": "2001",
  "user_phone": "(555) 555-5000"
}
```


`POST /user/signup`

Create a new user account.

Input: 
```javascript
{
	"firstName": "Alfred",
	"lastName": "Hitchcock",
	"email": "rebecca@gmail.com",
	"password": "psycho",
	"phoneNumber": "(555) 555-5555"
}
```

Output:
```javascript
{
  "message": "New user has been successfully created",
  "user": {
      "user_id": 4,
      "user_firstname": "Alfred",
      "user_lastname": "Hitchcock",
      "user_email": "rebecca@gmail.com",
      "user_password": "psycho",
      "user_phone": "(555) 555-5555"
  }
}
```

### Orders

`POST /user/order`

Create an order for a specific user.

Input: 
```javascript
{
	"userId": "1",
	"restId": "1",
	"menuItems": [1,2]
}
```

Output:
```javascript
{
  "message": 'Your order was submitted successfully',
  "orderId": 1
}
```


`PUT /restaurant/orders/:orderId`

Complete an order.

Output:
```javascript
{
  "message": "This order has been completed",
  "orderId": "25"
}
```


`GET /restaurant/orders/:restId`

Display list of incomplete orders for a specific restaurant.

Output:
```javascript
[
  {
    "fk_orders": 22,
    "fk_menu_item": 5,
    "rest_name": "Menotti's Coffee Shop",
    "user_firstname": "Stanley",
    "user_lastname": "Kubrick"
  },
]
```
