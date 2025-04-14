import { Container } from "@mui/system";
import './ChattingContainer.css';
import { formDate } from "../../hooks/util";
import { useRef, useEffect } from 'react'; 
import React from 'react';

const ChattingContainer = ({ multiChatPartner, messageList, user, chatPartner }) => {
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
                        {chatPartner.length > 1 ? (
                            <>
                                {chatPartner.slice(0, 5).map((p) =>
                                    p.profileImage && (
                                        <React.Fragment key={p._id}>
                                            <div className='chat-userfriend-img'>
                                                <img
                                                    className="img-rsc"
                                                    src={p.profileImage}
                                                    alt='chatting partner'
                                                />
                                            </div>
                                        </React.Fragment>
                                    )
                                )}
                                {(chatPartner.length - 5) > 0 && (
                                    <div>and {chatPartner.length - 5} more</div>
                                )}
                            </>
                        ) : (
                            chatPartner.map((p) =>
                                p.profileImage && (
                                    <React.Fragment key={p._id}>
                                        <div className='chat-userfriend-img'>
                                            <img
                                                className="img-rsc"
                                                src={p.profileImage}
                                                alt='chatting partner'
                                            />
                                        </div>
                                        {p.online && (
                                            <span className='online-state-text'>&nbsp;&nbsp;&nbsp;online</span>
                                        )}
                                    </React.Fragment>
                                )
                            ))
                        }
                    </div>
                )}


                {/* multiChatPartner만 존재하고, 아직 챗은 안보냈을 때 */}
                {(multiChatPartner && multiChatPartner.users.length > 0) && !messageList.length > 0 && (
                    <div className='userfriend-img-container'>
                        {multiChatPartner.users.map((chatPartner) => (
                            chatPartner.profileImage ? (
                                <div className='chat-userfriend-img' key={chatPartner._id}>
                                    <img
                                        className="img-rsc"
                                        src={chatPartner.profileImage}
                                        alt={`user profile clicked ${chatPartner.name}`}
                                    />
                                </div>
                            ) : null // profileImage가 없으면 null 반환
                        ))}
                    </div>
                )} 
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
                                                    src={message.sender.profileImage}
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




