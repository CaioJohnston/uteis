import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-border dark:border-ink-border mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-display text-sm text-paper/40 hover:text-gold transition-colors duration-200"
          >
            úteis<span className="text-gold">.</span>
          </Link>
          <span className="text-xs font-mono text-paper/20">
            {year} · feito à mão
          </span>
        </div>

        <div className="flex items-center gap-5">
          <Link
            href="/tools"
            className="text-xs font-mono text-paper/30 hover:text-paper/60 transition-colors"
          >
            ferramentas
          </Link>
          <a
            href="https://github.com/seuusuario/toolhub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-paper/30 hover:text-paper/60 transition-colors"
          >
            github
          </a>
        </div>
      </div>
    </footer>
  );
}
