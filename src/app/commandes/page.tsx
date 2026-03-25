"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Order, OrderStatus, COUNTRIES, COUNTRY_LABELS, ORDER_STATUS_CONFIG, ORDER_STATUS_GROUPS } from "@/lib/types";
import KpiCard from "@/components/KpiCard";
import PipelineBar from "@/components/PipelineBar";
import OrderTable from "@/components/OrderTable";

function formatCurrency(val: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);
}

function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const end = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

export default function CommandesPage() {
  const defaultRange = getCurrentMonthRange();
  const [country, setCountry] = useState<string>("ALL");
  const [activeStatus, setActiveStatus] = useState<OrderStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateStart, setDateStart] = useState(defaultRange.start);
  const [dateEnd, setDateEnd] = useState(defaultRange.end);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Load orders when country or dates change — filtered server-side
  const loadOrders = useCallback(async (env: string, ds: string, de: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (env !== "ALL") params.set("environment", env);
      if (ds) params.set("dateStart", ds);
      if (de) params.set("dateEnd", de + "T23:59:59");
      const url = `/api/orders${params.toString() ? "?" + params.toString() : ""}`;
      const res = await fetch(url);
      const data: Order[] = await res.json();
      setOrders(data);
    } catch (e) {
      console.error("Failed to load orders:", e);
      setOrders([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders(country, dateStart, dateEnd);
  }, [country, dateStart, dateEnd, loadOrders]);

  // Orders already filtered by date server-side
  const dateFiltered = orders;

  // Compute KPIs dynamically from date-filtered orders
  const computedKpis = useMemo(() => {
    const total = dateFiltered.length;
    if (total === 0) return { totalOrders: 0, totalCA: 0, avgBasket: 0, cancelRate: 0, webPct: 0 };

    const totalCA = dateFiltered.reduce((sum, o) => sum + (o.totalAmountInclTax || 0), 0);
    const cancelCount = dateFiltered.filter((o) => o.status === "Canceled" || o.status === "PartiallyCancelled").length;
    const webCount = dateFiltered.filter((o) => o.isWebOrder).length;

    return {
      totalOrders: total,
      totalCA,
      avgBasket: total > 0 ? totalCA / total : 0,
      cancelRate: Math.round((cancelCount / total) * 1000) / 10,
      webPct: Math.round((webCount / total) * 1000) / 10,
    };
  }, [dateFiltered]);

  // Pipeline counts from date-filtered orders
  const pipelineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of dateFiltered) {
      counts[o.status] = (counts[o.status] || 0) + 1;
    }
    return counts;
  }, [dateFiltered]);

  // Fully filtered orders for table (date + status + search)
  const filtered = useMemo(() => {
    let result = dateFiltered;
    if (activeStatus) result = result.filter((o) => o.status === activeStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.ref.toLowerCase().includes(q) ||
          o.sellerName.toLowerCase().includes(q) ||
          o.sellerId.toString().includes(q)
      );
    }
    return result;
  }, [dateFiltered, activeStatus, searchQuery]);

  // Quick date presets
  const setPreset = (preset: string) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    switch (preset) {
      case "this-month": {
        const range = getCurrentMonthRange();
        setDateStart(range.start);
        setDateEnd(range.end);
        break;
      }
      case "last-month": {
        const lm = new Date(year, month - 1, 1);
        const lmEnd = new Date(year, month, 0);
        setDateStart(lm.toISOString().slice(0, 10));
        setDateEnd(lmEnd.toISOString().slice(0, 10));
        break;
      }
      case "this-week": {
        const day = now.getDay();
        const diff = day === 0 ? 6 : day - 1; // Monday-based
        const monday = new Date(now);
        monday.setDate(now.getDate() - diff);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        setDateStart(monday.toISOString().slice(0, 10));
        setDateEnd(sunday.toISOString().slice(0, 10));
        break;
      }
      case "ytd": {
        setDateStart(`${year}-01-01`);
        setDateEnd(now.toISOString().slice(0, 10));
        break;
      }
      case "all": {
        setDateStart("");
        setDateEnd("");
        break;
      }
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-tw-dark">Commandes</h1>
          <p className="text-sm text-muted mt-1">Suivi des commandes et de la performance commerciale</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Quick presets */}
          <div className="flex items-center gap-1">
            {[
              { key: "this-week", label: "Semaine" },
              { key: "this-month", label: "Mois" },
              { key: "last-month", label: "M-1" },
              { key: "ytd", label: "YTD" },
              { key: "all", label: "Tout" },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setPreset(p.key)}
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-tw-accent/20 bg-white hover:bg-tw-accent/10 hover:border-tw-accent/40 text-tw-dark transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-tw-accent/20 bg-white focus:outline-none focus:ring-2 focus:ring-tw-accent/30 focus:border-tw-accent transition-all"
            />
            <span className="text-muted text-sm">→</span>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-tw-accent/20 bg-white focus:outline-none focus:ring-2 focus:ring-tw-accent/30 focus:border-tw-accent transition-all"
            />
          </div>

          {/* Country filter */}
          <select
            value={country}
            onChange={(e) => { setCountry(e.target.value); setActiveStatus(null); setSearchQuery(""); }}
            className="px-4 py-2 text-sm rounded-lg border border-tw-accent/20 bg-white focus:outline-none focus:ring-2 focus:ring-tw-accent/30 focus:border-tw-accent transition-all"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{COUNTRY_LABELS[c]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards - dynamically computed from filtered data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard
          label="Total commandes"
          value={computedKpis.totalOrders.toLocaleString("fr-FR")}
          accentClass="text-tw-primary"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <KpiCard
          label="CA TTC"
          value={formatCurrency(computedKpis.totalCA)}
          accentClass="text-success"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KpiCard
          label="Panier moyen"
          value={formatCurrency(computedKpis.avgBasket)}
          accentClass="text-tw-accent"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          }
        />
        <KpiCard
          label="Taux d'annulation"
          value={`${computedKpis.cancelRate}%`}
          accentClass="text-danger"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          }
        />
        <KpiCard
          label="Commandes web"
          value={`${computedKpis.webPct}%`}
          accentClass="text-info"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          }
        />
      </div>

      {/* Pipeline */}
      <div className="mb-6">
        <PipelineBar
          counts={pipelineCounts}
          activeStatus={activeStatus}
          onStatusClick={(s) => setActiveStatus(s as OrderStatus | null)}
          title="Statuts des commandes"
          statusConfig={ORDER_STATUS_CONFIG}
          groups={ORDER_STATUS_GROUPS}
        />
      </div>

      {/* Order Table */}
      <OrderTable orders={filtered} searchQuery={searchQuery} onSearchChange={setSearchQuery} loading={loading} />
    </div>
  );
}
