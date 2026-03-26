export interface Env {
  DB: D1Database;
}

interface GoogleTokenPayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

export async function verifyGoogleToken(idToken: string): Promise<GoogleTokenPayload | null> {
  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );

    if (!res.ok) return null;

    const payload = await res.json() as Record<string, string>;

    if (!payload.sub || !payload.email) return null;

    // Reject tokens issued for other apps
    if (payload.aud && payload.aud !== GOOGLE_CLIENT_ID) return null;

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name || '',
      picture: payload.picture,
    };
  } catch {
    return null;
  }
}

export async function getAuthenticatedUser(context: EventContext<Env, string, unknown>): Promise<{ id: string } | null> {
  const auth = context.request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;

  const token = auth.slice(7);
  const payload = await verifyGoogleToken(token);
  if (!payload) return null;

  return context.env.DB.prepare(
    'SELECT id FROM users WHERE google_id = ?'
  ).bind(payload.sub).first<{ id: string }>();
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
