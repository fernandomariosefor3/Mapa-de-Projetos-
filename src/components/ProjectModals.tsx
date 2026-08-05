import { useState } from "react";
import {
  Bot,
  CheckCircle2,
  Link2,
  Plus,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import type {
  Project,
  ProjectCheck,
  ProjectLink,
  ProjectPriority,
  ProjectStatus,
  UpdateSource,
} from "../types";
import { statusOptions } from "../lib/projectUtils";

type ProjectFormProps = {
  project: Project | null;
  onClose: () => void;
  onSave: (project: Project) => Promise<void>;
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-[#d8d2c6] bg-white/70 px-3.5 py-3 text-sm text-[#294c46] outline-none transition placeholder:text-[#a2ada9] focus:border-[#79b9aa] focus:bg-white focus:ring-2 focus:ring-[#79b9aa]/15";
const labelClass = "text-xs font-bold uppercase tracking-[0.11em] text-[#718581]";

function emptyProject(): Project {
  return {
    id: crypto.randomUUID(),
    name: "",
    summary: "",
    category: "",
    status: "Planejamento",
    progress: 0,
    priority: "Media",
    dueDate: "",
    nextAction: "",
    blockers: "",
    notes: "",
    visual: "",
    updateMethod: "",
    users: "",
    login: "",
    links: [],
    checks: [],
    history: [],
    updatedAt: new Date().toISOString(),
    updateSource: "Fernando",
  };
}

export function ProjectForm({ project, onClose, onSave }: ProjectFormProps) {
  const [draft, setDraft] = useState<Project>(() =>
    project ? structuredClone(project) : emptyProject(),
  );
  const [saving, setSaving] = useState(false);

  const setField = <K extends keyof Project>(key: K, value: Project[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const addLink = () => {
    setField("links", [
      ...draft.links,
      { id: crypto.randomUUID(), label: "", url: "", kind: "site" },
    ]);
  };

  const updateLink = (id: string, change: Partial<ProjectLink>) => {
    setField(
      "links",
      draft.links.map((link) => (link.id === id ? { ...link, ...change } : link)),
    );
  };

  const addCheck = () => {
    setField("checks", [
      ...draft.checks,
      {
        id: crypto.randomUUID(),
        label: "",
        type: "manual",
        status: "idle",
        detail: "Ainda nao verificado",
      },
    ]);
  };

  const updateCheck = (id: string, change: Partial<ProjectCheck>) => {
    setField(
      "checks",
      draft.checks.map((check) =>
        check.id === id ? { ...check, ...change } : check,
      ),
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const timestamp = new Date().toISOString();
    const saved: Project = {
      ...draft,
      name: draft.name.trim(),
      progress: Math.min(100, Math.max(0, Number(draft.progress))),
      updatedAt: timestamp,
      links: draft.links.filter((link) => link.label.trim() && link.url.trim()),
      checks: draft.checks.filter((check) => check.label.trim()),
      history: [
        {
          id: crypto.randomUUID(),
          message: project ? "Informacoes gerais do projeto atualizadas." : "Projeto criado no Mapa de Projetos.",
          source: draft.updateSource,
          createdAt: timestamp,
        },
        ...draft.history,
      ],
    };
    await onSave(saved);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#173b37]/35 p-3 backdrop-blur-sm sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        className="mx-auto max-w-3xl overflow-hidden rounded-[1.75rem] bg-[#f6f3eb] shadow-[0_30px_90px_rgba(24,59,55,0.28)]"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#ded8ca] bg-[#f6f3eb]/95 px-5 py-4 backdrop-blur sm:px-7">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d65c48]">{project ? "Editar" : "Novo"}</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-[#183b37]">{project ? project.name : "Cadastrar projeto"}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl text-[#718581] hover:bg-white hover:text-[#d65c48]" aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-9 p-5 sm:p-7">
          <section>
            <h3 className="font-serif text-xl font-semibold text-[#183b37]">Essencial</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2"><span className={labelClass}>Nome</span><input required value={draft.name} onChange={(event) => setField("name", event.target.value)} placeholder="Nome do projeto" className={inputClass} /></label>
              <label><span className={labelClass}>Categoria</span><input value={draft.category} onChange={(event) => setField("category", event.target.value)} placeholder="Ex.: Gestao escolar" className={inputClass} /></label>
              <label><span className={labelClass}>Prazo</span><input type="date" value={draft.dueDate} onChange={(event) => setField("dueDate", event.target.value)} className={inputClass} /></label>
              <label className="sm:col-span-2"><span className={labelClass}>Resumo</span><textarea required rows={3} value={draft.summary} onChange={(event) => setField("summary", event.target.value)} placeholder="O que este projeto faz?" className={inputClass} /></label>
              <label><span className={labelClass}>Status</span><select value={draft.status} onChange={(event) => setField("status", event.target.value as ProjectStatus)} className={inputClass}>{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></label>
              <label><span className={labelClass}>Prioridade</span><select value={draft.priority} onChange={(event) => setField("priority", event.target.value as ProjectPriority)} className={inputClass}><option>Alta</option><option>Media</option><option>Baixa</option></select></label>
              <label className="sm:col-span-2"><span className={labelClass}>Progresso: {draft.progress}%</span><input type="range" min="0" max="100" step="1" value={draft.progress} onChange={(event) => setField("progress", Number(event.target.value))} className="mt-3 w-full accent-[#ef765f]" /></label>
            </div>
          </section>

          <section>
            <h3 className="font-serif text-xl font-semibold text-[#183b37]">Direcao e contexto</h3>
            <div className="mt-4 grid gap-4">
              <label><span className={labelClass}>Proxima acao</span><textarea rows={2} value={draft.nextAction} onChange={(event) => setField("nextAction", event.target.value)} placeholder="Qual e o proximo movimento concreto?" className={inputClass} /></label>
              <label><span className={labelClass}>Bloqueios</span><textarea rows={2} value={draft.blockers} onChange={(event) => setField("blockers", event.target.value)} placeholder="Deixe vazio se nao houver bloqueio" className={inputClass} /></label>
              <label><span className={labelClass}>Notas importantes</span><textarea rows={3} value={draft.notes} onChange={(event) => setField("notes", event.target.value)} placeholder="Decisoes, riscos e contexto que nao podem se perder" className={inputClass} /></label>
            </div>
          </section>

          <section>
            <h3 className="font-serif text-xl font-semibold text-[#183b37]">Operacao</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label><span className={labelClass}>Forma de atualizacao</span><input value={draft.updateMethod} onChange={(event) => setField("updateMethod", event.target.value)} placeholder="Firebase, GitHub, IA..." className={inputClass} /></label>
              <label><span className={labelClass}>Usuarios</span><input value={draft.users} onChange={(event) => setField("users", event.target.value)} placeholder="Quem usa?" className={inputClass} /></label>
              <label><span className={labelClass}>Login do projeto</span><input value={draft.login} onChange={(event) => setField("login", event.target.value)} placeholder="Google OAuth, Firebase Auth..." className={inputClass} /></label>
              <label><span className={labelClass}>Estilo visual</span><input value={draft.visual} onChange={(event) => setField("visual", event.target.value)} placeholder="Cores ou identidade" className={inputClass} /></label>
              <label className="sm:col-span-2"><span className={labelClass}>Atualizado por</span><select value={draft.updateSource} onChange={(event) => setField("updateSource", event.target.value as UpdateSource)} className={inputClass}><option>Fernando</option><option>Assistente de IA</option></select></label>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between gap-3">
              <div><h3 className="font-serif text-xl font-semibold text-[#183b37]">Links</h3><p className="mt-1 text-xs text-[#83928f]">Site, GitHub, deploy ou qualquer referencia.</p></div>
              <button type="button" onClick={addLink} className="flex items-center gap-1.5 rounded-lg bg-[#dcece6] px-3 py-2 text-xs font-bold text-[#35685f]"><Plus size={14} /> Adicionar</button>
            </div>
            <div className="mt-4 space-y-3">
              {draft.links.map((link) => (
                <div key={link.id} className="grid gap-2 rounded-xl border border-[#ded8ca] bg-white/40 p-3 sm:grid-cols-[1fr_1.5fr_100px_36px]">
                  <input value={link.label} onChange={(event) => updateLink(link.id, { label: event.target.value })} placeholder="Nome do link" className="rounded-lg border border-[#ded8ca] bg-white px-3 py-2 text-sm outline-none focus:border-[#79b9aa]" />
                  <input type="url" value={link.url} onChange={(event) => updateLink(link.id, { url: event.target.value })} placeholder="https://..." className="rounded-lg border border-[#ded8ca] bg-white px-3 py-2 text-sm outline-none focus:border-[#79b9aa]" />
                  <select value={link.kind} onChange={(event) => updateLink(link.id, { kind: event.target.value as ProjectLink["kind"] })} className="rounded-lg border border-[#ded8ca] bg-white px-2 py-2 text-xs outline-none"><option value="site">Site</option><option value="github">GitHub</option><option value="deploy">Deploy</option><option value="other">Outro</option></select>
                  <button type="button" onClick={() => setField("links", draft.links.filter((item) => item.id !== link.id))} className="grid h-9 w-9 place-items-center rounded-lg text-[#aa786f] hover:bg-[#fff0ed]"><Trash2 size={15} /></button>
                </div>
              ))}
              {!draft.links.length && <button type="button" onClick={addLink} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#cfc8bb] py-5 text-sm font-semibold text-[#81938f] hover:border-[#79b9aa]"><Link2 size={17} /> Cadastrar primeiro link</button>}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between gap-3">
              <div><h3 className="font-serif text-xl font-semibold text-[#183b37]">Verificacoes</h3><p className="mt-1 text-xs text-[#83928f]">Escolha controles que facam sentido para este projeto.</p></div>
              <button type="button" onClick={addCheck} className="flex items-center gap-1.5 rounded-lg bg-[#dcece6] px-3 py-2 text-xs font-bold text-[#35685f]"><Plus size={14} /> Adicionar</button>
            </div>
            <div className="mt-4 space-y-3">
              {draft.checks.map((check) => (
                <div key={check.id} className="grid gap-2 rounded-xl border border-[#ded8ca] bg-white/40 p-3 sm:grid-cols-[1.4fr_120px_1fr_36px]">
                  <input value={check.label} onChange={(event) => updateCheck(check.id, { label: event.target.value })} placeholder="O que verificar?" className="rounded-lg border border-[#ded8ca] bg-white px-3 py-2 text-sm outline-none focus:border-[#79b9aa]" />
                  <select value={check.type} onChange={(event) => updateCheck(check.id, { type: event.target.value as ProjectCheck["type"] })} className="rounded-lg border border-[#ded8ca] bg-white px-2 py-2 text-xs outline-none"><option value="manual">Manual</option><option value="website">Site</option><option value="github">GitHub</option></select>
                  <input value={check.url ?? ""} onChange={(event) => updateCheck(check.id, { url: event.target.value })} disabled={check.type === "manual"} placeholder={check.type === "manual" ? "Sem endereco" : "https://..."} className="rounded-lg border border-[#ded8ca] bg-white px-3 py-2 text-sm outline-none focus:border-[#79b9aa] disabled:bg-[#eeeae2]" />
                  <button type="button" onClick={() => setField("checks", draft.checks.filter((item) => item.id !== check.id))} className="grid h-9 w-9 place-items-center rounded-lg text-[#aa786f] hover:bg-[#fff0ed]"><Trash2 size={15} /></button>
                </div>
              ))}
              {!draft.checks.length && <button type="button" onClick={addCheck} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#cfc8bb] py-5 text-sm font-semibold text-[#81938f] hover:border-[#79b9aa]"><CheckCircle2 size={17} /> Criar verificacao personalizada</button>}
            </div>
          </section>

          <footer className="flex flex-col-reverse gap-3 border-t border-[#ded8ca] pt-6 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-xl px-5 py-3 text-sm font-bold text-[#718581] hover:bg-white">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-xl bg-[#183b37] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(24,59,55,0.18)] hover:bg-[#254b46] disabled:cursor-wait disabled:opacity-60">{saving ? "Salvando..." : project ? "Salvar alteracoes" : "Criar projeto"}</button>
          </footer>
        </form>
      </motion.div>
    </div>
  );
}

type QuickUpdateProps = {
  project: Project;
  onClose: () => void;
  onSave: (project: Project) => Promise<void>;
};

export function QuickUpdate({ project, onClose, onSave }: QuickUpdateProps) {
  const [message, setMessage] = useState("");
  const [source, setSource] = useState<UpdateSource>("Fernando");
  const [progress, setProgress] = useState(project.progress);
  const [status, setStatus] = useState(project.status);
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const timestamp = new Date().toISOString();
    await onSave({
      ...project,
      progress,
      status,
      updateSource: source,
      updatedAt: timestamp,
      history: [{ id: crypto.randomUUID(), message, source, createdAt: timestamp }, ...project.history],
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#173b37]/35 p-4 backdrop-blur-sm">
      <motion.form initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16 }} onSubmit={submit} className="w-full max-w-lg rounded-[1.75rem] bg-[#f6f3eb] p-6 shadow-[0_28px_80px_rgba(24,59,55,0.26)] sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d65c48]">Atualizacao rapida</p><h2 className="mt-1 font-serif text-2xl font-semibold text-[#183b37]">{project.name}</h2></div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-[#81938f] hover:bg-white"><X size={19} /></button>
        </div>
        <label className="mt-6 block"><span className={labelClass}>O que avancou ou foi decidido?</span><textarea required autoFocus rows={4} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Escreva uma atualizacao curta e objetiva..." className={inputClass} /></label>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label><span className={labelClass}>Status</span><select value={status} onChange={(event) => setStatus(event.target.value as ProjectStatus)} className={inputClass}>{statusOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span className={labelClass}>Progresso: {progress}%</span><input type="range" min="0" max="100" value={progress} onChange={(event) => setProgress(Number(event.target.value))} className="mt-5 w-full accent-[#ef765f]" /></label>
        </div>
        <div className="mt-5">
          <span className={labelClass}>Quem esta registrando?</span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setSource("Fernando")} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold ${source === "Fernando" ? "border-[#79b9aa] bg-[#dcece6] text-[#285c53]" : "border-[#d8d2c6] text-[#718581]"}`}><UserRound size={17} /> Fernando</button>
            <button type="button" onClick={() => setSource("Assistente de IA")} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold ${source === "Assistente de IA" ? "border-[#79b9aa] bg-[#dcece6] text-[#285c53]" : "border-[#d8d2c6] text-[#718581]"}`}><Bot size={17} /> Assistente de IA</button>
          </div>
        </div>
        <div className="mt-7 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl px-4 py-3 text-sm font-bold text-[#718581]">Cancelar</button><button type="submit" disabled={saving} className="rounded-xl bg-[#ef765f] px-5 py-3 text-sm font-bold text-white hover:bg-[#df6651] disabled:opacity-60">{saving ? "Registrando..." : "Registrar avanco"}</button></div>
      </motion.form>
    </div>
  );
}

type DeleteDialogProps = {
  project: Project;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function DeleteDialog({ project, onClose, onConfirm }: DeleteDialogProps) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#173b37]/40 p-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full max-w-md rounded-[1.5rem] bg-[#f6f3eb] p-6 shadow-[0_28px_80px_rgba(24,59,55,0.28)]">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff0ed] text-[#d65c48]"><Trash2 size={20} /></div>
        <h2 className="mt-5 font-serif text-2xl font-semibold text-[#183b37]">Apagar {project.name}?</h2>
        <p className="mt-2 text-sm leading-6 text-[#70827e]">O projeto e todo o seu historico serao removidos. Esta acao nao pode ser desfeita.</p>
        <div className="mt-7 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl px-4 py-3 text-sm font-bold text-[#718581]">Cancelar</button><button type="button" disabled={busy} onClick={async () => { setBusy(true); await onConfirm(); setBusy(false); }} className="rounded-xl bg-[#d65c48] px-5 py-3 text-sm font-bold text-white hover:bg-[#c64e3c] disabled:opacity-60">{busy ? "Apagando..." : "Apagar projeto"}</button></div>
      </motion.div>
    </div>
  );
    }
