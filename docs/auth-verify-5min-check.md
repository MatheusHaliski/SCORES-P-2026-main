# `/api/auth/verify` 5-Minute Debug Check

Use this to quickly identify why `/api/auth/verify` is returning HTTP 500.

## 1) Add temporary logs in `app/api/auth/verify/route.ts`

Add these logs at the top of `POST` (right after `email/password/clientIp` are created):

```ts
console.log("[Auth Verify] incoming", {
  email,
  hasPassword: Boolean(password),
  clientIp,
});

console.log("[Auth Verify] env check", {
  hasProjectId: Boolean(process.env.NEXT_FIREBASE_ADMIN_PROJECT_ID),
  hasClientEmail: Boolean(process.env.NEXT_FIREBASE_ADMIN_CLIENT_EMAIL),
  hasPrivateKey: Boolean(process.env.NEXT_FIREBASE_ADMIN_PRIVATE_KEY),
});
```

Add this after loading `record`:

```ts
console.log("[Auth Verify] record found", {
  found: Boolean(record),
  email,
  uid: record?.uid,
  displayNameType: typeof record?.displayName,
  passwordIterationsType: typeof record?.passwordIterations,
  hashAlgo: record?.passwordHashAlgorithm,
});
```

Add this before returning success:

```ts
console.log("[Auth Verify] success", {
  uid: synced.uid,
  email: synced.email,
  role: synced.role,
});
```

And replace the existing catch log with:

```ts
console.error("[Auth Verify API] credential check failed", {
  message: error instanceof Error ? error.message : String(error),
  stack: error instanceof Error ? error.stack : undefined,
});
```

---

## 2) Reproduce from `/authview`

1. Open `/authview`.
2. Use a known test email/password.
3. Submit once.
4. Immediately inspect server logs.

---

## 3) How to read the console output (copy/paste guide)

### A) Missing Firebase Admin env (most common)

If you see:

```txt
[Auth Verify] env check { hasProjectId: false ... }
```

or error message:

```txt
Server authentication is not configured.
```

Then fix these env vars in deployment/runtime:

- `NEXT_FIREBASE_ADMIN_PROJECT_ID`
- `NEXT_FIREBASE_ADMIN_CLIENT_EMAIL`
- `NEXT_FIREBASE_ADMIN_PRIVATE_KEY` (with proper newlines)

---

### B) Data shape issue from Firestore record

If you see types like:

```txt
displayNameType: "undefined"
```

or

```txt
passwordIterationsType: "string"
```

and then a thrown error, your stored user doc has invalid field types for current code paths.

Expected safe shapes:

- `displayName`: string
- `passwordIterations`: number
- `passwordSalt`: base64 string
- `passwordHash`: base64 string

---

### C) Firestore read/write failure

If env check is true and record shape looks fine, but catch still logs a Firestore error,
that points to project/credential mismatch, permissions, or runtime connectivity issues.

Look for Firestore-specific messages in the same catch output block.

---

## 4) Remove logs after confirmation

After root cause is confirmed, remove temporary logs to keep production logs clean.

---

## Quick decision matrix

- `hasProjectId/hasClientEmail/hasPrivateKey` false -> **environment config issue**.
- Record types invalid -> **legacy/invalid Firestore data issue**.
- Firestore exception with valid env + valid types -> **infrastructure/permission issue**.
