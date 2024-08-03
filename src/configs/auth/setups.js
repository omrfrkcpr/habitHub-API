"use strict";

const nodeEnv = process.env.NODE_ENV == "production" ? true : false; //! in development false

module.exports = {
  googleSetup: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `/auth/google/callback`,
    proxy: nodeEnv,
  },
  twitterSetup: {
    consumerKey: process.env.TWITTER_CLIENT_ID,
    consumerSecret: process.env.TWITTER_CLIENT_SECRET,
    callbackURL: `/auth/twitter/callback`,
    proxy: nodeEnv,
  },
  githubSetup: {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `/auth/github/callback`,
    proxy: nodeEnv,
  },
};
