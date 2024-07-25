"use strict";

//* UPLOAD
//? $ npm i multer
// https://expressjs.com/en/resources/middleware/multer.html
// multer module ile "form-data" verileri kabul edebiliriz. Yani dosya yükleme yapılabilir.

const multer = require("multer");

const path = require("path");
const { CustomError } = require("../errors/customError");

// File filter to accept only JPEG and PNG files
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    // cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    cb(new CustomError("Only .png, .jpg and .jpeg format allowed!", 400));
  }
};

module.exports = multer({
  storage: multer.diskStorage({
    destination: "./uploads",
    filename: function (req, file, cb) {
      // console.log(mimetype)
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 10 }, // Optional: Limit file size to 10MB
});
