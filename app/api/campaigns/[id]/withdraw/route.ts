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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.creatorId !== session.userId) {
      return NextResponse.json({ error: "Only the campaign creator can withdraw funds" }, { status: 403 });
    }

    if (campaign.raisedAmount < campaign.fundingGoal) {
      return NextResponse.json({ error: "Campaign funding goal was not reached" }, { status: 400 });
    }

    if (campaign.status === "WITHDRAWN") {
      return NextResponse.json({ error: "Campaign funds have already been withdrawn" }, { status: 400 });
    }

    const updated = await prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: "WITHDRAWN" },
    });

    await prisma.notification.create({
      data: {
        userId: session.userId,
        type: "WITHDRAWAL_COMPLETED",
        message: `Successfully withdrawn ${campaign.raisedAmount} XLM from "${campaign.title}" to your Stellar wallet!`,
        link: `/dashboard`,
      },
    });

    return NextResponse.json({ success: true, campaign: updated });
  } catch (error) {
    console.error("Withdraw error:", error);
    return NextResponse.json({ error: "Failed to process withdrawal" }, { status: 500 });
  }
}
