//saving users' msgs
import api from './axiosInstance.js';
//서비스 함수 만들 때 api를 자꾸 빼먹어서 router호출이 안됨

export const fetchRoomDataOfUser = async () => {
  try {
  
    const response = await api.get('http://localhost:5001/api/roomDataOfUser', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }
} 	  

export const fetchChatsByRoom = async () => {

    try {
      const response = await api.get('http://localhost:5001/api/room/chats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });
    //   console.log('fetchChatsByRoom응답-chat:', response.data.lastMessage.chat);
    //   console.log('fetchChatsByRoom응답-profileImage:', response.data.lastMessage.sender.profileImage);
    //   console.log('fetchChatsByRoom응답-name:', response.data.lastMessage.sender.name);
    
    // console.log('fetchChatsByRoom응답-lastMessage:', response.data);

      return response.data;  
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  };

  //클릭한 chat의 room id를 통해 chat들을 불러온다 
  export const fetchChat = async (id) => {
    // console.log('클릭한 대화를 가지고 오기 위해 필요한 id는?', id);
    try{ 
        const response = await api.get(`http://localhost:5001/api/chat/${id}`, {
            headers: {
                Authorization : `Bearer ${localStorage.getItem('accessToken')}`,
            },
        });
        // console.log('fetchChat으로 가져오는 데이터:' , response.data);
        return response.data;
    }catch(error){
        throw new Error('Error occurred', error);
    }
  };

  

  export const deleteSelectedChatRoom = async(id) => {
    console.log('deleteSelectedChatRoom이 호출됨');
    try{
      const response = await api.put(`http://localhost:5001/api/room/${id}`, {}, {
        headers: {
          Authorization : `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      console.log('유저 객체의 rooms - roomId, room 객체의 memebers에서 userId 성공적으로 삭제됨', response.data);
      return response.data;
    }catch(error){
      throw error;
    }
  }