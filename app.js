const express = require("express");
const errorHandler = require("./Middleware/errorHandler")
const mongoose = require("mongoose");
require('dotenv').config();
const cors = require('cors');
const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
//이미지 읽기
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));  

const userRoutes = require('./Routes/userRoutes')
const chatRoutes = require('./Routes/chatRoutes')


//route사용예시
app.use('/api', userRoutes);  // 사용자 관련 API
app.use('/api', chatRoutes);  // 채팅 관련 API
app.use(errorHandler);

//db address bring DB from .env file to process as db address
mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('connected to db'));

module.exports = app



