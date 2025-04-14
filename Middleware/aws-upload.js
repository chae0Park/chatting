const multer = require('multer');
const dotenv = require('dotenv');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'); 
dotenv.config();
require('dotenv').config();
console.log('Region:', process.env.AWS_DEFAULT_REGION);
console.log('accessKeyId:', process.env.AWS_ACCESS_KEY_ID);
console.log('secretAccessKey:', process.env.AWS_SECRET_ACCESS_KEY);

// S3 클라이언트 설정
const s3 = new S3Client({
    region: process.env.AWS_DEFAULT_REGION, 
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Multer 설정
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 최대 파일 크기 5MB
    },
 }).single('profileImage');


// 파일 업로드 처리 함수
const uploadToS3 = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
            const file = req.file;

            const params = {
                Bucket: 'chae-chatapp-image',
                Key: file.originalname,
                Body: file.buffer,
                ContentType: file.mimetype,
            };

            const command = new PutObjectCommand(params);
            await s3.send(command);

            req.file.s3Url = `https://${params.Bucket}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${params.Key}`;

            next(); //다음 미들웨어로 이동

        }catch (err) {
            return res.status(500).send('Error uploading file: ' + err.message);
    }
};
  
  // multer 업로드 미들웨어 내보내기
  module.exports = { upload, uploadToS3 };