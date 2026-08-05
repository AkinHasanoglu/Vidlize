import { IS_DEMO } from "@/lib/demo";
import { getActiveWorkspaceId } from "@/lib/workspace";
import { createClient } from "@/lib/supabase/server";
import { CreateStudio, type JobTemplate } from "@/components/studio/CreateStudio";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ fromJob?: string }>;
};

export default async function CreatePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { fromJob } = await searchParams;
  const activeWorkspaceId = IS_DEMO ? null : await getActiveWorkspaceId();
  const initialTemplate = IS_DEMO || !fromJob ? null : await getJobTemplate(fromJob);

  return (
    <CreateStudio locale={locale} activeWorkspaceId={activeWorkspaceId} initialTemplate={initialTemplate} />
  );
}

async function getJobTemplate(jobId: string): Promise<JobTemplate | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { prisma } = await import("@/lib/prisma");
    const job = await prisma.generationJob.findFirst({
      where: { id: jobId, userId: user.id },
      select: {
        outputType: true,
        backgroundType: true,
        backgroundUrl: true,
        customPrompt: true,
        model: true,
      },
    });
    return job;
  } catch {
    return null;
  }
}
