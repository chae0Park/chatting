const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
    {
        chat: String,

        sender: { //new mongoose.Schema' for a single object***
          type: new mongoose.Schema({ 
            name: { type: String, required: true },
            profileImage: { type: String },
            _id: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
            online: {type: Boolean, default: false},
          }),
          required: true
        },

    recipient:{
      type:
        [{
          name: { type: String, required: true },
          profileImage: { type: String },
          _id: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
          online: { type: Boolean, default: false },
        }]
      ,
      required: true
    },

        createdAt: {
          type: Date,
          default: Date.now, 
        },
        
        isRead: { 
          type: Boolean, 
          default: false 
        }, 

      room: {
          type: mongoose.Schema.ObjectId,
          ref: "Room",
      },
    },
        {timestamp: true}
    );

    module.exports = mongoose.model("Chat", chatSchema);