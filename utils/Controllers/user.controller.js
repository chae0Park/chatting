const bcrypt = require('bcryptjs/dist/bcrypt');
const User = require('../../Models/user');
const Room = require('../../Models/room');
const Chat = require('../../Models/chat');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtSecretKey = process.env.SECRET_KEY;
const jwtRefreshSecretKey =  process.env.REFRESH_SECRET_KEY;

//회원가입 로그인 로그아웃관련은 auth.controller로 빼기 
const userController = {};

    // 회원가입 
    userController.saveUser = async(req, res) => {
        const { name, email, currentPassword, newPassword, phone, online } = req.body
        let profileImage = req.file ? `/uploads/${req.file.filename}` : null;

        try{
            const [existingEmail, existingPhone] = await Promise.all([
                User.findOne({ email }),
                User.findOne({ phone }),
            ]);
            if(existingEmail){
                return res.status(400).json({ message: 'Email already exists' });
            }else if(existingPhone){
                return res.status(400).json({ message: 'Phone number already exists' });
            }

            const newUser = new User({
                name,
                email,
                currentPassword,
                newPassword : null,
                phone,
                profileImage,
                online: online || false,
            });

            await newUser.save();

            res.status(200).json({message: 'User created successfully'});

            
        }catch (error){
            res.status(500).json({
                message: 'Server error',
                error: error.message
            });
        }
    }


    userController.login =  async(req, res) => {
        const { email, currentPassword } = req.body;
        try{
            const user = await User.findOne({ email });
            if(!user){
                return res.status(400).json({ message: 'Invalid user credentials' });
            }
            //await bcrypt.compare() ***
            const isMatch = await bcrypt.compare(currentPassword, user.currentPassword);

            if(!isMatch){
                res.status(400).json({ message: 'Invalid user password credentials' });
                return 
            }

            const accessToken  = jwt.sign({ userId: user._id }, jwtSecretKey,{ expiresIn: '1h' });
            const refreshToken = jwt.sign({ userId: user._id }, jwtRefreshSecretKey, { expiresIn: '7d' });

            user.refreshToken = refreshToken;
            user.online = true;
            await user.save();


            res.status(200).json({
                message: 'Login successful',
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    profileImage: user.profileImage,
                    online: user.online,
                },
            });
        }catch (error){
            res.status(500).json({ message: 'server error', error: error.message});
        }
    };


    

    userController.refreshToken = async (req, res) => {
        const { refreshToken } = req.body;

        if(!refreshToken){
            return res.status(400).json({ message: 'Refresh token is required' });
        }

        try{
            const decoded = jwt.verify(refreshToken, jwtRefreshSecretKey);

            const user = await User.findById(decoded.userId);
            if(!user || user.refreshToken !== refreshToken){
                return res.status(400).json({ message: 'Invalid or expried refresh token'});
            }
            // if the refreshToken from request matches user's refreshToken create a new access token. 
            const newAccessToken = jwt.sign({ useId : user._id }, jwtSecretKey, { expiresIn: '1h' });
            
            res.status(200).json({ newAccessToken });

        }catch(error){
            res.status(400).json({ message: 'Invalid or expired refresh token' });
        }
    };


    //logout하면 user 객체 찾아와서  online : false로 만드는코드 


    // auth.controller 끝----------------------


    userController.getLoggedInUser =async (req, res) => {
       try{
        const userId = req.userId;
        const user = await User.findById(userId).populate('rooms');
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }
        //console.log('user friend:', user.friends);
        const friends = await User.find({ _id: { $in: user.friends.map(f => f.userId.toString()) } });

        const responseData = {
            id: user._id,
            name: user.name,
            password: user.currentPassword,
            profileImage: user.profileImage,
            online: user.online,
            refreshToken: user.refreshToken,
            rooms: user.rooms,
            friends,
        };

        //console.log('로그인한 유저 정보: ', responseData);

        res.status(200).json(responseData);

       }catch(error){
        res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
       }
    }

    


    //edit user info - name, profileImage, password
    userController.editUser = async(req, res) => {
        //console.log('edit controller fn called!')
        try{
            const userId = req.userId; 
            const user = await User.findById(userId);

            if(!user){
                return res.status(404).json({message: 'User not found'})
            }

            const { name, currentPassword, newPassword } = req.body;
            const profileImage = req.file; // Get the file from req.file

            if(name) user.name = name;

            if(currentPassword){
                    const isMatch = await bcrypt.compare(currentPassword, user.currentPassword);
                if(!isMatch){
                    return res.status(400).json({ message : 'current password invalid'})
                }else{
                    user.currentPassword = newPassword;
                };
            };

            if(profileImage){
                //파일네임은 멀터 속성에 의해 추가되어짐 
                user.profileImage = `/uploads/${profileImage.filename}`;
                //console.log('파일경로: ', profileImage.filename);
            };

            await user.save();
            res.status(200).json({ message: 'User info updated successfully', user });

        }catch(error){
            console.error(error);
            res.status(500).json({ message: 'Failed to update user info' });
        }
    };

//유저 정보 가져오기 유저찾기 친구추가하기
    userController.findUsers = async(req, res) => {
        try{
            const loggedInUserId = req.userId;
            const { query } = req.query;
            //console.log('유저 찾기 쿼리: ', query);
            
            if(!query){
                return res.status(400).json({ message: 'Please provide a search term'});
            }

            //쿼리로 유저 찾기 ----------------------------------------------------------------------------
            let users;
            try {
                //이름으로만 찾기
                users = await User.find({ name: { $regex: new RegExp(query, 'i')} });
            } catch (dbError) {
                console.error('Database query error: ', dbError); // Log database error
                return res.status(500).json({ message: 'Database query failed', error: dbError.message });
            }

            
            // console.log('검색어로 찾은 유저(들): ', users);
            if(users.length === 0){
                return res.status(400).json({message: 'No users found'});
            }

            //유저 사이에 존재하는 채팅창 찾기----------------------------------------------

            //1. users의 아이디 추출 
            const userIds = [loggedInUserId, ...users.map((user) => user._id)]; // ['로그인한 유저 아이디','유저아이디1', '유저아이디2','유저아이디3'...]

            //2.로그인한 유저아이디랑 쿼리로 검색한 유저들의 아이디가 memebers로 들어간 rooms 들 가지고옴 
            let rooms = await Room.find({ members: {$all: userIds} })
            rooms = rooms.filter(room => !room.leftMembers.some(member => member.toString() === loggedInUserId));

            let searchedLastMessage = [];

            //두 유저 사이의 채팅방이 존재한다면 마지막 메세지를 찾아서 가져옴
            if (rooms && rooms.length > 0) {
                searchedLastMessage = await Promise.all(
                    rooms.map(async (room) => {
                        // Check if there are any messages in the room
                        const lastMessageIdx = room.chats.length > 0 ? room.chats[room.chats.length - 1] : null;

                        if (lastMessageIdx) {
                            // Fetch the last message from the Chat collection
                            const lastMessage = await Chat.findById(lastMessageIdx);
                            return lastMessage; // Return the last message object
                        }

                        return null; // If no lastMessageIdx exists in the room, return null
                    })
                );
            }

           

            //두 유저 중 한명이 채팅방을 삭제해서 userId가 들어간 채팅이라도 내보낸다
        
        //console.log('findUsers 함수가 호출되고 전달되는 값: ', { users, searchedLastMessage });
        res.status(200).json({ users, searchedLastMessage });
        }catch(e){
            res.status(500).json({message: e.message});
        }
    };


    userController.fetchOneUserData = async(req, res) => {
        // console.log('one user fetch controller called');
        try{
            const user = req.userId;
            const friendId = req.params.id

            if(!friendId){
                return res.status(400).json({message:'User not found'});
            }

            const foundUser = await User.findById(friendId);
            if(!foundUser){
                return res.status(400).json({message:'db prob mate when finding the clicked user.'});
            }
            // console.log('foundUser: ', foundUser);
            res.status(200).json(foundUser); //클릭한 유저의 정보만 찾아서 감 

        }catch(e){
            res.status(500).json({message: e.message});
        }

    };

    //그룹챗 - useQueries + fetchmultiUserData를 처리할 서버코드 만들기 
    userController.fetchMultipleUsers = async (req, res) => {
        try {
            // 쿼리 파라미터로 전달된 'ids' 값을 가져옴
            const { ids } = req.query;
            //console.log('ids값은?', ids);
            if (!ids || ids.trim() === '') {
                return res.status(400).json({ message: 'No user ids provided' });
            }
    
            // ids가 문자열일 경우, 쉼표로 구분하여 배열로 변환
            const idsArray = ids.split(',').map(id => id.trim());
            //split(','):목적: ids 문자열을 쉼표(,)를 기준으로 나눔, 
            //map(id => id.trim()):목적: 각 ID 문자열에서 불필요한(의도치 않는) 공백을 제거 만약 ids 값이 '676cd5269184dea34f297730, 676cab1d9184dea34f29765f, 676caac69184dea34f29764c'와 같이 ID들 사이에 공백이 있다면, trim() 메서드를 사용해 각 ID 앞뒤의 공백을 제거할 수 있습니다.
            //console.log('idsArray값은?', idsArray);


            // ids값은? 676cd5269184dea34f297730,676cab1d9184dea34f29765f,676caac69184dea34f29764c
            // idsArray값은? [
            // '676cd5269184dea34f297730',
            // '676cab1d9184dea34f29765f',
            // '676caac69184dea34f29764c'
            // ]

            // idsArray에 해당하는 유저 정보를 DB에서 찾는 로직
            const users = await User.find({ '_id': { $in: idsArray } });
    
            if (!users) {
                return res.status(404).json({ message: 'No users found' });
            }

            //idsArray 순으로 User 객체 정렬 
            const sortedUsers = idsArray.map(id => users.find(user => user._id.toString() === id));
    
            // 유저 정보 반환
            return res.status(200).json({ users: sortedUsers });
        } catch (error) {
            console.error('Error fetching users:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };
    


    userController.addFriends = async(req, res) => {
        //console.log('add friend controller called');
        try {
            const userId = req.userId;
            const { friendId } = req.body;

        
            const user = await User.findById(userId);
            const friend = await User.findById(friendId);
            if(!user || !friend){
                return res.status(404).json({ message: 'User not found' });
            }

            /*
            for multiple friends

            const friendIds = req.body.friendId;

            for(const friendId of friendIds){
                if(friendId === userId){
                    return res.status(400).json({ message: "You cannot add yourself as a friend" });
                }

                const friend = await User.findById(friendId);
                if(friend && !user.friends.includes(friendId)){
                    user.friends.push(friendId);
                    friend.friends.push(userId);
                }
            }

             await User.updateMany(
                { _id: { $in: friendIds } }, 
                { $addToSet: { friends: userId } } 
            );	
            */

            if(friendId === userId){
                return res.status(400).json({ message: 'You cannot add yourself as a friend'})
            }


            // if (!user.friends) user.friends = [];
            // if (!friend.friends) friend.friends = [];

            if(!user.friends.some(f => f.userId === userId)){
                user.friends.push({ userId: friendId, status: true });
            }

            // if(!friend.friends.some(f => f.userId === userId)){
            //     friend.friends.push({ userId: userId, status: true });
            // }
            
                    
        // Save the updated users
            await user.save(); 
            //await friend.save();
            //console.log('유저에게 친구추가 완료', user.friends);
            res.status(200).json({ message: "Friend added successfully" });

        } catch(e){
            res.status(500).json({ message: e.message });
        }
    };

    userController.fetchFriends = async(req, res) => {
        try {
            const userId = req.userId;
            const { friendId } = req.query;

            if(!friendId){
                return res.status(400).json({ message: 'Friend not found' });
            }
            
            const friend = await User.findById(friendId);
            if(!friend){
                return res.status(400).json({ message: 'Friend not found' });
            }

            res.status(200).json(friend.friends);
        }catch(error){
            res.status(500).json({ message: error.message });

        }

    }

/*
클라이언트에서 이미지 업로드 [Setting.js] →
라우터에서 upload() 메소드로 파일 저장 (destination과 filename 설정 후 새로운 파일명 생성) [userRoutes.js, upload.js] →
컨트롤러에서 profileImage DB에 저장할 때 새로 만들어진 파일명을 넣어줌 [user.controller.js]  →
db의 profileImage 값과(컨트롤러에서 저장) upload폴더에 저장된 값이(upload.js multer로 저장) 같아서 클라이언트에서 user.profileImage로 이미지를 불러옵니다.
*/ 
module.exports = userController