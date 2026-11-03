const CURRENT_USER_KEY = "fitplanner_current_user";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdAt: string;
  role?: "user" | "admin";
}

interface AuthResult {
  success: boolean;
  message: string;
  user?: Omit<User, "password">;
}

const API_URL_CANDIDATES = [
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/auth.php",
  "http://127.0.0.1:8000/auth.php",
  "http://localhost:8000/auth.php",
  "http://localhost/fit-planner-api/auth.php",
  "http://localhost/fit-planner/api/auth.php",
].filter((value): value is string => Boolean(value));

async function request(payload: Record<string, string>): Promise<AuthResult> {
  let lastError: Error | null = null;

  for (const url of API_URL_CANDIDATES) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : { success: false, message: "Authentication failed." };

      if (response.ok) {
        return result;
      }

      return { success: false, message: result.message || "Authentication failed." };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  if (lastError) {
    console.error("Auth request failed:", lastError);
  }

  return { success: false, message: "Cannot connect to the server. Start Apache and MySQL in XAMPP." };
}

export async function register(
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<AuthResult> {
  const result = await request({ action: "register", firstName, lastName, email, password });
  if (result.success && result.user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(result.user));
  return result;
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const result = await request({ action: "login", email, password });
  if (result.success && result.user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(result.user));
  return result;
}

export function logout(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getCurrentUser(): Omit<User, "password"> | null {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}
