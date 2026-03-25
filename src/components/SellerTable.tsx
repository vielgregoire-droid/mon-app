"use client";

import { useState } from "react";
import { Seller } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import SellerDetail from "./SellerDetail";

interface SellerTableProps {
  sellers: Seller[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

type SortKey = "full_name" | "total_sales" | "order_count" | "created_at" | "pipeline_status" | "months_since_last_order";

export default function SellerTable({ sellers, searchQuery, onSearchChange }: SellerTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("total_sales");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const pageSize = 25;

  const sorted = [...sellers].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "full_name") return dir * a.full_name.localeCompare(b.full_name);
    if (sortKey === "total_sales") return dir * (a.total_sales - b.total_sales);
    if (sortKey === "order_count") return dir * (a.order_count - b.order_count);
    if (sortKey === "created_at") return dir * (a.months_since_creation - b.months_since_creation);
    if (sortKey === "pipeline_status") return dir * a.pipeline_status.localeCompare(b.pipeline_status);
    if (sortKey === "months_since_last_order") {
      const aVal = a.months_since_last_order ?? 999;
      const bVal = b.months_since_last_order ?? 999;
      return dir * (aVal - bVal);
    }
    return 0;
  });

  const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(sellers.length / pageSize);

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

  function formatCurrency(val: number) {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);
  }

  function formatMonths(val: number | null) {
    if (val === null) return "-";
    if (val < 1) return `${Math.round(val * 30)}j`;
    return `${Math.round(val)}m`;
  }

  return (
    <>
      <div className="bg-card rounded-xl shadow-sm border border-tw-accent/10 overflow-hidden">
        {/* Header with search */}
        <div className="px-6 py-4 border-b border-tw-accent/10 flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-tw-dark uppercase tracking-wider shrink-0">
            Profils vendeurs
            <span className="text-muted font-normal normal-case tracking-normal ml-2">({sellers.length.toLocaleString("fr-FR")})</span>
          </h3>
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un vendeur..."
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
                  Vendeur <SortIcon col="full_name" />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider">Pays</th>
                <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("pipeline_status")}>
                  Statut <SortIcon col="pipeline_status" />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider text-right cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("total_sales")}>
                  CA TTC <SortIcon col="total_sales" />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider text-right cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("order_count")}>
                  Cmd <SortIcon col="order_count" />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider text-center cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("created_at")}>
                  Ancienneté <SortIcon col="created_at" />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider text-center cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("months_since_last_order")}>
                  Dern. vente <SortIcon col="months_since_last_order" />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider">Manager</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tw-accent/5">
              {paginated.map((seller) => (
                <tr
                  key={`${seller.environment_raw}-${seller.id}`}
                  onClick={() => setSelectedSeller(seller)}
                  className="hover:bg-tw-bg/30 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${seller.pipeline_status === "Active" || seller.pipeline_status === "Activated" ? "bg-tw-primary text-tw-accent-light" : "bg-gray-200 text-gray-500"}`}>
                        {seller.first_name.charAt(0)}{seller.last_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{seller.full_name}</p>
                        <p className="text-xs text-muted">ID: {seller.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-tw-bg text-tw-dark">
                      {seller.environment}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={seller.pipeline_status} />
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {seller.total_sales > 0 ? formatCurrency(seller.total_sales) : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {seller.order_count > 0 ? seller.order_count : <span className="text-gray-300">-</span>}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">
                    {formatMonths(seller.months_since_creation)}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">
                    {formatMonths(seller.months_since_last_order)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[150px]">
                    {seller.manager_full_name || "-"}
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
              {(page * pageSize + 1).toLocaleString("fr-FR")}-{Math.min((page + 1) * pageSize, sellers.length).toLocaleString("fr-FR")} sur {sellers.length.toLocaleString("fr-FR")}
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

      {/* Seller detail panel */}
      {selectedSeller && (
        <SellerDetail seller={selectedSeller} onClose={() => setSelectedSeller(null)} />
      )}
    </>
  );
}
