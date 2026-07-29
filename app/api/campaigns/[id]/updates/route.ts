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
    const { title, content, image } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content required" }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign || campaign.creatorId !== session.userId) {
      return NextResponse.json({ error: "Only the campaign creator can post updates" }, { status: 403 });
    }

    const update = await prisma.campaignUpdate.create({
      data: {
        campaignId: campaign.id,
        title,
        content,
        image,
      },
    });

    return NextResponse.json({ success: true, update });
  } catch (error) {
    return NextResponse.json({ error: "Failed to post update" }, { status: 500 });
  }
}
