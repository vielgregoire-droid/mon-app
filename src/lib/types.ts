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
  months_since_creation: number;
  months_since_last_order: number | null;
  days_since_creation: number;
}

// =============================================================
// Pipeline Segmentation - Orientation RELANCE / ACTION
// =============================================================
//
// GROUPE 1 : Nouvelles recrues (< 3 mois) — Onboarding
//   - Onboarding Urgent : inscrite < 14 jours, 0 vente → action immédiate
//   - En Risque         : inscrite 14-30 jours, 0 vente → relance rapide
//   - Critique          : inscrite 30-90 jours, 0 vente → dernier push onboarding
//   - Activated         : au moins 1 vente dans les 3 premiers mois ✅
//
// GROUPE 2 : Vendeuses matures (> 3 mois)
//   - Active            : dernière vente < 1 mois ✅
//   - Churn Rescue      : dernière vente 1-3 mois → rattrapable
//   - Churn Emergency   : dernière vente 3-6 mois → dernière chance
//   - Dead              : inactive 6+ mois (a déjà vendu)
//   - Jamais vendu      : inscrite > 3 mois, 0 vente ever

export type PipelineStatus =
  | "Onboarding Urgent"
  | "En Risque"
  | "Critique"
  | "Activated"
  | "Active"
  | "Churn Rescue"
  | "Churn Emergency"
  | "Dead"
  | "Jamais vendu";

export const PIPELINE_GROUPS = {
  onboarding: {
    label: "Moins de 3 mois",
    subtitle: "Phase d'onboarding",
    statuses: ["Onboarding Urgent", "En Risque", "Critique", "Activated"] as PipelineStatus[],
  },
  mature: {
    label: "Plus de 3 mois",
    subtitle: "Vendeuses matures",
    statuses: ["Active", "Churn Rescue", "Churn Emergency", "Dead", "Jamais vendu"] as PipelineStatus[],
  },
};

export const PIPELINE_STATUSES: PipelineStatus[] = [
  ...PIPELINE_GROUPS.onboarding.statuses,
  ...PIPELINE_GROUPS.mature.statuses,
];

export const STATUS_CONFIG: Record<PipelineStatus, { color: string; label: string; description: string }> = {
  "Onboarding Urgent": { color: "#dc2626", label: "Onboarding Urgent", description: "< 14 jours, 0 vente — action immédiate" },
  "En Risque":         { color: "#f97316", label: "En Risque", description: "14-30 jours, 0 vente — relance rapide" },
  "Critique":          { color: "#eab308", label: "Critique", description: "30-90 jours, 0 vente — dernier push" },
  Activated:           { color: "#06b6d4", label: "Activated", description: "1ère vente dans les 3 mois ✅" },
  Active:              { color: "#10b981", label: "Active", description: "Dernière vente < 1 mois ✅" },
  "Churn Rescue":      { color: "#f59e0b", label: "Churn Rescue", description: "Inactive 1-3 mois — rattrapable" },
  "Churn Emergency":   { color: "#ef4444", label: "Churn Emergency", description: "Inactive 3-6 mois — dernière chance" },
  Dead:                { color: "#6b7280", label: "Dead", description: "Inactive 6+ mois" },
  "Jamais vendu":      { color: "#94a3b8", label: "Jamais vendu", description: "Aucune vente depuis l'inscription" },
};

// --- Order types ---

export type OrderStatus =
  | "Finished"
  | "NotYetShipped"
  | "Shipped"
  | "Delivered"
  | "Canceled"
  | "PartiallyCancelled"
  | "InPreparation"
  | "InProgress"
  | "Validated";

export interface Order {
  ref: string;
  date: string;
  paidDate: string | null;
  environment: string;
  sellerId: number;
  sellerName: string;
  customerId: number;
  status: OrderStatus;
  orderType: string;
  deliveryMode: string;
  isWebOrder: boolean;
  totalItems: number;
  totalQuantity: number;
  totalAmountInclTax: number;
  totalDiscountInclTax: number;
  totalPaidInclTax: number;
  deliveryAmount: number;
  managerName: string;
  salesLeaderName: string;
  orderWeek: number | null;
}

export interface OrdersSummary {
  totalOrders: number;
  totalCA: number;
  avgBasket: number;
  cancelRate: number;
  webPct: number;
  statusCounts: Record<string, number>;
  orderTypeCounts: Record<string, number>;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { color: string; label: string }> = {
  Finished:           { color: "#10b981", label: "Terminée" },
  Delivered:          { color: "#06b6d4", label: "Livrée" },
  Shipped:            { color: "#3b82f6", label: "Expédiée" },
  InPreparation:      { color: "#8b5cf6", label: "En préparation" },
  InProgress:         { color: "#a78bfa", label: "En cours" },
  NotYetShipped:      { color: "#f59e0b", label: "Non expédiée" },
  Validated:          { color: "#14b8a6", label: "Validée" },
  PartiallyCancelled: { color: "#f97316", label: "Part. annulée" },
  Canceled:           { color: "#ef4444", label: "Annulée" },
};

export const ORDER_STATUS_GROUPS = [
  {
    label: "En cours",
    subtitle: "Commandes actives",
    statuses: ["InProgress", "Validated", "InPreparation", "NotYetShipped"] as OrderStatus[],
  },
  {
    label: "Traitées",
    subtitle: "Commandes complétées",
    statuses: ["Shipped", "Delivered", "Finished"] as OrderStatus[],
  },
  {
    label: "Annulées",
    subtitle: "Commandes annulées",
    statuses: ["PartiallyCancelled", "Canceled"] as OrderStatus[],
  },
];

export const COUNTRIES = ["ALL", "DE", "PL", "IT", "FR", "BE"] as const;

export const COUNTRY_LABELS: Record<string, string> = {
  ALL: "Tous les pays",
  DE: "Allemagne",
  PL: "Pologne",
  IT: "Italie",
  FR: "France",
  BE: "Belgique",
};

// --- Lead types ---

export interface Lead {
  id: number;
  source: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  postal_code: string;
  country_raw: string;
  country: string;
  intent: string;
  motivation: string;
  preferred_contact_time: string;
  message: string;
  submitted_at: string | null;
  status_raw: string;
  status: LeadStatus;
  days_since_submission: number | null;
}

export type LeadStatus = "Nouveau" | "Transmis" | "Irrelevant" | "Doublon";

export const LEAD_STATUS_CONFIG: Record<LeadStatus, { color: string; label: string; description: string }> = {
  Nouveau:    { color: "#3b82f6", label: "Nouveau", description: "Lead non traité" },
  Transmis:   { color: "#10b981", label: "Transmis", description: "Envoyé au Sales Leader" },
  Irrelevant: { color: "#6b7280", label: "Irrelevant", description: "Lead non qualifié" },
  Doublon:    { color: "#f59e0b", label: "Doublon", description: "Lead en double" },
};

export const LEAD_STATUS_GROUPS = [
  {
    label: "À traiter",
    subtitle: "Leads en attente",
    statuses: ["Nouveau"] as LeadStatus[],
  },
  {
    label: "Traités",
    subtitle: "Leads assignés",
    statuses: ["Transmis"] as LeadStatus[],
  },
  {
    label: "Exclus",
    subtitle: "Leads écartés",
    statuses: ["Irrelevant", "Doublon"] as LeadStatus[],
  },
];

export const LEAD_COUNTRIES = ["ALL", "FR", "DE", "IT", "PL", "BE", "AT", "CH", "NL", "OTHER"] as const;

export const LEAD_COUNTRY_LABELS: Record<string, string> = {
  ALL: "Tous les pays",
  FR: "France",
  DE: "Allemagne",
  IT: "Italie",
  PL: "Pologne",
  BE: "Belgique",
  AT: "Autriche",
  CH: "Suisse",
  NL: "Pays-Bas",
  OTHER: "Autres",
};
