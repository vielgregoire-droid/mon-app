"use client";

import { Order } from "@/lib/types";
import OrderStatusBadge from "./OrderStatusBadge";

interface OrderDetailProps {
  order: Order;
  onClose: () => void;
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(val);
}

function formatDate(str: string | null) {
  if (!str) return "-";
  const d = new Date(str);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function OrderDetail({ order, onClose }: OrderDetailProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-white shadow-2xl overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-tw-accent/10 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-tw-primary text-tw-accent-light flex items-center justify-center text-sm font-bold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-tw-dark">{order.ref}</h2>
              <p className="text-xs text-muted">{formatDate(order.date)} · {order.environment}</p>
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
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="bg-tw-bg rounded-xl p-4">
              <p className="text-xs text-muted mb-1">Type</p>
              <p className="text-sm font-semibold text-tw-dark">{order.orderType}</p>
            </div>
            <div className="bg-tw-bg rounded-xl p-4">
              <p className="text-xs text-muted mb-1">Montant TTC</p>
              <p className="text-lg font-bold text-tw-dark">{formatCurrency(order.totalPaidInclTax)}</p>
            </div>
            <div className="bg-tw-bg rounded-xl p-4">
              <p className="text-xs text-muted mb-1">Montant brut</p>
              <p className="text-lg font-bold text-tw-dark">{formatCurrency(order.totalAmountInclTax)}</p>
            </div>
            <div className="bg-tw-bg rounded-xl p-4">
              <p className="text-xs text-muted mb-1">Remises</p>
              <p className="text-sm font-semibold text-danger">{order.totalDiscountInclTax > 0 ? `-${formatCurrency(order.totalDiscountInclTax)}` : "-"}</p>
            </div>
            <div className="bg-tw-bg rounded-xl p-4">
              <p className="text-xs text-muted mb-1">Livraison</p>
              <p className="text-sm font-semibold text-tw-dark">{order.deliveryAmount > 0 ? formatCurrency(order.deliveryAmount) : "Gratuite"}</p>
            </div>
            <div className="bg-tw-bg rounded-xl p-4">
              <p className="text-xs text-muted mb-1">Articles</p>
              <p className="text-lg font-bold text-tw-dark">{order.totalItems}</p>
            </div>
            <div className="bg-tw-bg rounded-xl p-4">
              <p className="text-xs text-muted mb-1">Quantité totale</p>
              <p className="text-lg font-bold text-tw-dark">{order.totalQuantity}</p>
            </div>
          </div>

          {/* Details */}
          <div className="bg-tw-bg rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-semibold text-tw-dark uppercase tracking-wider mb-3">Informations</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-muted">Date de commande</span>
              <span className="text-tw-dark font-medium">{formatDate(order.date)}</span>
              <span className="text-muted">Date de paiement</span>
              <span className="text-tw-dark font-medium">{formatDate(order.paidDate)}</span>
              <span className="text-muted">Mode de livraison</span>
              <span className="text-tw-dark font-medium">{order.deliveryMode || "-"}</span>
              <span className="text-muted">Commande web</span>
              <span className="text-tw-dark font-medium">{order.isWebOrder ? "Oui" : "Non"}</span>
              <span className="text-muted">Semaine</span>
              <span className="text-tw-dark font-medium">{order.orderWeek || "-"}</span>
            </div>
          </div>

          {/* Seller info */}
          <div className="bg-tw-bg rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-semibold text-tw-dark uppercase tracking-wider mb-3">Vendeur</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-muted">Vendeur</span>
              <span className="text-tw-dark font-medium">{order.sellerName}</span>
              <span className="text-muted">ID Vendeur</span>
              <span className="text-tw-dark font-medium">{order.sellerId}</span>
              <span className="text-muted">ID Client</span>
              <span className="text-tw-dark font-medium">{order.customerId}</span>
              <span className="text-muted">Manager</span>
              <span className="text-tw-dark font-medium">{order.managerName || "-"}</span>
              <span className="text-muted">Sales Leader</span>
              <span className="text-tw-dark font-medium">{order.salesLeaderName || "-"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
