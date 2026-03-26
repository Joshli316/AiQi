interface Env {
  DB: D1Database;
}

// GET — return all progress for user
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const auth = context.request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = auth.slice(7);
    const payload = JSON.parse(atob(token.split('.')[1]));
    const googleId = payload.sub;

    const user = await context.env.DB.prepare(
      'SELECT id FROM users WHERE google_id = ?'
    ).bind(googleId).first<{ id: string }>();

    if (!user) {
      return new Response(JSON.stringify({ progress: [] }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { results } = await context.env.DB.prepare(
      'SELECT lesson_id as lessonId, completed_at as completedAt, exercise_passed as exercisePassed FROM progress WHERE user_id = ? ORDER BY lesson_id'
    ).bind(user.id).all();

    return new Response(JSON.stringify({ progress: results || [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST — mark lesson complete
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = context.request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = auth.slice(7);
    const payload = JSON.parse(atob(token.split('.')[1]));
    const googleId = payload.sub;

    const user = await context.env.DB.prepare(
      'SELECT id FROM users WHERE google_id = ?'
    ).bind(googleId).first<{ id: string }>();

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
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

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
