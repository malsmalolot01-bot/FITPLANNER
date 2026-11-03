import { AUTH_API_URL } from './apiConfig';

const CURRENT_USER_KEY = 'fitplanner_current_user';
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  token: string;
  createdAt: string;
  role?: 'user' | 'admin';
}

interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
}

async function request(payload: Record<string, string>, token?: string): Promise<AuthResult> {
  try {
    const response = await fetch(AUTH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-Auth-Token': token } : {}),
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    const result: AuthResult = text
      ? JSON.parse(text)
      : { success: false, message: 'Authentication failed.' };

    if (response.ok) return result;
    return { success: false, message: result.message || 'Authentication failed.' };
  } catch (error) {
    console.error('Auth request failed:', error);
    return { success: false, message: 'Cannot connect to the server. Start Apache and MySQL in XAMPP.' };
  }
}

export async function register(
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<AuthResult> {
  const result = await request({ action: 'register', firstName, lastName, email, password });
  if (result.success && result.user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(result.user));
  return result;
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const result = await request({ action: 'login', email, password });
  if (result.success && result.user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(result.user));
  return result;
}

export function logout(): void {
  const user = getCurrentUser();
  localStorage.removeItem(CURRENT_USER_KEY);
  if (user?.token) {
    void request({ action: 'logout' }, user.token).then((result) => {
      if (!result.success) console.error('Logout request failed:', result.message);
    });
  }
}

export function getCurrentUser(): User | null {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) as User : null;
}

export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}
