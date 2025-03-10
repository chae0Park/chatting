import { Container } from "@mui/system";
import './ChattingContainer.css';
import { formDate } from "../../hooks/util";
import { useRef, useEffect } from 'react'; 

const ChattingContainer = ({ clickedUserData, multiChatPartner, messageList, user, chatPartner }) => {
    const chattingContentsContainerRef = useRef(null); 

    useEffect(() => {
        const container = chattingContentsContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight; 
        }
    },[messageList])

    return (
        <>
            {/* header - 기존 채팅의 유무에 따라 */}
            <div className='chatroom-header'>
                {(messageList && messageList.length > 0) && chatPartner && (
                    <div className='userfriend-img-container'>
                        {chatPartner.length > 1 ?
                            (
                                <>
                                    {chatPartner.slice(0, 5).map((p) => (
                                        p.profileImage && (
                                            <div className='chat-userfriend-img' key={p._id}>
                                                <img
                                                    className="img-rsc"
                                                    src={`http://localhost:5001${p.profileImage}`}
                                                    alt='chatting partner'
                                                />
                                            </div>
                                        )
                                    ))}
                                    {(chatPartner.length - 5) > 0 && <div>and {chatPartner.length - 5} more</div>}
                                </>
                            ) : (chatPartner.map((p) => (
                                p.profileImage && (
                                    <>
                                        <div className='chat-userfriend-img' key={p._id}>
                                            <img
                                                className="img-rsc"
                                                src={`http://localhost:5001${p.profileImage}`}
                                                alt='chatting partner'
                                            />
                                        </div>
                                        {p.online ? <span className='online-state-text'>&nbsp;&nbsp;&nbsp;online</span> : null}
                                    </>
                                    
                                )
                            ))
                            )}
                    </div>
                )}
                
                {/* multiChatPartner만 존재하고, 아직 챗은 안보냈을 때 */}
                {(multiChatPartner && multiChatPartner.users.length > 0) && !messageList && (
                    <div className='userfriend-img-container'>
                        {multiChatPartner.users.map((chatPartner) => (
                            chatPartner.profileImage ? (
                                <div className='chat-userfriend-img' key={chatPartner._id}>
                                    <img
                                        className="img-rsc"
                                        src={`http://localhost:5001${chatPartner.profileImage}`}
                                        alt={`user profile clicked ${chatPartner.name}`}
                                    />
                                </div>
                            ) : null // profileImage가 없으면 null 반환
                        ))}
                    </div>
                )} 
                {/* clickedUserData 만 존재  */}
                {clickedUserData && !messageList && !multiChatPartner &&
                    <div className='userfriend-img-container'>
                        <div className='chat-userfriend-img'>
                            <img
                                className='img-rsc'
                                src={`http://localhost:5001${clickedUserData.profileImage}`}
                                alt='user profile clicked'
                            />
                        </div>
                    </div>
                }


            </div>



            {/* chatting container: ui에 바로 업데이트 됨 하지만 채팅에 없는 사용자에게도 업뎃됨 */} 
            <div className='chatting-contents-container' ref={chattingContentsContainerRef}>
                {messageList && messageList.length > 0  ? (
                        messageList.map((message) => {
                            //console.log('message.sender._id :', message.sender._id, 'user.id :', user.id);
                            const isMyMessage = message.sender._id === user.id;
                            const formattedDate = formDate(message.createdAt);
                            
                            return (
                                <Container key={message.chatId} className="message-container">
                                    {isMyMessage ? (
                                        <div className='chatting-card-me'>
                                            <div>
                                                <div className='chatting-card-my-msg'>{message.chat}</div>
                                                <div className='chatting-card-my-date'>{formattedDate}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='chatting-card'>
                                            <div className='chatting-card-profile-img'>
                                                <img
                                                    className='img-rsc'
                                                    src={`http://localhost:5001${message.sender.profileImage}`}
                                                    alt='chatting partner'
                                                />
                                            </div>
                                            <div>
                                                <div className='chatting-card-name'>{message.sender.name}</div>
                                                <div className='chatting-card-msg'>{message.chat}</div>
                                                <div className='chatting-card-date'>{formattedDate}</div>
                                            </div>
                                        </div>
                                    )}
                                </Container>


                            );
                        })
                    ) 
                    : null}
            </div>
        </>


    )
}

export default ChattingContainer




