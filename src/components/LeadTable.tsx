"use client";

import { useState } from "react";
import { Lead, LEAD_STATUS_CONFIG, LeadStatus, LEAD_COUNTRY_LABELS } from "@/lib/types";

interface LeadTableProps {
  leads: Lead[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

type SortKey = "full_name" | "submitted_at" | "country" | "status" | "intent" | "days_since_submission";

function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const cfg = LEAD_STATUS_CONFIG[status];
  if (!cfg) return <span className="text-xs text-muted">{status}</span>;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: cfg.color + "18", color: cfg.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  );
}

export default function LeadTable({ leads, searchQuery, onSearchChange }: LeadTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("submitted_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const pageSize = 25;

  const sorted = [...leads].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "full_name") return dir * a.full_name.localeCompare(b.full_name);
    if (sortKey === "submitted_at") {
      if (!a.submitted_at) return 1;
      if (!b.submitted_at) return -1;
      return dir * a.submitted_at.localeCompare(b.submitted_at);
    }
    if (sortKey === "country") return dir * a.country.localeCompare(b.country);
    if (sortKey === "status") return dir * a.status.localeCompare(b.status);
    if (sortKey === "intent") return dir * a.intent.localeCompare(b.intent);
    if (sortKey === "days_since_submission") {
      const aVal = a.days_since_submission ?? 999;
      const bVal = b.days_since_submission ?? 999;
      return dir * (aVal - bVal);
    }
    return 0;
  });

  const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(leads.length / pageSize);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(0);
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-tw-accent/30 ml-1">↕</span>;
    return <span className="text-tw-primary ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  function formatDate(iso: string | null) {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function formatDays(days: number | null) {
    if (days === null) return "-";
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 7) return `${days}j`;
    if (days < 30) return `${Math.floor(days / 7)}sem`;
    return `${Math.floor(days / 30)}m`;
  }

  return (
    <>
      <div className="bg-card rounded-xl shadow-sm border border-tw-accent/10 overflow-hidden">
        {/* Header with search */}
        <div className="px-6 py-4 border-b border-tw-accent/10 flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-tw-dark uppercase tracking-wider shrink-0">
            Leads
            <span className="text-muted font-normal normal-case tracking-normal ml-2">({leads.length.toLocaleString("fr-FR")})</span>
          </h3>
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un lead..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-lg border border-tw-accent/20 bg-tw-bg/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-tw-accent/30 focus:border-tw-accent w-64 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-tw-bg/50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("full_name")}>
                  Lead <SortIcon col="full_name" />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("country")}>
                  Pays <SortIcon col="country" />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("status")}>
                  Statut <SortIcon col="status" />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("intent")}>
                  Intent <SortIcon col="intent" />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("submitted_at")}>
                  Date <SortIcon col="submitted_at" />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider text-center cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("days_since_submission")}>
                  Âge <SortIcon col="days_since_submission" />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tw-accent/5">
              {paginated.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="hover:bg-tw-bg/30 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        lead.status === "Nouveau" ? "bg-blue-100 text-blue-600" :
                        lead.status === "Transmis" ? "bg-emerald-100 text-emerald-600" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {(lead.first_name || "?").charAt(0).toUpperCase()}{(lead.last_name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{lead.full_name || "Anonyme"}</p>
                        <p className="text-xs text-muted">{lead.city || "-"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-tw-bg text-tw-dark">
                      {LEAD_COUNTRY_LABELS[lead.country] || lead.country}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-[200px] truncate">
                    {lead.intent.includes("Devenir") ? "🎯 Devenir animatrice" :
                     lead.intent.includes("Organiser") ? "🏠 Organiser un atelier" :
                     lead.intent}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {formatDate(lead.submitted_at)}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500">
                    {formatDays(lead.days_since_submission)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 truncate max-w-[180px]">
                    {lead.preferred_contact_time || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-tw-accent/10 flex items-center justify-between bg-tw-bg/30">
            <p className="text-xs text-muted">
              {(page * pageSize + 1).toLocaleString("fr-FR")}-{Math.min((page + 1) * pageSize, leads.length).toLocaleString("fr-FR")} sur {leads.length.toLocaleString("fr-FR")}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1 text-xs rounded-lg border border-tw-accent/15 hover:bg-tw-bg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ←
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(0, Math.min(totalPages - 5, page - 2)) + i;
                if (p >= totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                      p === page
                        ? "bg-tw-primary text-white border-tw-primary"
                        : "border-tw-accent/15 hover:bg-tw-bg"
                    }`}
                  >
                    {p + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 text-xs rounded-lg border border-tw-accent/15 hover:bg-tw-bg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lead detail panel */}
      {selectedLead && (
        <LeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </>
  );
}

// --- Lead Detail Panel ---
function LeadDetail({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl border-l border-tw-accent/10 overflow-y-auto animate-in slide-in-from-right">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-tw-accent/10 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
              lead.status === "Nouveau" ? "bg-blue-100 text-blue-600" :
              lead.status === "Transmis" ? "bg-emerald-100 text-emerald-600" :
              "bg-gray-100 text-gray-500"
            }`}>
              {(lead.first_name || "?").charAt(0).toUpperCase()}{(lead.last_name || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-tw-dark">{lead.full_name || "Anonyme"}</p>
              <LeadStatusBadge status={lead.status} />
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-tw-bg transition-colors">
            <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Contact info */}
          <div>
            <h4 className="text-xs font-semibold text-tw-dark/60 uppercase tracking-wider mb-3">Contact</h4>
            <div className="space-y-2">
              <InfoRow label="Email" value={lead.email} />
              <InfoRow label="Téléphone" value={lead.phone} />
              <InfoRow label="Ville" value={lead.city} />
              <InfoRow label="Code postal" value={lead.postal_code} />
              <InfoRow label="Pays" value={`${LEAD_COUNTRY_LABELS[lead.country] || lead.country} (${lead.country_raw})`} />
            </div>
          </div>

          {/* Intent & motivation */}
          <div>
            <h4 className="text-xs font-semibold text-tw-dark/60 uppercase tracking-wider mb-3">Motivation</h4>
            <div className="space-y-2">
              <InfoRow label="Intent" value={lead.intent} />
              <InfoRow label="Motivation" value={lead.motivation} />
              <InfoRow label="Préférence contact" value={lead.preferred_contact_time} />
            </div>
          </div>

          {/* Message */}
          {lead.message && (
            <div>
              <h4 className="text-xs font-semibold text-tw-dark/60 uppercase tracking-wider mb-3">Message</h4>
              <p className="text-sm text-gray-700 bg-tw-bg/50 rounded-lg p-3">{lead.message}</p>
            </div>
          )}

          {/* Meta */}
          <div>
            <h4 className="text-xs font-semibold text-tw-dark/60 uppercase tracking-wider mb-3">Informations</h4>
            <div className="space-y-2">
              <InfoRow label="Source" value={lead.source} />
              <InfoRow label="Date soumission" value={lead.submitted_at ? new Date(lead.submitted_at).toLocaleString("fr-FR") : "-"} />
              <InfoRow label="Statut brut" value={lead.status_raw || "-"} />
              <InfoRow label="Âge" value={lead.days_since_submission !== null ? `${lead.days_since_submission} jours` : "-"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-muted w-28 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800 break-all">{value || "-"}</span>
    </div>
  );
}
