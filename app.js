const express = require("express");
const mongoose = require("mongoose");
const Room = require('./Models/room');
const Chat = require('./Models/chat');
//needed to use .env file
require('dotenv').config();
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
//이미지 읽기
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));  

const userRoutes = require('./Routes/userRoutes')
const chatRoutes = require('./Routes/chatRoutes')


//route사용예시
app.use('/api', userRoutes);  // 사용자 관련 API
app.use('/api', chatRoutes);  // 채팅 관련 API

//db address bring DB from .env file to process as db address
mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('connected to db'));

module.exports = app



// 데이터베이스 연결
// mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => {
//         console.log('connected to db');
        
//         // 앱 시작 시점에 해당 ObjectId를 가진 데이터를 삭제하는 쿼리 실행
//         const chatIdToRemove = '676530af2ad2840a91804f92';  // 삭제할 ObjectId

//         // chats 배열에서 해당 ObjectId를 자동으로 제거
//         Room.updateMany(
//             { chats: new mongoose.Types.ObjectId(chatIdToRemove) },  // chats 배열에 해당 ObjectId가 포함된 모든 문서 찾기
//             { $pull: { chats: new mongoose.Types.ObjectId(chatIdToRemove) } }  // 해당 ObjectId를 chats 배열에서 제거
//         )
//         .then(result => {
//             console.log(`Successfully removed chat ID ${chatIdToRemove} from chats arrays.`);
//         })
//         .catch(err => {
//             console.error('Error removing chat ID:', err);
//         });
//     })
//     .catch(err => console.error('MongoDB connection error:', err));

//room 찾아서 room과 room에 있는 chats들 모두 삭제하기 
// mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(async () => {
//         console.log('Connected to DB');

//         // 삭제할 room의 ObjectId
//         const roomIdToRemove = '676a587127093933c464656f'; // 삭제할 room ID

//         // 해당 room을 찾고, 그 안에 있는 모든 chat Id를 가져옵니다.
//         const room = await Room.findById(roomIdToRemove);
        
//         if (!room) {
//             console.log('Room not found');
//             return;
//         }

//         // chats 배열에 포함된 모든 ObjectId들
//         const chatIdsToRemove = room.chats;

//         if (chatIdsToRemove.length === 0) {
//             console.log('No chats found in this room');
//             return;
//         }

//         // 1. Room의 chats 배열에서 해당 ObjectId들을 모두 삭제
//         await Room.updateOne(
//             { _id: roomIdToRemove },
//             { $pull: { chats: { $in: chatIdsToRemove } } }
//         );

//         // 2. chats 배열에 포함된 각각의 chat들을 삭제
//         await Chat.deleteMany({ _id: { $in: chatIdsToRemove } });

//         // 3. 해당 room 자체 삭제
//         await Room.deleteOne({ _id: roomIdToRemove });

//         console.log(`Successfully removed room and all associated chats.`);
//     })
//     .catch(err => {
//         console.error('MongoDB connection error:', err);
//     });
