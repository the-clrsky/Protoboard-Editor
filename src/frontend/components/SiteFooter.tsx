import { SITE_URL } from "@/lib/mode";

export default function SiteFooter() {
  return (
    <div className="border-t border-neutral-200 dark:border-neutral-700 mt-auto font-site">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-[0.85rem] text-neutral-500 dark:text-neutral-400">
        <span>© 2026 Sadman Rahamat Bishal</span>
        <a href={SITE_URL} className="hover:text-[#113768] dark:hover:text-[#5b9bd5] transition-colors">sadmanbishal.com</a>
      </div>
    </div>
  );
}
