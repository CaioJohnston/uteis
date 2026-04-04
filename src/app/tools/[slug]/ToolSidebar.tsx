"use client";

import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/contexts/language";
import type { Tool, OsPlatform } from "@/types";

const OsIcon = ({ os }: { os: OsPlatform }) => {
  if (os === "windows") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.551H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
      </svg>
    );
  }
  if (os === "macos-intel" || os === "macos-arm") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489.117.779.567 1.563 1.048 2.078.524.565 1.124.965 1.754 1.154.293.095.6.148.91.148.787 0 1.55-.278 2.16-.738.61.46 1.373.738 2.16.738.31 0 .617-.053.91-.148.63-.19 1.23-.589 1.754-1.154.481-.515.931-1.299 1.048-2.078.123-.805-.009-1.657-.287-2.489-.589-1.77-1.831-3.47-2.716-4.521-.75-1.067-.974-1.928-1.05-3.02-.065-1.491 1.056-5.965-3.17-6.298A7.64 7.64 0 0 0 12.504 0zm-1.8 3.38c-.067.372.144.732.47.8.33.07.655-.186.722-.558.065-.372-.145-.732-.472-.8-.328-.07-.655.187-.72.558zm3.6 0c-.065-.371.392-.628.72-.558.327.068.537.428.472.8-.067.372-.392.628-.72.558-.327-.068-.537-.428-.472-.8zM12 5.5c1.105 0 2 .895 2 2s-.895 2-2 2-2-.895-2-2 .895-2 2-2zm-4 9.5c.553 0 1 .448 1 1s-.447 1-1 1-1-.448-1-1 .447-1 1-1zm8 0c.553 0 1 .448 1 1s-.447 1-1 1-1-.448-1-1 .447-1 1-1z" />
    </svg>
  );
};

const osLabel: Record<OsPlatform, string> = {
  windows: "Windows",
  "macos-intel": "macOS Intel",
  "macos-arm": "macOS Apple Silicon",
  linux: "Linux",
};

export function ToolSidebar({ tool }: { tool: Tool }) {
  const { t } = useLanguage();

  const statusLabel = {
    active: t("status_active"),
    experimental: t("status_experimental"),
    maintenance: t("status_maintenance"),
    archived: t("status_archived"),
  };

  return (
    <aside className="space-y-6">
      {/* Links de ação */}
      <div className="border border-paper-border dark:border-ink-border p-5 space-y-3">
        <p className="text-xs font-mono text-ink/30 dark:text-paper/30 uppercase tracking-widest mb-4">
          {t("links")}
        </p>

        {tool.hostingMode === "embedded" && tool.href && (
          <Link
            href={tool.href}
            className="flex items-center justify-between w-full bg-gold text-ink text-sm font-sans font-medium px-4 py-2.5 hover:bg-gold-light transition-colors"
          >
            {t("use_tool")}
            <span className="font-mono text-xs">→</span>
          </Link>
        )}

        {tool.hostingMode === "external" && tool.externalUrl && (
          <a
            href={tool.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full bg-gold text-ink text-sm font-sans font-medium px-4 py-2.5 hover:bg-gold-light transition-colors"
          >
            {t("open_tool")}
            <span className="font-mono text-xs">↗</span>
          </a>
        )}

        {tool.hostingMode === "download" && tool.downloads && tool.downloads.length > 0 && (
          <div className="space-y-2">
            {tool.downloads.map((d) => (
              <a
                key={d.os}
                href={d.url}
                className="flex items-center gap-2.5 w-full bg-gold text-ink text-sm font-sans font-medium px-4 py-2.5 hover:bg-gold-light transition-colors"
              >
                <span><OsIcon os={d.os} /></span>
                <span className="flex-1">{osLabel[d.os]}</span>
                <span className="text-ink/60 text-xs font-mono">{d.label}</span>
                <span className="font-mono text-xs">↓</span>
              </a>
            ))}
          </div>
        )}

        {tool.hostingMode === "download" && !tool.downloads && tool.downloadUrl && (
          <a
            href={tool.downloadUrl}
            className="flex items-center justify-between w-full bg-gold text-ink text-sm font-sans font-medium px-4 py-2.5 hover:bg-gold-light transition-colors"
          >
            {tool.downloadLabel ?? t("download_label")}
            <span className="font-mono text-xs">↓</span>
          </a>
        )}

        {tool.githubUrl && (
          <a
            href={tool.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full border border-paper-border dark:border-ink-border text-ink/60 dark:text-paper/60 text-sm font-sans px-4 py-2.5 hover:border-ink/30 dark:hover:border-paper/30 hover:text-ink dark:hover:text-paper transition-colors"
          >
            {tool.hostingMode === "embedded" ? t("mirror_repo") : t("source_code")}
            <span className="font-mono text-xs">↗</span>
          </a>
        )}
      </div>

      {/* Requisitos */}
      {tool.hostingMode === "download" && tool.requirements && (
        <div className="border border-paper-border dark:border-ink-border p-5">
          <p className="text-xs font-mono text-ink/30 dark:text-paper/30 uppercase tracking-widest mb-3">
            {t("requirements")}
          </p>
          <p className="text-xs font-mono text-ink/60 dark:text-paper/60">{tool.requirements}</p>
        </div>
      )}

      {/* Metadados */}
      <div className="border border-paper-border dark:border-ink-border p-5 space-y-3">
        <p className="text-xs font-mono text-ink/30 dark:text-paper/30 uppercase tracking-widest mb-4">
          {t("metadata")}
        </p>
        <div className="flex justify-between text-xs">
          <span className="font-mono text-ink/30 dark:text-paper/30">{t("published")}</span>
          <span className="font-mono text-ink/60 dark:text-paper/60">{formatDate(tool.createdAt)}</span>
        </div>
        {tool.version && (
          <div className="flex justify-between text-xs">
            <span className="font-mono text-ink/30 dark:text-paper/30">{t("version")}</span>
            <span className="font-mono text-ink/60 dark:text-paper/60">{tool.version}</span>
          </div>
        )}
        <div className="flex justify-between text-xs">
          <span className="font-mono text-ink/30 dark:text-paper/30">{t("status")}</span>
          <span className="font-mono text-ink/60 dark:text-paper/60">{statusLabel[tool.status]}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="font-mono text-ink/30 dark:text-paper/30">{t("visibility")}</span>
          <span className="font-mono text-ink/60 dark:text-paper/60">{tool.visibility}</span>
        </div>
      </div>
    </aside>
  );
}
