# Discord Staff Verification App

## Overview
A full-stack application for Discord server staff verification. Users log in with Discord, take a test, and admins can approve/deny submissions via a web dashboard or Discord buttons. Approved users receive a "Verified Staff" role automatically.

## Architecture
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js + Passport (Discord OAuth) + Drizzle ORM
- **Database**: PostgreSQL (Neon-backed via Replit)
- **Bot**: discord.js for role assignment and notification embeds

## Key Files
- `shared/schema.ts` - Data models (users, submissions)
- `shared/routes.ts` - API contract with Zod schemas
- `server/auth.ts` - Discord OAuth via passport-discord
- `server/discord.ts` - Discord bot (notifications, button interactions, role assignment)
- `server/routes.ts` - Express API routes
- `server/storage.ts` - Database storage layer
- `server/db.ts` - Database connection

## Discord Integration
- **Not using Replit Discord connector** - User provided credentials directly as secrets
- Secrets: DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_GUILD_ID, DISCORD_ROLE_ID, DISCORD_CHANNEL_ID

## User Flow
1. User visits app → clicks "Login with Discord" → OAuth redirect
2. After login → redirected to `/test` page → takes quiz
3. Submission sent → notification posted to Discord channel with Approve/Deny buttons
4. Admin approves via web dashboard (`/admin`) or Discord button
5. Approved user gets "Verified Staff" role + DM notification

## Recent Changes
- 2026-02-08: Initial build with Discord OAuth, bot integration, admin dashboard, test page
