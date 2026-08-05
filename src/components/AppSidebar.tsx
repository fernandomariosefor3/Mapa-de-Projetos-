import {
  Bell,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
} from "lucide-react";
import type { AppUser } from "../types";

export type AppView = "overview" | "projects" | "alerts";

type AppSidebarProps = {
  user: AppUser;
  view: AppView;
  alertCount: number;
  cloud: boolean;
  onView: (view: AppView) => void;
  onNew: () => void;
  onLogout: () => void;
};

const navItems = [
  { id: "overview" as const, label: "Visao geral", icon: LayoutDashboard },
  { id: "projects" as const, label: "Projetos", icon: FolderKanban },
  { id: "alerts" as const, label: "Alertas", icon: Bell },
];

export default function AppSidebar({
  user,
  view,
  alertCount,
  cloud,
  onView,
  onNew,
  onLogout,
}: AppSidebarProps) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[#ded8ca] bg-[#f6f3eb] px-4 py-6 lg:flex">
        <button type="button" onClick={() => onView("overview")} className="flex items-center gap-3 px-2 text-left">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#183b37] text-[#f6f3eb] shadow-[0_7px_18px_rgba(24,59,55,0.2)]">
            <span className="font-serif text-lg font-bold">F</span>
          </div>
          <div>
            <p className="font-serif text-lg font-bold leading-none text-[#183b37]">Mapa de Projetos</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#81938f]">Fernando</p>
          </div>
        </button>

        <button
          type="button"
          onClick={onNew}
          className="mt-9 flex items-center justify-center gap-2 rounded-xl bg-[#ef765f] px-4 py-3 text-sm font-bold text-white shadow-[0_9px_20px_rgba(239,118,95,0.22)] transition hover:-translate-y-0.5 hover:bg-[#df6651]"
        >
          <Plus size={18} /> Novo projeto
        </button>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onView(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-[#dcece6] text-[#183b37]"
                    : "text-[#667b77] hover:bg-white/70 hover:text-[#183b37]"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.id === "alerts" && alertCount > 0 && (
                  <span className="ml-auto grid min-w-6 place-items-center rounded-full bg-[#ef765f] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {alertCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto">
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2.5 text-xs font-semibold text-[#52706a]">
            <span className={`h-2 w-2 rounded-full ${cloud ? "bg-emerald-500" : "bg-amber-500"}`} />
            {cloud ? "Sincronizado com Firebase" : "Salvo neste navegador"}
          </div>
          <div className="flex items-center gap-3 border-t border-[#ded8ca] pt-4">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#d9eee7] font-serif font-bold text-[#183b37]">F</div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#183b37]">{user.displayName}</p>
              <p className="truncate text-xs text-[#81938f]">{user.email}</p>
            </div>
            <button type="button" title="Sair" onClick={onLogout} className="rounded-lg p-2 text-[#81938f] hover:bg-white hover:text-[#c4513e]">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#ded8ca] bg-[#f6f3eb]/95 px-4 backdrop-blur lg:hidden">
        <button type="button" onClick={() => onView("overview")} className="flex items-center gap-2 font-serif text-lg font-bold text-[#183b37]">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#183b37] text-white">F</span>
          Mapa
        </button>
        <button type="button" onClick={onNew} className="grid h-10 w-10 place-items-center rounded-xl bg-[#ef765f] text-white" aria-label="Novo projeto">
          <Plus size={20} />
        </button>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-[4.5rem] items-center justify-around border-t border-[#ded8ca] bg-[#f6f3eb]/95 px-3 backdrop-blur lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onView(item.id)}
              className={`relative flex min-w-20 flex-col items-center gap-1 text-[11px] font-bold ${view === item.id ? "text-[#183b37]" : "text-[#84938f]"}`}
            >
              <Icon size={20} />
              {item.label}
              {item.id === "alerts" && alertCount > 0 && <span className="absolute right-2 top-[-4px] h-2.5 w-2.5 rounded-full border-2 border-[#f6f3eb] bg-[#ef765f]" />}
            </button>
          );
        })}
        <button type="button" onClick={onLogout} className="flex min-w-16 flex-col items-center gap-1 text-[11px] font-bold text-[#84938f]">
          <Settings size={20} /> Conta
        </button>
      </nav>
    </>
  );
}
