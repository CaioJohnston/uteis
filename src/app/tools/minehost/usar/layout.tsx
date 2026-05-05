import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Git-Craft",
  openGraph: {
    title: "Git-Craft",
    description: "Crie e gerencie um servidor Minecraft via GitHub Codespaces. Sem VPS, sem configuração de rede.",
    images: [{
      url: "/git-craft-og.png",
      width: 1200,
      height: 630,
      alt: "Git-Craft — Minecraft server via GitHub Codespaces",
    }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
