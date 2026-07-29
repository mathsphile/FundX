import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { amount, txHash, contributorAddress } = body;

    if (!amount || !contributorAddress) {
      return NextResponse.json({ error: "Amount and wallet address required" }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (new Date() > new Date(campaign.deadline)) {
      return NextResponse.json({ error: "Campaign deadline has passed" }, { status: 400 });
    }

    const session = await getSession();
    const contributorId = session?.userId || null;

    const mockHash = txHash || `0x${Math.random().toString(16).substring(2)}${Date.now().toString(16)}`;

    // Create donation transaction record
    const donation = await prisma.donation.create({
      data: {
        campaignId: campaign.id,
        contributorId,
        contributorAddress,
        amount: Number(amount),
        txHash: mockHash,
        status: "CONFIRMED",
      },
    });

    // Update campaign raised total & status
    const newRaised = campaign.raisedAmount + Number(amount);
    const isSuccessful = newRaised >= campaign.fundingGoal;

    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        raisedAmount: newRaised,
        status: isSuccessful ? "SUCCESSFUL" : campaign.status,
      },
    });

    // Create notification for contributor if session exists
    if (contributorId) {
      await prisma.notification.create({
        data: {
          userId: contributorId,
          type: "DONATION_SUCCESS",
          message: `Successfully donated ${amount} XLM to "${campaign.title}"`,
          link: `/campaigns/${campaign.slug}`,
        },
      });
    }

    return NextResponse.json({ success: true, donation, campaign: updatedCampaign });
  } catch (error) {
    console.error("Record donation error:", error);
    return NextResponse.json({ error: "Failed to record donation" }, { status: 500 });
  }
}
