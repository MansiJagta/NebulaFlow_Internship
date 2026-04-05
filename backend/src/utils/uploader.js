// const cloudinary = require("../config/cloudinary");

// exports.uploadFile = async (filePath) => {
//   return await cloudinary.uploader.upload(filePath, {
//     resource_type: "auto"
//   });
// };



const cloudinary = require('../config/cloudinary');
const path = require('path');

exports.uploadFile = async (filePath, originalName = '') => {
  const nameToCheck = originalName || filePath;
  const ext = path.extname(nameToCheck).toLowerCase();

  // For PDFs, use the 'raw' resource type for direct file access.
  // For other files, 'auto' will detect the type (e.g., images).
  const resource_type = ext === '.pdf' ? 'raw' : 'auto';

  return await cloudinary.uploader.upload(filePath, {
    resource_type,
  });
};

exports.deleteFile = async (publicId, type = 'auto') => {
  if (!publicId) return;
  try {
    // Map our custom internal types to Cloudinary resource types
    // PDFs and non-image files are uploaded as 'raw'
    let resource_type = 'auto';
    if (type === 'pdf' || type === 'raw') {
      resource_type = 'raw';
    } else if (type === 'image') {
      resource_type = 'image';
    }

    return await cloudinary.uploader.destroy(publicId, { resource_type });
  } catch (err) {
    console.error('Cloudinary deletion error:', err);
    return null;
  }
};