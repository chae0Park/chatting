const jwt = require('jsonwebtoken');
const jwtSecretKey = process.env.SECRET_KEY;
const jwtRefreshSecretKey =  process.env.REFRESH_SECRET_KEY;

/* the middleware checks if the accessToken user sent in their request's header is valid.*/ 

const verifyAccessToken = ( req, res, next ) => {
    const token  = req.headers['authorization']?.split(' ')[1];
    console.log('verifyAccessToken - Token in header:', token);
    // console.log('verifyAccessToken 함수에서 가져온 refreshToken', refreshToken);

    if(!token) {
        return res.status(401).json({ message: 'Access token is missing' });
    }
    try{
        const decoded = jwt.verify(token, jwtSecretKey);
        req.userId = decoded.userId;
        next();
    }catch(error){
        res.status(401).json({ message: 'Access token is expired or invalid' });
    }
    
};

module.exports =  verifyAccessToken;


//기존방식 : 유효성만 검사
// try{
//     const decoded = jwt.verify(token, jwtSecretKey);
//     req.userId = decoded.userId;
//     next();
// }catch(error){
//     res.status(401).json({ message: 'Access token is expired or invalid' });
// }

//수정
// try {
//     jwt.verify(token, jwtSecretKey, (err, user) => {
//         if (err) {
//             if (err.name === 'TokenExpiredError') {
//                 const refreshToken = req.cookies.refreshToken;
//                 console.log('authenticateToken 함수에서 가져온 refreshToken', refreshToken);
//                 if (!refreshToken) {
//                     return res.status(403).json({ message: 'no refreshToken exists' });
//                 }

//                 // 리프레시 토큰을 검증하고 새 액세스 토큰 발급
//                 jwt.verify(refreshToken, jwtRefreshSecretKey, (refreshErr, refreshUser) => {
//                     if (refreshErr) {
//                         req.session.destroy((err) => {
//                             if (err) {
//                                 return res.status(500).json({ message: 'Failed to end session' });
//                             }
//                             // 세션 쿠키 삭제
//                             res.clearCookie('connect.sid'); 
//                         return res.status(403).json({ message: 'Invalid refresh token' });
//                         });
//                     }

//                     // 새 액세스 토큰 발급
//                     const newAccessToken = jwt.sign(
//                         { id: refreshUser.id },
//                         jwtSecretKey,
//                         { expiresIn: '15m' }
//                     );

//                     console.log('newAccessToken', newAccessToken);

//                     jwt.verify(newAccessToken, jwtSecretKey, (newAccessTokenErr, user) => {
//                         if (newAccessTokenErr) {
//                             // 새 액세스 토큰이 유효하지 않다면
//                             return res.status(403).json({ message: 'Invalid new access token' });
//                         }

//                         req.user = user;
//                         console.log('req.user: ', req.user);
//                         next();
//                     });
//                 });
//             } else {
//                 return res.status(403).json({ message: 'Invalid token' });
//             }
//         } else {
//             req.user = user; //? 왜 undefiend 로 찍혀나오는 걸까?
//             next(); 
//         }
//     });
// } catch (err) {
//     console.error('Token validation error:', err);
//     res.status(403).json({ message: 'Invalid token' }); 
// }
