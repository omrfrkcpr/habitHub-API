"use strict";

const jwt = require("jsonwebtoken");
const passwordEncryption = require("../helpers/passwordEncryption");
const Token = require("../models/tokenModel");

// Generate Simple Token
const generateSimpleToken = async (user) => {
  const token = passwordEncryption((user._id || user.id) + Date.now());
  const tokenData = await Token.create({
    userId: user._id || user.id,
    token: token,
  });

  console.log("Simple Token generated: ", tokenData.token);
  return tokenData;
};

// Generate Access Token
const generateAccessToken = (user) => {
  const accessInfo = {
    key: process.env.ACCESS_KEY,
    time: process.env.ACCESS_EXP || "30m",
    data: {
      id: user._id || user.id,
      email: user.email,
      isActive: user.isActive,
      isAdmin: user.isAdmin,
    },
  };

  const accessToken = jwt.sign(accessInfo.data, accessInfo.key, {
    expiresIn: accessInfo.time,
  });

  console.log("AccessToken generated: ", accessToken);
  return accessToken;
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  const refreshInfo = {
    key: process.env.REFRESH_KEY,
    time: process.env.REFRESH_EXP || "3d",
    data: {
      id: user._id || user.id,
    },
  };

  const refreshToken = jwt.sign(refreshInfo.data, refreshInfo.key, {
    expiresIn: refreshInfo.time,
  });

  console.log("RefreshToken generated: ", refreshToken);
  return refreshToken;
};

// Generate All Tokens
const generateAllTokens = async (user) => {
  const tokenData = await generateSimpleToken(user);
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { tokenData, accessToken, refreshToken };
};

module.exports = {
  generateSimpleToken,
  generateAccessToken,
  generateRefreshToken,
  generateAllTokens,
};
