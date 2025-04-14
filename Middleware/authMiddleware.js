const jwt = require('jsonwebtoken');
const jwtSecretKey = process.env.SECRET_KEY;
const jwtRefreshSecretKey =  process.env.REFRESH_SECRET_KEY;

/* the middleware checks if the accessToken user sent in their request's header is valid.*/ 

const verifyAccessToken = ( req, res, next ) => {
    const token  = req.headers['authorization']?.split(' ')[1];
    // console.log('verifyAccessToken - Token in header:', token);
    // const refreshToken = req.cookies.refreshToken;
    // console.log('verifyAccessToken - refreshToken:', refreshToken);
                   



    if(!token) {
        return res.status(401).json({ message: 'Access token is missing' });
    }
    try {
        jwt.verify(token, jwtSecretKey, (err, user) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    const refreshToken = req.cookies.refreshToken;
                    if (!refreshToken) {
                        res.clearCookie('refreshToken', { httpOnly: true, path: '/' });
                        return res.status(403).json({ message: 'no refreshToken exists' });
                    }

                    // 리프레시 토큰을 검증하고 새 액세스 토큰 발급
                    jwt.verify(refreshToken, jwtRefreshSecretKey, (refreshErr, refreshUser) => {
                        if (refreshErr) {
                            res.clearCookie('connect.sid'); 
                            return res.status(403).json({ message: 'Invalid refresh token' });
                        }

                        // 새 액세스 토큰 발급
                        const newAccessToken = jwt.sign(
                            { userId: refreshUser.userId  },
                            jwtSecretKey,
                            { expiresIn: '15m' }
                        );

                        // console.log('newAccessToken', newAccessToken);

                        jwt.verify(newAccessToken, jwtSecretKey, (newAccessTokenErr, user) => {
                            if (newAccessTokenErr) {
                                // 새 액세스 토큰이 유효하지 않다면
                                return res.status(403).json({ message: 'Invalid new access token' });
                            }

                            req.userId = user.userId;
                            next();
                        });
                    });
                } else {
                    return res.status(403).json({ message: 'Invalid token' });
                }
            } else {
                req.userId = user.userId; //? 왜 undefiend 로 찍혀나오는 걸까?
                next(); 
            }
        });
    } catch (err) {
        console.error('Token validation error:', err);
        res.status(403).json({ message: 'Invalid token' }); 
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
