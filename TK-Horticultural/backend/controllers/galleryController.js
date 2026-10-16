const { Gallery } = require('../models');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer for gallery image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/uploads/gallery');
    // Ensure directory exists
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

class GalleryController {
  async index(req, res) {
    try {
      let where = { is_active: true };
      if (req.query.division && req.query.division !== 'all') {
        where.division = req.query.division;
      }

      const galleries = await Gallery.findAll({
        where,
        order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
      });

      // Add url and imageUrl (same for now)
      const result = galleries.map(gallery => ({
        ...gallery.toJSON(),
        url: `/uploads/gallery/${gallery.image_path}`,
        imageUrl: `/uploads/gallery/${gallery.image_path}`
      }));

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async adminIndex(req, res) {
    try {
      const galleries = await Gallery.findAll({
        order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
      });

      const result = galleries.map(gallery => ({
        ...gallery.toJSON(),
        url: `/uploads/gallery/${gallery.image_path}`,
        imageUrl: `/uploads/gallery/${gallery.image_path}`
      }));

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async store(req, res) {
    try {
      // Run multer middleware
      upload.single('image')(req, res, async (err) => {
        if (err) {
          return res.status(422).json({ message: err.message });
        }

        const { title, division, description, is_active, sort_order } = req.body;

        if (!req.file) {
          return res.status(422).json({ message: 'Image file is required' });
        }

        const gallery = await Gallery.create({
          title,
          division: division || null,
          description: description || null,
          image_path: req.file.filename,
          thumbnail_path: null, // we could generate thumbnail but skip for now
          is_active: is_active === 'true' || is_active === true ? true : false,
          sort_order: parseInt(sort_order) || 0
        });

        res.status(201).json({
          ...gallery.toJSON(),
          url: `/uploads/gallery/${gallery.image_path}`,
          imageUrl: `/uploads/gallery/${gallery.image_path}`
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async update(req, res) {
    try {
      const gallery = await Gallery.findByPk(req.params.id);
      if (!gallery) {
        return res.status(404).json({ message: 'Gallery item not found' });
      }

      upload.single('image')(req, res, async (err) => {
        if (err) {
          return res.status(422).json({ message: err.message });
        }

        const { title, division, description, is_active, sort_order } = req.body;

        // If new image uploaded, delete old image
        let imagePath = gallery.image_path;
        if (req.file) {
          // Delete old image
          const oldImagePath = path.join(__dirname, '../../public/uploads/gallery', gallery.image_path);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
          imagePath = req.file.filename;
        }

        await gallery.update({
          title: title || gallery.title,
          division: division !== undefined ? division : gallery.division,
          description: description !== undefined ? description : gallery.description,
          image_path: imagePath,
          thumbnail_path: gallery.thumbnail_path, // keep old
          is_active: is_active !== undefined ? (is_active === 'true' || is_active === true) : gallery.is_active,
          sort_order: sort_order !== undefined ? parseInt(sort_order) : gallery.sort_order
        });

        res.json({
          ...gallery.toJSON(),
          url: `/uploads/gallery/${gallery.image_path}`,
          imageUrl: `/uploads/gallery/${gallery.image_path}`
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async destroy(req, res) {
    try {
      const gallery = await Gallery.findByPk(req.params.id);
      if (!gallery) {
        return res.status(404).json({ message: 'Gallery item not found' });
      }

      // Delete image files
      const uploadsDir = path.join(__dirname, '../../public/uploads/gallery');
      const imagePath = path.join(uploadsDir, gallery.image_path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      if (gallery.thumbnail_path) {
        const thumbPath = path.join(uploadsDir, gallery.thumbnail_path);
        if (fs.existsSync(thumbPath)) {
          fs.unlinkSync(thumbPath);
        }
      }

      await gallery.destroy();
      res.json({ message: 'Gallery item deleted' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = { GalleryController: new GalleryController() };