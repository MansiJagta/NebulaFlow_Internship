// const cloudinary = require("../config/cloudinary");

// exports.uploadFile = async (filePath) => {
//   return await cloudinary.uploader.upload(filePath, {
//     resource_type: "auto"
//   });
// };



const cloudinary = require("../config/cloudinary");

exports.uploadFile = async (filePath) => {
  return await cloudinary.uploader.upload(filePath, {
    resource_type: "auto"
  });
};