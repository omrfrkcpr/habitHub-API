"use strict";

module.exports = {
  googleSetup: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `/auth/google/callback`,
    // proxy: true, //! in development false
  },
  twitterSetup: {
    consumerKey: process.env.TWITTER_CLIENT_ID,
    consumerSecret: process.env.TWITTER_CLIENT_SECRET,
    callbackURL: `/auth/twitter/callback`,
    // proxy: true, //! in development false
  },
  githubSetup: {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `/auth/github/callback`,
    // proxy: true, //! in development false
  },
};
