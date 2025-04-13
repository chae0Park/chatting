const Room = require('../../Models/room');
const Chat = require('../../Models/chat');
const User = require('../../Models/user');
const chatController = {};

//a last message per room
chatController.getChatMessagesByRoom = async (req, res) => {
    try {
    const userId = req.userId;
    if(!userId){
        return res.status(404).json({message: 'getChatMessagesByRoom - no user ID is fetched.'})
    }

    let rooms = await Room.find({members : userId});
    rooms = rooms.filter(room => !room.leftMembers.some(member => member.toString() === userId));
    
      if (!rooms) {
        return res.status(404).json({ message: 'getChatMessagesByRoom - Rooms not found' });
      }

      // 각 방에 대한 마지막 메시지 조회
      const lastMessages = await Promise.all(
        rooms.map(async (room) => {
          const lastMessageIdx = room.chats.slice(-1)[0];

          if(lastMessageIdx) {
            const lastMessage = await Chat.findById(lastMessageIdx)
              .populate('sender')  // Populate sender's full details
              .populate('recipient');  // Populate recipient's full details;
            return lastMessage;
          }
          return null; // if no chats in the room, return null
        })
      );
      return res.json({rooms, lastMessages}); // return res.json(rooms); 
      
    } catch (e) {
      console.error('Failed to fetch chat messages', e);
      return res.status(500).json({ message: 'Failed to fetch chat messages' });
    }
  };
  
  //fetch chats by a certain room id
chatController.fetchConversation = async (req, res) => {
  const userId = req.userId;
	const {userIds} = req.query;
	const {roomId} = req.query;

  // console.log('userIds', userIds);
	
	if (!userId) {
      return res.status(401).json({ message: 'Unauthorised while fetching the selected chat conversation' });
  } else if (!userIds && !roomId) {
      return res.status(404).json({ message: '유저 아이디나 룸아이디 중에 하나는 있어야 됌.' });
  }

  try {
    
    //유저 아이디로 찾은 채팅 룸 
    let membersIds;
    let room;
    if(userIds){
      membersIds = [userId, ...userIds];
      // console.log('membersIds', membersIds);
      room = await Room.findOne(
      {members: { $all: membersIds }, $expr: { $eq: [{ $size: "$members" }, membersIds.length] }}
      );

      if(!room){
        return res.status(200).json(null);
      }

      // console.log('멤버들의 id로 찾은 room', room);

    }

    if(roomId){
      room = await Room.findById(roomId); //클릭한 room 1개를 의미 
      // console.log('룸 id로 찾은 room', room);
  
      if(!room){
        return res.status(200).json(null);
      }
  
    }

    const leftMember = room.leftTime.find(member => member.userId.toString() === userId);
    const chatsQuery = {}; 

    //leftMember가 존재하고 timestamp 값이 있으면
    if (leftMember && leftMember.timestamp) {
      chatsQuery.createdAt = { $gte: leftMember.timestamp }; //퇴장한 멤버 이후의 채팅만 조회하도록 createdAt 필터를 추가합니다.
    }

    // 기존 메시지들을 가져오기 + leftMember가 있으면 timestamp 필터링이 적용됨
    const chatIdsList = room.chats.flat().map((id) => id.toString()); //방에 있는 모든 채팅 ID를 문자열로 변환하여 chatIdsList 배열에 저장합니다.
    const chats = await Chat.find({
      '_id': { $in: chatIdsList },
      ...chatsQuery,  // leftMember가 있으면 timestamp 필터링이 적용됨
    }).populate('sender', 'name profileImage online')  // Populate sender's full details
      .populate('recipient', 'name profileImage online');

    const conversations = chats.map((chat) => {
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

    // console.log('대화 불러오기 conversations', conversations);
    return res.status(202).json(conversations);
  } catch (error) {
    return res.status(404).json({ message: error.message || 'Something went wrong while fetching the clicked conversation' });
  }
};


chatController.findChatRoom = async (recipientIds, sender) => {
  // console.log('findChatRoom() is called!', recipientIds, sender.id);

  try{
    const membersIds = [sender.id, ...recipientIds];
    // console.log('findChatRoom() - membersIds:', membersIds);
    const existingRoom = await Room.findOne(
      {members: { $all: membersIds }, $expr: { $eq: [{ $size: "$members" }, membersIds.length] }}
    );

    if(existingRoom){
      // console.log('findChatRoom() - existingRoom:', existingRoom);
    }
    return existingRoom;
  }catch(e){
    throw new Error('Failed to find chat room');
  }
}


chatController.saveChatRoom = async (recipient, sender) => {
 
  try{

    const recipients = Array.isArray(recipient) ? recipient : [recipient];

    // console.log('recipients:', recipients);

    // sender-recipiend 를 모두 포함한 room 이 있는지 확인
    let membersIds = [sender.id, ...recipients.map(r => r._id)];
    let room = await Room.findOne({
      members: { $all: membersIds }, // 모든 membersId가 포함된 room 찾기
      $expr: { $eq: [{ $size: "$members" }, membersIds.length] } // members의 크기가 정확히 일치하는지 확인
    });

    if(room){
      console.log('saveChatRoom() - existingroom:', room);
    }


    //room이 없는경우엔 하나 만들어줌 
    if (!room) {
      room = new Room(
        {
          name: `Room-${Date.now()}`,
          members: [sender.id, ...recipients.map(r => r._id)], // room -type: mongoose.Schema.ObjectId,
        }
      );
      await room.save();
    }
    return room;
  } catch (e) {
    throw new Error('Failed to save chat room');
  }
}


//기존 코드
chatController.saveChat = async(message, recipient, sender, room) => {
  try{  

    // console.log('saveChat() param으로 받은 room은?', room);
    if(room.leftMembers.length > 0){
      room.leftMembers =[];
    }
    // console.log('saveChat() leftroom 초기화', room);
    
      let recipients = Array.isArray(recipient) ? recipient : [recipient];

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
          sender: sender,
          recipient: recipients, 
          isRead: false,  // 기본적으로 읽지 않은 상태         
          room: room._id,
       });           

       await newMessage.save();

       room.chats.push(newMessage._id);
       await room.save();

       console.log('saveChat이 성공하면 -', newMessage);
       return newMessage;
  }catch(e){
      throw new Error('Failed to save chat message');
  }
};




  chatController.deleteSelectedChatRoom = async (req, res) => {

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