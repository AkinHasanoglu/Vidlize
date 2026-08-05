import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceCreditsUsed } from "@/lib/workspace";
import { IS_DEMO } from "@/lib/demo";
import { getTranslations } from "next-intl/server";
import { Building2 } from "lucide-react";
import { WorkspaceList, type Workspace } from "@/components/workspaces/WorkspaceList";

type Props = { params: Promise<{ locale: string }> };

export default async function WorkspacesPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("workspaces");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const workspaces = IS_DEMO ? [] : await getDatabaseWorkspaces(user.id);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-2 mb-2">
        <Building2 className="h-5 w-5 text-[#8B5CF6]" />
        <h1 className="text-2xl font-bold gradient-hero-text">{t("title")}</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-8">{t("subtitle")}</p>

      <WorkspaceList workspaces={workspaces} disabled={IS_DEMO} />
    </div>
  );
}

async function getDatabaseWorkspaces(userId: string): Promise<Workspace[]> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const workspaces = await prisma.workspace.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "asc" },
    });
    return Promise.all(
      workspaces.map(async (w) => ({
        id: w.id,
        name: w.name,
        brandColor: w.brandColor,
        logoUrl: w.logoUrl,
        creditAllocation: w.creditAllocation,
        creditsUsed: await getWorkspaceCreditsUsed(w.id),
      }))
    );
  } catch {
    return [];
  }
}
