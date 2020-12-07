const properties = require("./json/properties.json");
const users = require("./json/users.json");
const { Pool } = require("pg");

/// Users

const pool = new Pool({
  user: "vagrant",
  password: "123",
  host: "localhost",
  database: "lightbnb",
});

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  const values = [email];

  const sqlQuery = ` SELECT *
  FROM users 
  WHERE users.email = $1
  ; `;

  return pool.query(sqlQuery, values).then((res) => {
    if (res.rows[0] === undefined) {
      return null;
    }
    return res.rows[0];
  });
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  const values = [id];

  const sqlQuery = ` SELECT *
   FROM users 
   WHERE users.id = $1
   ; `;

  return pool.query(sqlQuery, values).then((res) => {
    if (res.rows[0] === undefined) {
      return null;
    }
    //  console.log(res.rows[0])
    return res.rows[0];
  });
};
exports.getUserWithId = getUserWithId;

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  let values = [user.name, user.email, user.password];
  let sqlQuery = `INSERT INTO users(name, email, password) VALUES ($1, $2, $3) RETURNING *;`;

  return pool.query(sqlQuery, values).then((res) => res.rows[0]);
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  let values = [guest_id, limit];

  let sqlQuery = `SELECT properties.*, reservations.*, avg(rating) as average_rating
  FROM reservations
  JOIN properties ON reservations.property_id = properties.id
  JOIN property_reviews ON properties.id = property_reviews.property_id 
  WHERE reservations.guest_id = $1
  AND reservations.end_date < now()::date
  GROUP BY properties.id, reservations.id
  ORDER BY reservations.start_date
  LIMIT $2;`;

  return pool.query(sqlQuery, values).then((res) => res.rows);
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {
  ///LIMIT IS ALWAYS SHOWING AS 20 -which is the value in the API routes
  console.log("this is limit:", limit);
  const values = [];

  let sqlQuery = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  if (options.city) {
    values.push(`%${options.city}%`);
    sqlQuery += `WHERE city LIKE $${values.length}`;
  }

  //WHERE TO ACCESS THIS IN SEARCH PAGE?
  if (options.owner_id) {
    if (values.length === 0) {
      values.push(`${options.owner_id}`);
      sqlQuery += `WHERE owner_id = $${values.length}`;
    } else {
      values.push(`${options.owner_id}`);
      sqlQuery += ` AND owner_id = $${values.length}`;
    }
  }

  //// SEEMS TO be FIXED**
  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    if (values.length === 0) {
      values.push(`${options.minimum_price_per_night * 100}`);
      sqlQuery += `WHERE cost_per_night >= $${values.length}`;
      values.push(`${options.maximum_price_per_night * 100}`);
      sqlQuery += ` AND cost_per_night <= $${values.length}`;
    } else {
      values.push(`${options.minimum_price_per_night * 100}`);
      sqlQuery += ` AND cost_per_night >= $${values.length}`;
      values.push(`${options.maximum_price_per_night * 100}`);
      sqlQuery += ` AND cost_per_night <= $${values.length}`;
    }
  } else if (options.minimum_price_per_night) {
    if (values.length === 0) {
      values.push(`${options.minimum_price_per_night * 100}`);
      sqlQuery += `WHERE cost_per_night >= $${values.length}`;
    } else {
      values.push(`${options.minimum_price_per_night * 100}`);
      sqlQuery += ` AND cost_per_night >= $${values.length}`;
    }
  } else if (options.maximum_price_per_night) {
    if (values.length === 0) {
      values.push(`${options.maximum_price_per_night * 100}`);
      sqlQuery += `WHERE cost_per_night <= $${values.length}`;
    } else {
      values.push(`${options.maximum_price_per_night * 100}`);
      sqlQuery += ` AND cost_per_night <= $${values.length}`;
    }
  }

  if (options.minimum_rating) {
    if (values.length === 0) {
      values.push(`${options.minimum_rating}`);
      sqlQuery += `WHERE rating >= $${values.length}`;
    } else {
      values.push(`${options.minimum_rating}`);
      sqlQuery += ` AND rating >= $${values.length}`;
    }
  }

  values.push(limit);
  sqlQuery += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${values.length};`;

  console.log(sqlQuery);
  console.log("THIS IS VALUE:", values);
  ///HOW EXACTLY is the RES.ROWS ARRAY being used after it is sent in the bellow return.
  return pool.query(sqlQuery, values).then((res) => res.rows);
};
exports.getAllProperties = getAllProperties;

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  let values = [property.owner_id, property.title, property.description, property.thumbnail_photo_url, 
    property.cover_photo_url, property.cost_per_night, property.street, property.city, property.province, 
    property.post_code, property.country, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms];
  

  let sqlQuery = `INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, 
    cover_photo_url, cost_per_night, street, city, province, 
    post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *;`
  // const propertyId = Object.keys(properties).length + 1;
  // property.id = propertyId;
  // properties[propertyId] = property;
  // return Promise.resolve(property);
  return pool.query(sqlQuery, values).then((res) => res.rows[0]);
};
exports.addProperty = addProperty;
