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
    interface User extends User {} 
  }
}

export function setupAuth(app: Express) {
  const MemoryStore = createMemoryStore(session);
  const sessionSecret = process.env.SESSION_SECRET || "super-secret-key";
  const clientID = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  // NOTE: This must match the URL you put in the Discord Developer Portal
  const callbackURL = "https://927830b1-3484-4513-99a6-b6b8cf295070-00-jjp2jkyawyks.janeway.replit.dev/auth/discord/callback";

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

    passport.use(new DiscordStrategy({
      clientID,
      clientSecret,
      callbackURL, 
      scope: scopes
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await storage.getUserByDiscordId(profile.id);

        if (!user) {
          user = await storage.createUser({
            id: profile.id, 
            username: profile.username,
            discriminator: profile.discriminator,
            avatarUrl: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : undefined,
          });
        } else {
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

    // --- NEW AUTH ROUTES ---

    // 1. Route to trigger login (Link your "Login with Discord" button to this)
    app.get("/api/auth/discord", passport.authenticate("discord"));

    // 2. The Callback route Discord sends users to
    app.get(
      "/auth/discord/callback",
      (req, res, next) => {
        passport.authenticate("discord", (err: any, user: any, info: any) => {
          if (err) return next(err);
          if (!user) return res.redirect("/login?error=auth_failed");

          // Single session check
          const store = (req.session as any).store;
          if (store && store.all) {
            store.all((err: any, sessions: any) => {
              if (sessions) {
                const activeSession = Object.entries(sessions).find(([sid, s]: [string, any]) => 
                  s.passport?.user === user.id && sid !== req.sessionID
                );
                if (activeSession) {
                  return res.redirect("/login?error=active_session");
                }
              }
              req.logIn(user, (err) => {
                if (err) return next(err);
                res.redirect("/test");
              });
            });
          } else {
            req.logIn(user, (err) => {
              if (err) return next(err);
              res.redirect("/test");
            });
          }
        })(req, res, next);
      }
    );

    // 3. Route to get current user status (useful for frontend)
    app.get("/api/user", (req, res) => {
      if (req.isAuthenticated()) {
        return res.json(req.user);
      }
      res.status(401).send("Not authenticated");
    });

    // 4. Logout route
    app.post("/api/logout", (req, res, next) => {
      req.logout((err) => {
        if (err) return next(err);
        res.sendStatus(200);
      });
    });
  }
}