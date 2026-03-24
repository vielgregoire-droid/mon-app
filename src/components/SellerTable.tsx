"use client";

import { useState } from "react";
import { Seller } from "@/lib/types";
import StatusBadge from "./StatusBadge";

interface SellerTableProps {
  sellers: Seller[];
}

type SortKey = "full_name" | "total_sales" | "order_count" | "created_at" | "pipeline_status";

export default function SellerTable({ sellers }: SellerTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("total_sales");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const pageSize = 25;

  const sorted = [...sellers].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "full_name") return dir * a.full_name.localeCompare(b.full_name);
    if (sortKey === "total_sales") return dir * (a.total_sales - b.total_sales);
    if (sortKey === "order_count") return dir * (a.order_count - b.order_count);
    if (sortKey === "created_at") return dir * ((a.created_at || "").localeCompare(b.created_at || ""));
    if (sortKey === "pipeline_status") return dir * a.pipeline_status.localeCompare(b.pipeline_status);
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

  return (
    <div className="bg-card rounded-xl shadow-sm border border-tw-accent/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-tw-accent/10 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-tw-dark uppercase tracking-wider">
          Profils vendeurs
          <span className="text-muted font-normal normal-case tracking-normal ml-2">({sellers.length})</span>
        </h3>
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
              <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider">Rôle</th>
              <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider text-right cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("total_sales")}>
                CA TTC <SortIcon col="total_sales" />
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider text-right cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("order_count")}>
                Commandes <SortIcon col="order_count" />
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("created_at")}>
                Inscrit le <SortIcon col="created_at" />
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider">Manager</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tw-accent/5">
            {paginated.map((seller) => (
              <tr key={`${seller.environment_raw}-${seller.id}`} className="hover:bg-tw-bg/30 transition-colors">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${seller.is_active ? "bg-tw-primary text-tw-accent-light" : "bg-gray-200 text-gray-500"}`}>
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
                <td className="px-4 py-3 text-gray-600 text-xs">{seller.standard_status}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                  {seller.total_sales > 0 ? formatCurrency(seller.total_sales) : <span className="text-gray-300">-</span>}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {seller.order_count > 0 ? seller.order_count : <span className="text-gray-300">-</span>}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {seller.created_at ? seller.created_at.split(" ")[0] : "-"}
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
            {page * pageSize + 1}-{Math.min((page + 1) * pageSize, sellers.length)} sur {sellers.length}
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
  );
}
