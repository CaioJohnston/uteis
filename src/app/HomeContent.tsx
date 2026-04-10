"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useLanguage } from "@/contexts/language";
import { ToolCard } from "@/components/ToolCard";
import type { Tool } from "@/types";

const MeshAnimation = dynamic(
  () => import("@/components/MeshAnimation").then((m) => m.MeshAnimation),
  { ssr: false, loading: () => <div className="hidden md:block w-[320px] h-[320px] flex-shrink-0" /> }
);

export function HomeContent({ featured }: { featured: Tool[] }) {
  const { t } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-6">
      {/* Hero */}
      <section className="py-20 md:py-28 border-b border-paper-border dark:border-ink-border">
        <div className="flex flex-row items-center gap-8 md:gap-12">
          <div className="flex-1 min-w-0 max-w-xl">
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light leading-none tracking-tight mb-6">
              <span className="text-ink dark:text-paper">úteis</span><span className="text-gold">.</span>
            </h1>
            <p className="text-base text-ink/50 dark:text-paper/50 leading-relaxed max-w-lg mt-6">
              {t("home_desc_1")}{" "}
              {t("home_desc_2")}{" "}
              <span className="text-ink dark:text-paper">úteis</span><span className="text-gold">.</span>
            </p>
            <div className="flex items-center gap-4 mt-10">
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 bg-gold text-ink text-sm font-sans font-medium px-5 py-2.5 hover:bg-gold-light transition-colors duration-200"
              >
                {t("home_cta")}
              </Link>
              <a
                href="https://github.com/CaioJohnston/uteis"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono text-ink/40 dark:text-paper/40 hover:text-ink/80 dark:hover:text-paper/80 transition-colors duration-200"
              >
                GitHub →
              </a>
            </div>
          </div>
          <MeshAnimation />
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-16">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display text-2xl font-light text-ink dark:text-paper">
            {t("home_featured")}
          </h2>
          <Link
            href="/tools"
            className="text-xs font-mono text-ink/40 dark:text-paper/40 hover:text-gold transition-colors duration-200"
          >
            {t("home_see_all")}
          </Link>
        </div>

        <div className="tool-grid border border-paper-border dark:border-ink-border">
          {featured.map((tool) => (
            <ToolCard key={tool.id} tool={tool} variant="featured" />
          ))}
        </div>
      </section>

      {/* Sobre */}
      <section className="py-16 border-t border-paper-border dark:border-ink-border">
        <div className="max-w-xl">
          <h2 className="font-display text-2xl font-light text-ink dark:text-paper mb-4">
            {t("home_about_title")}
          </h2>
          <p className="text-sm text-ink/50 dark:text-paper/50 leading-relaxed">
            {t("home_about_body")}
          </p>
          <p className="text-xs font-mono text-ink/30 dark:text-paper/30 mt-4">
            {t("home_author")}
          </p>
        </div>
      </section>
    </div>
  );
}
