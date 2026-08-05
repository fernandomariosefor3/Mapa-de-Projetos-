import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  FolderSearch,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { motion } from "motion/react";
import type { Project } from "../types";
import type { AppView } from "./AppSidebar";
import {
  formatRelativeDate,
  getProjectAlerts,
  statusOptions,
  statusStyles,
} from "../lib/projectUtils";

type DashboardProps = {
  projects: Project[];
  view: AppView;
  onSelect: (project: Project) => void;
  onNew: () => void;
};

function chooseFocus(projects: Project[]) {
  return [...projects]
    .filter((project) => !["Arquivado", "Pausado"].includes(project.status))
    .sort((a, b) => {
      const priority = { Alta: 3, Media: 2, Baixa: 1 };
      const blockerScore = (project: Project) => (project.blockers ? 2 : 0);
      return (
        priority[b.priority] + blockerScore(b) -
        (priority[a.priority] + blockerScore(a))
      );
    })[0];
}

function ProjectRow({
  project,
  index,
  onClick,
}: {
  project: Project;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.28) }}
      onClick={onClick}
      className="group grid w-full grid-cols-[1fr_auto] items-center gap-4 border-b border-[#e2ddd2] px-1 py-5 text-left transition hover:bg-white/45 sm:grid-cols-[minmax(180px,1.2fr)_minmax(130px,0.8fr)_100px_90px_24px] sm:px-3"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${project.priority === "Alta" ? "bg-[#ef765f]" : project.priority === "Media" ? "bg-[#f2c968]" : "bg-[#79b9aa]"}`} />
          <p className="truncate font-serif text-lg font-semibold text-[#183b37] group-hover:text-[#d65c48]">{project.name}</p>
        </div>
        <p className="mt-1 truncate pl-5 text-xs text-[#81938f]">{project.category}</p>
      </div>
      <span className={`hidden w-fit rounded-lg border px-2.5 py-1 text-[11px] font-bold sm:inline ${statusStyles[project.status]}`}>{project.status}</span>
      <div className="hidden sm:block">
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold text-[#758985]"><span>Progresso</span><span>{project.progress}%</span></div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#e5e0d5]"><div className="h-full rounded-full bg-[#79b9aa]" style={{ width: `${project.progress}%` }} /></div>
      </div>
      <span className="hidden text-right text-xs font-medium text-[#758985] sm:block">{formatRelativeDate(project.updatedAt)}</span>
      <ChevronRight size={18} className="text-[#9aa7a3] transition-transform group-hover:translate-x-1 group-hover:text-[#d65c48]" />
    </motion.button>
  );
}

export default function Dashboard({ projects, view, onSelect, onNew }: DashboardProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Todos");
  const alerts = useMemo(() => getProjectAlerts(projects), [projects]);
  const focus = chooseFocus(projects);
  const published = projects.filter((project) => project.status === "Publicado").length;
  const moving = projects.filter((project) =>
    ["Em desenvolvimento", "Em revisao"].includes(project.status),
  ).length;
  const filtered = projects.filter((project) => {
    const matchesSearch = `${project.name} ${project.category} ${project.summary}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesSearch && (status === "Todos" || project.status === status);
  });

  if (view === "alerts") {
    return (
      <div className="mx-auto max-w-6xl px-5 pb-28 pt-8 sm:px-8 lg:px-10 lg:pb-12 lg:pt-10">
        <div className="mb-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d65c48]">Central de atencao</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.03em] text-[#183b37]">O que pede uma decisao</h1>
          <p className="mt-3 text-[#6f827e]">Alertas sao criados pelos bloqueios, tempo sem atualizacao e verificacoes de cada projeto.</p>
        </div>
        {alerts.length ? (
          <div className="divide-y divide-[#ded8ca] border-y border-[#ded8ca]">
            {alerts.map((alert, index) => (
              <motion.button
                type="button"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.035 }}
                key={alert.id}
                onClick={() => {
                  const project = projects.find((item) => item.id === alert.projectId);
                  if (project) onSelect(project);
                }}
                className="group grid w-full grid-cols-[40px_1fr_auto] gap-4 py-5 text-left"
              >
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${alert.tone === "urgent" ? "bg-[#fff0ed] text-[#d65c48]" : alert.tone === "warning" ? "bg-[#fff7dd] text-[#a37513]" : "bg-[#e5f1ed] text-[#36796d]"}`}>
                  {alert.tone === "urgent" ? <AlertCircle size={19} /> : alert.tone === "warning" ? <CalendarDays size={19} /> : <Bell size={19} />}
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8b9a96]">{alert.projectName}</p>
                  <p className="mt-1 font-semibold text-[#254842]">{alert.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#70827e]">{alert.detail}</p>
                </div>
                <ArrowRight size={18} className="mt-3 text-[#9aa7a3] transition-transform group-hover:translate-x-1 group-hover:text-[#d65c48]" />
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="border-y border-[#ded8ca] py-16 text-center">
            <CheckCircle2 className="mx-auto text-[#69a99c]" size={32} />
            <p className="mt-3 font-serif text-2xl font-semibold text-[#183b37]">Tudo tranquilo por aqui</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-28 pt-7 sm:px-8 lg:px-10 lg:pb-12 lg:pt-9">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d65c48]">{view === "overview" ? "Painel pessoal" : "Seu portfolio de trabalho"}</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.035em] text-[#183b37] sm:text-5xl">{view === "overview" ? "Bom trabalho, Fernando." : "Todos os projetos"}</h1>
          <p className="mt-3 text-sm text-[#748783]">{projects.length} projetos, {published} publicados e {moving} em movimento agora.</p>
        </div>
        <button type="button" onClick={onNew} className="hidden items-center gap-2 rounded-xl bg-[#183b37] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#254b46] sm:flex lg:hidden xl:flex">
          Novo projeto <ArrowRight size={17} />
        </button>
      </header>

      {view === "overview" && focus && (
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mt-9 overflow-hidden rounded-[1.75rem] bg-[#183b37] text-white shadow-[0_18px_45px_rgba(24,59,55,0.14)]"
        >
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[3.5rem] border-[#79b9aa]/30" />
          <div className="absolute -bottom-24 right-[22%] h-56 w-56 rotate-12 rounded-[3.5rem] bg-[#ef765f]/90" />
          <div className="relative grid min-h-[270px] gap-8 p-7 sm:p-9 lg:grid-cols-[1fr_260px]">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-[#f2c968] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#493b14]">Foco recomendado</span>
                <span className="text-xs font-semibold text-white/55">Prioridade {focus.priority.toLowerCase()}</span>
              </div>
              <h2 className="mt-5 font-serif text-3xl font-semibold sm:text-4xl">{focus.name}</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">{focus.summary}</p>
              <div className="mt-7 border-l-2 border-[#f2c968] pl-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Proxima acao</p>
                <p className="mt-1.5 max-w-xl text-sm font-medium leading-6">{focus.nextAction}</p>
              </div>
            </div>
            <div className="relative flex items-end justify-between gap-5 lg:flex-col lg:items-end lg:justify-between">
              <div className="text-right">
                <p className="font-serif text-5xl font-semibold">{focus.progress}<span className="text-2xl text-white/50">%</span></p>
                <p className="mt-1 text-xs font-semibold text-white/50">progresso registrado</p>
              </div>
              <button type="button" onClick={() => onSelect(focus)} className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#183b37] transition hover:-translate-y-0.5">
                Abrir projeto <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </motion.section>
      )}

      <div className={`mt-10 grid gap-10 ${view === "overview" ? "xl:grid-cols-[minmax(0,1fr)_310px]" : ""}`}>
        <section className="min-w-0">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#183b37]">{view === "overview" ? "Projetos em andamento" : "Encontre um projeto"}</h2>
              <p className="mt-1 text-sm text-[#80908d]">Clique em uma linha para ver detalhes e registrar avancos.</p>
            </div>
            <div className="flex gap-2">
              <label className="flex h-10 min-w-0 items-center gap-2 rounded-xl border border-[#d9d3c7] bg-white/60 px-3 focus-within:border-[#79b9aa] sm:w-52">
                <Search size={16} className="shrink-0 text-[#8b9a96]" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar" className="min-w-0 flex-1 bg-transparent text-sm text-[#254842] outline-none placeholder:text-[#9da9a6]" />
              </label>
              <label className="flex h-10 items-center gap-2 rounded-xl border border-[#d9d3c7] bg-white/60 px-3">
                <SlidersHorizontal size={15} className="text-[#8b9a96]" />
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="max-w-32 bg-transparent text-xs font-bold text-[#526d68] outline-none">
                  <option>Todos</option>
                  {statusOptions.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
            </div>
          </div>

          <div className="mt-5 border-y border-[#dcd6ca]">
            {filtered.length ? filtered.map((project, index) => (
              <ProjectRow key={project.id} project={project} index={index} onClick={() => onSelect(project)} />
            )) : (
              <div className="py-14 text-center text-[#7b8d89]">
                <FolderSearch className="mx-auto mb-3" size={28} />
                Nenhum projeto encontrado.
              </div>
            )}
          </div>
        </section>

        {view === "overview" && (
          <aside>
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-semibold text-[#183b37]">Pede atencao</h2>
              <span className="rounded-full bg-[#fff0ed] px-2.5 py-1 text-xs font-black text-[#d65c48]">{alerts.length}</span>
            </div>
            <div className="mt-5 divide-y divide-[#ded8ca] border-y border-[#ded8ca]">
              {alerts.slice(0, 4).map((alert) => (
                <button
                  type="button"
                  key={alert.id}
                  onClick={() => {
                    const project = projects.find((item) => item.id === alert.projectId);
                    if (project) onSelect(project);
                  }}
                  className="group flex w-full gap-3 py-4 text-left"
                >
                  <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${alert.tone === "urgent" ? "bg-[#ef765f]" : alert.tone === "warning" ? "bg-[#e2ad35]" : "bg-[#79b9aa]"}`} />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold uppercase tracking-[0.12em] text-[#889894]">{alert.projectName}</span>
                    <span className="mt-1 block text-sm font-semibold leading-5 text-[#35534f] group-hover:text-[#d65c48]">{alert.title}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-8 rounded-2xl bg-[#f2c968]/35 p-5">
              <CircleDot size={19} className="text-[#8d6715]" />
              <p className="mt-3 font-serif text-lg font-semibold text-[#4a421f]">Uma atualizacao curta ja conta.</p>
              <p className="mt-1 text-sm leading-6 text-[#756a3e]">Registre a decisao de hoje para continuar de casa sem perder o contexto.</p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
