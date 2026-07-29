import { NextResponse } from "next/server";
import { generateAuthNonce } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { publicKey } = await req.json();
    if (!publicKey) {
      return NextResponse.json({ error: "Public key is required" }, { status: 400 });
    }

    const nonce = generateAuthNonce(publicKey);
    return NextResponse.json({ nonce });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
