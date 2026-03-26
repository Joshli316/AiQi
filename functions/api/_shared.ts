// Shared utilities for API functions

interface GoogleTokenPayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

/**
 * Verify a Google ID token by calling Google's tokeninfo endpoint.
 * Returns the verified payload or null if invalid.
 */
export async function verifyGoogleToken(idToken: string): Promise<GoogleTokenPayload | null> {
  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );

    if (!res.ok) return null;

    const payload = await res.json() as Record<string, string>;

    // Verify required fields exist
    if (!payload.sub || !payload.email) return null;

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

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
