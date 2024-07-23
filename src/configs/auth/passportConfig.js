const passport = require("passport");

// Import individual strategy configurations
require("./strategies/googleStrategy");
require("./strategies/githubStrategy");
require("./strategies/twitterStrategy");

// function to serialize a user/profile object into the session
passport.serializeUser(function (data, done) {
  done(null, data);
});

// function to deserialize a user/profile object into the session
passport.deserializeUser(async (data, done) => {
  done(null, data);
});
