import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-32 text-center">
      <p className="font-mono text-xs text-gold mb-4 tracking-widest uppercase">404</p>
      <h1 className="font-display text-5xl font-light text-paper dark:text-paper mb-4">
        Não encontrado
      </h1>
      <p className="text-sm text-paper/40 mb-10">
        Esta ferramenta não existe ou foi removida.
      </p>
      <Link
        href="/tools"
        className="text-sm font-mono text-gold hover:text-gold-light transition-colors"
      >
        ← voltar ao catálogo
      </Link>
    </div>
  );
}
