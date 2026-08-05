import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IS_DEMO } from "@/lib/demo";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Clock, Image as ImageIcon, Film, Star, RotateCcw } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type WorkspaceOption = { id: string; name: string; brandColor: string };

const STATUS_COLORS: Record<string, string> = {
  PENDING: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
  PROCESSING: "border-blue-500/40 bg-blue-500/10 text-blue-400",
  COMPLETED: "border-green-500/40 bg-green-500/10 text-green-400",
  FAILED: "border-red-500/40 bg-red-500/10 text-red-400",
};

const OUTPUT_ICONS: Record<string, React.ElementType> = {
  UGC_PHOTO: ImageIcon,
  UGC_VIDEO: Film,
  LIFESTYLE: Star,
};

// Computed once at module load (not during render) — mock history for demo mode.
const DEMO_NOW = Date.now();
const DEMO_JOBS = [
  { id: "1", outputType: "UGC_PHOTO", status: "COMPLETED", outputMediaUrl: "https://picsum.photos/seed/product1/400/400", createdAt: new Date(DEMO_NOW - 1000 * 60 * 30), workspace: null },
  { id: "2", outputType: "UGC_VIDEO", status: "COMPLETED", outputMediaUrl: null, createdAt: new Date(DEMO_NOW - 1000 * 60 * 60 * 2), workspace: null },
  { id: "3", outputType: "LIFESTYLE", status: "COMPLETED", outputMediaUrl: "https://picsum.photos/seed/lifestyle1/400/400", createdAt: new Date(DEMO_NOW - 1000 * 60 * 60 * 5), workspace: null },
  { id: "4", outputType: "UGC_PHOTO", status: "FAILED", outputMediaUrl: null, createdAt: new Date(DEMO_NOW - 1000 * 60 * 60 * 24), workspace: null },
];

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ workspace?: string }>;
};

export default async function HistoryPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { workspace: workspaceFilter } = await searchParams;
  const t = await getTranslations("history");
  const tSwitcher = await getTranslations("workspaceSwitcher");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  // Demo: use mock job history — no DB needed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let jobs: any[] = [];
  let workspaces: WorkspaceOption[] = [];
  if (IS_DEMO) {
    jobs = DEMO_JOBS;
  } else {
    try {
      const { prisma } = await import("@/lib/prisma");
      workspaces = await prisma.workspace.findMany({
        where: { ownerId: user!.id },
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, brandColor: true },
      });

      const where =
        workspaceFilter === "personal"
          ? { userId: user!.id, workspaceId: null }
          : workspaceFilter
            ? { userId: user!.id, workspaceId: workspaceFilter }
            : { userId: user!.id };

      jobs = await prisma.generationJob.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { workspace: { select: { name: true, brandColor: true } } },
      });
    } catch { jobs = []; }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5 text-[#8B5CF6]" />
        <h1 className="text-2xl font-bold gradient-hero-text">{t("title")}</h1>
      </div>

      {workspaces.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {[
            { id: undefined, label: t("workspaceFilter.all") },
            { id: "personal", label: tSwitcher("personal") },
            ...workspaces.map((w) => ({ id: w.id, label: w.name })),
          ].map(({ id, label }, i) => {
            const isActive = (workspaceFilter ?? undefined) === id;
            const href = id ? `/${locale}/history?workspace=${id}` : `/${locale}/history`;
            return (
              <Link
                key={i}
                href={href}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  isActive
                    ? "gradient-brand text-white border-transparent"
                    : "border-[var(--border)] text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground mb-4">{t("empty")}</p>
          <Link
            href={`/${locale}/create`}
            className="text-[#C4B5FD] hover:text-[#8B5CF6] text-sm font-medium transition-colors"
          >
            {t("emptyAction")} →
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {jobs.map((job: any) => {
            const Icon = OUTPUT_ICONS[job.outputType] ?? ImageIcon;
            const statusKey = job.status.toLowerCase();
            const outputKey = job.outputType.toLowerCase().replace("_", "");

            return (
              <div
                key={job.id}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden hover:border-[rgba(255,255,255,0.12)] transition-colors group"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-[var(--surface-2)] flex items-center justify-center relative overflow-hidden">
                  {job.status === "COMPLETED" && job.outputMediaUrl ? (
                    job.outputType === "UGC_VIDEO" ? (
                      <video
                        src={job.outputMediaUrl}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={job.outputMediaUrl}
                        alt="Generated"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    )
                  ) : (
                    <Icon className="h-8 w-8 text-muted-foreground/30" />
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                      {t(`outputType.${outputKey}`)}
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] px-2 py-0.5 border", STATUS_COLORS[job.status] ?? "")}
                    >
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(t as any)(`status.${statusKey}`, undefined, { default: statusKey })}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <p className="text-xs text-muted-foreground">
                      {new Date(job.createdAt).toLocaleDateString(locale, {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {job.workspace && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground truncate max-w-[100px]">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: job.workspace.brandColor }}
                        />
                        {job.workspace.name}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/${locale}/create?fromJob=${job.id}`}
                    className="mt-3 flex items-center gap-1.5 text-xs text-[#C4B5FD] hover:text-[#8B5CF6] transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    {t("useAsTemplate")}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
