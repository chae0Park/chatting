const jwt = require('jsonwebtoken');
const jwtSecretKey = process.env.SECRET_KEY;

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



/*

유저가 요청을 보낼 때 headers 안에 있는 Authorization의 토큰 값을 가져와  이곳에서 secret key와 비교
-> 맞다면 유저의 아이디를 넘겨주고 다음 코드를 실행 할 수 있게한다.

플로우: 
토큰 추출
토큰 밸리데이션 - 없으면 응답으로 상태/메세지 날림
-----try-----
추출한 토큰 시크릿키로 인증한 객체 생성 : decoded
이 객체의 userId를 req.userId로 넣어준다 
그러고 다음 코드 진행 생성 삭제 등등이 있을 수 있음 
-----catch-----
try과정 중에 빵꾸가 생기면 바로 이 캐치문으로 넘어와서 응답으로 상태, 메세지 날림 
*/ 