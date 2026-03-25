"use client";

import { Seller } from "@/lib/types";
import StatusBadge from "./StatusBadge";

interface SellerDetailProps {
  seller: Seller;
  onClose: () => void;
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(val);
}

function formatDate(str: string | null) {
  if (!str) return "-";
  const parts = str.split(" ")[0].split("/").map(Number);
  const d = new Date(parts[2], parts[1] - 1, parts[0]);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatMonths(val: number | null) {
  if (val === null) return "-";
  if (val < 1) return `${Math.round(val * 30)} jours`;
  if (val < 12) return `${Math.round(val)} mois`;
  return `${Math.round(val / 12 * 10) / 10} ans`;
}

// Generate mock orders from seller data for demo
function generateOrders(seller: Seller) {
  if (!seller.first_order_date || seller.order_count === 0) return [];

  const parseDate = (str: string) => {
    const parts = str.split(" ")[0].split("/").map(Number);
    return new Date(parts[2], parts[1] - 1, parts[0]);
  };

  const firstDate = parseDate(seller.first_order_date);
  const lastDate = seller.last_order_date ? parseDate(seller.last_order_date) : firstDate;
  const totalDays = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
  const avgAmount = seller.total_sales / seller.order_count;

  const orders = [];
  for (let i = 0; i < seller.order_count; i++) {
    const dayOffset = seller.order_count === 1 ? 0 : Math.round((i / (seller.order_count - 1)) * totalDays);
    const date = new Date(firstDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    // Vary amount around average
    const variation = 0.5 + Math.random() * 1.0;
    const amount = Math.round(avgAmount * variation * 100) / 100;

    orders.push({
      id: `ORD-${seller.id}-${String(i + 1).padStart(4, "0")}`,
      date,
      amount,
      items: Math.ceil(Math.random() * 8),
    });
  }

  // Normalize amounts so they sum to total_sales
  const currentTotal = orders.reduce((a, o) => a + o.amount, 0);
  const factor = seller.total_sales / currentTotal;
  orders.forEach((o) => { o.amount = Math.round(o.amount * factor * 100) / 100; });

  return orders.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export default function SellerDetail({ seller, onClose }: SellerDetailProps) {
  const orders = generateOrders(seller);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-white shadow-2xl overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-tw-accent/10 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
              seller.pipeline_status === "Active" || seller.pipeline_status === "Activated"
                ? "bg-tw-primary text-tw-accent-light"
                : "bg-gray-200 text-gray-500"
            }`}>
              {seller.first_name.charAt(0)}{seller.last_name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-tw-dark">{seller.full_name}</h2>
              <p className="text-xs text-muted">ID: {seller.id} · {seller.environment}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-tw-bg transition-colors text-muted hover:text-tw-dark"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-tw-bg rounded-xl p-4">
              <p className="text-xs text-muted mb-1">Statut</p>
              <StatusBadge status={seller.pipeline_status} />
            </div>
            <div className="bg-tw-bg rounded-xl p-4">
              <p className="text-xs text-muted mb-1">Rôle</p>
              <p className="text-sm font-semibold text-tw-dark">{seller.standard_status}</p>
            </div>
            <div className="bg-tw-bg rounded-xl p-4">
              <p className="text-xs text-muted mb-1">CA Total TTC</p>
              <p className="text-lg font-bold text-tw-dark">{formatCurrency(seller.total_sales)}</p>
            </div>
            <div className="bg-tw-bg rounded-xl p-4">
              <p className="text-xs text-muted mb-1">Commandes</p>
              <p className="text-lg font-bold text-tw-dark">{seller.order_count}</p>
            </div>
            <div className="bg-tw-bg rounded-xl p-4">
              <p className="text-xs text-muted mb-1">Ancienneté</p>
              <p className="text-sm font-semibold text-tw-dark">{formatMonths(seller.months_since_creation)}</p>
            </div>
            <div className="bg-tw-bg rounded-xl p-4">
              <p className="text-xs text-muted mb-1">Dernière vente</p>
              <p className="text-sm font-semibold text-tw-dark">{formatMonths(seller.months_since_last_order)}</p>
            </div>
          </div>

          {/* Details */}
          <div className="bg-tw-bg rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-semibold text-tw-dark uppercase tracking-wider mb-3">Informations</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-muted">Inscription</span>
              <span className="text-tw-dark font-medium">{formatDate(seller.created_at)}</span>
              <span className="text-muted">1ère commande</span>
              <span className="text-tw-dark font-medium">{formatDate(seller.first_order_date)}</span>
              <span className="text-muted">Dernière commande</span>
              <span className="text-tw-dark font-medium">{formatDate(seller.last_order_date)}</span>
              <span className="text-muted">Manager</span>
              <span className="text-tw-dark font-medium">{seller.manager_full_name || "-"}</span>
              <span className="text-muted">Sales Leader</span>
              <span className="text-tw-dark font-medium">{seller.sales_leader_full_name || "-"}</span>
              <span className="text-muted">Recruteur</span>
              <span className="text-tw-dark font-medium">{seller.recruiter_full_name || "-"}</span>
            </div>
          </div>

          {/* Orders list */}
          <div>
            <h3 className="text-xs font-semibold text-tw-dark uppercase tracking-wider mb-3">
              Historique des commandes ({orders.length})
            </h3>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-muted text-sm">Aucune commande enregistrée</div>
            ) : (
              <div className="bg-card rounded-xl border border-tw-accent/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-tw-bg/50 text-left">
                      <th className="px-4 py-2.5 text-xs font-semibold text-tw-dark/60 uppercase">Commande</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-tw-dark/60 uppercase">Date</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-tw-dark/60 uppercase text-center">Articles</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-tw-dark/60 uppercase text-right">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-tw-accent/5">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-tw-bg/30">
                        <td className="px-4 py-2.5 font-mono text-xs text-muted">{order.id}</td>
                        <td className="px-4 py-2.5 text-gray-700">
                          {order.date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-4 py-2.5 text-center text-gray-600">{order.items}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-gray-900">{formatCurrency(order.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
