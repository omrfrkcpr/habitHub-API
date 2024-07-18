const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const User = require("../../models/userModel");
const bcrypt = require("bcrypt");
const { generateAllTokens } = require("../../helpers/tokenGenerator");
const { getName } = require("../../helpers/getSocialData");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Google Profile: ", profile);

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
          if (user.avatar === "") {
            // change avatar url of existing user
            await User.updateOne(
              { email: profile.emails[0].value },
              { avatar: profile.photos[0].value }
            );
          }
        }

        user = await User.findOne({ email: profile.emails[0].value });
        // console.log(user);

        const { tokenData, accessToken, refreshToken } =
          await generateAllTokens(user);

        return done(null, { user, accessToken, tokenData, refreshToken });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `/auth/github/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Github Profile: ", profile);
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
          if (user.avatar === "") {
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

        const { tokenData, accessToken, refreshToken } =
          await generateAllTokens(user);

        const data = { user, accessToken, tokenData, refreshToken };

        return done(null, data);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CLIENT_ID,
      consumerSecret: process.env.TWITTER_CLIENT_SECRET,
      callbackURL: `/auth/twitter/callback`,
    },
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
          if (user.avatar === "") {
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

        const { tokenData, accessToken, refreshToken } =
          await generateAllTokens(user);

        const data = { user, accessToken, tokenData, refreshToken };

        return done(null, data);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// function to serialize a user/profile object into the session
passport.serializeUser(function (data, done) {
  done(null, data);
});

// function to deserialize a user/profile object into the session
passport.deserializeUser(async (data, done) => {
  done(null, data);
  // try {
  //   const user = await User.findById(id);
  //   done(null, user);
  // } catch (err) {
  //   done(err);
  // }
});
