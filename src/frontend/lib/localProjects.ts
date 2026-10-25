import type { PreviewData, ProjectDetail, ProjectMeta } from "@/lib/api";

// Projects of the static (browser-only) build, kept in this browser. Same
// function names and shapes as the project calls in lib/api.ts, so the pages
// can use either one (see lib/projects.ts). IndexedDB first; localStorage when
// IndexedDB cannot open (some private windows); memory as the last resort.

interface LocalRecord {
  edit_uuid: string;
  name: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface Backend {
  kind: StorageKind;
  all(): Promise<LocalRecord[]>;
  get(id: string): Promise<LocalRecord | undefined>;
  put(rec: LocalRecord): Promise<void>;
  remove(id: string): Promise<void>;
}

export type StorageKind = "indexeddb" | "localstorage" | "memory";

const DB_NAME = "protoboard-editor";
const STORE = "projects";
const LS_KEY = "protoboard-editor:projects";

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "edit_uuid" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error("IndexedDB blocked"));
  });
}

function idbBackend(db: IDBDatabase): Backend {
  const store = (mode: IDBTransactionMode) => db.transaction(STORE, mode).objectStore(STORE);
  return {
    kind: "indexeddb",
    all: () => request(store("readonly").getAll() as IDBRequest<LocalRecord[]>),
    get: (id) => request(store("readonly").get(id) as IDBRequest<LocalRecord | undefined>),
    put: async (rec) => { await request(store("readwrite").put(rec)); },
    remove: async (id) => { await request(store("readwrite").delete(id)); },
  };
}

// One map for all projects. Writes throw when the storage is full, so a save
// fails visibly instead of being lost.
function mapBackend(kind: StorageKind, load: () => Record<string, LocalRecord>, store: (m: Record<string, LocalRecord>) => void): Backend {
  return {
    kind,
    all: async () => Object.values(load()),
    get: async (id) => load()[id],
    put: async (rec) => { const m = load(); m[rec.edit_uuid] = rec; store(m); },
    remove: async (id) => { const m = load(); delete m[id]; store(m); },
  };
}

function localStorageBackend(): Backend {
  localStorage.setItem(`${LS_KEY}:probe`, "1"); // throws when localStorage is blocked
  localStorage.removeItem(`${LS_KEY}:probe`);
  return mapBackend(
    "localstorage",
    () => JSON.parse(localStorage.getItem(LS_KEY) ?? "{}"),
    (m) => localStorage.setItem(LS_KEY, JSON.stringify(m)),
  );
}

function memoryBackend(): Backend {
  let m: Record<string, LocalRecord> = {};
  return mapBackend("memory", () => ({ ...m }), (next) => { m = next; });
}

let backendPromise: Promise<Backend> | null = null;

function backend(): Promise<Backend> {
  backendPromise ??= (async () => {
    try {
      return idbBackend(await openDb());
    } catch {
      try {
        return localStorageBackend();
      } catch {
        return memoryBackend();
      }
    }
  })();
  return backendPromise;
}

// Where the projects are kept, for the static-mode banner.
export async function storageKind(): Promise<StorageKind> {
  return (await backend()).kind;
}

function newId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  // crypto.randomUUID needs a secure context; a plain-http host gets this instead
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

// Same rules as get_preview_data / get_description in backend/projects/serializers.py
function previewData(data: Record<string, unknown>): PreviewData | null {
  const components = (data.components as Record<string, unknown>[] | undefined) ?? [];
  // An off-board part is on the board as its solder pads, kept in "leads"
  const placed = components.filter(
    (c) => c.boardPos != null || (c.offBoard && Array.isArray(c.leads) && c.leads.length > 0),
  );
  if (placed.length === 0) return null;
  return {
    components: placed,
    componentDefs: (data.componentDefs as Record<string, unknown>[] | undefined) ?? [],
    board: (data.board as Record<string, unknown> | undefined) ?? {},
    nets: (data.nets as Record<string, unknown>[] | undefined) ?? [],
    netAssignments: (data.netAssignments as Record<string, unknown>[] | undefined) ?? [],
  };
}

function toMeta(rec: LocalRecord): ProjectMeta {
  const description = rec.data.description;
  return {
    edit_uuid: rec.edit_uuid,
    view_uuid: "", // no view-only links in the browser-only build
    name: rec.name,
    description: typeof description === "string" ? description.slice(0, 200) : "",
    fork_count: 0,
    created_at: rec.created_at,
    updated_at: rec.updated_at,
    preview_data: previewData(rec.data),
  };
}

function toDetail(rec: LocalRecord): ProjectDetail {
  return { ...toMeta(rec), data: rec.data, owner_name: null };
}

export async function createProject(name: string, data: Record<string, unknown>): Promise<ProjectDetail> {
  const now = new Date().toISOString();
  const rec: LocalRecord = { edit_uuid: newId(), name, data, created_at: now, updated_at: now };
  await (await backend()).put(rec);
  return toDetail(rec);
}

export async function getProject(editUuid: string): Promise<ProjectDetail> {
  const rec = await (await backend()).get(editUuid);
  if (!rec) throw new Error("Project not found");
  return toDetail(rec);
}

export async function saveProject(editUuid: string, name: string, data: Record<string, unknown>): Promise<ProjectDetail> {
  const b = await backend();
  const old = await b.get(editUuid);
  if (!old) throw new Error("Failed to save project");
  const rec: LocalRecord = { ...old, name, data, updated_at: new Date().toISOString() };
  await b.put(rec);
  return toDetail(rec);
}

export async function deleteProject(editUuid: string): Promise<void> {
  await (await backend()).remove(editUuid);
}

// Newest first, like the server list.
export async function getUserProjects(): Promise<ProjectMeta[]> {
  const all = await (await backend()).all();
  return all.map(toMeta).sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}
