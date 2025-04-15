import { io } from 'socket.io-client'; //library 
const socket = io("https://chatting-h36e.onrender.com");
export default socket;

/*server.js**에서 socket.io-client를 사용하여 클라이언트 측 socket 객체를 생성하고 있습니다 */