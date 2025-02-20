const Room = require('../../Models/room');
const Chat = require('../../Models/chat');
const User = require('../../Models/user');
const chatController = {};
//controller for http

chatController.fetchRoomDataOfUser = async (req, res) => {
  try{
    const userId = req.userId;
    const user = await User.findById(userId);

    const roomIds = user.rooms.flat().map(room => room.toString());
    const rooms = await Room.find({ _id: { $in: roomIds } });
   //todo: room과 room에 해당하는 chat 객체들을 찾아 함께 response로 보내야함 

   
    return res.status(202).json(rooms);

  }catch (e) {
    console.error('Failed to fetch room data of a logged in user', e);
    return res.status(500).json({ message: 'Failed to fetch chat messages' });
  }
};

//a last message per room
chatController.getChatMessagesByRoom = async (req, res) => {
    try {
    //fetch user Id from the request 
    const userId = req.userId;

    if(!userId){
        return res.status(404).json({message: 'getChatMessagesByRoom - no user ID is fetched.'})
    }

    //로그인한 user의 id로 채팅방을 찾음 
    let rooms = await Room.find({members : userId});

    rooms = rooms.filter(room => !room.leftMembers.some(member => member.toString() === userId));
    //console.log('getChatMessagesByRoom함수에서 찾은 - rooms:', rooms);
    
      if (!rooms) {
        return res.status(404).json({ message: 'getChatMessagesByRoom - Rooms not found' });
      }

      // 각 방에 대한 마지막 메시지 조회
      const lastMessages = await Promise.all(
        rooms.map(async (room) => {
          const lastMessageIdx = room.chats.slice(-1)[0];

          if(lastMessageIdx) {
            const lastMessage = await Chat.findById(lastMessageIdx);
            return lastMessage;
          }
          return null; // if no chats in the room, return null
        })
      );
      //room 객체 안의 chat 아이디들이 잘 나오는지 확인
      // const chatInRooms = rooms.map((room) => room.chats); //이건 잘 나옴
      // const chatIds = chatInRooms.flat().map((id) => id.toString());

      // 방에 포함된 모든 채팅 메시지를 반환
      // console.log("rooms:", rooms, "lastMessages:",lastMessages);
      return res.json({rooms, lastMessages}); // return res.json(rooms); 
    } catch (e) {
      console.error('Failed to fetch chat messages', e);
      return res.status(500).json({ message: 'Failed to fetch chat messages' });
    }
  };
  
  //fetch chats by a certain room id
  chatController.fetchConversation = async (req, res) => {
    try{
        const userId = req.userId;
        const roomId = req.params.id;
        
        if(!userId){
          return res.status(401).json({message: 'Unauthorised while fetching the selected chat conversation'});
        }else if(!roomId){
          return res.status(404).json({message: 'id parameter from client is invalid'});
        }
        
        //todo : room._id 대신 user.rooms 에 있는 id(ObjectId이기 때문에 toString() 사용해야 함)를 이용해서 room 가져오기를 추가한다. 

        const room = await Room.findById(roomId); //클릭한 room 1개를 의미 

        const leftMember = room.leftTime.find(member => member.userId.toString() === userId);
        const chatsQuery = {};

        //leftMember가 존재하고 timestamp 값이 있으면
        if (leftMember && leftMember.timestamp) {
          chatsQuery.createdAt = { $gte: leftMember.timestamp }; //퇴장한 멤버 이후의 채팅만 조회하도록 createdAt 필터를 추가합니다.
        }

        /*여기서 leftMember의 값: 
        leftMembers: [
          {
              userId: userId,  // 유저의 ID
              timestamp: Date,  // 나간 시간
          }
        ]*/

        // 기존 메시지들을 가져오기 + leftMember가 있으면 timestamp 필터링이 적용됨
        const chatIdsList = room.chats.flat().map((id) => id.toString()); //방에 있는 모든 채팅 ID를 문자열로 변환하여 chatIdsList 배열에 저장합니다.
        const chats = await Chat.find({
          '_id': { $in: chatIdsList },
          ...chatsQuery,  // leftMember가 있으면 timestamp 필터링이 적용됨
        });


        //room - chatsid 로 chat 가져옴- chatsQuery로 필터링함을 포함하지 않음 
        // const chatIdsList = room.chats.flat().map((id) => id.toString());
        // const chats = await Chat.find({
        //   '_id': { $in: chatIdsList }
        // });

        

        //user isOnline 가져오기 
        // console.log("chatIdsList",chatIdsList);
        // console.log("chats",chats);

        const conversations = chats.map((chat) =>  {
          return {
            chatId: chat._id,
            chat: chat.chat,
            isRead: chat.isRead,
            createdAt: chat.createdAt,
            recipient: chat.recipient,
            sender: chat.sender,
            members: room.members
          };
        });

        //console.log('대화 불러오기 conversations', conversations);
        return res.status(202).json(conversations);
    }catch(error){
        return res.status(404).json({message: error.message || 'Something went wrong while fetching the clicked conversation'});
        
    }
  };


//기존 코드
chatController.saveChat = async({ message, recipient, sender }, user) => {  
  if (!user) {
      throw new Error('User not found');
  }
  try{         

    const recipients = Array.isArray(recipient) ? recipient : [recipient];
    console.log('recipients:', recipients);

    // 1. 기존의 방을 찾을 때는, `members` 배열에 포함된 ID들이 모두 있는 `room`을 찾는다.
    let membersIds = [sender.id, ...recipients.map(r => r._id)];
    let room = await Room.findOne({
    members: { $all: membersIds }, // 모든 membersId가 포함된 room 찾기
    $expr: { $eq: [{ $size: "$members" }, membersIds.length] } // members의 크기가 정확히 일치하는지 확인
    });

    if(room && room.members.length === recipients.length + 1){
      room.leftMembers = [];
    }

      if(!room){
          const recipientNames = recipients.map(r => r.name).join(', ');
          room = new Room({
              name: `${sender.name} - ${recipientNames}`,
              members: [sender.id, ...recipients.map(r => r._id)], // room -type: mongoose.Schema.ObjectId,
          });
          await room.save();
      }

      //room id를 각 유저 객체에 추가
      sender = await User.findById(sender.id);
      if (!sender.rooms.includes(room._id)) {
        sender.rooms.push(room._id);
        await sender.save();
      }
     
      for (let recipient of recipients) {
        recipient = await User.findById(recipient._id);
        if (!recipient.rooms.includes(room._id)) {
            recipient.rooms.push(room._id);
            await recipient.save();
        }
      }


      //create a new chat message object
      const newMessage = new Chat({
          chat: message,   
          sender: { 
              _id: sender.id, 
              name: sender.name,
              profileImage: sender.profileImage,
              room: room._id,
          },
          recipient: recipients.map(r => ({ 
              _id: r._id,
              name: r.name,
              profileImage: r.profileImage, 
              room: room._id,
          })), 
          isRead: false,  // 기본적으로 읽지 않은 상태         
          room: room._id,
       });           

       await newMessage.save();

       room.chats.push(newMessage._id);
       await room.save();

       console.log('saveChat이 성공하면 -', newMessage);
       return newMessage;
  }catch(e){
      //console.error('Failed to save chat message', e);
      throw new Error('Failed to save chat message');
  }
};




  chatController.deleteSelectedChatRoom = async (req, res) => {
    //console.log('deleteSelectedChatRoom() is called!');

    try{
      const userId = req.userId;
      const roomId = req.params.id;

      if(!userId){
        return res.status(401).json({message: 'Unauthorised while deleting the selected chat room'});
      }else if(!roomId){
        return res.status(404).json({message: 'Selected chat room id does not exist'});
      }

      // 대화를 삭제하면 room.leftMembers와 leftTime에 유저 정보를 추가합니다.
      const room = await Room.findById(roomId);

      if(!room){
        return res.status(404).json({message: 'Selected chat room not found'});
      }

      //leftMembers에 유저가 이미 있는지 없는 지 확인
      if(!room.leftMembers.includes(userId)){
        room.leftMembers.push(userId);
      }
      
      // leftTime에 유저가 이미 있는지 확인하고, 있다면 가장 최신의 timestamp를 유지
      const existingLeftTime = room.leftTime.find(member => member.userId.toString() === userId);
      if (existingLeftTime) {
          // 이미 나갔던 기록이 있으면 timestamp가 가장 최신인 걸로 업데이트
          room.leftTime = room.leftTime.filter(member => member.userId.toString() !== userId);
          // 가장 최근 timestamp를 가지고 온 뒤에 push
          room.leftTime.push({
              userId: userId,
              timestamp: new Date(),
          });
      } else {
          // leftTime에 처음으로 나가는 경우
          room.leftTime.push({
              userId: userId,
              timestamp: new Date(),
          });
      }

      await room.save();

      return res.status(202).json({room});
    }catch(error){
      return res.status(404).json({message: error.message || 'Something went wrong while deleting the selected chat room'});
    }
  };


  module.exports = chatController;