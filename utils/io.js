const userWsController = require('../utils/Controllers/user.websocket.controller');
const chatController = require('../utils/Controllers/chat.controller');
const users = {};
const clients = {};
const rooms = {};

//io의 이벤트 리스너들 기재
module.exports = function (io) {

    io.on("connection", (socket) => {
        console.log("User is connected to the websocket"); // 서버와 클라이언트가 socket에 연결되면 자동으로 socket 이라는 객체를 생성한다 


        socket.on("login", async (userId) => {
            if (userId) {
                clients[userId] = socket;  // clients 객체에 userId와 socket 매핑
                console.log(`User with ID ${userId} logged in : ${clients[userId].id}`);

                const user = await userWsController.findUserById(userId);
                user.online = true;
                user.save();
            } else {
                console.log("Invalid login credentials");
            }
        });
//User with ID 67b2ec36420e9f59a8b1fd45 logged in

        //join chat 은 기존 멤버 2명 보다 더 많은 인원이 들어왔을 때, 혹은 그룹채팅시 사용하도록 한다.
        socket.on('joinChat', async (userName, cb) => {
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
            console.log('프론트로 부터 받은 메세지:', message);

            if (!recipient) {
                return cb({ ok: false, error: 'Recipient is not existing' });
            } else {
                console.log('recipient is existing ');
            }
            try {
                let recipientIds = Array.isArray(recipient) ? recipient.map(r => r._id) : [recipient._id];
                if(recipientIds.length === 0){
                    recipientIds = [sender._id];
                }
                
                // 채팅방이 이미 있는지 확인
                const existingRoom = await chatController.findChatRoom(recipientIds, sender);

                let room;
                if (existingRoom) {
                    room = existingRoom;
                } else {
                    room = await chatController.saveChatRoom(recipient, sender);
                }

                if (!room) {
                    return cb({ ok: false, error: 'Failed to find or save chat room' });
                } else {
                    console.log('찾거나 새로 생성한 room의 아이디 :', room.id);
                }

                // 채팅룸을 가져오거나 만들고 룸안에 유저들의 소켓을 저장한다 
                rooms[room._id] = [];
                [sender.id, ...recipientIds].forEach(id => {
                    const userSocket = clients[id]; // userId로 해당 소켓을 찾음
                    if (userSocket) {
                        rooms[room._id].push(userSocket); // 소켓을 해당 방 배열에 추가
                    }
                });

                //chat 객체를 저장한다 
                const newMessage = await chatController.saveChat(message, recipient, sender, room);
                (newMessage) ? console.log('newMessage:', newMessage) : console.log('newMessage is null');

                //메세지 전송 - 기존코드
                rooms[room._id].forEach(socket => {
                    console.log('메시지 전송 중:', newMessage);  // 전송되는 메시지 확인
                    console.log('socket 상태:', socket.connected);  // 소켓 연결 상태 확인
                    socket.emit('message', newMessage);
                });

                cb({ ok: true });
            } catch (error) {
                cb({ ok: false, error: error.message });
            }
        } //call back function ended
        );


        socket.on('message', (message) => {
            console.log('받은 메시지:', message);  // 수신된 메시지 확인
        });



        socket.on("disconnect", async () => {
            // 사용자가 연결을 끊었을 때 소켓에서 삭제
            for (let userId in clients) {
                if (clients[userId] === socket) {
                    const user = await userWsController.findUserById(userId);
                    user.online = false;
                    user.save();

                    delete clients[userId];
                    console.log(`User with ID ${userId} disconnected`);
                    break;
                }
            }
            console.log('클라이언트 연결 끊어짐:', socket.id);
        });


    });
};


