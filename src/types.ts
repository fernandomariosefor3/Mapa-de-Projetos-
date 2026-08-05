export type ProjectStatus =
  | "Ideia"
  | "Planejamento"
  | "Em desenvolvimento"
  | "Em revisao"
  | "Publicado"
  | "Pausado"
  | "Arquivado";

export type ProjectPriority = "Alta" | "Media" | "Baixa";
export type UpdateSource = "Fernando" | "Assistente de IA";

export type ProjectLink = {
  id: string;
  label: string;
  url: string;
  kind: "site" | "github" | "deploy" | "other";
};

export type ProjectCheck = {
  id: string;
  label: string;
  type: "website" | "github" | "manual";
  url?: string;
  status: "idle" | "checking" | "ok" | "attention";
  detail: string;
  checkedAt?: string;
};

export type ProjectActivity = {
  id: string;
  message: string;
  source: UpdateSource;
  createdAt: string;
};

export type Project = {
  id: string;
  name: string;
  summary: string;
  category: string;
  status: ProjectStatus;
  progress: number;
  priority: ProjectPriority;
  dueDate: string;
  nextAction: string;
  blockers: string;
  notes: string;
  visual: string;
  updateMethod: string;
  users: string;
  login: string;
  links: ProjectLink[];
  checks: ProjectCheck[];
  history: ProjectActivity[];
  updatedAt: string;
  updateSource: UpdateSource;
};

export type ProjectDraft = Omit<Project, "id" | "history" | "updatedAt">;

export type AppUser = {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isDemo?: boolean;
};
