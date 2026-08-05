import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IS_DEMO, DEMO_USER } from "@/lib/demo";
import { getActiveWorkspaceId } from "@/lib/workspace";
import { Sidebar } from "@/components/shell/Sidebar";
import { Header } from "@/components/shell/Header";
import type { WorkspaceOption } from "@/components/shell/WorkspaceSwitcher";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DashboardLayout({ children, params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // In demo mode, use static demo user data — no DB required
  const dbUser = IS_DEMO ? null : await getDatabaseUser(user.id);
  const credits = IS_DEMO ? DEMO_USER.credits : dbUser?.credits ?? 0;
  const fullName = IS_DEMO ? DEMO_USER.fullName : dbUser?.fullName ?? null;
  const avatarUrl = IS_DEMO ? DEMO_USER.avatarUrl : dbUser?.avatarUrl ?? null;
  const workspaces: WorkspaceOption[] = IS_DEMO ? [] : await getDatabaseWorkspaces(user.id);
  const activeWorkspaceId = IS_DEMO ? null : await getActiveWorkspaceId();

  return (
    <div className="flex h-screen overflow-hidden bg-background bg-radial-brand">
      <Sidebar locale={locale} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          locale={locale}
          credits={credits}
          userEmail={user.email!}
          userAvatarUrl={avatarUrl}
          userFullName={fullName}
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

async function getDatabaseUser(userId: string) {
  try {
    const { prisma } = await import("@/lib/prisma");
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true, fullName: true, avatarUrl: true },
    });
  } catch {
    return null;
  }
}

async function getDatabaseWorkspaces(userId: string): Promise<WorkspaceOption[]> {
  try {
    const { prisma } = await import("@/lib/prisma");
    return await prisma.workspace.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, brandColor: true },
    });
  } catch {
    return [];
  }
}
