import { User, AuthResult } from "./types";

const USERS_KEY = "fitplanner_users";
const CURRENT_USER_KEY = "fitplanner_current_user";

function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function stripPassword(user: User): Omit<User, "password"> {
  const { password: _, ...rest } = user;
  return rest;
}

export function register(
  firstName: string,
  lastName: string,
  email: string,
  password: string
): AuthResult {
  const users = getUsers();

  if (users.find((u) => u.email === email)) {
    return { success: false, message: "An account with this email already exists." };
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    firstName,
    lastName,
    email,
    password,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  const userWithoutPassword = stripPassword(newUser);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

  return { success: true, message: "Account created successfully.", user: userWithoutPassword };
}

export function login(email: string, password: string): AuthResult {
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return { success: false, message: "Invalid email or password." };
  }

  const userWithoutPassword = stripPassword(user);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

  return { success: true, message: "Login successful.", user: userWithoutPassword };
}

export function logout(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getCurrentUser(): Omit<User, "password"> | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}
