import * as server from "@/lib/api";
import * as local from "@/lib/localProjects";
import { STATIC } from "@/lib/mode";

// Project storage for the pages: the Django API in the full build, this
// browser in the static build (lib/localProjects.ts). Same calls either way.
const store = STATIC ? local : server;

export const createProject = store.createProject;
export const getProject = store.getProject;
export const saveProject = store.saveProject;
export const deleteProject = store.deleteProject;
export const getUserProjects = store.getUserProjects;

// Only the backend upgrades project files of an older schema version.
export const OLD_VERSION_MESSAGE =
  "This file is from an older version of the editor. Open it once in a self-hosted Protoboard Editor, then export it again.";

export async function migrateProjectData(data: unknown): Promise<unknown> {
  if (STATIC) throw new Error(OLD_VERSION_MESSAGE);
  return server.migrateProjectData(data);
}

// Editor URL of a saved project, without the base path (Link and router.push
// add it; window.history calls need BASE_PATH in front).
export function projectEditPath(editUuid: string): string {
  return STATIC ? `/project/open/?id=${encodeURIComponent(editUuid)}` : `/project/${editUuid}`;
}
