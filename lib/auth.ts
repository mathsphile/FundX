import { Keypair, StrKey } from "@stellar/stellar-sdk";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "crowdfundx_super_secret_jwt_key_stellar_2026"
);

export interface SessionPayload {
  walletAddress: string;
  userId: string;
  iat: number;
  exp: number;
}

/**
 * Generate a random authentication challenge nonce
 */
export function generateAuthNonce(publicKey: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `${publicKey.substring(0, 6)}_${timestamp}_${random}`;
}

/**
 * Verify Stellar ED25519 signature of the challenge message
 */
export function verifyStellarSignature({
  publicKey,
  nonce,
  signatureBase64,
}: {
  publicKey: string;
  nonce: string;
  signatureBase64: string;
}): boolean {
  try {
    if (!StrKey.isValidEd25519PublicKey(publicKey)) {
      return false;
    }

    const message = `CrowdFundX Authentication Nonce: ${nonce}`;
    const messageBuffer = Buffer.from(message, "utf-8");
    
    let signatureBuffer: Buffer;
    if (/^[0-9a-fA-F]+$/.test(signatureBase64) && signatureBase64.length === 128) {
      signatureBuffer = Buffer.from(signatureBase64, "hex");
    } else {
      signatureBuffer = Buffer.from(signatureBase64, "base64");
    }

    const keypair = Keypair.fromPublicKey(publicKey);
    return keypair.verify(messageBuffer, signatureBuffer);
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

/**
 * Create JWT Session Token
 */
export async function createSessionToken(walletAddress: string, userId: string): Promise<string> {
  return await new SignJWT({ walletAddress, userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Get current session from HTTP-only cookie
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("crowdfundx_session")?.value;
  if (!token) return null;

  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}
