const userWsController = require('../utils/Controllers/user.websocket.controller');
const chatController = require('../utils/Controllers/chat.controller');
const users = {};
const User = require('../Models/user');

//io의 이벤트 리스너들 기재
module.exports = function (io) {

    io.on("connection", async (socket) => {
        console.log("User is connected to the websocket", socket.id); //socket.id is created automatically

        //todo : if I succeed in fetching chat history, delete this event and also the one in Home.jsx too
        socket.on("registerSocket", async (userId) => {
            console.log('registerSocket is called', userId);
            try {
                const user = await userWsController.findUserById(userId);
                if (user) {

                    if (!user.socketId) {
                        user.socketId = []; // If it's not an array, initialize it
                    }

                    if (!user.socketId.includes(socket.id)) {
                        user.socketId.push(socket.id); // Add socket id to the user's socketId array
                        await user.save();
                        console.log('Socket registered for user:', userId);
                    } else {
                        console.log('Socket id already registered');
                    }

                } else {
                    console.log('User not found:', userId);
                    socket.emit('error', 'User not found');
                }
            } catch (e) {
                console.error('Error registering socket:', e);
            }
        });

        //join chat 은 기존 멤버 2명 보다 더 많은 인원이 들어왔을 때, 혹은 그룹채팅시 사용하도록 한다.
        socket.on('joinChat', async (userName, cb) => {
            //call saveUser function from userController to save user info
            try {
                const user = await userWsController.findUserByName(userName);
                if (user) {
                    user.socketId.push = (socket.id);
                    await user.save();

                    users[socket.id] = user; //store the user in the users object
                    const welcomeMessage = {
                        chat: `${user.name} has joined`,
                        user: { id: null, name: 'system' },
                    };
                    io.emit("message", welcomeMessage);
                    cb({ ok: true, data: user })
                } else {
                    cb({ ok: false, error: 'User not found' });
                }
            } catch (error) {
                cb({ ok: false, error: error.message });
            }
        });

        
        socket.on("sendMessage", async ({ message, recipient, sender }, cb) => {
            console.log('받는사람', recipient);

            if (!recipient) {
                return cb({ ok: false, error: 'Recipient is not existing' });
            }else{
                console.log('recipient is existing : ', recipient);
            }


            try {
                // 채팅 메시지 저장
                const user = await userWsController.findUserById(sender.id);
                console.log('user-보내는 사람은?:', user);

                const newMessage = await chatController.saveChat({ message, recipient, sender }, user);

                //메세지 전송 - 기존코드
                io.emit('message', newMessage);


                cb({ ok: true }); // 클라이언트에게 성공 응답
            } catch (error) {
                cb({ ok: false, error: error.message }); // 실패 시 에러 응답
            }
        });



        

        socket.on("disconnect", async () => {
            const user = users[socket.id];
            if (user) {
                user.socketId = user.socketId.filter(id => id !== socket.id);
                await user.save();
                delete users[socket.id];
                const exitMessage = {
                    chat: `${user.name} has left`,
                    user: { id: null, name: 'system' },
                };
                io.emit("message", exitMessage);
            }
            console.log('user is disconnected');
            //system 메세지로 ${user.name} left 표시해주기 
        });
    });
};


