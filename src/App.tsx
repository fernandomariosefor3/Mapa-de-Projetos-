import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, CloudOff, LoaderCircle, X } from "lucide-react";
import AppSidebar, { type AppView } from "./components/AppSidebar";
import Dashboard from "./components/Dashboard";
import LoginScreen from "./components/LoginScreen";
import ProjectDetail from "./components/ProjectDetail";
import {
  DeleteDialog,
  ProjectForm,
  QuickUpdate,
} from "./components/ProjectModals";
import { useProjects } from "./hooks/useProjects";
import {
  auth,
  firebaseReady,
  googleProvider,
  ownerEmail,
} from "./lib/firebase";
import { getProjectAlerts } from "./lib/projectUtils";
import type { AppUser, Project } from "./types";

type Modal = "new" | "edit" | "quick" | "delete" | null;

function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f6f3eb] text-[#183b37]">
      <div className="text-center">
        <LoaderCircle className="mx-auto animate-spin" size={28} />
        <p className="mt-3 font-serif text-xl font-semibold">Abrindo seu mapa...</p>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(firebaseReady);
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [view, setView] = useState<AppView>("overview");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [toast, setToast] = useState("");

  const {
    projects,
    loading,
    error: projectError,
    isCloud,
    saveProject,
    removeProject,
  } = useProjects(user);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedId) ?? null,
    [projects, selectedId],
  );
  const alertCount = useMemo(() => getProjectAlerts(projects).length, [projects]);

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const firebaseAuth = auth;
    return onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setAuthLoading(false);
        return;
      }
      if (ownerEmail && firebaseUser.email?.toLowerCase() !== ownerEmail.toLowerCase()) {
        await signOut(firebaseAuth);
        setLoginError("Esta conta nao esta autorizada para acessar o mapa de Fernando.");
        setAuthLoading(false);
        return;
      }
      setUser({
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || "Fernando",
        email: firebaseUser.email || "",
        photoURL: firebaseUser.photoURL || undefined,
      });
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const loginWithGoogle = async () => {
    if (!auth) return;
    setLoginBusy(true);
    setLoginError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (loginFailure) {
      const message = loginFailure instanceof Error ? loginFailure.message : "";
      setLoginError(
        message.includes("popup-closed")
          ? "A janela de login foi fechada antes de concluir."
          : "Nao foi possivel entrar com Google. Tente novamente.",
      );
    } finally {
      setLoginBusy(false);
    }
  };

  const enterDemo = () => {
    setUser({
      uid: "fernando-demo",
      displayName: "Fernando",
      email: "modo local",
      isDemo: true,
    });
  };

  const logout = async () => {
    setSelectedId(null);
    if (auth && user && !user.isDemo) await signOut(auth);
    setUser(null);
  };

  const saveWithFeedback = async (project: Project) => {
    try {
      await saveProject(project);
      setSelectedId(project.id);
      setToast("Projeto salvo e historico atualizado.");
    } catch {
      setToast("Nao foi possivel salvar. Verifique sua conexao.");
    }
  };

  const confirmDelete = async () => {
    if (!selectedProject) return;
    try {
      await removeProject(selectedProject.id);
      setModal(null);
      setSelectedId(null);
      setToast("Projeto apagado.");
    } catch {
      setToast("Nao foi possivel apagar o projeto.");
    }
  };

  const changeView = (nextView: AppView) => {
    setView(nextView);
    setSelectedId(null);
  };

  if (authLoading) return <LoadingScreen />;

  if (!user) {
    return (
      <LoginScreen
        firebaseReady={firebaseReady}
        busy={loginBusy}
        error={loginError}
        onGoogleLogin={loginWithGoogle}
        onDemo={enterDemo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f3eb] text-[#183b37]">
      <AppSidebar
        user={user}
        view={view}
        alertCount={alertCount}
        cloud={isCloud}
        onView={changeView}
        onNew={() => setModal("new")}
        onLogout={logout}
      />
      <div className="lg:pl-64">
        {loading ? (
          <LoadingScreen />
        ) : projectError ? (
          <div className="grid min-h-screen place-items-center p-6">
            <div className="max-w-md text-center">
              <CloudOff className="mx-auto text-[#d65c48]" size={32} />
              <h1 className="mt-4 font-serif text-2xl font-semibold">Nao foi possivel carregar os projetos</h1>
              <p className="mt-2 text-sm leading-6 text-[#6f827e]">{projectError}</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {selectedProject ? (
              <ProjectDetail
                key={selectedProject.id}
                project={selectedProject}
                onBack={() => setSelectedId(null)}
                onEdit={() => setModal("edit")}
                onDelete={() => setModal("delete")}
                onQuickUpdate={() => setModal("quick")}
                onSave={saveWithFeedback}
              />
            ) : (
              <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Dashboard
                  projects={projects}
                  view={view}
                  onSelect={(project) => setSelectedId(project.id)}
                  onNew={() => setModal("new")}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {modal === "new" && <ProjectForm key="new-project" project={null} onClose={() => setModal(null)} onSave={saveWithFeedback} />}
        {modal === "edit" && selectedProject && <ProjectForm key={`edit-${selectedProject.id}`} project={selectedProject} onClose={() => setModal(null)} onSave={saveWithFeedback} />}
        {modal === "quick" && selectedProject && <QuickUpdate key={`quick-${selectedProject.id}`} project={selectedProject} onClose={() => setModal(null)} onSave={saveWithFeedback} />}
        {modal === "delete" && selectedProject && <DeleteDialog key={`delete-${selectedProject.id}`} project={selectedProject} onClose={() => setModal(null)} onConfirm={confirmDelete} />}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="fixed bottom-24 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl bg-[#183b37] px-4 py-3 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(24,59,55,0.28)] lg:bottom-6 lg:left-auto lg:right-6 lg:translate-x-0">
            <CheckCircle2 size={18} className="shrink-0 text-[#8ed0c1]" />
            <span className="flex-1">{toast}</span>
            <button type="button" onClick={() => setToast("")} className="text-white/55 hover:text-white"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
