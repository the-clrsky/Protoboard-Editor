import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import HeaderControls from "@/components/HeaderControls";
import { SITE_URL } from "@/lib/mode";

// Same links as the top bar of sadmanbishal.com (src/components/Nav.astro there).
const SITE_LINKS = [
  { href: "/about", label: "About" },
  { href: "/writing", label: "Writing" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

const LINK =
  "text-neutral-500 dark:text-neutral-400 hover:text-[#113768] dark:hover:text-[#5b9bd5] transition-colors";

export default function SiteHeader({
  breadcrumb,
  actions,
}: {
  breadcrumb?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 font-site">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-3 sm:px-6 py-3">
        <div className="flex items-center min-w-0 text-base">
          <a href={SITE_URL} className={`font-serif shrink-0 ${LINK}`}>
            Sadman R. Bishal
          </a>
          <span className="mx-2 text-neutral-300 dark:text-neutral-600">/</span>
          <Link
            href="/"
            className="truncate font-serif font-medium text-[#113768] dark:text-[#5b9bd5] hover:text-[var(--copper)] dark:hover:text-[var(--copper)] transition-colors"
          >
            Protoboard Editor
          </Link>
          {breadcrumb && (
            <>
              <span className="mx-2 max-sm:hidden text-neutral-300 dark:text-neutral-600">/</span>
              <span className="truncate max-sm:hidden text-sm text-neutral-500 dark:text-neutral-400">{breadcrumb}</span>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-1 text-sm">
          <nav className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-1">
            {SITE_LINKS.map((l) => (
              <a key={l.href} href={`${SITE_URL}${l.href}`} className={LINK}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center shrink-0 gap-2 sm:gap-3">
            <HeaderControls actions={actions} />
            <ThemeToggle className="px-2 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-[var(--copper)] hover:text-[var(--copper)] transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
}
