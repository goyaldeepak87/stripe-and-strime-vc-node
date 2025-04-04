// services/fileService.js
const path = require('path');

// Function to handle the file upload logic
const uploadFile = (req) => {
  // if (!req.file) {
  //   throw new Error('No file uploaded');
  // }
  
  // Generate the relative file path for storage
  const filePath = path.join('uploads', req.file.filename); 
//   return filePath;  // Return the relative path of the uploaded file
};

module.exports = {
  uploadFile
};
