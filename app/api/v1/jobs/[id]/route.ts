import { prisma } from "@/lib/prisma";
import { authenticateApiRequest } from "@/lib/apiAuth";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await authenticateApiRequest(request);
  if (!userId) return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });

  const { id } = await params;
  const job = await prisma.generationJob.findFirst({
    where: { id, userId },
    select: {
      id: true,
      status: true,
      outputMediaUrl: true,
      errorMessage: true,
      outputType: true,
      createdAt: true,
    },
  });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(job);
}
