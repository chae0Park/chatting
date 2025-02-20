const User = require('../../Models/user');
const userWsController = {}

userWsController.findUserByName = async (userName) => {
    try{
        const user = await User.findOne({ name: userName });
        return user;
    }catch (error){
        throw new Error('User not found');
    }

};

userWsController.findUserById = async (userId) => {
    try{
        const user = await User.findById(userId);
        return user;
    }catch (error){
        throw new Error('User not found');
    }

};

userWsController.findUsersById = async (userIds) => {
    try{
        const user = await User.find({ '_id': { $in: userIds } });
        return user;
    }catch (error){
        throw new Error('User not found');
    }

};


userWsController.findUserBySocketId = async (socketId) => {
    try{
        const user = await User.findOne({ socketId: socketId });
        return user;
    }catch(e){
        throw new Error('User socket id is not found');
    }
};

module.exports =userWsController;