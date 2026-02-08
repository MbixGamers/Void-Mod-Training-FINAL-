import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import { type Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { storage } from "./storage";
import { type User } from "@shared/schema";

// Extend Express.User
declare global {
  namespace Express {
    interface User extends User {} // Use our schema User type
  }
}

export function setupAuth(app: Express) {
  const MemoryStore = createMemoryStore(session);
  const sessionSecret = process.env.SESSION_SECRET || "super-secret-key";
  const clientID = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  
  if (!clientID || !clientSecret) {
    console.warn("DISCORD_CLIENT_ID or DISCORD_CLIENT_SECRET not set. Auth will fail.");
  }

  // Session middleware
  app.use(
    session({
      cookie: { maxAge: 86400000 },
      store: new MemoryStore({ checkPeriod: 86400000 }),
      resave: false,
      saveUninitialized: false,
      secret: sessionSecret,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Passport Config
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  if (clientID && clientSecret) {
    const scopes = ['identify', 'email'];
    const callbackURL = '/auth/discord/callback'; // Relative URL often works if behind proxy with correct headers, otherwise needs full URL

    passport.use(new DiscordStrategy({
      clientID,
      clientSecret,
      callbackURL, 
      scope: scopes
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user
        let user = await storage.getUserByDiscordId(profile.id);
        
        if (!user) {
          user = await storage.createUser({
            id: profile.id, // Use Discord ID as our ID
            username: profile.username,
            discriminator: profile.discriminator,
            avatarUrl: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : undefined,
          });
        } else {
            // Update avatar/username if changed
             user = await storage.updateUser(user.id, {
                username: profile.username,
                discriminator: profile.discriminator,
                avatarUrl: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : undefined,
             });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err as any);
      }
    }));
  }
}
