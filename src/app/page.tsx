import type { Metadata } from "next";
import Link from "next/link";
import { getFeaturedTools } from "@/data/tools";
import { ToolCard } from "@/components/ToolCard";

export const metadata: Metadata = {
  title: "Início",
};

export default function HomePage() {
  const featured = getFeaturedTools();

  return (
    <div className="max-w-5xl mx-auto px-6">
      {/* Hero */}
      <section className="py-20 md:py-28 border-b border-ink-border dark:border-ink-border">
        <div className="max-w-2xl">
          <p className="font-mono text-xs text-gold mb-6 tracking-widest uppercase">
            hub pessoal
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light leading-none tracking-tight text-paper dark:text-paper mb-6 text-balance">
            Ferramentas que uso.
            <br />
            <em className="text-gold">Que talvez você use também.</em>
          </h1>
          <p className="text-base text-paper/50 dark:text-paper/50 leading-relaxed max-w-lg mt-6">
            Uma coleção de mini aplicações, scripts convertidos em interfaces web e experimentos de IA.
            Construídos para uso próprio. Compartilhados porque pode ser útil.
          </p>
          <div className="flex items-center gap-4 mt-10">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 bg-gold text-ink-DEFAULT text-sm font-sans font-medium px-5 py-2.5 hover:bg-gold-light transition-colors duration-200"
            >
              Ver ferramentas
            </Link>
            <a
              href="https://github.com/CaioJohnston/uteis"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono text-paper/40 dark:text-paper/40 hover:text-paper/80 transition-colors duration-200"
            >
              GitHub →
            </a>
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-16">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display text-2xl font-light text-paper dark:text-paper">
            Em destaque
          </h2>
          <Link
            href="/tools"
            className="text-xs font-mono text-paper/40 hover:text-gold transition-colors duration-200"
          >
            ver todas →
          </Link>
        </div>

        <div className="tool-grid border border-ink-border dark:border-ink-border">
          {featured.map((tool) => (
            <ToolCard key={tool.id} tool={tool} variant="featured" />
          ))}
        </div>
      </section>

      {/* Sobre */}
      <section className="py-16 border-t border-ink-border dark:border-ink-border">
        <div className="max-w-xl">
          <h2 className="font-display text-2xl font-light text-paper dark:text-paper mb-4">
            Sobre o projeto
          </h2>
          <p className="text-sm text-paper/50 leading-relaxed">
            Este site é um arquivo pessoal de utilidades. Cada ferramenta aqui
            existe porque eu precisei dela em algum momento e decidi transformá-la em
            algo com interface. O código é aberto, a intenção é simples.
          </p>
          <p className="text-xs font-mono text-paper/30 mt-4">
            {/* Substitua com seu nome e contexto */}
            Caio Johnstonm · Brasil
          </p>
        </div>
      </section>
    </div>
  );
}
