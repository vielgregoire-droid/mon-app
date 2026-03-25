"use client";

import { useState, useMemo, useEffect } from "react";
import { Lead, LeadStatus, LEAD_STATUS_CONFIG, LEAD_STATUS_GROUPS, LEAD_COUNTRIES, LEAD_COUNTRY_LABELS } from "@/lib/types";
import KpiCard from "@/components/KpiCard";
import PipelineBar from "@/components/PipelineBar";
import LeadTable from "@/components/LeadTable";

export default function LeadsPage() {
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState<string>("ALL");

  useEffect(() => {
    setLoading(true);
    fetch("/api/leads")
      .then((r) => r.json())
      .then((data) => setAllLeads(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  const [activeStatus, setActiveStatus] = useState<LeadStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [intentFilter, setIntentFilter] = useState<string>("ALL");

  // Country filtered
  const countryFiltered = useMemo(() => {
    if (country === "ALL") return allLeads;
    return allLeads.filter((l) => l.country === country);
  }, [allLeads, country]);

  // Date + intent filtered (for KPIs)
  const dateFiltered = useMemo(() => {
    let result = countryFiltered;
    if (dateStart) result = result.filter((l) => l.submitted_at && l.submitted_at >= dateStart);
    if (dateEnd) result = result.filter((l) => l.submitted_at && l.submitted_at <= dateEnd + "T23:59:59");
    if (intentFilter !== "ALL") {
      result = result.filter((l) => l.intent.includes(intentFilter));
    }
    return result;
  }, [countryFiltered, dateStart, dateEnd, intentFilter]);

  // Fully filtered (for table)
  const filtered = useMemo(() => {
    let result = dateFiltered;
    if (activeStatus) result = result.filter((l) => l.status === activeStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.full_name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.city.toLowerCase().includes(q)
      );
    }
    return result;
  }, [dateFiltered, activeStatus, searchQuery]);

  // KPIs
  const totalLeads = dateFiltered.length;
  const nouveauxCount = dateFiltered.filter((l) => l.status === "Nouveau").length;
  const transmisCount = dateFiltered.filter((l) => l.status === "Transmis").length;
  const conversionRate = totalLeads > 0 ? Math.round((transmisCount / totalLeads) * 100) : 0;

  // Avg response time (days since submission for "Nouveau" leads)
  const nouveaux = dateFiltered.filter((l) => l.status === "Nouveau" && l.days_since_submission !== null);
  const avgWaitDays = nouveaux.length > 0
    ? Math.round(nouveaux.reduce((a, l) => a + (l.days_since_submission || 0), 0) / nouveaux.length)
    : 0;

  // Pipeline counts
  const pipelineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of dateFiltered) {
      counts[l.status] = (counts[l.status] || 0) + 1;
    }
    return counts;
  }, [dateFiltered]);

  return (
    <div className="p-6 lg:p-8 max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-tw-dark">Leads</h1>
          <p className="text-sm text-muted mt-1">Gestion des leads CRM et recrutement</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
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

          {/* Intent filter */}
          <select
            value={intentFilter}
            onChange={(e) => setIntentFilter(e.target.value)}
            className="px-4 py-2 text-sm rounded-lg border border-tw-accent/20 bg-white focus:outline-none focus:ring-2 focus:ring-tw-accent/30 focus:border-tw-accent transition-all"
          >
            <option value="ALL">Tous les intents</option>
            <option value="Devenir">🎯 Devenir animatrice</option>
            <option value="Organiser">🏠 Organiser un atelier</option>
          </select>

          {/* Country filter */}
          <select
            value={country}
            onChange={(e) => { setCountry(e.target.value); setActiveStatus(null); setSearchQuery(""); }}
            className="px-4 py-2 text-sm rounded-lg border border-tw-accent/20 bg-white focus:outline-none focus:ring-2 focus:ring-tw-accent/30 focus:border-tw-accent transition-all"
          >
            {LEAD_COUNTRIES.map((c) => (
              <option key={c} value={c}>{LEAD_COUNTRY_LABELS[c]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard
          label="Total leads"
          value={totalLeads.toLocaleString("fr-FR")}
          accentClass="text-tw-primary"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          }
        />
        <KpiCard
          label="Nouveaux (à traiter)"
          value={nouveauxCount.toLocaleString("fr-FR")}
          subtitle={`${avgWaitDays}j d'attente moy.`}
          accentClass="text-blue-500"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          }
        />
        <KpiCard
          label="Transmis"
          value={transmisCount.toLocaleString("fr-FR")}
          subtitle={`${conversionRate}% taux transmission`}
          accentClass="text-success"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          }
        />
        <KpiCard
          label="Devenir animatrice"
          value={dateFiltered.filter((l) => l.intent.includes("Devenir")).length.toLocaleString("fr-FR")}
          subtitle={`${totalLeads > 0 ? Math.round((dateFiltered.filter((l) => l.intent.includes("Devenir")).length / totalLeads) * 100) : 0}% des leads`}
          accentClass="text-violet-500"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
          }
        />
        <KpiCard
          label="Organiser atelier"
          value={dateFiltered.filter((l) => l.intent.includes("Organiser")).length.toLocaleString("fr-FR")}
          subtitle={`${totalLeads > 0 ? Math.round((dateFiltered.filter((l) => l.intent.includes("Organiser")).length / totalLeads) * 100) : 0}% des leads`}
          accentClass="text-tw-accent"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
            </svg>
          }
        />
      </div>

      {/* Pipeline */}
      <div className="mb-6">
        <PipelineBar
          counts={pipelineCounts}
          activeStatus={activeStatus}
          onStatusClick={(s) => setActiveStatus(s as LeadStatus | null)}
          title="Statuts des leads"
          statusConfig={LEAD_STATUS_CONFIG}
          groups={LEAD_STATUS_GROUPS}
        />
      </div>

      {/* Lead Table */}
      <LeadTable leads={filtered} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
    </div>
  );
}
