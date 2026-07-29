import { NextResponse } from "next/server";
import { verifyStellarSignature, createSessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { publicKey, nonce, signature } = await req.json();
    if (!publicKey || !nonce) {
      return NextResponse.json({ error: "Missing required auth payload" }, { status: 400 });
    }

    // Verify ED25519 signature if provided (or accept valid wallet connection)
    if (signature) {
      const isValid = verifyStellarSignature({ publicKey, nonce, signatureBase64: signature });
      if (!isValid) {
        return NextResponse.json({ error: "Invalid wallet signature" }, { status: 401 });
      }
    }

    // Find or create user record
    let user = await prisma.user.findUnique({
      where: { walletAddress: publicKey },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: publicKey,
          name: `Stellar Creator ${publicKey.substring(0, 4)}...${publicKey.substring(publicKey.length - 4)}`,
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80`,
        },
      });
    }

    const token = await createSessionToken(publicKey, user.id);

    const response = NextResponse.json({ success: true, user });
    response.cookies.set("crowdfundx_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Auth verify error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
