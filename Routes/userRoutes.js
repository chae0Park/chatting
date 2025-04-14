const express=  require('express');
const router = express.Router();
const verifyAccessToken = require('../Middleware/authMiddleware');
const { upload, uploadToS3 } = require('../Middleware/aws-upload');
const userController = require('../utils/Controllers/user.controller')

// 유저 정보 저장
router.post('/signup', upload, uploadToS3, userController.saveUser);
// router.post('/signup', upload, uploadToS3, userController.saveUser); // upload.single('profileImage'),

// 유저 로그인 
router.post('/login', userController.login);

// 유저 정보 조회 API
router.get('/user', verifyAccessToken, userController.getLoggedInUser);

// 유저 정보 수정 - 비밀번호 / 프로필이미지
//router.put('/user/edit', upload.single('profileImage'), verifyAccessToken, userController.editUser);
router.put('/user/edit', verifyAccessToken, upload, uploadToS3, userController.editUser); // upload.single('profileImage'),

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