const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../../../models/userModel");
const bcrypt = require("bcrypt");
const { googleSetup } = require("../setups");

passport.use(
  new GoogleStrategy(
    googleSetup,
    async (accessToken, refreshToken, profile, done) => {
      // console.log("Google Profile: ", profile);

      try {
        let user = await User.findOne({
          $or: [{ email: profile.emails[0].value }, { googleId: profile.id }],
        });
        if (!user) {
          user = new User({
            googleId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            password: bcrypt.hashSync(
              "A" + profile.name.familyName + profile.id,
              10
            ),
            isActive: profile?.emails[0]?.verified ? true : false,
          });
          await user.save();
        } else {
          if (!user.avatar) {
            // change avatar url of existing user, it user avatar doesnt exist
            await User.updateOne(
              { email: profile.emails[0].value },
              { avatar: profile.photos[0].value }
            );
          }
          if (!user.googleId) {
            // update googleId of existing user
            await User.updateOne(
              { email: profile.emails[0].value },
              { googleId: profile.id }
            );
          }
        }

        user = await User.findOne({ email: profile.emails[0].value });

        // console.log(user)
        return done(null, { user });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
