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
      // console.log("Profile", profile)
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          user = new User({
            googleId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            password: bcrypt.hashSync(
              A + profile.name.familyName + profile.id,
              10
            ),
            isActive: true,
          });
          await user.save();
        }

        console.log(user);

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
        console.log(profile._json);
        const { firstName, lastName } = getName(profile._json.name);

        let user = await User.findOne({
          $or: [
            { email: profile._json?.email },
            { githubId: profile._json?.id },
            { firstName },
            { lastName },
          ],
        });

        if (!user) {
          const email = profile._json?.email
            ? profile._json?.email
            : `${profile?.username}@github.com`;

          user = new User({
            githubId: profile._json?.id,
            firstName,
            lastName,
            email,
            password: bcrypt.hashSync(A + lastName + profile._json?.id, 10),
            isActive: true,
          });
          await user.save();
        }

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
        console.log(profile);
        let user = await User.findOne({ twitterId: profile.id });
        if (!user) {
          user = new User({
            twitterId: profile.id,
            firstName: profile.displayName.split(" ")[0],
            lastName: profile.displayName.split(" ")[1],
            email: `${profile.username}@twitter.com`, // Twitter'da email yoksa alternatif bir yöntem kullanılıyor
            isActive: true,
          });
          await user.save();
        } else {
          user.twitterId = profile.id;
          await user.save();
        }
        return done(null, user);
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
