import './Chat.css';
import { useState, useEffect } from 'react'; 
import InputField from '../InputField/InputField.jsx';
import socket from '../../server.js' 
import { useFetchLoginUser, queryClient } from '../../hooks/util.js';
import { fetchClickedUserData, fetchmultiUserData } from '../../api/userService.js'; 
import ProfileContainer from '../profile container/ProfileContainer.jsx';
import { fetchChatsByRoom, fetchChat, fetchConversationByUsers } from '../../api/chatService.js'; //
import ChattingContainer from '../chatting container/ChattingContainer.jsx';
import { useQuery, useMutation } from '@tanstack/react-query';


const Chat = () => {
    const [message, setMessage] = useState('');
    const [messageList, setMessageList] = useState([]); // Initialize messageList as an empty array
    const [clickedUser, setClickedUser] = useState(''); // id
    const [clickedUserList, setClickedUserList] = useState([]);  // 여러 유저 ids
    const [chatPartner, setChatPartner] = useState([]); //유저 객체들
    const [isUserClicked, setIsUserClicked] = useState(false); // 클릭된 상태를 추적
    const { data: user } = useFetchLoginUser();

    const {data : multiChatPartner } = useQuery({
        queryKey: ['multiChatPartner', {id: clickedUserList}],
        queryFn: () => fetchmultiUserData(clickedUserList),
        enabled: (clickedUserList !== undefined) && clickedUserList && (clickedUserList.length > 0), 
        //enabled: clickedUserList.length > 0,  // 클릭된 유저가 있을 때만 활성화
    });


    const { data: clickedUserData } = useQuery({ 
		queryKey: ['clickedUserData', {id: clickedUser}],
		queryFn: () => fetchClickedUserData(clickedUser), 
        enabled: clickedUser !== '',
	});


    const {data: roomsAndChats} = useQuery({
        queryKey: ['roomsAndChats'],
        queryFn: fetchChatsByRoom,
        initialData: [] //이니셜데이터 설정을 해두지 않으면 오류남
    });


    const { data: conversationByUsers } = useQuery({ 
		queryKey: ['conversationByUsers', {id: clickedUserList}],//
		queryFn: () => fetchConversationByUsers(clickedUserList), 
        enabled: clickedUserList && clickedUserList.length > 0 
	});  

    useEffect(() => {
        if(conversationByUsers && conversationByUsers.length > 0){
            setMessageList(conversationByUsers);
            const partnerIdArray = conversationByUsers[0].members.filter(member => member !== user.id); // partner 의 아이디
            setClickedUserList(partnerIdArray) // partner 의 아이디들로 객체들을 가져옴 
            console.log('✅파트너는?', partnerIdArray);
        }else{ // 둘 사이의 채팅이 존재하지 않으면 messageList 는 null
            setMessageList(null);
        }
        
    },[conversationByUsers, user]) // 기존 메세지와 유저 객체 까지는 설정

    useEffect(() => {
        if(clickedUserData){
            console.log('🔎clickedUserData',clickedUserData);
            setChatPartner([clickedUserData]); 
        }else if(multiChatPartner){
            setChatPartner(multiChatPartner.users);
        }
    }, [clickedUserData , multiChatPartner]);



    const handleChatClick = async (id) => {
        console.log('handleChatClick 호출됨');
        try {
            const existingChat = await fetchChat(id);

            if (existingChat && existingChat.length > 0) {
                setMessageList(existingChat);
				//새로운 유저가 들어올 경우 대비하여 가장 마지막 챗에서 추출
                const messageListLast = existingChat.slice(-1)[0];
                const membersObj = [...messageListLast.recipient, messageListLast.sender];
                const partner = membersObj.filter(member => member._id !== user.id); 
                setChatPartner(partner);
                // console.log('현재 챗에서 파트너는? :', partner);
            }else {
                console.log('채팅이 존재하지 않습니다.');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };
    
    const handleUserClick = async(id) => {
        //console.log('handleUserClick 호출됨, id 값:',id);
        try {
            setIsUserClicked(true); // 첫번째 대화 상대가 정해짐 렌더링 된 후 : isUserClicked = true            
            setClickedUser(id);
            setClickedUserList([id]); 
            setMessageList(null); 
            setIsUserClicked(false);
        } catch (error) {
            console.error('Error fetching user data:', error);
            setIsUserClicked(false);
        }
    };

    //clickedUserList 유저만 세팅함 
    const handleAddMoreUser = (userId) => {
        if (isUserClicked) return; // 첫번째 유져가 없으면 (첫 번째 유저는 반드시 handleUserClick() 호출로 설정된다.)
		
        setClickedUser('');
		if(clickedUserList.includes(userId)){
			setClickedUserList((prevList) => prevList.filter(user => user !== userId)); 
		}else {
			setClickedUserList((prevList) => [...prevList, userId]); 
		}
    };

    socket.on('message', (message) => {
        console.log('socket.send message 로 받은 메세지:', message);
        // 받은 메시지를 처리하는 로직 추가
    });


    useEffect(() => {
        socket.on('message', (message) => {
            console.log("방금받은메세지용:", message);  
            setMessageList((prevState) => {
                return Array.isArray(prevState) ? [...prevState, message] : [message];
            });
            queryClient.invalidateQueries('roomsAndChats');
        });

        return () => {
            socket.off('message');
          };
    }, []);

    const sendMessage = useMutation({
        mutationFn: async({message, recipient, sender}) => {
            return new Promise((resolve, reject) => {
                socket.emit('sendMessage', {message, recipient, sender}, (response) => {
                    if(response.ok){
                        console.log('Message sent successfully');
                        resolve(response);
                    }else{
                        console.error('Message sending failed', response.error);
                        reject(response.error || '메세지 전송 실패');
                    }
                });
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries('roomsAndChats');
            setMessage('');
        },

    });


    const handleSendMessage = (e) => {
        e.preventDefault();
        console.log('handleSendMessage 호출됨'); 

        let recipient;

        if (messageList) {
            recipient = chatPartner;
        }
        if (multiChatPartner && multiChatPartner.users && multiChatPartner.users.length > 0) {
            recipient = multiChatPartner.users;
        } else if (clickedUserData) {
            recipient = clickedUserData;
        }


        console.log('최종적으로 설정된 recipient:', recipient); 
        setChatPartner(recipient);

        const sender = user;

        if(sender){
            console.log('sender는?', sender);
        }

        // 유효성 검사 - recipient와 sender가 잘 설정되어 있는지 확인
        if (!sender) {
            alert("Sender information is missing");
            return;
        } else if (!recipient) {
            alert("Recipient information is missing");
            return;
        }


        sendMessage.mutate({ message, recipient, sender });
       
    };


    //todo:  모달 만드는거 비디오 다시 보고 여기서 error띄우도록 하기 

    return (
        <div>
            <div className='chat'>
                {/* 왼쪽 컨테이너 */}
                <ProfileContainer
                    clickedUserList={clickedUserList}
                    user={user} //로그인한 유저
                    handleUserClick={handleUserClick}
                    roomsAndChats={roomsAndChats}
                    handleChatClick={handleChatClick}
                    onAddMoreUser={handleAddMoreUser} 
                    isUserClicked={isUserClicked}
                />
                

                {/* 채팅창 헤더 + 채팅 컨테이너 */}
                <div className='chatting-container'>
                    <ChattingContainer
                        clickedUserData={clickedUserData}
                        clickedUserList={clickedUserList}
                        chatPartner={chatPartner}
                        messageList={messageList}
                        user={user}
                        multiChatPartner={multiChatPartner}
                    />
                </div>
            </div>
            
            {/* 인풋바 */}
            <InputField
                message={message}
                setMessage={setMessage}
                sendMessage={handleSendMessage}
            />
            
        </div>

    )
}

export default Chat;