import type { Metadata } from "next";
import { getFeaturedTools } from "@/data/tools";
import { HomeContent } from "./HomeContent";

export const metadata: Metadata = {
  title: "úteis.",
};

export default function HomePage() {
  const featured = getFeaturedTools();
  return <HomeContent featured={featured} />;
}
