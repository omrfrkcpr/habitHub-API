const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const User = require("../../models/userModel");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://127.0.0.1:8000/auth/google/callback`,
    },
    async (token, tokenSecret, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          user = new User({
            googleId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            isActive: true,
          });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: `http://127.0.0.1:8000/auth/facebook/callback`,
      profileFields: ["id", "emails", "name"],
    },
    async (token, tokenSecret, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          user = new User({
            facebookId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            isActive: true,
          });
          await user.save();
        } else {
          user.facebookId = profile.id;
          await user.save();
        }
        return done(null, user);
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
      callbackURL: `http://127.0.0.1:8000/auth/github/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
          const firstName = profile.displayName
            ? profile.displayName.split(" ")[0]
            : "";
          const lastName = profile.displayName
            ? profile.displayName.split(" ")[1]
            : "";
          const email = profile.emails
            ? profile.emails[0].value
            : `${profile.username}@github.com`;

          user = new User({
            githubId: profile.id,
            firstName,
            lastName,
            email,
            isActive: true,
          });
          await user.save();
        }

        const accessInfo = {
          key: process.env.ACCESS_KEY,
          time: process.env.ACCESS_EXP || "30m",
          data: {
            id: user.id,
            email: user.email,
            isActive: true,
            isAdmin: false,
          },
        };
        const accessToken = jwt.sign(accessInfo.data, accessInfo.key, {
          expiresIn: accessInfo.time,
        });

        const refreshInfo = {
          key: process.env.REFRESH_KEY,
          time: process.env.REFRESH_EXP || "3d",
          data: {
            id: user.id,
          },
        };
        const refreshToken = jwt.sign(refreshInfo.data, refreshInfo.key, {
          expiresIn: refreshInfo.time,
        });

        done(null, { user, accessToken, refreshToken });
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
      callbackURL: `http://127.0.0.1:8000/auth/twitter/callback`,
    },
    async (token, tokenSecret, profile, done) => {
      try {
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

// Initialize Passport and restore authentication state if available
passport.initialize();
passport.session();
