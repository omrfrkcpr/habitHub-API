"use strict";

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const dotenv = require("dotenv");
const { CustomError } = require("../errors/customError");

dotenv.config();
// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configure AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
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
    const command = new PutObjectCommand(params);
    const data = await s3Client.send(command);
    req.fileLocation = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${params.Key}`;
    next();
  } catch (err) {
    throw new CustomError("Failed to upload file.", 500);
  }
};

module.exports = {
  upload,
  uploadToS3,
};
