import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { AuthRepository } from '@/api/auth/authRepository';
import jwt from 'jsonwebtoken';
import { env } from "@/common/utils/envConfig";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(new LocalStrategy(
  { usernameField: "email" },

  async function (email, password, done) {
    try {
      const authRepository = new AuthRepository();

      const user = await authRepository.findOne({ email });
      if (!user) return done(null, false, { message: "User not found" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: "Incorrect password" });

      const payload = { id: user.id, email: user.email, role: user.role };
      const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: "30m" });

      console.log("🔥 token:", token, payload, isMatch);

      return done(null, {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      });
    } catch (err) {
      return done(err);
    }
  }
));

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        const authRepository = new AuthRepository();

        let user = await authRepository.findByGoogleId(profile.id);
        console.log("🔥 findByGoogleId:", user);

        if (!user) {
          const newUser = {
            google_id: profile.id,
            username: profile.displayName,
            email: profile.emails?.[0]?.value || "",
            avatar: profile.photos?.[0]?.value || null,
            password: "",
            role: "user" as const,
            created_at: new Date(),
            updated_at: new Date(),
          };

          const userId = await authRepository.createUser(newUser);
          (newUser as any).id = userId;

          return done(null, newUser);
        }

        delete (user as any).password;

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user (lấy thông tin user từ ID)
passport.deserializeUser(async (id: number, done) => {
  try {
    const authRepository = new AuthRepository();
    const user = await authRepository.findById(id);
    if (user) {
      delete (user as any).password;
      return done(null, user);
    } else {
      return done(new Error("User not found"), null);
    }
  } catch (err) {
    return done(err);
  }
});
