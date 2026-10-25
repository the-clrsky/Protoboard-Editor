"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import {
  getLibraryParts,
  deleteAccount,
  changePassword,
  setEmail,
  logout,
  type User,
  type ProjectMeta,
} from "@/lib/api";
import { getUserProjects, deleteProject, projectEditPath } from "@/lib/projects";
import { STATIC, FEEDBACK_HREF, withBase } from "@/lib/mode";
import { SITE_URL } from "@/lib/site";
import StaticModeBanner from "@/components/StaticModeBanner";
import { useProjectStore } from "@/store/useProjectStore";
import StripboardPreview from "@/components/StripboardPreview";
import BoardTypePreview from "@/components/BoardTypePreview";
import { BOARD_TYPES } from "@/components/stripboard/boardTypes";
import type { BoardType } from "@/types";
import { track } from "@/lib/track";
import SiteHeader from "@/components/SiteHeader";
import AuthModal from "@/components/AuthModal";
import PasswordInput from "@/components/PasswordInput";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


export default function HomeClient({
  initialUser,
  initialProjects,
}: {
  initialUser: User | null;
  initialProjects: ProjectMeta[];
}) {
  const router = useRouter();
  const resetProject = useProjectStore((s) => s.resetProject);

  const [user, setUser] = useState<User | null>(initialUser);
  // Size of the user's part library, once known
  const [partCount, setPartCount] = useState<number | null>(null);
  useEffect(() => {
    if (!user) return;
    getLibraryParts().then((parts) => setPartCount(parts ? parts.length : null)).catch(() => setPartCount(null));
  }, [user]);
  const [projects, setProjects] = useState<ProjectMeta[]>(initialProjects);
  // Static build: the projects are in this browser, so load them here (no login)
  useEffect(() => {
    if (STATIC) getUserProjects().then(setProjects).catch(() => setProjects([]));
  }, []);
  const showProjects = STATIC || !!user;

  const [showAuth, setShowAuth] = useState<"login" | "register" | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showAccountDelete, setShowAccountDelete] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSaving, setEmailSaving] = useState(false);

  const handleNewProject = (type?: BoardType) => {
    resetProject(type);
    track("project-create", type ? { board: type } : undefined);
    router.push("/project/new");
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteProject(deleteConfirm);
    setProjects((prev) => prev.filter((p) => p.edit_uuid !== deleteConfirm));
    setDeleteConfirm(null);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setProjects([]);
    router.refresh();
  };

  // Card text per board kind (the full description is in boardTypes.ts)
  const boardBlurbs: Record<BoardType, string> = {
    strip: "Copper strips along every row. Cut them where two nets must part.",
    dot: "A lone pad per hole. Solder runs join the pads you choose.",
    tripad: "Pads joined in threes along each row. Bridge the groups with solder.",
    breadboard: "The breadboard pattern in copper: power rails and joined columns.",
  };

  const steps: { title: string; body: string; aside?: { label: string; body: string; href?: string } }[] = [
    { title: "Draw", body: "Build the schematic from the symbol library or your own parts. The wires make the nets." },
    { title: "Choose the board", body: "Pick the kind of board on your bench and its size. Presets cover the common perfboard sizes." },
    {
      title: "Lay it out",
      body: "Drag the parts onto the board. Every net gets its own colour, and a short or an open connection shows at once.",
      aside: { label: "or auto-layout", body: "On stripboard and dot board the router places every part and lays the cuts or solder runs.", href: "/how-auto-layout-works" },
    },
    {
      title: "Print and solder",
      body: "Print the 1:1 sheets, push the parts through the paper, then follow the cut or run sheet.",
      aside: { label: "or go to PCB", body: "When the prototype works, export a KiCad netlist and draw the real PCB." },
    },
  ];

  const featureGroups = [
    {
      title: "Design",
      items: [
        "Schematic editor with a standard symbol library and automatic net detection",
        "IC pinouts from the KiCad symbol library, plus your own custom parts",
        "Parts drawn as real packages at true size: choose the body you have",
        "Editable footprints and flexible leads for passives",
      ],
    },
    {
      title: "Lay out",
      items: [
        "Four board kinds: stripboard, dot board, tripad board, breadboard PCB",
        "Auto-layout for stripboard and dot board: placement, board size, cuts and runs",
        "Lock the board size or single parts, and the router works around them",
        "Off-board parts such as pots and jacks get pads or a connector",
      ],
    },
    {
      title: "Build and share",
      items: [
        "1:1 print: placement sheet, mirrored cut or run sheet, parts list",
        "KiCad-compatible netlist export",
        "JSON export and import, full undo history",
        "Edit and view-only links when you host it yourself",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#121212] bg-[radial-gradient(var(--page-dot)_1px,transparent_1.5px)] [background-size:24px_24px] font-site flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Protoboard Editor",
            url: SITE_URL,
            description:
              "Free, open-source layout editor for prototyping boards: stripboard, dot board (perfboard), tripad board and breadboard PCB. Draw the schematic with standard symbols, then place the parts by hand with live net colouring, or let the automatic layout router place them and lay the strip cuts or solder runs. Parts are drawn as their real packages at true size. Print a true-scale build template with a mirrored cut or solder-run sheet and a bill of materials (BOM), or export a KiCad-compatible netlist to turn the prototype into a PCB.",
            applicationCategory: "DesignApplication",
            operatingSystem: "Any",
            featureList: [
              "Stripboard, dot board, tripad board and breadboard PCB layouts",
              "Schematic editor with a standard symbol library",
              "Automatic layout router for stripboard and dot board that places every part at the real size of its package",
              "Lockable board dimensions and lockable component positions the router designs around",
              "Live net colouring with real-time conflict detection",
              "Realistic part rendering at true package size, with selectable packages",
              "Off-board parts wired to solder pads or connectors",
              "Editable component footprints and custom components",
              "Printable 1:1 build template with a mirrored cut or solder-run sheet and BOM",
              "KiCad-compatible netlist export",
              "Shareable edit and view-only project links",
            ],
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "EUR",
            },
            author: {
              "@type": "Person",
              name: "the-clrsky",
              url: "https://github.com/the-clrsky",
            },
          }),
        }}
      />
      {/* Header */}
      <SiteHeader
        actions={
          STATIC ? null : user ? (
            <>
              <span className="font-site-mono text-neutral-500 dark:text-neutral-400 hidden sm:inline">{user.username}</span>
              <button
                onClick={handleLogout}
                className="font-site-mono px-2 sm:px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-[var(--copper)] hover:text-[var(--copper)] transition-colors"
              >
                logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowAuth("login")}
                className="font-site-mono px-2 sm:px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-[var(--copper)] hover:text-[var(--copper)] transition-colors"
              >
                login
              </button>
              <button
                onClick={() => setShowAuth("register")}
                className="font-site-mono px-2 sm:px-3 py-1.5 rounded bg-[#113768] text-white border-2 border-[#113768] hover:border-[var(--copper)] transition-colors"
              >
                register
              </button>
            </>
          )
        }
      />

      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex-1">
        {/* Hero */}
        <div className="mb-8">
          <p className="font-site-mono text-xs uppercase tracking-[0.2em] text-[var(--copper)] mb-3">{"// one editor, four kinds of board"}</p>
          <h1 className="font-serif font-medium text-4xl sm:text-5xl leading-tight text-[#113768] dark:text-[#5b9bd5] mb-3">
            Protoboard Editor
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-base sm:text-[17px] leading-relaxed max-w-2xl">
            Plan a circuit on the board you will really solder: stripboard, dot board, tripad board or a breadboard-style PCB. Draw the schematic once. Then place the parts by hand, with every net in its own colour, or let auto-layout place them and lay the cuts or solder runs for you.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 mb-4 font-site text-[0.95rem] font-medium">
          <button
            onClick={() => handleNewProject()}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-md border border-[#113768] bg-[#113768] text-white hover:bg-[#1a4a8a] hover:border-[#1a4a8a] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New project
          </button>
          <Link
            href="/guide"
            onClick={() => track("content-cta", { from: "home", to: "guide" })}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-md border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:border-[#113768] dark:hover:border-[#5b9bd5] hover:text-[#113768] dark:hover:text-[#5b9bd5] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
              <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
            </svg>
            Short guide
          </Link>
        </div>

        {STATIC && <StaticModeBanner />}

        {/* What's new pointer */}
        <div className="mb-12 text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
          <p>This fork is young and still grows. New board features land often.</p>
          <p>
            <Link href="/updates" onClick={() => track("content-cta", { from: "home", to: "updates" })} className="font-site-mono text-[var(--copper)] hover:underline">
              Changelog and plans →
            </Link>
          </p>
          <p>
            <Link href={FEEDBACK_HREF} className="font-site-mono text-[var(--copper)] hover:underline">
              Found a bug or have an idea? Send feedback →
            </Link>
          </p>
        </div>

        {/* Board kinds: each card starts a new project on that board */}
        <div className="mb-12">
          <h2 className="font-site-mono text-sm uppercase tracking-[0.2em] text-[var(--copper)] mb-1">start on a board</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">Each card opens a new project on that board. You can change the kind later in the editor.</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...BOARD_TYPES].sort((a, b) => Number(b.id === "dot") - Number(a.id === "dot")).map((b) => (
              <button
                key={b.id}
                onClick={() => handleNewProject(b.id)}
                className="group text-left rounded-lg border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161616] p-3 hover:border-[var(--copper)] dark:hover:border-[var(--copper)] transition-colors flex flex-col"
              >
                <BoardTypePreview type={b.id} className="w-full h-auto mb-3" />
                <span className="font-serif font-medium text-lg leading-snug text-[#113768] dark:text-[#5b9bd5] group-hover:text-[var(--copper)] transition-colors">{b.name}</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex-1">{boardBlurbs[b.id]}</span>
                <span className={`font-site-mono text-[10px] uppercase tracking-[0.15em] mt-2 ${b.autoLayout ? "text-[var(--copper)]" : "text-neutral-400 dark:text-neutral-500"}`}>
                  {b.autoLayout ? "auto-layout" : "hand layout"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {!user && (<>
        {/* Editor screenshot: the demo project on a dot board. Wider than the
            text column on large screens, so the board stays readable. */}
        <figure className="mb-12 lg:-mx-32 xl:-mx-48">
          <img
            src={withBase("/demo-dotboard.png")}
            alt="Protoboard Editor with the schematic of a 555 LED flasher on the left and its dot board layout on the right"
            className="rounded-lg border-2 border-neutral-200 dark:border-neutral-700 shadow-sm dark:shadow-neutral-900/30 w-full dark:hidden"
          />
          <img
            src={withBase("/demo-dotboard-dark.png")}
            alt="Protoboard Editor with the schematic of a 555 LED flasher on the left and its dot board layout on the right"
            className="rounded-lg border-2 border-neutral-200 dark:border-neutral-700 shadow-sm dark:shadow-neutral-900/30 w-full hidden dark:block"
          />
          <figcaption className="font-site-mono text-xs text-neutral-500 dark:text-neutral-400 mt-2 text-center">
            555 LED flasher: auto-layout put it on a 7 × 18 dot board. each colour is one net, joined by solder runs.
          </figcaption>
        </figure>

        {/* How it works */}
        <div className="mb-12">
          <h2 className="font-site-mono text-sm uppercase tracking-[0.2em] text-[var(--copper)] mb-5">from idea to board</h2>
          <ol className="border-l-2 border-dashed border-[var(--copper)]/50 ml-3 space-y-6">
            {steps.map((s, i) => (
              <li key={s.title} className="relative pl-7">
                <span className="absolute -left-[15px] top-0 w-7 h-7 rounded-full border-2 border-[var(--copper)] bg-[#fafafa] dark:bg-[#121212] font-site-mono text-xs text-[var(--copper)] flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="sm:flex sm:gap-6">
                  <div className="sm:flex-1">
                    <p className="font-serif font-medium text-lg text-neutral-800 dark:text-neutral-200 leading-7">{s.title}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{s.body}</p>
                  </div>
                  {s.aside && (
                    <div className="mt-2 sm:mt-0 sm:w-64 flex-shrink-0 rounded-md border border-dashed border-[var(--copper)] bg-[var(--copper)]/[0.06] px-3 py-2">
                      <span className="font-site-mono text-[10px] uppercase tracking-[0.15em] text-[var(--copper)]">{s.aside.label}</span>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {s.aside.body}
                        {s.aside.href && (
                          <>
                            {" "}
                            <Link href={s.aside.href} onClick={() => track("content-cta", { from: "home", to: "explainer" })} className="text-[var(--copper)] hover:underline">How it works &rarr;</Link>
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="font-site-mono text-sm uppercase tracking-[0.2em] text-[var(--copper)] mb-5">what you get</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featureGroups.map((g) => (
              <div key={g.title} className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161616] p-4">
                <p className="font-serif font-medium text-lg text-[#113768] dark:text-[#5b9bd5] mb-3">{g.title}</p>
                <ul className="space-y-2">
                  {g.items.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <span className="font-site-mono text-[var(--copper)] leading-5 flex-shrink-0" aria-hidden="true">▸</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Print demo */}
        <div className="mb-12">
          <h2 className="font-site-mono text-sm uppercase tracking-[0.2em] text-[var(--copper)] mb-5">print and build</h2>
          <img
            src={withBase("/print-dotboard.png")}
            alt="Printable 1:1 dot board build template: placement sheet, mirrored solder-run sheet and parts list"
            loading="lazy"
            decoding="async"
            className="rounded-lg border-2 border-neutral-200 dark:border-neutral-700 shadow-sm dark:shadow-neutral-900/30 w-full max-w-md mx-auto block"
          />
          <p className="font-site-mono text-xs text-neutral-500 dark:text-neutral-400 mt-2 text-center">placement sheet on top, the solder-run sheet mirrored for the copper side, then the parts list.</p>
        </div>

        {/* Free banner */}
        <div className="mb-12 font-site-mono text-xs sm:text-sm text-center text-neutral-500 dark:text-neutral-400 border-y border-dashed border-neutral-300 dark:border-neutral-700 py-4">
          <span className="text-[var(--copper)]">free and open source</span> (GPL-3.0) · in your browser or on your own server · no ads
        </div>

        </>)}


        {/* Account settings */}
        {user && (
          <div className="mb-8">
            <h2 className="font-serif font-medium text-xl text-neutral-800 dark:text-neutral-200 mb-3">Account</h2>
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-4 py-3 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className="text-sm text-neutral-600 dark:text-neutral-400 min-w-0 break-words">Logged in as <span className="font-medium text-neutral-900 dark:text-neutral-100">{user.username}</span></span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setShowChangePassword(true); setPwError(null); setPwSuccess(false); setNewPw(""); setConfirmPw(""); }}
                    className="text-sm text-[#113768] dark:text-[#5b9bd5] hover:underline"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={() => setShowAccountDelete(true)}
                    className="text-sm text-red-500 dark:text-red-400 hover:underline"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-neutral-100 dark:border-neutral-800 pt-3">
                <span className="text-sm text-neutral-600 dark:text-neutral-400 min-w-0 break-words">
                  {user.email
                    ? <>Recovery email: <span className="font-medium text-neutral-900 dark:text-neutral-100">{user.email}</span></>
                    : <>No recovery email set <span className="text-neutral-400 dark:text-neutral-500">(fully optional, only used for password reset)</span></>}
                </span>
                <button
                  onClick={() => { setEmailInput(user.email ?? ""); setEmailError(null); setShowEmailModal(true); }}
                  className="text-sm text-[#113768] dark:text-[#5b9bd5] hover:underline flex-shrink-0"
                >
                  {user.email ? "Change email" : "Add email"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* The user's part library */}
        {user && (
          <div className="mb-8">
            <h2 className="font-serif font-medium text-xl text-neutral-800 dark:text-neutral-200 mb-3">Your Parts</h2>
            <Link
              href="/parts"
              onClick={() => track("content-cta", { from: "home", to: "parts" })}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
            >
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {partCount === null
                  ? "Custom parts you can use in all your projects"
                  : `${partCount} custom ${partCount === 1 ? "part" : "parts"} in your library, usable in all your projects`}
              </span>
              <span className="text-sm text-[#113768] dark:text-[#5b9bd5]">Manage parts →</span>
            </Link>
          </div>
        )}

        {/* User projects */}
        {showProjects && (
          <div>
            <h2 className="font-serif font-medium text-xl text-neutral-800 dark:text-neutral-200 mb-3">Your Projects</h2>
            {projects.length === 0 ? (
              <p className="text-neutral-400 dark:text-neutral-500 text-sm">No projects yet. Create one above.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {projects.map((project) => (
                  <Link
                    key={project.edit_uuid}
                    href={projectEditPath(project.edit_uuid)}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 sm:px-4 py-3 flex items-center gap-3 sm:gap-4 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
                  >
                    {project.preview_data && (
                      <div className="flex-shrink-0 w-24 sm:w-[180px] [&>svg]:w-full [&>svg]:h-auto">
                        <StripboardPreview data={project.preview_data} maxWidth={180} maxHeight={120} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-[#113768] dark:text-[#5b9bd5]">
                        {project.name}
                      </span>
                      {project.description && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                          {project.description}
                        </p>
                      )}
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5" suppressHydrationWarning>
                        Updated {new Date(project.updated_at).toLocaleDateString()}
                        {project.fork_count > 0 && ` · ${project.fork_count} fork${project.fork_count > 1 ? "s" : ""}`}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); setDeleteConfirm(project.edit_uuid); }}
                      className="text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 text-sm px-2 flex-shrink-0"
                      title="Delete project"
                    >
                      Delete
                    </button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Change password modal */}
      {showChangePassword && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setShowChangePassword(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl dark:shadow-neutral-900/50 p-6 w-[calc(100%-2rem)] sm:w-80 max-w-sm mx-4 sm:mx-0"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Change Password</h2>
            {pwSuccess ? (
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 mb-4">Password changed successfully.</p>
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="w-full bg-[#113768] text-white py-2 rounded text-sm font-medium hover:bg-[#0d2a50] transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                noValidate
                onSubmit={async (e) => {
                  e.preventDefault();
                  setPwError(null);
                  if (newPw !== confirmPw) {
                    setPwError("New passwords do not match.");
                    return;
                  }
                  try {
                    await changePassword(newPw);
                    track("password-change");
                    setPwSuccess(true);
                  } catch (err: unknown) {
                    setPwError(err instanceof Error ? err.message : "Failed to change password");
                  }
                }}
                className="flex flex-col gap-3"
              >
                <PasswordInput
                  value={newPw}
                  onChange={(e) => { setNewPw(e.target.value); setPwError(null); }}
                  placeholder="New password"
                  className="border border-neutral-300 dark:border-neutral-600 rounded px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 dark:bg-neutral-800 outline-none focus:border-[#113768] dark:focus:border-[#5b9bd5]"
                  autoFocus
                />
                <PasswordInput
                  value={confirmPw}
                  onChange={(e) => { setConfirmPw(e.target.value); setPwError(null); }}
                  placeholder="Confirm new password"
                  className="border border-neutral-300 dark:border-neutral-600 rounded px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 dark:bg-neutral-800 outline-none focus:border-[#113768] dark:focus:border-[#5b9bd5]"
                />
                {pwError && <p className="text-xs text-red-500 dark:text-red-400">{pwError}</p>}
                <button
                  type="submit"
                  disabled={!newPw || !confirmPw}
                  className="bg-[#113768] text-white py-2 rounded text-sm font-medium hover:bg-[#0d2a50] transition-colors disabled:opacity-60"
                >
                  Change Password
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Recovery email modal */}
      {showEmailModal && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setShowEmailModal(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl dark:shadow-neutral-900/50 p-6 w-[calc(100%-2rem)] sm:w-80 max-w-sm mx-4 sm:mx-0"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Recovery email</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Used only to reset a forgotten password. Leave blank to remove it.
            </p>
            <form
              noValidate
              onSubmit={async (e) => {
                e.preventDefault();
                setEmailError(null);
                const trimmed = emailInput.trim();
                if (trimmed && !EMAIL_RE.test(trimmed)) {
                  setEmailError("Enter a valid email, or leave it blank.");
                  return;
                }
                setEmailSaving(true);
                try {
                  const updated = await setEmail(trimmed);
                  track("email-change", { action: trimmed ? "set" : "remove" });
                  setUser(updated);
                  setShowEmailModal(false);
                } catch (err: unknown) {
                  setEmailError(err instanceof Error ? err.message : "Failed to update email");
                }
                setEmailSaving(false);
              }}
              className="flex flex-col gap-3"
            >
              <input
                type="email"
                value={emailInput}
                onChange={(e) => { setEmailInput(e.target.value); setEmailError(null); }}
                placeholder="you@example.com"
                className="border border-neutral-300 dark:border-neutral-600 rounded px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 dark:bg-neutral-800 outline-none focus:border-[#113768] dark:focus:border-[#5b9bd5]"
                autoFocus
              />
              {emailError && <p className="text-xs text-red-500 dark:text-red-400">{emailError}</p>}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 text-sm rounded border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={emailSaving}
                  className="px-4 py-2 text-sm rounded bg-[#113768] text-white font-medium hover:bg-[#0d2a50] transition-colors disabled:opacity-60"
                >
                  {emailSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete account modal */}
      {showAccountDelete && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setShowAccountDelete(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl dark:shadow-neutral-900/50 p-6 w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Delete Account</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5">
              Are you sure? This will permanently delete your account and all your projects. This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowAccountDelete(false)}
                className="px-4 py-2 text-sm rounded border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteAccount();
                  setUser(null);
                  setProjects([]);
                  setShowAccountDelete(false);
                  router.refresh();
                }}
                className="px-4 py-2 text-sm rounded bg-red-500 dark:bg-red-600 text-white font-medium hover:bg-red-600 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl dark:shadow-neutral-900/50 p-6 w-[calc(100%-2rem)] sm:w-80 max-w-sm mx-4 sm:mx-0"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Delete Project</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5">
              Are you sure you want to delete{" "}
              <span className="font-medium">
                {projects.find((p) => p.edit_uuid === deleteConfirm)?.name ?? "this project"}
              </span>
              ? This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm rounded border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm rounded bg-red-500 dark:bg-red-600 text-white font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Auth modal */}
      {showAuth && (
        <AuthModal
          mode={showAuth}
          onMode={setShowAuth}
          onClose={() => setShowAuth(null)}
          onSuccess={(u) => {
            setUser(u);
            setShowAuth(null);
            getUserProjects().then(setProjects);
            router.refresh();
          }}
        />
      )}

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
