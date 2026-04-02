import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminFirestore } from "@/app/lib/firebaseAdmin";
import { UserControlRepository } from "@/repositories/UserControlRepository";
import { AuthUserControlService } from "@/services/AuthUserControlService";

export const runtime = "nodejs";

type AuthPayload = {
  email?: string;
  password?: string;
};

const HASH_ALGORITHM = "SHA-256";
const APP_PEPPER = "scores-usercontrol-v1";

const buildSalt = (saltBase64: string) =>
  Buffer.concat([Buffer.from(saltBase64, "base64"), Buffer.from(APP_PEPPER)]);

const hashPassword = (password: string, saltBase64: string, iterations: number): Promise<string> =>
  new Promise((resolve, reject) => {
    crypto.pbkdf2(password, buildSalt(saltBase64), iterations, 32, "sha256", (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey.toString("base64"));
    });
  });

export async function POST(request: NextRequest): Promise<Response> {
  let body: AuthPayload = {};
  try {
    body = (await request.json()) as AuthPayload;
  } catch {
    body = {};
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password?.trim() ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Missing credentials." }, { status: 400 });
  }

  try {
    const db = getAdminFirestore();
    const repository = new UserControlRepository(db);
    const service = new AuthUserControlService(repository);
    const record = await repository.getUserControlByEmail(email);

    if (!record || !record.passwordHash || !record.passwordSalt || !record.passwordIterations) {
      return NextResponse.json({ error: "No account was found with these credentials." }, { status: 401 });
    }

    if (record.passwordHashAlgorithm && record.passwordHashAlgorithm !== HASH_ALGORITHM) {
      return NextResponse.json({ error: "No account was found with these credentials." }, { status: 401 });
    }

    const candidate = await hashPassword(password, record.passwordSalt, record.passwordIterations);
    if (candidate !== record.passwordHash) {
      return NextResponse.json({ error: "No account was found with these credentials." }, { status: 401 });
    }

    const synced = await service.createOrSyncUserControl({
      uid: record.uid,
      displayName: record.displayName,
      email: record.email,
      provider: record.provider,
    });
    await service.validateUserControlAccess(synced.uid);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[AuthView API] credential check failed:", error);
    return NextResponse.json({ error: "Unable to verify credentials right now." }, { status: 500 });
  }
}
