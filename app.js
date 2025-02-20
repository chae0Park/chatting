const express = require("express");
const mongoose = require("mongoose");
//needed to use .env file
require('dotenv').config();
const cors = require('cors');
const app = express();
app.use(cors());

//db address bring DB from .env file to process as db address
mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('connected to db'));

module.exports = app