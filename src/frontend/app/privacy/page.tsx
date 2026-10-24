import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for the Protoboard Editor. What data is stored and where.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen font-mono bg-[#fafafa] dark:bg-[#121212] bg-[radial-gradient(var(--page-dot)_1px,transparent_1.5px)] [background-size:24px_24px] flex flex-col">
      <SiteHeader breadcrumb="privacy" />

      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex-1">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm dark:shadow-neutral-900/30 px-5 sm:px-8 py-7 sm:py-9">
        <h1 className="font-mono text-2xl font-bold text-[#113768] dark:text-[#5b9bd5] mb-6 tracking-tight">Privacy Policy</h1>

        <div className="prose prose-sm text-neutral-700 dark:text-neutral-300 space-y-5">
          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--copper)] mb-2 mt-0">About this project</h2>
            <p>Protoboard Editor is a personal, non-commercial hobby project by the-clrsky. It is not affiliated with or operated by any company, does not generate revenue and is free of charge.</p>
          </section>
          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--copper)] mb-2">Where your data is</h2>
            <p>The editor runs on your own computer. Projects, accounts and feedback are stored in a local SQLite database next to the program and never leave your computer.</p>
          </section>
          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--copper)] mb-2">What is stored</h2>
            <p>Your projects (components, nets, board layout). If you create an account: your username, a hashed version of your password and, if you add one, your email address. A single session cookie keeps you logged in.</p>
          </section>
          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--copper)] mb-2">What is shared</h2>
            <p>Nothing. There is no analytics, no tracking and no ads. Only if you set up an email provider yourself (RESEND_API_KEY in the backend settings) is your email address passed to it, to send a password reset link you asked for.</p>
          </section>
          <section>
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--copper)] mb-2">Contact</h2>
            <p>Open an issue on <a href="https://github.com/the-clrsky/Protoboard-Editor/issues" className="text-[#113768] dark:text-[#5b9bd5] hover:underline" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>
          </section>
        </div>

        <div className="mt-10 pt-4 border-t border-neutral-200 dark:border-neutral-700 text-xs text-neutral-400 dark:text-neutral-500">
          <Link href="/" className="text-neutral-500 dark:text-neutral-400 hover:text-[#113768] dark:hover:text-[#5b9bd5] transition-colors">
            Back to Protoboard Editor
          </Link>
        </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
