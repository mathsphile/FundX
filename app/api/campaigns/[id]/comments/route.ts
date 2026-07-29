import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Connect wallet to post a comment" }, { status: 401 });
    }

    const { id } = await params;
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Comment content required" }, { status: 400 });
    }

    const comment = await prisma.campaignComment.create({
      data: {
        campaignId: id,
        userId: session.userId,
        content,
      },
      include: {
        user: { select: { name: true, avatar: true, walletAddress: true } },
      },
    });

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
