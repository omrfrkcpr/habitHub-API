const passport = require("passport");
const TwitterStrategy = require("passport-twitter").Strategy;
const User = require("../../../models/userModel");
const bcrypt = require("bcrypt");
const { twitterSetup } = require("../setups");

passport.use(
  new TwitterStrategy(
    twitterSetup,
    async (token, tokenSecret, profile, done) => {
      try {
        // console.log("Twitter Profile: ", profile)
        // console.log(profile._json.entities.description);
        // console.log(profile._json.status.entities);

        let user = await User.findOne({ twitterId: profile._json.id });
        if (!user) {
          user = new User({
            twitterId: profile._json.id,
            email: `${profile._json?.name}@twitter.com`, // If there is no email provided, we will use the username
            username: profile._json?.name,
            avatar:
              profile._json?.profile_image_url_https ||
              profile._json?.profile_image_url,
            password: bcrypt.hashSync(
              "A" + profile._json?.name + profile._json?.id,
              10
            ),
            isActive: true,
          });
          await user.save();
        } else {
          if (!user.avatar) {
            await User.updateOne(
              { twitterId: profile._json.id },
              {
                avatar:
                  profile._json?.profile_image_url_https ||
                  profile._json?.profile_image_url,
              }
            );
          }
        }

        user = await User.findOne({ twitterId: profile._json.id });

        // console.log(user)
        return done(null, { user });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
