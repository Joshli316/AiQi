import { verifyGoogleToken, jsonResponse } from './_shared';

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { token } = await context.request.json() as { token: string };

    if (!token) {
      return jsonResponse({ error: 'Missing token' }, 400);
    }

    // Verify token with Google's tokeninfo endpoint
    const payload = await verifyGoogleToken(token);
    if (!payload) {
      return jsonResponse({ error: 'Invalid or expired token' }, 401);
    }

    const { sub: googleId, email, name } = payload;

    // Upsert user
    const existing = await context.env.DB.prepare(
      'SELECT id FROM users WHERE google_id = ?'
    ).bind(googleId).first<{ id: string }>();

    let userId: string;

    if (existing) {
      userId = existing.id;
    } else {
      const id = crypto.randomUUID();
      await context.env.DB.prepare(
        'INSERT INTO users (id, google_id, email, name, created_at) VALUES (?, ?, ?, ?, ?)'
      ).bind(id, googleId, email, name, new Date().toISOString()).run();
      userId = id;
    }

    return jsonResponse({ userId });
  } catch {
    return jsonResponse({ error: 'Internal error' }, 500);
  }
};
