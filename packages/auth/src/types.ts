export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: Omit<User, "password">;
}
