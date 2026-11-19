import { createHmac, timingSafeEqual } from "node:crypto";

export type Role = "STUDENT" | "ADMIN";
export type TokenPayload = { uid: string; role: Role; exp: number };

const encode = (buf: Buffer) => buf.toString("base64url");

/** Creates "<payload>.<signature>". The payload is readable, but it cannot be changed without the secret. */
export function signToken(payload: TokenPayload, secret: string): string {
  const body = encode(Buffer.from(JSON.stringify(payload), "utf8"));
  const sig = encode(createHmac("sha256", secret).update(body).digest());
  return `${body}.${sig}`;
}

/** Returns the payload if the signature is valid and the token has not expired, otherwise null. */
export function verifyToken(token: string, secret: string, now = Date.now()): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;

  const expected = createHmac("sha256", secret).update(body).digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  let payload: TokenPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof payload.uid !== "string") return null;
  if (payload.role !== "STUDENT" && payload.role !== "ADMIN") return null;
  if (typeof payload.exp !== "number" || payload.exp < now) return null;
  return payload;
}
