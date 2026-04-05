import { UserControlRepository } from "@/repositories/UserControlRepository";
import { removeUndefinedFields } from "@/lib/removeUndefinedFields";
import type {
  AuthUserProfile,
  CreateUserControlPayload,
  UpdateUserControlPayload,
  UserControlCredentialFields,
  UserControlRecord,
} from "@/types/UserControl";

const nowIso = () => new Date().toISOString();

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const normalizeDisplayName = (displayName: string | undefined, fallbackEmail: string) => {
  const normalized = displayName?.trim();
  return normalized || fallbackEmail.split("@")[0] || "SCORES Manager";
};

const buildCredentialPayload = (authUser: AuthUserProfile): Partial<UserControlCredentialFields> =>
  removeUndefinedFields({
    passwordHash: authUser.passwordHash,
    passwordSalt: authUser.passwordSalt,
    passwordIterations: authUser.passwordIterations,
    passwordHashAlgorithm: authUser.passwordHashAlgorithm,
  });

export class AuthUserControlService {
  constructor(private readonly repository: UserControlRepository) {}

  async createOrSyncUserControl(authUser: AuthUserProfile): Promise<UserControlRecord> {
    const email = normalizeEmail(authUser.email);
    const displayName = normalizeDisplayName(authUser.displayName, email);
    const now = nowIso();
    const credentialPayload = buildCredentialPayload(authUser);

    const existingByUid = await this.repository.getUserControlByUid(authUser.uid);
    if (existingByUid) {
      const updatePayload: UpdateUserControlPayload = {
        email,
        displayName,
        provider: authUser.provider ?? existingByUid.provider ?? "password",
        lastLoginAt: now,
        updatedAt: now,
        ...credentialPayload,
      };

      await this.repository.updateUserControl(existingByUid.id, updatePayload);

      return {
        ...existingByUid,
        ...updatePayload,
      };
    }

    const existingByEmail = await this.repository.getUserControlByEmail(email);
    if (existingByEmail) {
      const updatePayload: UpdateUserControlPayload = {
        email,
        displayName,
        provider: authUser.provider ?? existingByEmail.provider ?? "password",
        lastLoginAt: now,
        updatedAt: now,
        ...credentialPayload,
      };

      await this.repository.updateUserControl(existingByEmail.id, updatePayload);

      return {
        ...existingByEmail,
        ...updatePayload,
      };
    }

    const createPayload: CreateUserControlPayload = {
      uid: authUser.uid,
      displayName,
      email,
      role: "manager",
      status: "active",
      provider: authUser.provider ?? "password",
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      ...credentialPayload,
    };

    return this.repository.createUserControl(createPayload);
  }

  async validateUserControlAccess(uid: string): Promise<UserControlRecord> {
    const record = await this.repository.getUserControlByUid(uid);
    if (!record) {
      throw new Error("No SCORES profile was found for this account.");
    }

    if (record.status === "blocked") {
      throw new Error("Your SCORES account is currently blocked.");
    }

    return record;
  }
}
