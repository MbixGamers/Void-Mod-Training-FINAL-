import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { setupAuth } from "./auth";
import { startDiscordBot, sendSubmissionNotification, handleSubmissionResult } from "./discord";
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
      if (req.isAuthenticated() && (req.user as any).isAdmin) return next();
      // For testing, we might assume the first user is admin or check env var
      // Or if no admins exist, maybe allow? For now strict check.
      res.status(401).json({ message: "Unauthorized Admin" });
  };

  // Submissions
  app.post(api.submissions.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.submissions.create.input.parse(req.body);
      
      // Calculate score and pass/fail
      const correctAnswers: Record<string, string> = {
        // Defining some mock correct answers for the quiz
        q1: "A", q2: "B", q3: "C", q4: "D", q5: "A", q6: "B", q7: "C", q8: "D", q9: "A", q10: "B"
      };
      
      const submittedAnswers = input.answers as Record<string, string>;
      const totalQuestions = Object.keys(correctAnswers).length;
      let correctCount = 0;
      
      for (const [key, value] of Object.entries(correctAnswers)) {
        if (submittedAnswers[key] === value) {
          correctCount++;
        }
      }
      
      const score = Math.round((correctCount / totalQuestions) * 100);
      const passed = score >= 70; // Pass threshold 70%

      const submission = await storage.createSubmission({
        ...input,
        userId: (req.user as any).id,
        score,
        passed
      });

      // Send Discord Webhook/Embed
      await sendSubmissionNotification(submission.id, (req.user as any).username, score, passed);

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
    if (submission.userId !== (req.user as any).id && !(req.user as any).isAdmin) {
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
      
      await handleSubmissionResult(submission.userId, action === 'approve' ? 'approve' : 'deny');

      res.json(submission);
    } catch (err) {
      res.status(400).json({ message: "Invalid action" });
    }
  });

  // Simple seed endpoint (optional, or run on startup)
  // We won't expose a public seed endpoint for security in this app.

  return httpServer;
}
