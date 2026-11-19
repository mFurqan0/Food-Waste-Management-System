import { describe, expect, it } from "vitest";
import { signToken, verifyToken } from "./token";

const SECRET = "test-secret-that-is-long-enough-1234";
const payload = { uid: "user_1", role: "ADMIN" as const, exp: Date.now() + 60_000 };

describe("token", () => {
  it("round-trips a valid token", () => {
    const token = signToken(payload, SECRET);
    expect(verifyToken(token, SECRET)).toEqual(payload);
  });
  it("rejects a token signed with another secret", () => {
    const token = signToken(payload, SECRET);
    expect(verifyToken(token, "a-different-secret-that-is-also-long")).toBeNull();
  });
  it("rejects a tampered payload (role escalation attempt)", () => {
    const token = signToken({ ...payload, role: "STUDENT" }, SECRET);
    const [, sig] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ ...payload, role: "ADMIN" })).toString("base64url");
    expect(verifyToken(`${forged}.${sig}`, SECRET)).toBeNull();
  });
  it("rejects an expired token", () => {
    const token = signToken({ ...payload, exp: Date.now() - 1 }, SECRET);
    expect(verifyToken(token, SECRET)).toBeNull();
  });
  it("rejects malformed input", () => {
    expect(verifyToken("garbage", SECRET)).toBeNull();
    expect(verifyToken("a.b.c", SECRET)).toBeNull();
  });
});
