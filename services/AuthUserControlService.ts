import { UserControlRepository } from "@/repositories/UserControlRepository";
import type { AuthUserProfile, UserControlRecord } from "@/types/UserControl";

const nowIso = () => new Date().toISOString();

export class AuthUserControlService {
  constructor(private readonly repository: UserControlRepository) {}

  async createOrSyncUserControl(authUser: AuthUserProfile): Promise<UserControlRecord> {
    const email = (authUser.email ?? "").trim().toLowerCase();
    if (!email) {
      throw new Error("No email was provided for this account.");
    }

    const displayName =
      (authUser.displayName ?? "").trim() || email.split("@")[0] || "SCORES Manager";
    const now = nowIso();

    const existingByUid = await this.repository.getUserControlByUid(authUser.uid);
    if (existingByUid) {
      await this.repository.updateUserControl(existingByUid.id, {
        email,
        displayName,
        provider: authUser.provider ?? existingByUid.provider ?? "password",
        lastLoginAt: now,
        updatedAt: now,
        passwordHash: authUser.passwordHash,
        passwordSalt: authUser.passwordSalt,
        passwordIterations: authUser.passwordIterations,
        passwordHashAlgorithm: authUser.passwordHashAlgorithm,
      });
      return {
        ...existingByUid,
        email,
        displayName,
        provider: authUser.provider ?? existingByUid.provider,
        lastLoginAt: now,
        updatedAt: now,
        passwordHash: authUser.passwordHash,
        passwordSalt: authUser.passwordSalt,
        passwordIterations: authUser.passwordIterations,
        passwordHashAlgorithm: authUser.passwordHashAlgorithm,
      };
    }

    const existingByEmail = await this.repository.getUserControlByEmail(email);
    if (existingByEmail) {
      await this.repository.updateUserControl(existingByEmail.id, {
        displayName,
        provider: authUser.provider ?? existingByEmail.provider ?? "password",
        lastLoginAt: now,
        updatedAt: now,
        passwordHash: authUser.passwordHash,
        passwordSalt: authUser.passwordSalt,
        passwordIterations: authUser.passwordIterations,
        passwordHashAlgorithm: authUser.passwordHashAlgorithm,
      });

      return {
        ...existingByEmail,
        displayName,
        provider: authUser.provider ?? existingByEmail.provider,
        lastLoginAt: now,
        updatedAt: now,
        passwordHash: authUser.passwordHash,
        passwordSalt: authUser.passwordSalt,
        passwordIterations: authUser.passwordIterations,
        passwordHashAlgorithm: authUser.passwordHashAlgorithm,
      };
    }

    return this.repository.createUserControl({
      uid: authUser.uid,
      displayName,
      email,
      role: "manager",
      status: "active",
      provider: authUser.provider ?? "password",
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      passwordHash: authUser.passwordHash,
      passwordSalt: authUser.passwordSalt,
      passwordIterations: authUser.passwordIterations,
      passwordHashAlgorithm: authUser.passwordHashAlgorithm,
    });
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
