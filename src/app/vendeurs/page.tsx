"use client";

import { useState, useMemo } from "react";
import sellersData from "@/data/sellers.json";
import { Seller, PipelineStatus, COUNTRIES, COUNTRY_LABELS } from "@/lib/types";
import KpiCard from "@/components/KpiCard";
import PipelineBar from "@/components/PipelineBar";
import SellerTable from "@/components/SellerTable";

const allSellers = sellersData as Seller[];

function formatCurrency(val: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);
}

export default function VendeursPage() {
  const [country, setCountry] = useState<string>("ALL");
  const [activeStatus, setActiveStatus] = useState<PipelineStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let result = allSellers;
    if (country !== "ALL") result = result.filter((s) => s.environment === country);
    if (activeStatus) result = result.filter((s) => s.pipeline_status === activeStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => s.full_name.toLowerCase().includes(q) || s.id.toString().includes(q));
    }
    return result;
  }, [country, activeStatus, searchQuery]);

  const countryFiltered = useMemo(() => {
    if (country === "ALL") return allSellers;
    return allSellers.filter((s) => s.environment === country);
  }, [country]);

  const totalSellers = countryFiltered.length;
  const activeSellers = countryFiltered.filter((s) => s.is_active).length;
  const totalSales = countryFiltered.reduce((a, s) => a + s.total_sales, 0);
  const avgSalesPerSeller = activeSellers > 0 ? totalSales / activeSellers : 0;
  const newRecruits = countryFiltered.filter((s) => s.pipeline_status === "Recruit" || s.pipeline_status === "Onboarding").length;

  const pipelineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of countryFiltered) {
      counts[s.pipeline_status] = (counts[s.pipeline_status] || 0) + 1;
    }
    return counts;
  }, [countryFiltered]);

  return (
    <div className="p-6 lg:p-8 max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-tw-dark">Vendeurs</h1>
          <p className="text-sm text-muted mt-1">Suivi de la performance et du pipeline vendeurs</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-lg border border-tw-accent/20 bg-white focus:outline-none focus:ring-2 focus:ring-tw-accent/30 focus:border-tw-accent w-52 transition-all"
            />
          </div>

          {/* Country filter */}
          <select
            value={country}
            onChange={(e) => { setCountry(e.target.value); setActiveStatus(null); }}
            className="px-4 py-2 text-sm rounded-lg border border-tw-accent/20 bg-white focus:outline-none focus:ring-2 focus:ring-tw-accent/30 focus:border-tw-accent transition-all"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{COUNTRY_LABELS[c]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total vendeurs"
          value={totalSellers.toLocaleString("fr-FR")}
          subtitle={`${activeSellers} actifs`}
          accentClass="text-tw-primary"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128H9m6 0a5.98 5.98 0 00-.786-3.07M9 19.128v-.003c0-1.113.285-2.16.786-3.07m0 0a5.997 5.997 0 0112 0M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          }
        />
        <KpiCard
          label="CA Total TTC"
          value={formatCurrency(totalSales)}
          subtitle="4 derniers mois"
          accentClass="text-success"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KpiCard
          label="CA moyen / actif"
          value={formatCurrency(avgSalesPerSeller)}
          subtitle={`sur ${activeSellers} vendeurs actifs`}
          accentClass="text-tw-accent"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          }
        />
        <KpiCard
          label="Nouvelles recrues"
          value={newRecruits}
          subtitle="Recruit + Onboarding"
          accentClass="text-violet-500"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
          }
        />
      </div>

      {/* Pipeline */}
      <div className="mb-6">
        <PipelineBar counts={pipelineCounts} activeStatus={activeStatus} onStatusClick={setActiveStatus} />
      </div>

      {/* Seller Table */}
      <SellerTable sellers={filtered} />
    </div>
  );
}
