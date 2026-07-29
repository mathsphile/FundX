import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const campaign = await prisma.campaign.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
      },
      include: {
        creator: true,
        milestones: true,
        rewardTiers: true,
        updates: { orderBy: { createdAt: "desc" } },
        comments: {
          include: {
            user: { select: { name: true, avatar: true, walletAddress: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        donations: {
          include: {
            contributor: { select: { name: true, avatar: true, walletAddress: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: {
          select: { donations: true, bookmarks: true },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Increment page view asynchronously
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Fetch single campaign error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
