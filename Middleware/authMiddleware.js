const jwt = require('jsonwebtoken');
const jwtSecretKey = process.env.SECRET_KEY;
const jwtRefreshSecretKey =  process.env.REFRESH_SECRET_KEY;

/* the middleware checks if the accessToken user sent in their request's header is valid.*/ 

const verifyAccessToken = ( req, res, next ) => {
    const token  = req.headers['authorization']?.split(' ')[1];

    if(!token) {
        return res.status(401).json({ message: 'Access token is missing' });
    }

    try{
        const decoded = jwt.verify(token, jwtSecretKey);
        console.log(decoded); // Check what is actually in the decoded token
        req.userId = decoded.userId;
        next();
    }catch(error){
        res.status(401).json({ message: 'Access token is expired or invalid' });
    }
};

module.exports =  verifyAccessToken;



