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
      return NextResponse.json({ error: "Unauthorized. Please connect wallet." }, { status: 401 });
    }

    const { id } = await params;
    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (new Date() < new Date(campaign.deadline) && campaign.status !== "FAILED") {
      return NextResponse.json({ error: "Campaign is still active. Refund only available after deadline." }, { status: 400 });
    }

    if (campaign.raisedAmount >= campaign.fundingGoal) {
      return NextResponse.json({ error: "Campaign succeeded. Refunds not permitted." }, { status: 400 });
    }

    // Find user's active donation for this campaign
    const donation = await prisma.donation.findFirst({
      where: {
        campaignId: campaign.id,
        contributorId: session.userId,
        status: "CONFIRMED",
      },
    });

    if (!donation) {
      return NextResponse.json({ error: "No active donation found to refund" }, { status: 400 });
    }

    // Update donation status to REFUNDED
    await prisma.donation.update({
      where: { id: donation.id },
      data: { status: "REFUNDED" },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.userId,
        type: "REFUND_CLAIMED",
        message: `Successfully claimed refund of ${donation.amount} XLM for "${campaign.title}"`,
        link: `/supporter`,
      },
    });

    return NextResponse.json({
      success: true,
      refundedAmount: donation.amount,
      message: `Refund of ${donation.amount} XLM claimed!`,
    });
  } catch (error) {
    console.error("Refund error:", error);
    return NextResponse.json({ error: "Failed to process refund" }, { status: 500 });
  }
}
