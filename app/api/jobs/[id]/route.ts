import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const job = await prisma.generationJob.findUnique({
    where: { id },
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

  // Users can only view their own jobs
  const ownership = await prisma.generationJob.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!ownership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(job);
}
