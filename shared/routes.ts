import { z } from 'zod';
import { insertSubmissionSchema, submissions, users } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  auth: {
    // These are handled by Passport/Express routes, but defining them for reference/consistency
    discord: {
      method: 'GET' as const,
      path: '/auth/discord' as const,
      responses: {} // Redirects
    },
    callback: {
      method: 'GET' as const,
      path: '/auth/discord/callback' as const,
      responses: {} // Redirects
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>().nullable(), // Returns user or null
      }
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: {
        200: z.object({ message: z.string() })
      }
    }
  },
  submissions: {
    create: {
      method: 'POST' as const,
      path: '/api/submissions' as const,
      input: insertSubmissionSchema,
      responses: {
        201: z.custom<typeof submissions.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/submissions' as const,
      responses: {
        200: z.array(z.custom<typeof submissions.$inferSelect & { user: typeof users.$inferSelect }>()),
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/submissions/:id' as const,
      responses: {
        200: z.custom<typeof submissions.$inferSelect & { user: typeof users.$inferSelect }>(),
        404: errorSchemas.notFound,
      },
    },
  },
  admin: {
    action: {
      method: 'POST' as const,
      path: '/api/admin/submissions/:id/action' as const,
      input: z.object({
        action: z.enum(['approve', 'deny']),
      }),
      responses: {
        200: z.custom<typeof submissions.$inferSelect>(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
  // Webhook for Discord Interactions (Button clicks)
  webhook: {
    action: {
      method: 'POST' as const,
      path: '/api/webhook/interaction' as const,
      // Input is Discord Interaction Payload (complex, so we'll leave strict validation to the handler or use z.unknown())
      input: z.unknown(),
      responses: {
        200: z.any(), // Discord expects specific JSON response
      }
    }
  }
};

// ============================================
// HELPER
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
