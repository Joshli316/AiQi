import { getLang } from './i18n';

interface User {
  id?: string;
  name: string;
  email: string;
  picture: string;
  token?: string;
}

const AUTH_STORAGE_KEY = 'aiqi-auth';
let currentUser: User | null = null;

export function initAuth(): void {
  // Restore from localStorage
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (stored) {
    try {
      currentUser = JSON.parse(stored);
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  // Initialize Google Identity Services when available
  if (typeof google !== 'undefined' && google.accounts) {
    setupGoogleSignIn();
  } else {
    // Wait for script to load
    window.addEventListener('load', () => {
      if (typeof google !== 'undefined' && google.accounts) {
        setupGoogleSignIn();
      }
    });
  }
}

function setupGoogleSignIn(): void {
  // Google client ID would go here - placeholder for now
  // In production, set this via environment variable
  try {
    google.accounts.id.initialize({
      client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
      callback: handleCredentialResponse,
    });
  } catch {
    // Google sign-in not available — that's fine for local dev
  }
}

async function handleCredentialResponse(response: any): Promise<void> {
  try {
    // Decode JWT to get user info (client-side for display)
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    currentUser = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      token: response.credential,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));

    // Verify token server-side
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential }),
      });
      if (res.ok) {
        const data = await res.json();
        currentUser!.id = data.userId;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      }
    } catch {
      // Server auth failed — still allow local usage
    }

    // Re-render
    window.dispatchEvent(new CustomEvent('authchange'));
  } catch {
    // sign-in processing failed silently
  }
}

export function getToken(): string | null {
  return currentUser?.token || null;
}

export function signOut(): void {
  currentUser = null;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  try {
    google.accounts.id.disableAutoSelect();
  } catch {}
  window.dispatchEvent(new CustomEvent('authchange'));
}


// Expose globally
declare global {
  interface Window {
    __signIn: () => void;
    __signOut: () => void;
  }
  var google: any;
}

window.__signIn = () => {
  try {
    google.accounts.id.prompt();
  } catch {
    // Google sign-in not configured — show message
    alert(getLang() === 'zh' ? '登录功能即将上线' : 'Sign-in coming soon');
  }
};

window.__signOut = signOut;
