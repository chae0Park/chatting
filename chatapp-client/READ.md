1. backend setting : DB setting, websocket setting
2. frontend setting: websocket setting
3. BE-FE connect test
4. user login 
5. sending messages

flow
1. download lib : npm init -y 
npm i express mongoose cors dotenv http socket.io
2. setting User model in db
    -user
    -chat
3. setting app.js (backend)
    -nodemon installed

4. websocket setting : index.js
    - http / websocket / server -app.js
    -utils/io.js -> making io related functions into this file and this functions need io
    so getting io as a parameter and app.js file which defined io, need to declare by using require()
    that it will give this file's io to (somewhere) where it needs to use io as param.

5. front-end websocket setting 
    library : socket.io-client needed
    make a file server.js to use socket
    import it in App.js

6. check the connection between fe and be
    nodemon index.js -> be