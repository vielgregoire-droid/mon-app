"use client";

import { useState, useMemo, useEffect } from "react";
import KpiCard from "@/components/KpiCard";
import { COUNTRIES, COUNTRY_LABELS } from "@/lib/types";

interface TopProduct {
  productRef: string;
  environment: string;
  totalQty: number;
  totalRevenue: number;
  totalDiscount: number;
  totalProductDiscount: number;
  totalOrderDiscount: number;
  orderCount: number;
  avgPrice: number;
  discountRate: number;
}

interface MonthlyPromo {
  environment: string;
  month: string;
  totalRevenue: number;
  totalDiscount: number;
  totalProductDiscount: number;
  totalOrderDiscount: number;
  itemCount: number;
  orderCount: number;
  discountedOrderCount: number;
  discountRate: number;
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);
}

function formatNumber(val: number) {
  return new Intl.NumberFormat("fr-FR").format(val);
}

export default function PromotionsPage() {
  const [allProducts, setAllProducts] = useState<TopProduct[]>([]);
  const [allMonthly, setAllMonthly] = useState<MonthlyPromo[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState<string>("ALL");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/top-products").then((r) => r.json()),
      fetch("/api/promo-monthly").then((r) => r.json()),
    ])
      .then(([products, monthly]) => {
        setAllProducts(products);
        setAllMonthly(monthly);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const availableMonths = useMemo(() => [...new Set(allMonthly.map((m: MonthlyPromo) => m.month))].sort(), [allMonthly]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[availableMonths.length - 1]);
    }
  }, [availableMonths, selectedMonth]);
  const [sortKey, setSortKey] = useState<"totalRevenue" | "totalQty" | "totalDiscount" | "discountRate" | "orderCount">("totalRevenue");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 25;

  const filteredMonthly = useMemo(() => {
    if (country === "ALL") return allMonthly;
    return allMonthly.filter((m) => m.environment === country);
  }, [allMonthly, country]);

  const currentMonthStats = useMemo(() => {
    const rows = filteredMonthly.filter((m) => m.month === selectedMonth);
    return rows.reduce(
      (acc, m) => ({
        totalRevenue: acc.totalRevenue + m.totalRevenue,
        totalDiscount: acc.totalDiscount + m.totalDiscount,
        totalProductDiscount: acc.totalProductDiscount + m.totalProductDiscount,
        totalOrderDiscount: acc.totalOrderDiscount + m.totalOrderDiscount,
        itemCount: acc.itemCount + m.itemCount,
        orderCount: acc.orderCount + m.orderCount,
        discountedOrderCount: acc.discountedOrderCount + m.discountedOrderCount,
      }),
      { totalRevenue: 0, totalDiscount: 0, totalProductDiscount: 0, totalOrderDiscount: 0, itemCount: 0, orderCount: 0, discountedOrderCount: 0 }
    );
  }, [filteredMonthly, selectedMonth]);

  const totalStats = useMemo(() => {
    return filteredMonthly.reduce(
      (acc, m) => ({
        totalRevenue: acc.totalRevenue + m.totalRevenue,
        totalDiscount: acc.totalDiscount + m.totalDiscount,
        orderCount: acc.orderCount + m.orderCount,
        discountedOrderCount: acc.discountedOrderCount + m.discountedOrderCount,
      }),
      { totalRevenue: 0, totalDiscount: 0, orderCount: 0, discountedOrderCount: 0 }
    );
  }, [filteredMonthly]);

  const globalDiscountRate = totalStats.totalRevenue + totalStats.totalDiscount > 0
    ? ((totalStats.totalDiscount / (totalStats.totalRevenue + totalStats.totalDiscount)) * 100).toFixed(1)
    : "0";

  const monthDiscountRate = currentMonthStats.orderCount > 0
    ? Math.round((currentMonthStats.discountedOrderCount / currentMonthStats.orderCount) * 100)
    : 0;

  const filteredProducts = useMemo(() => {
    let result = allProducts;
    if (country !== "ALL") result = result.filter((p) => p.environment === country);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.productRef.toLowerCase().includes(q));
    }
    return [...result].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      return dir * ((a[sortKey] as number) - (b[sortKey] as number));
    });
  }, [allProducts, country, searchQuery, sortKey, sortDir]);

  const paginated = filteredProducts.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
    setPage(0);
  }

  function SortIcon({ col }: { col: typeof sortKey }) {
    if (sortKey !== col) return <span className="text-tw-accent/30 ml-1">↕</span>;
    return <span className="text-tw-primary ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  const monthlyTrend = useMemo(() => {
    const byMonth: Record<string, { revenue: number; discount: number }> = {};
    for (const m of filteredMonthly) {
      if (!byMonth[m.month]) byMonth[m.month] = { revenue: 0, discount: 0 };
      byMonth[m.month].revenue += m.totalRevenue;
      byMonth[m.month].discount += m.totalDiscount;
    }
    return availableMonths.map((month) => ({
      month,
      label: new Date(month + "-01").toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
      revenue: byMonth[month]?.revenue || 0,
      discount: byMonth[month]?.discount || 0,
    }));
  }, [filteredMonthly]);

  const maxRevenue = Math.max(...monthlyTrend.map((m) => m.revenue), 1);

  return (
    <div className="p-6 lg:p-8 max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-tw-dark">Promotions</h1>
          <p className="text-sm text-muted mt-1">Analyse des remises et performance produits</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 text-sm rounded-lg border border-tw-accent/20 bg-white focus:outline-none focus:ring-2 focus:ring-tw-accent/30 focus:border-tw-accent transition-all"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {new Date(m + "-01").toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </option>
            ))}
          </select>
          <select
            value={country}
            onChange={(e) => { setCountry(e.target.value); setPage(0); }}
            className="px-4 py-2 text-sm rounded-lg border border-tw-accent/20 bg-white focus:outline-none focus:ring-2 focus:ring-tw-accent/30 focus:border-tw-accent transition-all"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{COUNTRY_LABELS[c]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard
          label="CA mois sélectionné"
          value={formatCurrency(currentMonthStats.totalRevenue)}
          subtitle={`${formatNumber(currentMonthStats.orderCount)} commandes`}
          accentClass="text-tw-primary"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KpiCard
          label="Remises du mois"
          value={formatCurrency(currentMonthStats.totalDiscount)}
          subtitle={`dont ${formatCurrency(currentMonthStats.totalProductDiscount)} produit`}
          accentClass="text-danger"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 6h.008v.008H6V6z" /></svg>}
        />
        <KpiCard
          label="% cmd avec remise"
          value={`${monthDiscountRate}%`}
          subtitle={`${formatNumber(currentMonthStats.discountedOrderCount)} cmd`}
          accentClass="text-warning"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>}
        />
        <KpiCard
          label="Taux remise global"
          value={`${globalDiscountRate}%`}
          subtitle="sur toute la période"
          accentClass="text-violet-500"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>}
        />
        <KpiCard
          label="Articles vendus"
          value={formatNumber(currentMonthStats.itemCount)}
          subtitle="mois sélectionné"
          accentClass="text-tw-accent"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>}
        />
      </div>

      {/* Monthly trend chart */}
      <div className="bg-card rounded-xl shadow-sm border border-tw-accent/10 p-6 mb-6">
        <h3 className="text-sm font-semibold text-tw-dark uppercase tracking-wider mb-4">Évolution mensuelle</h3>
        <div className="flex items-end gap-2 h-40">
          {monthlyTrend.map((m) => {
            const revH = (m.revenue / maxRevenue) * 100;
            const discH = maxRevenue > 0 ? (m.discount / maxRevenue) * 100 : 0;
            const isSelected = m.month === selectedMonth;
            return (
              <button
                key={m.month}
                onClick={() => setSelectedMonth(m.month)}
                className={`flex-1 flex flex-col items-center gap-1 group transition-all ${isSelected ? "" : "opacity-60 hover:opacity-100"}`}
              >
                <div className="w-full flex flex-col items-center gap-0.5" style={{ height: "120px", justifyContent: "flex-end" }}>
                  <div className={`w-full rounded-t transition-all ${isSelected ? "bg-tw-primary" : "bg-tw-primary/40 group-hover:bg-tw-primary/60"}`} style={{ height: `${revH}%`, minHeight: revH > 0 ? "4px" : "0" }} />
                  <div className="w-full rounded-b bg-red-400/60" style={{ height: `${discH}%`, minHeight: discH > 0 ? "2px" : "0" }} />
                </div>
                <span className={`text-[10px] ${isSelected ? "text-tw-dark font-bold" : "text-muted"}`}>{m.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted">
          <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-tw-primary inline-block" /> CA</span>
          <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-red-400/60 inline-block" /> Remises</span>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-card rounded-xl shadow-sm border border-tw-accent/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-tw-accent/10 flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-tw-dark uppercase tracking-wider shrink-0">
            Top Produits
            <span className="text-muted font-normal normal-case tracking-normal ml-2">({filteredProducts.length.toLocaleString("fr-FR")})</span>
          </h3>
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher une ref..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              className="pl-9 pr-4 py-2 text-sm rounded-lg border border-tw-accent/20 bg-tw-bg/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-tw-accent/30 focus:border-tw-accent w-64 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-tw-bg/50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider">Réf. produit</th>
                <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider">Pays</th>
                <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider text-right cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("totalRevenue")}>CA TTC <SortIcon col="totalRevenue" /></th>
                <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider text-right cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("totalQty")}>Qté <SortIcon col="totalQty" /></th>
                <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider text-right cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("orderCount")}>Cmd <SortIcon col="orderCount" /></th>
                <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider text-right cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("totalDiscount")}>Remises <SortIcon col="totalDiscount" /></th>
                <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider text-right cursor-pointer hover:text-tw-dark" onClick={() => toggleSort("discountRate")}>% Remise <SortIcon col="discountRate" /></th>
                <th className="px-4 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider text-right">Prix unit.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tw-accent/5">
              {paginated.map((product, idx) => {
                const rank = page * pageSize + idx + 1;
                return (
                  <tr key={`${product.environment}-${product.productRef}`} className="hover:bg-tw-bg/30 transition-colors">
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${rank <= 3 ? "bg-yellow-100 text-yellow-700" : rank <= 10 ? "bg-tw-bg text-tw-dark" : "text-muted"}`}>{rank}</span>
                    </td>
                    <td className="px-4 py-3"><span className="font-mono font-medium text-tw-dark">{product.productRef}</span></td>
                    <td className="px-4 py-3"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-tw-bg text-tw-dark">{product.environment}</span></td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(product.totalRevenue)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatNumber(product.totalQty)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatNumber(product.orderCount)}</td>
                    <td className="px-4 py-3 text-right text-red-500 font-medium">{product.totalDiscount > 0 ? formatCurrency(product.totalDiscount) : <span className="text-gray-300">-</span>}</td>
                    <td className="px-4 py-3 text-right">
                      {product.discountRate > 0 ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${product.discountRate > 40 ? "bg-red-100 text-red-700" : product.discountRate > 20 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{product.discountRate}%</span>
                      ) : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">{formatCurrency(product.avgPrice)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-tw-accent/10 flex items-center justify-between bg-tw-bg/30">
            <p className="text-xs text-muted">{(page * pageSize + 1).toLocaleString("fr-FR")}-{Math.min((page + 1) * pageSize, filteredProducts.length).toLocaleString("fr-FR")} sur {filteredProducts.length.toLocaleString("fr-FR")}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-3 py-1 text-xs rounded-lg border border-tw-accent/15 hover:bg-tw-bg disabled:opacity-30 disabled:cursor-not-allowed transition-colors">←</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(0, Math.min(totalPages - 5, page - 2)) + i;
                if (p >= totalPages) return null;
                return (<button key={p} onClick={() => setPage(p)} className={`px-3 py-1 text-xs rounded-lg border transition-colors ${p === page ? "bg-tw-primary text-white border-tw-primary" : "border-tw-accent/15 hover:bg-tw-bg"}`}>{p + 1}</button>);
              })}
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-3 py-1 text-xs rounded-lg border border-tw-accent/15 hover:bg-tw-bg disabled:opacity-30 disabled:cursor-not-allowed transition-colors">→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
