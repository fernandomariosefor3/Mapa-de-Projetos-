import type { Project, ProjectCheck, ProjectStatus } from "../types";

export const statusOptions: ProjectStatus[] = [
  "Ideia",
  "Planejamento",
  "Em desenvolvimento",
  "Em revisao",
  "Publicado",
  "Pausado",
  "Arquivado",
];

export const statusStyles: Record<ProjectStatus, string> = {
  Ideia: "bg-violet-50 text-violet-700 border-violet-200",
  Planejamento: "bg-amber-50 text-amber-800 border-amber-200",
  "Em desenvolvimento": "bg-blue-50 text-blue-700 border-blue-200",
  "Em revisao": "bg-orange-50 text-orange-700 border-orange-200",
  Publicado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pausado: "bg-stone-100 text-stone-600 border-stone-200",
  Arquivado: "bg-slate-100 text-slate-600 border-slate-200",
};

export const priorityStyles = {
  Alta: "text-rose-700 bg-rose-50",
  Media: "text-amber-800 bg-amber-50",
  Baixa: "text-teal-700 bg-teal-50",
};

export function formatDate(value: string) {
  if (!value) return "Sem prazo";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

export function formatRelativeDate(value: string) {
  const diff = Math.floor(
    (Date.now() - new Date(value).getTime()) / 86400000,
  );
  if (diff <= 0) return "hoje";
  if (diff === 1) return "ontem";
  return `ha ${diff} dias`;
}

export function getProjectAlerts(projects: Project[]) {
  return projects.flatMap((project) => {
    const alerts: Array<{
      id: string;
      projectId: string;
      projectName: string;
      title: string;
      detail: string;
      tone: "urgent" | "warning" | "info";
    }> = [];
    const idleDays = Math.floor(
      (Date.now() - new Date(project.updatedAt).getTime()) / 86400000,
    );
    if (project.blockers.trim()) {
      alerts.push({
        id: `${project.id}-blocker`,
        projectId: project.id,
        projectName: project.name,
        title: "Bloqueio registrado",
        detail: project.blockers,
        tone: "urgent",
      });
    }
    if (idleDays >= 14) {
      alerts.push({
        id: `${project.id}-idle`,
        projectId: project.id,
        projectName: project.name,
        title: `Sem atualizacao ha ${idleDays} dias`,
        detail: project.nextAction || "Registre uma proxima acao.",
        tone: "warning",
      });
    }
    const checksNeedingAttention = project.checks.filter(
      (check) => check.status === "attention",
    ).length;
    if (checksNeedingAttention) {
      alerts.push({
        id: `${project.id}-checks`,
        projectId: project.id,
        projectName: project.name,
        title: `${checksNeedingAttention} verificacao${checksNeedingAttention > 1 ? "es" : ""} pede atencao`,
        detail: "Abra o projeto para revisar os itens.",
        tone: "info",
      });
    }
    return alerts;
  });
}

function githubApiUrl(url: string) {
  const match = url.match(/github\.com\/([^/]+)\/([^/#]+)/i);
  if (!match) return null;
  return `https://api.github.com/repos/${match[1]}/${match[2]}/commits?per_page=1`;
}

export async function runProjectCheck(check: ProjectCheck): Promise<ProjectCheck> {
  const checkedAt = new Date().toISOString();
  if (check.type === "manual") {
    return {
      ...check,
      status: check.status === "ok" ? "attention" : "ok",
      detail:
        check.status === "ok"
          ? "Marcado para nova conferencia"
          : "Conferido manualmente",
      checkedAt,
    };
  }

  if (!check.url) {
    return {
      ...check,
      status: "attention",
      detail: "Cadastre um endereco para executar esta verificacao",
      checkedAt,
    };
  }

  try {
    if (check.type === "github") {
      const apiUrl = githubApiUrl(check.url);
      if (!apiUrl) throw new Error("Repositorio invalido");
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Repositorio indisponivel");
      const commits = (await response.json()) as Array<{
        commit?: { author?: { date?: string } };
      }>;
      const commitDate = commits[0]?.commit?.author?.date;
      return {
        ...check,
        status: "ok",
        detail: commitDate
          ? `Ultimo commit ${formatRelativeDate(commitDate)}`
          : "Repositorio acessivel",
        checkedAt,
      };
    }

    await fetch(check.url, { mode: "no-cors", cache: "no-store" });
    return {
      ...check,
      status: "ok",
      detail: "Endereco respondeu a verificacao do navegador",
      checkedAt,
    };
  } catch {
    return {
      ...check,
      status: "attention",
      detail: "Nao foi possivel confirmar agora",
      checkedAt,
    };
  }
    }
