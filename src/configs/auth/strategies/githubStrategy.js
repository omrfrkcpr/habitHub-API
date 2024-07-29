const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../../../models/userModel");
const bcrypt = require("bcrypt");
const { getName } = require("../../../helpers/getSocialData");
const { githubSetup } = require("../setups");

passport.use(
  new GitHubStrategy(
    githubSetup,
    async (accessToken, refreshToken, profile, done) => {
      try {
        // console.log("Github Profile: ", profile);
        // console.log(profile._json);
        const { firstName, lastName } = getName(profile._json?.name);

        let user = await User.findOne({
          $or: [
            { githubId: profile._json?.id },
            { email: profile._json?.email },
            { firstName },
            { lastName },
          ],
        });

        if (!user) {
          const email = profile._json?.email
            ? profile._json?.email
            : `${profile._json?.login}@github.com`;

          user = new User({
            githubId: profile._json?.id,
            firstName: firstName || "",
            lastName: lastName || "",
            avatar: profile._json?.avatar_url,
            email,
            username: profile._json?.login,
            password: bcrypt.hashSync(
              "A" + (lastName || profile._json?.login) + profile._json?.id,
              10
            ),
            isActive: true,
          });
          await user.save();
        } else {
          // change avatar url of existing user, it user avatar doesnt exist
          if (!user.avatar) {
            await User.updateOne(
              {
                $or: [
                  { githubId: profile._json?.id },
                  { email: profile._json?.email },
                  { firstName },
                  { lastName },
                ],
              },
              { avatar: profile._json?.avatar_url }
            );
          }
          if (!user.githubId) {
            // update githubId of existing user
            await User.updateOne(
              {
                $or: [
                  { githubId: profile._json?.id },
                  { email: profile._json?.email },
                  { firstName },
                  { lastName },
                ],
              },
              { githubId: profile._json?.id }
            );
          }
        }

        user = await User.findOne({
          $or: [
            { githubId: profile._json?.id },
            { email: profile._json?.email },
            { firstName },
            { lastName },
          ],
        });

        // console.log(user)
        return done(null, { user });
      } catch (err) {
        done(err, null);
      }
    }
  )
);

module.exports = passport;
