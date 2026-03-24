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
    if (sortKey !== col) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-primary ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  function formatCurrency(val: number) {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          Profils vendeurs
          <span className="text-muted font-normal ml-2">({sellers.length})</span>
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-6 py-3 text-xs font-medium text-muted uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => toggleSort("full_name")}>
                Vendeur <SortIcon col="full_name" />
              </th>
              <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Pays</th>
              <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => toggleSort("pipeline_status")}>
                Statut <SortIcon col="pipeline_status" />
              </th>
              <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Rôle</th>
              <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider text-right cursor-pointer hover:text-gray-700" onClick={() => toggleSort("total_sales")}>
                CA TTC <SortIcon col="total_sales" />
              </th>
              <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider text-right cursor-pointer hover:text-gray-700" onClick={() => toggleSort("order_count")}>
                Commandes <SortIcon col="order_count" />
              </th>
              <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => toggleSort("created_at")}>
                Inscrit le <SortIcon col="created_at" />
              </th>
              <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Manager</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.map((seller) => (
              <tr key={`${seller.environment_raw}-${seller.id}`} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${seller.is_active ? "bg-primary" : "bg-gray-300"}`}>
                      {seller.first_name.charAt(0)}{seller.last_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{seller.full_name}</p>
                      <p className="text-xs text-muted">ID: {seller.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                    {seller.environment}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={seller.pipeline_status} />
                </td>
                <td className="px-4 py-3 text-gray-600">{seller.standard_status}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {seller.total_sales > 0 ? formatCurrency(seller.total_sales) : "-"}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {seller.order_count > 0 ? seller.order_count : "-"}
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {seller.created_at ? seller.created_at.split(" ")[0] : "-"}
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {seller.manager_full_name || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-muted">
            {page * pageSize + 1}-{Math.min((page + 1) * pageSize, sellers.length)} sur {sellers.length}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
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
                  className={`px-3 py-1 text-xs rounded border ${
                    p === page
                      ? "bg-primary text-white border-primary"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {p + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
