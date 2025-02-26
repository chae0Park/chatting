const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User must type name'],
        unique: true,
    },
    email: {
        type: String,
        required: [true, 'User must type email'],
        unique: true,
    },

    currentPassword: {
        type: String,
        required: [true, 'User must type password'],
    },
    newPassword: {
        type: String,
    },
    refreshToken: {
        type: String,
    },
    online: {
        type: Boolean,
        default: false,
    },
    profileImage: {
        type: String,
    },
    rooms: 
    [
        {
        type: mongoose.Schema.ObjectId,
        ref: "Room",
        }
    ],
    friends: [
        { 
            _id: false,
            userId: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                
            },
            status: {
                type: Boolean, 
                default: false
            }
        }
    ],

},
    {timestamp : true}
);


userSchema.pre('save', async function(next) {
    if(this.isModified('currentPassword')){
        const salt = await bcrypt.genSalt(10);
        this.currentPassword = await bcrypt.hash(this.currentPassword, salt);
    }
    next();
});
module.exports = mongoose.model("User", userSchema);