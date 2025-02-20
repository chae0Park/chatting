const multer = require('multer');
const path = require('path');
const fs = require('fs'); // from node, no lib download needed

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', 'uploads');
        // Create the directory if it doesn't exist
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type. Allowed types: JPEG, PNG, GIF, MP4'), false);
    }
};

const upload = multer({ storage, fileFilter });
module.exports = upload;