const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
//DB connection
require("./database/connection");
//Uers API route
app.use('/api/users', require('./routes/api/users'));



/*const betweenusers = require('./models/betweenusers');
const cars = require('./models/cars');
const drivers = require('./models/drivers');
const offerridefrom = require('./models/offerridefrom');
const offerrideto = require('./models/offerrideto');
const organizations = require('./models/organizations');
const orgusers = require('./models/orgusers');
const ratings = require('./models/ratings');
const requestridefrom = require('./models/requestridefrom');
const requestrideto = require('./models/requestrideto');
const reviews = require('./models/reviews');
const riders = require('./models/riders');
const trips = require('./models/trips');*/