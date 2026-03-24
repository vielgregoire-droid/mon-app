export interface Seller {
  id: number;
  environment: string;
  environment_raw: string;
  first_name: string;
  last_name: string;
  full_name: string;
  gender: number;
  created_at: string | null;
  local_status: string;
  standard_status: string;
  hierarchy_level: number;
  manager_full_name: string;
  manager_id: number | null;
  sales_leader_full_name: string;
  sales_leader_id: number | null;
  recruiter_full_name: string;
  recruiter_id: number | null;
  last_connection: string | null;
  is_active: boolean;
  total_sales: number;
  order_count: number;
  first_order_date: string | null;
  last_order_date: string | null;
  pipeline_status: PipelineStatus;
}

export type PipelineStatus =
  | "Lead"
  | "Recruit"
  | "Onboarding"
  | "Activated"
  | "Active"
  | "Top Seller"
  | "At Risk"
  | "Churned";

export const PIPELINE_STATUSES: PipelineStatus[] = [
  "Lead",
  "Recruit",
  "Onboarding",
  "Activated",
  "Active",
  "Top Seller",
  "At Risk",
  "Churned",
];

export const STATUS_CONFIG: Record<PipelineStatus, { color: string; bg: string; label: string }> = {
  Lead: { color: "#94a3b8", bg: "bg-slate-400", label: "Lead" },
  Recruit: { color: "#8b5cf6", bg: "bg-violet-500", label: "Recruit" },
  Onboarding: { color: "#3b82f6", bg: "bg-blue-500", label: "Onboarding" },
  Activated: { color: "#06b6d4", bg: "bg-cyan-500", label: "Activated" },
  Active: { color: "#10b981", bg: "bg-emerald-500", label: "Active" },
  "Top Seller": { color: "#f59e0b", bg: "bg-amber-500", label: "Top Seller" },
  "At Risk": { color: "#f97316", bg: "bg-orange-500", label: "At Risk" },
  Churned: { color: "#ef4444", bg: "bg-red-500", label: "Churned" },
};

export const COUNTRIES = ["ALL", "DE", "PL", "IT", "FR", "BE"] as const;

export const COUNTRY_LABELS: Record<string, string> = {
  ALL: "Tous les pays",
  DE: "Allemagne",
  PL: "Pologne",
  IT: "Italie",
  FR: "France",
  BE: "Belgique",
};
