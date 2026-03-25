"use client";

import { useState } from "react";
import { Order } from "@/lib/types";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderDetail from "./OrderDetail";

interface OrderTableProps {
  orders: Order[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  loading?: boolean;
}

type SortKey = "ref" | "date" | "sellerName" | "totalPaidInclTax" | "totalItems" | "status" | "orderType" | "deliveryMode";

function formatCurrency(val: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);
}

function formatDate(str: string | null) {
  if (!str) return "-";
  const d = new Date(str);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function OrderTable({ orders, searchQuery, onSearchChange, loading }: OrderTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const pageSize = 25;

  const sorted = [...orders].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "ref") return dir * a.ref.localeCompare(b.ref);
    if (sortKey === "date") return dir * (a.date || "").localeCompare(b.date || "");
    if (sortKey === "sellerName") return dir * a.sellerName.localeCompare(b.sellerName);
    if (sortKey === "totalPaidInclTax") return dir * (a.totalPaidInclTax - b.totalPaidInclTax);
    if (sortKey === "totalItems") return dir * (a.totalItems - b.totalItems);
    if (sortKey === "status") return dir * a.status.localeCompare(b.status);
    if (sortKey === "orderType") return dir * a.orderType.localeCompare(b.orderType);
    if (sortKey === "deliveryMode") return dir * a.deliveryMode.localeCompare(b.deliveryMode);
    return 0;
  });

  const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(orders.length / pageSize);

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

  return (
    <>
      <div className="bg-card rounded-xl shadow-sm border border-tw-accent/10 overflow-hidden">
        {/* Header with search */}
        <div className="px-6 py-4 border-b border-tw-accent/10 flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-tw-dark uppercase tracking-wider shrink-0">
            Commandes
            <span className="text-muted font-normal normal-case tracking-normal ml-2">({orders.length.toLocaleString("fr-FR")})</span>
          </h3>
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher ref, vendeur..."
              value={searchQuery}
              onChange={(e) => { onSearchChange(e.target.value); setPage(0); }}
              className="pl-9 pr-4 py-2 text-sm rounded-lg border border-tw-accent/20 bg-tw-bg/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-tw-accent/30 focus:border-tw-accent w-64 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-16 text-center">
            <div className="inline-block w-8 h-8 border-4 border-tw-accent/20 border-t-tw-primary rounded-full animate-spin" />
            <p className="text-sm text-muted mt-3">Chargement des commandes...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="px-6 py-16 text-center text-muted text-sm">
            Aucune commande trouvée
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-tw-bg/50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("ref")}>
                    Ref <SortIcon col="ref" />
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("date")}>
                    Date <SortIcon col="date" />
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("sellerName")}>
                    Vendeur <SortIcon col="sellerName" />
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider text-right cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("totalPaidInclTax")}>
                    Montant TTC <SortIcon col="totalPaidInclTax" />
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider text-center cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("totalItems")}>
                    Articles <SortIcon col="totalItems" />
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("status")}>
                    Statut <SortIcon col="status" />
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("orderType")}>
                    Type <SortIcon col="orderType" />
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("deliveryMode")}>
                    Livraison <SortIcon col="deliveryMode" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tw-accent/5">
                {paginated.map((order) => (
                  <tr
                    key={order.ref}
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-tw-bg/30 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-3 font-mono text-xs text-tw-primary font-medium">{order.ref}</td>
                    <td className="px-4 py-3 text-gray-700">{formatDate(order.date)}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-[180px]">{order.sellerName}</p>
                        <p className="text-xs text-muted">ID: {order.sellerId}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatCurrency(order.totalPaidInclTax)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{order.totalItems}</td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{order.orderType}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[130px]">{order.deliveryMode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-3 border-t border-tw-accent/10 flex items-center justify-between bg-tw-bg/30">
            <p className="text-xs text-muted">
              {(page * pageSize + 1).toLocaleString("fr-FR")}-{Math.min((page + 1) * pageSize, orders.length).toLocaleString("fr-FR")} sur {orders.length.toLocaleString("fr-FR")}
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

      {/* Order detail panel */}
      {selectedOrder && (
        <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </>
  );
}
