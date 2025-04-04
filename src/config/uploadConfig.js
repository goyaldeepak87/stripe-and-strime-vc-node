const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer configuration for profile image upload
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = 'public/uploads';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      // console.log("Saving file to:", uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // console.log("file", file);
      const ext = path.extname(file.originalname+".jpeg");
      const filename = `${Date.now()}${ext}`;
      // console.log("Generated filename:", filename);
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 🔥 Increase limit to 10MB
    fieldSize: 2 * 1024 * 1024, // 🔥 Increase text field size limit to 2MB
  },
  fileFilter: (req, file, cb) => {
    // console.log("Processing file:", file.originalname, file.mimetype);
    if (!file.mimetype.startsWith("image/")) {
      // console.log("❌ Invalid file type:", file.mimetype);
      return cb(new Error("Only images are allowed"), false); // Reject non-image files
    }
    cb(null, true);
  },
});

module.exports = upload;
