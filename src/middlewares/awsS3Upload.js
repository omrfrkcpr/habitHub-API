"use strict";

const AWS = require("aws-sdk");
const multer = require("multer");
const dotenv = require("dotenv");
const { CustomError } = require("../errors/customError");

dotenv.config();
// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_BUCKET_REGION,
});

// Middleware function to upload file to S3
const uploadToS3 = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];

  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    throw new CustomError(
      "File type error. Only JPEG, JPG, and PNG files are allowed.",
      400
    );
  }

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${Date.now()}-${req.file.originalname}`,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    // ACL: 'public-read' // Uncomment if you want the file to be publicly readable
  };

  try {
    const data = await s3.upload(params).promise();
    req.fileLocation = data.Location;
    next();
  } catch (err) {
    throw new CustomError("Failed to upload file.", 500);
  }
};

module.exports = {
  upload,
  uploadToS3,
};
