import crypto from "crypto";
export function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString("hex");
}
