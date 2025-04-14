import './PreviewCard.css';


const PreviewCard = ({ 
    type,
    friend, 
    friendId,
    handleUserClick, 
    id, 
    profileImage, 
    name, 
    chat, 
    createdAt, 
    handleChatClick, 
    lastMessageRoomId, 
    lastMessage,
    handleDeleteSelectedChat,
    members,
    handleSendUserId,
    f,
    logginedUser,
    onAddMoreUser,
    currentAddState,
    searchedChatMembers
    }) => {  
    
    const date = new Date(createdAt); // Convert to Date object
    const formattedDate = date.toLocaleDateString('en-GB', {
        day: '2-digit', // '09'
        month: 'short', // 'Dec'
    });  

    // Helper function to truncate text to 7 characters
    const truncateText = (text, length = 14) => {
        return text.length > length ? text.slice(0, length) + '...' : text;
    };


    if(lastMessage){
        console.log('lastMessage', lastMessage);
    }


    switch(type){
        case "start":
            return( 
                <div className='chat-room-preview-card' onClick={() => handleChatClick(id)}>
                    <div className='chat-room-preview-layout1'>
                        <div className='chat-room-preview-profile-img'>
                            <img src={profileImage} alt='kelly' className='img-rsc' />
                        </div>
                        <div className='chat-room-preview-contents'>
                            <div className='preview-contents-name'>{name} {members.length - 2 > 0 ? `+ ${members.length - 2} more`  : null}
                            </div>
                            <div>{truncateText(chat)}</div>
                        </div>
                        <div className='chat-room-preview-more'>
                            <div className='preview-contents-date'>
                                <div>{formattedDate}</div>
                                <div 
                                    className='x-box'
                                    onClick={(e) => {
                                        e.stopPropagation(); // 클릭 이벤트가 부모로 전파되지 않도록 함 
                                        handleDeleteSelectedChat(id)
                                    }}    
                                >
                                    x
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
    
            );
        case "friendList":
            return(
                <div className='chat-room-preview-card' 
                    onClick={(e) => {
                        e.stopPropagation();
                        handleUserClick(f._id);
                    }}	
                >   
                    <div className='chat-room-preview-layout1'>
                        <div className='chat-room-preview-profile-img'><img  src={f.profileImage} alt='searched friend' className='img-rsc'/></div>
                        <div className='chat-room-preview-contents-friend'>
                            <div className='preview-contents-name'>{f.name} 
                                {f.online ? <span className='online-state'>&nbsp;•</span> : null}
                            </div>
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddMoreUser(f._id);
                                }}	
                                className="add-to-chat"
                            >
                                {/* isUserClicked면 글씨 안뜨게 -  {addState ? "add" : "delete"}  */}                                
                                {currentAddState !== undefined ? ( currentAddState ? "delete" : "add") : null}
                            </div>
                        </div>
                        <div className='chat-room-preview-more'>
                        </div>
                    </div>
                </div>
            )
        case "searched":
            return(
                <div className='chat-room-preview-card' onClick={() => handleUserClick(friendId)}>    
                    <div className='chat-room-preview-layout1'>
                        <div className='chat-room-preview-profile-img'><img  src={friend.profileImage} alt='searched friend' className='img-rsc'/></div>
                        <div className='chat-room-preview-contents-friend'>
                            <div className='preview-contents-name'>{friend.name}</div>
                            
                            {logginedUser.friends.find(f => f._id.toString() === friendId ) ? 
                            (
                            <div className='added'>
                                added
                            </div>
                            ) : (
                            <div className='addBtn'
                                    onClick={(e) => {
                                        e.stopPropagation(); // 클릭 이벤트가 부모로 전파되지 않도록 함 
                                        handleSendUserId(friendId)
                                    }} 
                            >
                                add
                            </div>
                            )
                            }
                        </div>
                        <div className='chat-room-preview-more'>
                        </div>
                    </div>
                </div>
            );
        case "searchedChat":
            return(
                <div className='chat-room-preview-card' onClick={() => handleChatClick(lastMessageRoomId)}>
                    <div className='chat-room-preview-layout1'>
                        <div className='chat-room-preview-profile-img'>
                            <img src={lastMessage.sender.profileImage} alt='profile' className='img-rsc' />
                        </div>
                        <div className='chat-room-preview-contents'>
                            <div className='preview-contents-name'>
                                {lastMessage.sender.name} {searchedChatMembers.length - 2 > 0 ? `+ ${searchedChatMembers.length - 2} more` : null }
                            </div>
                            <div>{truncateText(lastMessage.chat)}</div>
                            
                        </div>
                        <div className='chat-room-preview-more'>
                            <div className='preview-contents-date'>
                                <div>{formattedDate}</div>
                                <div 
                                    className='x-box'
                                    onClick={(e) => {
                                        e.stopPropagation(); // 클릭 이벤트가 부모로 전파되지 않도록 함 
                                        handleDeleteSelectedChat(lastMessageRoomId)
                                    }}    
                                >
                                    x
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        default:
            return null;
    }
}

export default PreviewCard;


