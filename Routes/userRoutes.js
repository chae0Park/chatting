const express=  require('express');
const router = express.Router();
const verifyAccessToken = require('../Middleware/authMiddleware');
const upload = require('../Middleware/upload');
const userController = require('../utils/Controllers/user.controller')

// 유저 정보 저장
router.post('/signup', upload.single('profileImage'), userController.saveUser);

// 유저 로그인 
router.post('/login', userController.login);

//refresh token 
router.post('/refresh-token', userController.refreshToken);

// 유저 정보 조회 API
router.get('/user', verifyAccessToken, userController.getLoggedInUser);

// 유저 정보 수정 - 비밀번호 / 프로필이미지
router.put('/user/edit', upload.single('profileImage'), verifyAccessToken, userController.editUser);

// ------------------------------

//친구들찾기
router.get('/find-users',verifyAccessToken, userController.findUsers);

//친구 하나 찾기
router.get('/fetch-one-user/:id', verifyAccessToken, userController.fetchOneUserData);

//그룹 챗- 여러 친구 객체 찾기
router.get('/fetch-multiple-users', verifyAccessToken, userController.fetchMultipleUsers);

//add friend 
router.put('/add-friend', verifyAccessToken, userController.addFriends);

//friend list 불러오기 
router.get('/fetch-friends', verifyAccessToken, userController.fetchFriends);


module.exports = router;