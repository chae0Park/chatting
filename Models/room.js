const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
    {
        name: String,
        members: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "User",
            },
        ],
        
        chats : [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Chat",
            }
        ],
        leftMembers: [
            {
                type: mongoose.Schema.ObjectId, 
                ref: "User" 
            }
        ],
        leftTime:[
            {
                userId: { type: mongoose.Schema.ObjectId, ref: "User" },
                timestamp: Date, // 나간 시간을 기록
            }
        ]
        
    },
    {timestamp: true}    
);

//Remove the unique index constraint from members if it was added elsewhere
roomSchema.index({ members: 1 }, { unique: false });
module.exports = mongoose.model("Room", roomSchema);

