const { randomUUID } = require('node:crypto');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer for uploads (quotes)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/uploads/quotes');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = randomUUID();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

class UploadController {
  async store(req, res) {
    try {
      upload.single('file')(req, res, async (err) => {
        if (err) {
          return res.status(422).json({ message: err.message });
        }

        if (!req.file) {
          return res.status(422).json({ message: 'File is required' });
        }

        const file = req.file;
        const sizeMB = (file.size / 1024 / 1024).toFixed(2);
        const preview = file.mimetype.startsWith('video/') ? null : `/uploads/quotes/${file.filename}`;

        res.json({
          name: file.originalname,
          size: sizeMB + ' MB',
          type: file.mimetype,
          preview,
          url: `/uploads/quotes/${file.filename}`,
          path: `uploads/quotes/${file.filename}`
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = { UploadController: new UploadController() };