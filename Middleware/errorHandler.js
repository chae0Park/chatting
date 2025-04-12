const multer = require('multer');

const errorHandler = (err, req, res, next) => {
    // Multer 에러 처리
    if (err instanceof multer.MulterError || err.message.includes('Unsupported file type')) {
        return res.status(400).json({ message: err.message });
    }

    // 일반 에러 처리
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
    });
};

module.exports = errorHandler;
