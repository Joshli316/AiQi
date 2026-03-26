import { type Env, getAuthenticatedUser, jsonResponse } from './_shared';

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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = await getAuthenticatedUser(context);
    if (!user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await context.request.json() as Record<string, unknown>;
    const lessonId = body.lessonId;
    const exercisePassed = body.exercisePassed;

    if (typeof lessonId !== 'number' || lessonId < 1 || lessonId > 14) {
      return jsonResponse({ error: 'Invalid lessonId' }, 400);
    }

    const now = new Date().toISOString();
    const passed = exercisePassed ? 1 : 0;

    await context.env.DB.prepare(
      `INSERT INTO progress (user_id, lesson_id, completed_at, exercise_passed)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, lesson_id) DO UPDATE SET completed_at = ?, exercise_passed = ?`
    ).bind(user.id, lessonId, now, passed, now, passed).run();

    return jsonResponse({ success: true });
  } catch {
    return jsonResponse({ error: 'Internal error' }, 500);
  }
};
