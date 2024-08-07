const passport = require("passport");
const User = require("../../models/userModel");

// Import individual strategy configurations
require("./strategies/googleStrategy");
// require("./strategies/githubStrategy");
// require("./strategies/twitterStrategy");

// function to serialize a user/profile object into the session
passport.serializeUser((user, done) => {
  done(null, user._id || user.id);
});

// function to deserialize a user/profile object into the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
