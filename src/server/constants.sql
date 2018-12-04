-- USERS TABLE
-- Deletes the users table
DROP TABLE users

-- Creates the users table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  user_firstname VARCHAR NOT NULL,
  user_lastname VARCHAR NOT NULL,
  user_email VARCHAR NOT NULL,
  user_password VARCHAR NOT NULL,
  user_phone VARCHAR NOT NULL
);

-- This query inserts an new row into the users table
INSERT INTO users (user_firstname, user_lastname, user_email, user_password, user_phone)
  VALUES ('Stanley', 'Kubrick', 'lolita@gmail.com', '2001', '(555) 555-5000');

-- This query uses the passed email address to retrieve the user_password from the users table
SELECT * 
FROM users 
WHERE user_email = 'lolita@gmail.com';

-- RESTAURANTS TABLE
-- Creates the restaurants table
CREATE TABLE restaurants (
  rest_id SERIAL PRIMARY KEY,
  rest_name VARCHAR NOT NULL,
  rest_email VARCHAR NOT NULL,
  rest_password VARCHAR NOT NULL,
  rest_address VARCHAR NOT NULL,
  rest_city VARCHAR NOT NULL,
  rest_state VARCHAR NOT NULL,
  rest_zipcode VARCHAR NOT NULL,
  rest_phone VARCHAR NOT NULL,
  rest_yelp_link VARCHAR NOT NULL,
  rest_imagelink VARCHAR NOT NULL
);

-- This query inserts a new row into the restaurants table

INSERT INTO restaurants (rest_name, rest_email, rest_password, rest_address, rest_city, rest_state, rest_zipcode, rest_phone, rest_yelp_link, rest_imagelink)
  VALUES ('Menotti''s Coffee Shop', 'admin@menottis.com', 'espresso424', '56 Windward Ave', 'Venice', 'CA', '90291', '(424) 205-7014', 'https://www.yelp.com/biz/menottis-coffee-stop-venice', 'http://frshgrnd.com/wp-content/uploads/2015/10/menottis-coffee-shop-venice-FRSHGRND-1898-610x424.jpg');
  
-- This query uses the passed email address to retrieve the rest_password from the restaurants table
SELECT * 
FROM restaurants 
WHERE rest_email = 'admin@menottis.com';

-- This query selects all the restaurants from the restaurants table
SELECT *
FROM restaurants

--MENU_ITEMS TABLE

-- The query below, deletes the menu_items table if it exists, 
-- creates the menu_items table, and adds default menu_items
DROP TABLE menu_items;

CREATE TABLE menu_items (
  menu_item_id SERIAL PRIMARY KEY,
  menu_item_name VARCHAR NOT NULL,
  menu_item_price NUMERIC(5, 2) NOT NULL,
  menu_item_desc VARCHAR NOT NULL,
  fk_rest_id INTEGER REFERENCES restaurants(rest_id)
);

INSERT INTO menu_items (menu_item_name, menu_item_price, menu_item_desc, fk_rest_id)
  VALUES ('Chai', '5.00', 'A coffee drink consisting of espresso with microfoam', (SELECT rest_id from restaurants WHERE rest_name='Menotti''s Coffee Shop' ));

INSERT INTO menu_items (menu_item_name, menu_item_price, menu_item_desc, fk_rest_id)
  VALUES ('Filtered Coffee', '4.00', 'Really? It''s coffee we run through a filter', (SELECT rest_id from restaurants WHERE rest_name='Menotti''s Coffee Shop' ));

INSERT INTO menu_items (menu_item_name, menu_item_price, menu_item_desc, fk_rest_id)
  VALUES ('Cold Brew', '5.00', 'Hot coffee that''s been cooled down and poured over ice', (SELECT rest_id from restaurants WHERE rest_name='Menotti''s Coffee Shop' ));

INSERT INTO menu_items (menu_item_name, menu_item_price, menu_item_desc, fk_rest_id)
  VALUES ('Spanish Latte', '6.50', 'White coffee that originated in Spain and is made by combining a strong coffee, usually in the form of espresso, with hot milk', (SELECT rest_id from restaurants WHERE rest_name='Menotti''s Coffee Shop' ));

INSERT INTO menu_items (menu_item_name, menu_item_price, menu_item_desc, fk_rest_id)
  VALUES ('Mocha', '6.50', 'One third espresso, two thirds steamed milk, with some chocolate added', (SELECT rest_id from restaurants WHERE rest_name='Menotti''s Coffee Shop' ));

INSERT INTO menu_items (menu_item_name, menu_item_price, menu_item_desc, fk_rest_id)
  VALUES ('Flat White', '4.00', 'A spiced beverage brewed with a variety of warming spices', (SELECT rest_id from restaurants WHERE rest_name='Menotti''s Coffee Shop' ));


--  This query returns an array of menu_items for a particular restaurant
SELECT
menu_items.menu_item_id,
menu_items.menu_item_name,
menu_items.menu_item_price,
menu_items.menu_item_desc,
menu_items.fk_rest_id
FROM menu_items 
INNER JOIN restaurants ON menu_items.fk_rest_id = restaurants.rest_id 
WHERE restaurants.rest_name = 'Menotti''s Coffee Shop'; 

--  This extra query returns a larger object. Need to explore the results more
SELECT * FROM menu_items INNER JOIN restaurants ON menu_items.fk_rest_id = restaurants.rest_id WHERE restaurants.rest_name = 'Menotti''s Coffee Shop'; 

-- ORDERS TABLE

-- Delete the orders table
DROP TABLE orders;

-- Create the orders table
CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  order_ready BOOLEAN,
  fk_user_id INTEGER REFERENCES users(user_id),
  fk_rest_id INTEGER REFERENCES restaurants(rest_id)
);

-- Insert a new row into the orders table and return the order_id 
INSERT INTO orders (order_ready, fk_user_id, fk_rest_id) 
  VALUES (false, (SELECT user_id from users WHERE user_email='lolita@gmail.com' ), (SELECT rest_id from restaurants WHERE rest_name='Menotti''s Coffee Shop' )) 
  RETURNING order_id;

-- Update an order_ready value to true
UPDATE orders SET order_ready = true WHERE order_id = $1 RETURNING order_ready AS order_ready;

-- ORDER_ITEMS TABLE

-- Delete the order_items table
DROP TABLE order_items;

-- Create the order_items table
CREATE TABLE order_items (
  order_item_id SERIAL PRIMARY KEY,
  fk_orders INTEGER REFERENCES orders(order_id),
  fk_menu_item INTEGER REFERENCES menu_items(menu_item_id)
);

-- Insert a new row into the order_items table and return the order__item_id
INSERT INTO order_items (fk_orders, fk_menu_item) 
  VALUES (25, (SELECT menu_item_id from menu_items WHERE menu_item_id=3)) 
  RETURNING order_items.order_item_id AS order_item_id;

-- Grabing orders for a restaurant

SELECT * from orders WHERE order_ready = false AND fk_rest_id = 1;

-- Query to return a list of order items for open orders for a specific restaurant
SELECT
 oi.fk_orders,
 oi.fk_menu_item
FROM 
 order_items AS oi
 INNER JOIN orders as o 
 ON oi.fk_orders = o.order_id
 INNER JOIN restaurants as r 
 ON o.fk_rest_id = r.rest_id
 WHERE o.order_ready = false AND r.rest_id = 1;

-- Same as above, but includes user's first name, last name and the restaurnt name
 SELECT 
  oi.fk_orders,  
  oi.fk_menu_item, 
  r.rest_name, 
  u.user_firstname, 
  u.user_lastname 
FROM order_items AS oi 
INNER JOIN orders as o ON oi.fk_orders = o.order_id  
INNER JOIN restaurants as r ON o.fk_rest_id = r.rest_id 
INNER JOIN users as u ON o.fk_user_id = u.user_id 
WHERE o.order_ready = false AND r.rest_id = 1;
