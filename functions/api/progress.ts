import { verifyGoogleToken, jsonResponse } from './_shared';

interface Env {
  DB: D1Database;
}

async function getAuthenticatedUser(context: EventContext<Env, any, any>): Promise<{ id: string } | null> {
  const auth = context.request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;

  const token = auth.slice(7);

  // Verify token signature with Google before trusting claims
  const payload = await verifyGoogleToken(token);
  if (!payload) return null;

  return context.env.DB.prepare(
    'SELECT id FROM users WHERE google_id = ?'
  ).bind(payload.sub).first<{ id: string }>();
}

// GET — return all progress for user
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const user = await getAuthenticatedUser(context);
    if (!user) {
      return jsonResponse({ progress: [] });
    }

    const { results } = await context.env.DB.prepare(
      'SELECT lesson_id as lessonId, completed_at as completedAt, exercise_passed as exercisePassed FROM progress WHERE user_id = ? ORDER BY lesson_id'
    ).bind(user.id).all();

    return jsonResponse({ progress: results || [] });
  } catch {
    return jsonResponse({ error: 'Internal error' }, 500);
  }
};

// POST — mark lesson complete
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = await getAuthenticatedUser(context);
    if (!user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const { lessonId, exercisePassed } = await context.request.json() as {
      lessonId: number;
      exercisePassed: boolean;
    };

    // Upsert progress
    await context.env.DB.prepare(
      `INSERT INTO progress (user_id, lesson_id, completed_at, exercise_passed)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, lesson_id) DO UPDATE SET completed_at = ?, exercise_passed = ?`
    ).bind(
      user.id, lessonId, new Date().toISOString(), exercisePassed ? 1 : 0,
      new Date().toISOString(), exercisePassed ? 1 : 0
    ).run();

    return jsonResponse({ success: true });
  } catch {
    return jsonResponse({ error: 'Internal error' }, 500);
  }
};
