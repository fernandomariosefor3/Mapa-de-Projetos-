import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  Cloud,
  ExternalLink,
  GitBranch,
  Link2,
  LoaderCircle,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { motion } from "motion/react";
import type { Project, ProjectCheck } from "../types";
import {
  formatDate,
  formatRelativeDate,
  priorityStyles,
  runProjectCheck,
  statusStyles,
} from "../lib/projectUtils";

type ProjectDetailProps = {
  project: Project;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onQuickUpdate: () => void;
  onSave: (project: Project) => Promise<void>;
};

function CheckIcon({ check }: { check: ProjectCheck }) {
  if (check.status === "checking") return <LoaderCircle size={18} className="animate-spin text-[#3e7f74]" />;
  if (check.status === "ok") return <CheckCircle2 size={18} className="text-[#3e8b7d]" />;
  if (check.status === "attention") return <CircleAlert size={18} className="text-[#d65c48]" />;
  return <CircleDashed size={18} className="text-[#9aa7a3]" />;
}

export default function ProjectDetail({
  project,
  onBack,
  onEdit,
  onDelete,
  onQuickUpdate,
  onSave,
}: ProjectDetailProps) {
  const [runningAll, setRunningAll] = useState(false);

  const saveChecks = async (checks: ProjectCheck[], message: string) => {
    await onSave({
      ...project,
      checks,
      updatedAt: new Date().toISOString(),
      history: [
        {
          id: crypto.randomUUID(),
          message,
          source: "Fernando",
          createdAt: new Date().toISOString(),
        },
        ...project.history,
      ],
    });
  };

  const handleCheck = async (check: ProjectCheck) => {
    const pending = project.checks.map((item) =>
      item.id === check.id ? { ...item, status: "checking" as const } : item,
    );
    await onSave({ ...project, checks: pending });
    const result = await runProjectCheck(check);
    const checks = project.checks.map((item) =>
      item.id === check.id ? result : item,
    );
    await saveChecks(checks, `Verificacao executada: ${check.label}.`);
  };

  const handleAllChecks = async () => {
    setRunningAll(true);
    const pending = project.checks.map((check) => ({
      ...check,
      status: check.type === "manual" ? check.status : ("checking" as const),
    }));
    await onSave({ ...project, checks: pending });
    const results = await Promise.all(
      project.checks.map((check) =>
        check.type === "manual" ? Promise.resolve(check) : runProjectCheck(check),
      ),
    );
    await saveChecks(results, "Verificacoes automaticas do projeto executadas.");
    setRunningAll(false);
  };

  const automaticChecks = project.checks.filter((check) => check.type !== "manual").length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      className="mx-auto max-w-6xl px-5 pb-28 pt-7 sm:px-8 lg:px-10 lg:pb-14 lg:pt-9"
    >
      <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[#69807b] transition hover:text-[#d65c48]">
        <ArrowLeft size={17} /> Voltar aos projetos
      </button>

      <header className="mt-7 border-b border-[#dcd6ca] pb-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold ${statusStyles[project.status]}`}>{project.status}</span>
              <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${priorityStyles[project.priority]}`}>Prioridade {project.priority.toLowerCase()}</span>
              <span className="text-xs font-semibold text-[#83928f]">Atualizado {formatRelativeDate(project.updatedAt)}</span>
            </div>
            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.035em] text-[#183b37] sm:text-5xl">{project.name}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#687e79]">{project.summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onEdit} className="flex items-center gap-2 rounded-xl border border-[#d6d0c4] bg-white/60 px-4 py-2.5 text-sm font-bold text-[#46625d] hover:border-[#79b9aa] hover:bg-white">
              <Pencil size={16} /> Editar
            </button>
            <button type="button" onClick={onQuickUpdate} className="flex items-center gap-2 rounded-xl bg-[#ef765f] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(239,118,95,0.2)] hover:bg-[#df6651]">
              <Plus size={17} /> Registrar avanco
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-[150px_1fr] sm:items-center">
          <div>
            <p className="font-serif text-4xl font-semibold text-[#183b37]">{project.progress}<span className="text-xl text-[#8da09b]">%</span></p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.13em] text-[#8da09b]">Concluido</p>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#e5e0d6]">
            <motion.div initial={{ width: 0 }} animate={{ width: `${project.progress}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full rounded-full bg-gradient-to-r from-[#79b9aa] to-[#3e7f74]" />
          </div>
        </div>
      </header>

      <div className="grid gap-12 py-10 lg:grid-cols-[minmax(0,1fr)_310px]">
        <main className="min-w-0 space-y-12">
          <section>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d65c48]">Direcao</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-[#183b37]">O proximo movimento</h2>
            <div className="mt-5 border-l-4 border-[#f2c968] bg-[#fff9e8] px-5 py-4">
              <p className="font-medium leading-7 text-[#4e573b]">{project.nextAction || "Nenhuma proxima acao registrada."}</p>
            </div>
            {project.blockers && (
              <div className="mt-4 flex gap-3 border-l-4 border-[#ef765f] bg-[#fff2ef] px-5 py-4">
                <AlertTriangle size={19} className="mt-1 shrink-0 text-[#d65c48]" />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.13em] text-[#bd513f]">Bloqueio</p>
                  <p className="mt-1 text-sm leading-6 text-[#77534c]">{project.blockers}</p>
                </div>
              </div>
            )}
          </section>

          <section>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d65c48]">Saude do projeto</p>
                <h2 className="mt-2 font-serif text-2xl font-semibold text-[#183b37]">Verificacoes sob medida</h2>
                <p className="mt-1 text-sm text-[#7a8d89]">Sites, repositorios e conferencias proprias deste projeto.</p>
              </div>
              {automaticChecks > 0 && (
                <button type="button" onClick={handleAllChecks} disabled={runningAll} className="flex items-center gap-2 rounded-xl bg-[#dcece6] px-4 py-2.5 text-xs font-bold text-[#285c53] hover:bg-[#cfe5dd] disabled:opacity-60">
                  <RefreshCw size={15} className={runningAll ? "animate-spin" : ""} /> Verificar automaticas
                </button>
              )}
            </div>
            <div className="mt-5 divide-y divide-[#ded8ca] border-y border-[#ded8ca]">
              {project.checks.map((check) => (
                <button key={check.id} type="button" onClick={() => handleCheck(check)} disabled={check.status === "checking"} className="group grid w-full grid-cols-[24px_1fr_auto] items-center gap-3 py-4 text-left disabled:cursor-wait">
                  <CheckIcon check={check} />
                  <span>
                    <span className="block text-sm font-bold text-[#35534f]">{check.label}</span>
                    <span className="mt-0.5 block text-xs text-[#82938f]">{check.detail}</span>
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.11em] text-[#9aa7a3] group-hover:text-[#d65c48]">
                    {check.type === "manual" ? <><Check size={13} /> Conferir</> : <><Play size={12} /> Executar</>}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d65c48]">Memoria</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-[#183b37]">Historico de atualizacoes</h2>
            <div className="relative mt-6 space-y-6 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-px before:bg-[#d8d2c6]">
              {project.history.length ? project.history.map((activity) => (
                <div key={activity.id} className="relative grid grid-cols-[24px_1fr] gap-4">
                  <span className={`relative z-10 grid h-6 w-6 place-items-center rounded-full border-4 border-[#f6f3eb] ${activity.source === "Assistente de IA" ? "bg-[#79b9aa]" : "bg-[#ef765f]"}`} />
                  <div>
                    <p className="text-sm font-medium leading-6 text-[#405c57]">{activity.message}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[#8b9a96]">
                      {activity.source === "Assistente de IA" ? <Bot size={13} /> : <UserRound size={13} />}
                      {activity.source} · {formatRelativeDate(activity.createdAt)}
                    </p>
                  </div>
                </div>
              )) : <p className="pl-10 text-sm text-[#81938f]">Nenhuma atualizacao registrada.</p>}
            </div>
          </section>
        </main>

        <aside className="space-y-8">
          <section>
            <h2 className="font-serif text-xl font-semibold text-[#183b37]">Informacoes</h2>
            <dl className="mt-4 divide-y divide-[#ded8ca] border-y border-[#ded8ca] text-sm">
              <div className="py-3"><dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#8a9995]">Categoria</dt><dd className="mt-1 font-medium text-[#405c57]">{project.category}</dd></div>
              <div className="py-3"><dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#8a9995]"><Calendar size={13} /> Prazo</dt><dd className="mt-1 font-medium text-[#405c57]">{formatDate(project.dueDate)}</dd></div>
              <div className="py-3"><dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#8a9995]">Atualizacao</dt><dd className="mt-1 font-medium leading-6 text-[#405c57]">{project.updateMethod || "Nao informado"}</dd></div>
              <div className="py-3"><dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#8a9995]">Usuarios</dt><dd className="mt-1 font-medium leading-6 text-[#405c57]">{project.users || "Nao informado"}</dd></div>
              <div className="py-3"><dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#8a9995]"><ShieldCheck size={13} /> Login</dt><dd className="mt-1 font-medium leading-6 text-[#405c57]">{project.login || "Nao informado"}</dd></div>
            </dl>
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-[#183b37]">Links</h2>
            <div className="mt-4 space-y-2">
              {project.links.length ? project.links.map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-xl border border-[#d8d2c6] bg-white/45 p-3 text-sm font-bold text-[#46625d] hover:border-[#79b9aa] hover:bg-white">
                  {link.kind === "github" ? <GitBranch size={17} /> : link.kind === "site" ? <Cloud size={17} /> : <Link2 size={17} />}
                  <span className="min-w-0 flex-1 truncate">{link.label}</span>
                  <ExternalLink size={14} className="text-[#9aa7a3] group-hover:text-[#d65c48]" />
                </a>
              )) : <p className="rounded-xl border border-dashed border-[#d8d2c6] p-4 text-sm leading-6 text-[#81938f]">Nenhum link cadastrado. Use Editar para inserir quando estiver pronto.</p>}
            </div>
          </section>

          {project.notes && (
            <section className="rounded-2xl bg-[#dcece6] p-5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#4c776f]">Notas importantes</p>
              <p className="mt-2 text-sm leading-6 text-[#35534f]">{project.notes}</p>
            </section>
          )}

          <button type="button" onClick={onDelete} className="flex items-center gap-2 text-xs font-bold text-[#a36c63] hover:text-[#c54130]">
            <Trash2 size={15} /> Apagar este projeto
          </button>
        </aside>
      </div>
    </motion.div>
  );
}
