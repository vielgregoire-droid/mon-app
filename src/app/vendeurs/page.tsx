"use client";

import { useState, useMemo, useEffect } from "react";
import { Seller, PipelineStatus, COUNTRIES, COUNTRY_LABELS, PIPELINE_GROUPS } from "@/lib/types";
import KpiCard from "@/components/KpiCard";
import PipelineBar from "@/components/PipelineBar";
import SellerTable from "@/components/SellerTable";

function formatCurrency(val: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);
}

export default function VendeursPage() {
  const [allSellers, setAllSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState<string>("ALL");
  const [activeStatus, setActiveStatus] = useState<PipelineStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/sellers")
      .then((r) => r.json())
      .then((data) => setAllSellers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = allSellers;
    if (country !== "ALL") result = result.filter((s) => s.environment === country);
    if (activeStatus) result = result.filter((s) => s.pipeline_status === activeStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => s.full_name.toLowerCase().includes(q) || s.id.toString().includes(q));
    }
    return result;
  }, [allSellers, country, activeStatus, searchQuery]);

  const countryFiltered = useMemo(() => {
    if (country === "ALL") return allSellers;
    return allSellers.filter((s) => s.environment === country);
  }, [allSellers, country]);

  const totalSellers = countryFiltered.length;
  const activeSellers = countryFiltered.filter((s) => s.pipeline_status === "Active").length;
  const totalSales = countryFiltered.reduce((a, s) => a + s.total_sales, 0);

  // Onboarding urgent : recrues < 14j + 14-30j + 30-90j sans vente
  const urgentCount = countryFiltered.filter((s) =>
    s.pipeline_status === "Onboarding Urgent" || s.pipeline_status === "En Risque" || s.pipeline_status === "Critique"
  ).length;

  // Churn total (rattrapables + dernière chance)
  const churnCount = countryFiltered.filter((s) =>
    s.pipeline_status === "Churn Rescue" || s.pipeline_status === "Churn Emergency"
  ).length;

  const activationRate = useMemo(() => {
    const onboardingStatuses = PIPELINE_GROUPS.onboarding.statuses;
    const inOnboarding = countryFiltered.filter((s) => onboardingStatuses.includes(s.pipeline_status));
    if (inOnboarding.length === 0) return 0;
    const activated = inOnboarding.filter((s) => s.pipeline_status === "Activated").length;
    return Math.round((activated / inOnboarding.length) * 100);
  }, [countryFiltered]);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard
          label="Total vendeurs"
          value={totalSellers.toLocaleString("fr-FR")}
          subtitle={`${activeSellers} actives`}
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
          accentClass="text-success"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KpiCard
          label="À relancer (onboarding)"
          value={urgentCount.toLocaleString("fr-FR")}
          subtitle={`${activationRate}% taux d'activation`}
          accentClass="text-red-500"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          }
        />
        <KpiCard
          label="Actives"
          value={activeSellers.toLocaleString("fr-FR")}
          subtitle={`${totalSellers > 0 ? Math.round((activeSellers / totalSellers) * 100) : 0}% du total`}
          accentClass="text-tw-accent"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KpiCard
          label="En churn"
          value={churnCount.toLocaleString("fr-FR")}
          subtitle="Rescue + Emergency"
          accentClass="text-warning"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
            </svg>
          }
        />
      </div>

      {/* Pipeline */}
      <div className="mb-6">
        <PipelineBar counts={pipelineCounts} activeStatus={activeStatus} onStatusClick={(s) => setActiveStatus(s as PipelineStatus | null)} />
      </div>

      {/* Seller Table */}
      <SellerTable sellers={filtered} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
    </div>
  );
}
