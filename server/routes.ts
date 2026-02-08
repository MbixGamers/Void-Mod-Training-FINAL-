import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { setupAuth } from "./auth";
import { startDiscordBot, sendSubmissionNotification, assignVerifiedRole } from "./discord";
import passport from "passport";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // 1. Setup Auth
  setupAuth(app);

  // 2. Start Discord Bot
  startDiscordBot();

  // 3. API Routes

  // Auth Routes
  app.get('/auth/discord', passport.authenticate('discord'));

  app.get('/auth/discord/callback', 
    passport.authenticate('discord', {
      failureRedirect: '/',
      successRedirect: '/test' // Redirect to test page on success as per flow
    })
  );

  app.post(api.auth.logout.path, (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.json(null);
    }
  });

  // Protected Routes Middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Unauthorized" });
  };

  const requireAdmin = (req: any, res: any, next: any) => {
      if (req.isAuthenticated() && req.user.isAdmin) return next();
      // For testing, we might assume the first user is admin or check env var
      // Or if no admins exist, maybe allow? For now strict check.
      res.status(401).json({ message: "Unauthorized Admin" });
  };

  // Submissions
  app.post(api.submissions.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.submissions.create.input.parse(req.body);
      
      // Calculate score and pass/fail (Simple logic for now)
      // Assuming answers is an object like { q1: "A", q2: "B" }
      // We'll mock the scoring logic: Score = length of answers (just for demo)
      // Real app would check against a key.
      const score = Object.keys(input.answers as object).length * 10; 
      const passed = score >= 70; // Pass threshold

      const submission = await storage.createSubmission({
        ...input,
        userId: req.user!.id,
        score,
        passed,
        status: 'pending' // Default
      });

      // Send Discord Webhook/Embed
      await sendSubmissionNotification(submission.id, req.user!.username, score, passed);

      res.status(201).json(submission);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.submissions.list.path, requireAdmin, async (req, res) => {
    const submissions = await storage.getAllSubmissions();
    res.json(submissions);
  });

  app.get(api.submissions.get.path, requireAuth, async (req, res) => {
    const submission = await storage.getSubmission(req.params.id);
    if (!submission) return res.status(404).json({ message: "Not found" });
    // Only allow owner or admin
    if (submission.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(submission);
  });

  // Admin Actions
  app.post(api.admin.action.path, requireAdmin, async (req, res) => {
    try {
      const { action } = api.admin.action.input.parse(req.body);
      const submissionId = req.params.id;

      const submission = await storage.updateSubmissionStatus(submissionId, action === 'approve' ? 'approved' : 'denied');
      
      if (action === 'approve') {
          await assignVerifiedRole(submission.userId);
      }

      res.json(submission);
    } catch (err) {
      res.status(400).json({ message: "Invalid action" });
    }
  });

  // Simple seed endpoint (optional, or run on startup)
  // We won't expose a public seed endpoint for security in this app.

  return httpServer;
}
