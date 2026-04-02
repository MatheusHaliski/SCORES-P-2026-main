export const USER_CONTROL_COLLECTION = "scores-p-2026-usercontrol";

export type UserControlStatus = "active" | "blocked";
export type UserControlRole = "manager" | "admin";

export type AuthProvider = "password" | "google" | "apple" | "unknown";

export type UserControlRecord = {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  role: UserControlRole;
  status: UserControlStatus;
  provider: AuthProvider;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  passwordHash?: string;
  passwordSalt?: string;
  passwordIterations?: number;
  passwordHashAlgorithm?: string;
};

export type CreateUserControlPayload = Omit<UserControlRecord, "id">;

export type UpdateUserControlPayload = Partial<Omit<UserControlRecord, "id" | "uid" | "createdAt">> & {
  updatedAt?: string;
};

export type AuthUserProfile = {
  uid: string;
  displayName: string;
  email: string;
  provider?: AuthProvider;
  passwordHash?: string;
  passwordSalt?: string;
  passwordIterations?: number;
  passwordHashAlgorithm?: string;
};
