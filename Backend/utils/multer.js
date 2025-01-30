import multer from 'multer';
import path from 'path';

// Multer configuration
const multerConfig = {
    storage: multer.diskStorage({
        filename: function (req, file, cb) {
            cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
        }
    }),
    fileFilter: (req, file, cb) => {
        // Allow only images
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (validImageTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images are allowed.'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
};

// Create multer upload instance
const upload = multer(multerConfig);

export default upload; 