import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { getServerSession } from "@/lib/serverSession";
import { STATIC } from "@/lib/mode";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  alternates: {
    canonical: SITE_URL,
    types: { "text/markdown": `${SITE_URL}/index.md` },
  },
};

export default async function HomePage() {
  // Static build: no server session; HomeClient loads the browser's projects.
  if (STATIC) return <HomeClient initialUser={null} initialProjects={[]} />;
  const { user, projects } = await getServerSession();
  return <HomeClient initialUser={user} initialProjects={projects} />;
}
