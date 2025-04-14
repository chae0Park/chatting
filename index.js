const { createServer } = require('http')
const app = require('./app');
const { Server } =  require("socket.io")
require ('dotenv').config();

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors:{
        origin: 'https://chatting-sage-psi.vercel.app',
        methods: ['GET', 'POST', 'PUT', 'DELETE']           
    },
});

//기존코드
require('./utils/io')(io);

app.get('/', (req, res) => {
    res.send('API is running');
});

//turn on the server using listen()
httpServer.listen(process.env.PORT, ()=>{
    console.log('server listening on port', process.env.PORT)
})