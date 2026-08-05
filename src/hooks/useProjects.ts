import { useCallback, useEffect, useRef, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { seedProjects } from "../data/projects";
import { db } from "../lib/firebase";
import type { AppUser, Project } from "../types";

const localKey = "mapa-projetos-fernando-v1";

function loadLocalProjects() {
  const saved = localStorage.getItem(localKey);
  if (!saved) return seedProjects;
  try {
    return JSON.parse(saved) as Project[];
  } catch {
    return seedProjects;
  }
}

export function useProjects(user: AppUser | null) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const seeded = useRef(false);
  const isCloud = Boolean(db && user && !user.isDemo);

  useEffect(() => {
    seeded.current = false;
    setError("");

    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    if (!db || user.isDemo) {
      const local = loadLocalProjects();
      setProjects(local);
      setLoading(false);
      return;
    }

    setLoading(true);
    const firestore = db;
    const projectsRef = collection(firestore, "users", user.uid, "projects");
    return onSnapshot(
      projectsRef,
      async (snapshot) => {
        if (snapshot.empty && !seeded.current) {
          seeded.current = true;
          const batch = writeBatch(firestore);
          seedProjects.forEach((project) => {
            batch.set(doc(projectsRef, project.id), project);
          });
          await batch.commit();
          return;
        }

        const next = snapshot.docs.map((item) => item.data() as Project);
        next.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
        setProjects(next);
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );
  }, [user]);

  const persistLocal = useCallback((next: Project[]) => {
    setProjects(next);
    localStorage.setItem(localKey, JSON.stringify(next));
  }, []);

  const saveProject = useCallback(
    async (project: Project) => {
      if (!user) return;
      if (isCloud && db) {
        await setDoc(doc(db, "users", user.uid, "projects", project.id), project);
        return;
      }
      persistLocal(
        projects.some((item) => item.id === project.id)
          ? projects.map((item) => (item.id === project.id ? project : item))
          : [project, ...projects],
      );
    },
    [isCloud, persistLocal, projects, user],
  );

  const removeProject = useCallback(
    async (projectId: string) => {
      if (!user) return;
      if (isCloud && db) {
        await deleteDoc(doc(db, "users", user.uid, "projects", projectId));
        return;
      }
      persistLocal(projects.filter((project) => project.id !== projectId));
    },
    [isCloud, persistLocal, projects, user],
  );

  const resetDemo = useCallback(() => {
    localStorage.removeItem(localKey);
    setProjects(seedProjects);
  }, []);

  return {
    projects,
    loading,
    error,
    isCloud,
    saveProject,
    removeProject,
    resetDemo,
  };
      }
