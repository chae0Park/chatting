import './ProfileContainer.css';
import { useRef, useState } from 'react';
import { searchUsers, addFriends } from '../../api/userService.js'
import { useQuery, useMutation } from '@tanstack/react-query';
import PreviewCard from '../preview card/PreviewCard.jsx';
import { deleteSelectedChatRoom } from '../../api/chatService.js';
import { queryClient } from '../../hooks/util.js';

const ProfileContainer = ({ clickedUserList, user, roomsAndChats, handleChatClick, handleUserClick, onAddMoreUser, isUserClicked }) => {
    const [searchbarActive, setSearchbarActive] = useState(false);
    const [query, setQuery] = useState('');
    const queryValue = useRef();

    const { mutate } = useMutation({
        mutationFn: deleteSelectedChatRoom,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['searchedUserData'] });
            window.location.reload();
        }
    });

    const { mutate: addFriendMutate } = useMutation({
        mutationFn: addFriends,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['searchedUserData'] });
            window.location.reload();
        }
    });

    // useQuery 사용
    const { data: searchedUserData, isError: isSearchError } = useQuery({
        queryKey: ['searchedUserData', { query }],
        queryFn: () => searchUsers(query),
        enabled: query.length > 0
    });


    // 쿼리 오류 처리
    if (isSearchError) {
        return <div>Error loading search data</div>; // 오류 발생 시 에러 메시지 표시
    }


    const handleAddFriend = (friendId) => {
        console.log('친구 추가할 아이디는?', friendId);
        addFriendMutate(friendId);
    };


    //유저 검색 후 나온 챗카드 삭제 
    const handleDeleteSelectedChat = (roomId) => {
        let clickDelete = window.confirm('채팅을 삭제하시겠습니까?');
        if (clickDelete) {
            console.log('삭제할 챗카트의 roomId는?', roomId);
            mutate(roomId);
        }
        clickDelete = false;
    }


    // 검색창 토글 함수
    const handleSearchbarToggle = () => {
        setSearchbarActive((prev) => {
            if (prev) {
                setQuery('');  // 검색어 초기화
            }
            return !prev;
        });
    };


    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const query = queryValue.current.value.trim();
            if (query) {
                setQuery(query);
            } else {
                console.log('검색어를 입력해주세요');
            }
            queryValue.current.value = '';
        }
    };

    // If the data is available
    const { rooms, lastMessages } = roomsAndChats;

    if (!rooms || !lastMessages) {
        return <div>Loading...</div>;
    }


    // Combine rooms and chats (lastMessages) 채팅방- 마지막메세지가 있는 경우 
    const combined = rooms.map((room) => {

        if (room && (room.chats.length === 0 || null || undefined)) {
            return null
        }

        const roomChats = lastMessages.filter((lastMessage) => lastMessage.room === room._id);
        // If we have chats, get the latest one (or first one in array)
        const latestChat = roomChats.length > 0 ? roomChats[0] : null;

        // Create a chat object with relevant properties
        const chat = latestChat ? {
            profileImage: latestChat.sender.profileImage,
            name: latestChat.sender.name,
            content: latestChat.chat,
            createdAt: latestChat.createdAt
        } : {
            profileImage: '',
            name: '',
            content: '',
            createdAt: ''
        };
        // Return room combined with chat information
        return { ...room, chat };
    });


    //room.members 중에 유저가 있는지 확인 - 있으면 해당 유저를 검색했을 때 채팅방을 함께 보여준다 
    const chatRoom = searchedUserData?.searchedLastMessage?.filter(lastMessage =>
        rooms.some(room => room._id === lastMessage.room &&
            room.members.some(member =>
                searchedUserData.users.some(user => user._id === member)
            )
        )
    ) || [];


    return (
        <div className='chat-user-profile-container'>
            <div className='chat-user-profile-container-header'>
                <div className='chat-profile'>
                    <p className='chat-user-img'>
                        {user && <img src={user.profileImage} alt='user' className='img-rsc' />}
                    </p>
                    <p>
                        {user ? user.name : 'no user found'}
                    </p>
                </div>
            </div>
            <div className='chat-user-chatroom-list'>
                {!searchbarActive && <p className='searchbar-trigger' onClick={handleSearchbarToggle}>click to find user</p>}
                {searchbarActive && <p className='searchbar-trigger' onClick={handleSearchbarToggle} >click to view chats</p>}
                {searchbarActive &&
                    <input
                        className='chat-searchbar'
                        placeholder='search user name here...'
                        type='text'
                        ref={queryValue}
                        onKeyDown={handleKeyDown}
                    />
                }
                {searchbarActive && !searchedUserData && user.friends && user.friends.length > 0 && (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '7px', fontSize: 'small', color: 'gray' }}>users</div>
                        {user.friends.map((f) => {
                            let currentAddState;

                            if (clickedUserList.length > 0) {
                                if (clickedUserList.some(c => c === f._id)) {
                                    currentAddState = true;
                                } else if (clickedUserList.some(c => c !== f._id)) {
                                    currentAddState = false;
                                } 
                            }


                            return (
                                <PreviewCard
                                    key={f._id}
                                    f={f}
                                    type='friendList'
                                    handleUserClick={handleUserClick}
                                    onAddMoreUser={onAddMoreUser} 
                                    isUserClicked={isUserClicked}
                                    currentAddState={currentAddState}
                                />
                            )
                        }
                        )}
                    </>
                )}



                {searchbarActive && searchedUserData && (
                    <>
                        {/* friends 보여주기 위한 조건 */}
                        {(searchedUserData.users.length > 0 && (user.friends.filter(user_f =>
                            searchedUserData.users.some(searched_u => searched_u._id === user_f.userId)
                        ))) && (
                                <>
                                    <div style={{ textAlign: 'center', marginBottom: '7px', fontSize: 'small', color: 'gray' }}>friends</div>
                                    {searchedUserData.users.filter(friend => friend.name !== user.name).map((friend) => {
                                        // console.log('프리뷰카드에 사용할 프렌드 아이디는?!', friend._id); // friend._id 값 콘솔에 출력
                                        return (
                                            <PreviewCard
                                                key={friend._id}
                                                type='searched'
                                                friendId={friend._id}
                                                friend={friend}
                                                logginedUser={user}
                                                handleSendUserId={handleAddFriend}
                                                handleUserClick={handleUserClick}
                                            />
                                        );
                                    })}
                                </>

                            )}

                        {/* chats 먼저 보여주기 위한 조건 */}
                        {searchedUserData.searchedLastMessage.length > 0 && chatRoom.length > 0 && (
                            <>
                                <div style={{ textAlign: 'center', marginBottom: '7px', fontSize: 'small', color: 'gray' }}>chats</div>
                                {searchedUserData.searchedLastMessage.map((lastMessage) => {
                                    console.log("lastMessage when map()", lastMessage);  // Log each `lastMessage` to the console
                                    const members = [lastMessage.sender, ...lastMessage.recipient];
                                    return (
                                        <PreviewCard
                                            key={lastMessage._id}
                                            type='searchedChat'
                                            lastMessageRoomId={lastMessage.room}
                                            lastMessage={lastMessage}  // Passing the `lastMessage` to PreviewCard
                                            handleChatClick={handleChatClick}
                                            createdAt={lastMessage.createdAt}
                                            handleDeleteSelectedChat={handleDeleteSelectedChat}
                                            searchedChatMembers={members}
                                        />
                                    );
                                })}
                            </>
                        )}


                    </>
                )}


                {/* 로그인한 유저가 기존에 들어가 있던 채팅방  */}
                {!searchbarActive && combined && combined.length > 0 && (
                    <>
                        {combined.map((roomWithChat) => (
                            <PreviewCard
                                key={roomWithChat._id}
                                type='start'
                                id={roomWithChat._id}
                                profileImage={roomWithChat.chat.profileImage}
                                name={roomWithChat.chat.name}
                                chat={roomWithChat.chat.content}
                                createdAt={roomWithChat.chat.createdAt}
                                handleChatClick={handleChatClick}
                                handleDeleteSelectedChat={handleDeleteSelectedChat}
                                members={roomWithChat.members}
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}

export default ProfileContainer;


