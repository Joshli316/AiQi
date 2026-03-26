interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { token } = await context.request.json() as { token: string };

    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Decode Google JWT (basic decode — in production, verify signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return new Response(JSON.stringify({ error: 'Invalid token format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload = JSON.parse(atob(parts[1]));
    const { sub: googleId, email, name } = payload;

    if (!googleId || !email) {
      return new Response(JSON.stringify({ error: 'Invalid token payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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

    return new Response(JSON.stringify({ userId }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
