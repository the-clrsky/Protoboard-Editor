import Link from "next/link";
import { FEEDBACK_HREF } from "@/lib/mode";

export default function SiteFooter() {
  return (
    <div className="border-t border-neutral-200 dark:border-neutral-700 mt-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-neutral-400 dark:text-neutral-500">
        <span className="sm:max-w-md">
          a hobby project by{" "}
          <a href="https://github.com/the-clrsky" className="text-neutral-500 dark:text-neutral-400 hover:text-[#113768] dark:hover:text-[#5b9bd5] transition-colors">the-clrsky</a>
          {" "}for stripboards, dot boards and other prototyping boards
        </span>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href={FEEDBACK_HREF} className="text-neutral-500 dark:text-neutral-400 hover:text-[#113768] dark:hover:text-[#5b9bd5] transition-colors">Feedback</Link>
          <a href="https://github.com/the-clrsky/Protoboard-Editor" target="_blank" rel="noopener noreferrer" className="text-neutral-500 dark:text-neutral-400 hover:text-[#113768] dark:hover:text-[#5b9bd5] transition-colors">GitHub</a>
          <Link href="/privacy" className="text-neutral-500 dark:text-neutral-400 hover:text-[#113768] dark:hover:text-[#5b9bd5] transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
