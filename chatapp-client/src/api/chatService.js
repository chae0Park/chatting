//saving users' msgs
import api from './axiosInstance.js';

// default
export const fetchChatsByRoom = async () => {

    try {
      const response = await api.get('/room/chats');
      return response.data;  
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  };

  //클릭한 chat의 room id 혹은 유저 아이디들을을 통해 chat들을 불러온다 
  export const fetchChat = async (roomId, userIds) => {
    // console.log('클릭한 대화를 가지고 오기 위해 필요한 roomId는?', roomId, 'userIds는?', userIds);
    try{ 
        const response = await api.get('/chat', {
            params : {
              userIds: userIds,
              roomId: roomId,
          }
        });
        // console.log('fetchChat으로 가져오는 데이터:' , response.data);
        return response.data;
    }catch(error){
        throw new Error('Error occurred', error);
    }
  };

  export const deleteSelectedChatRoom = async(id) => {
    try{
      const response = await api.put(`/room/${id}`, {});
      return response.data;
    }catch(error){
      throw error;
    }
  }

  /* put 요청 보낼 때 {} 사용하는 이유: 
    PUT 요청은 보통 body가 필요한데, 보낼 데이터가 없더라도 body가 있다는 걸 알려주기 위해 {}를 넣어야 함함
    그래야 요청이 제대로 동작.
  */