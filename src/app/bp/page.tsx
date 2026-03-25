"use client";

import { useState, useMemo, useEffect } from "react";
import KpiCard from "@/components/KpiCard";

interface BpRow {
  row: number;
  label: string;
  level: number;
  isHeader: boolean;
  section: string;
  annuals: Record<string, number>;
  monthly: Record<string, number>;
}

function formatK(val: number) {
  if (val === 0) return "-";
  if (Math.abs(val) >= 1000000) return `${(val / 1000000).toFixed(1)}M€`;
  if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(0)}k€`;
  return `${val}€`;
}

function formatCurrency(val: number) {
  if (val === 0) return "-";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);
}

const YEARS = ["2025", "2026", "2027", "2028"];

export default function BpPage() {
  const [allRows, setAllRows] = useState<BpRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [viewMode, setViewMode] = useState<"annual" | "monthly">("annual");

  useEffect(() => {
    setLoading(true);
    fetch("/api/bp")
      .then((r) => r.json())
      .then((data) => setAllRows(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const SECTIONS = useMemo(() => [...new Set(allRows.map((r: BpRow) => r.section))].filter(Boolean), [allRows]);
  const allMonths = useMemo(() => [...new Set(allRows.flatMap((r: BpRow) => Object.keys(r.monthly)))].sort(), [allRows]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (SECTIONS.length > 0) setExpandedSections(new Set(SECTIONS));
  }, [SECTIONS]);
  const [selectedSection, setSelectedSection] = useState<string>("ALL");

  // Key metrics
  const getAnnual = (label: string, year: string) => {
    const row = allRows.find((r) => r.label === label);
    return row?.annuals[year] || 0;
  };

  const ca = getAnnual("TOTAL CHIFFRE D'AFFAIRES", selectedYear);
  const couts = getAnnual("TOTAL COÛTS DIRECTS", selectedYear);
  const marge = getAnnual("TOTAL MARGE BRUTE", selectedYear);
  const margeRate = ca > 0 ? ((marge / ca) * 100).toFixed(1) : "0";

  // Monthly data for selected year
  const monthsForYear = allMonths.filter((m) => m.startsWith(selectedYear));

  // Filter rows by section
  const displayRows = useMemo(() => {
    if (selectedSection === "ALL") return allRows.filter((r) => !r.isHeader || r.label !== r.section);
    return allRows.filter((r) => r.section === selectedSection);
  }, [selectedSection]);

  // Monthly chart data for CA
  const caRow = allRows.find((r) => r.label === "TOTAL CHIFFRE D'AFFAIRES");
  const coutsRow = allRows.find((r) => r.label === "TOTAL COÛTS DIRECTS");
  const margeRow = allRows.find((r) => r.label === "TOTAL MARGE BRUTE");

  const monthlyChart = monthsForYear.map((m) => ({
    month: m,
    label: new Date(m + "-01").toLocaleDateString("fr-FR", { month: "short" }),
    ca: caRow?.monthly[m] || 0,
    couts: coutsRow?.monthly[m] || 0,
    marge: margeRow?.monthly[m] || 0,
  }));

  const maxMonthCA = Math.max(...monthlyChart.map((m) => m.ca), 1);

  function toggleSection(section: string) {
    const next = new Set(expandedSections);
    if (next.has(section)) next.delete(section);
    else next.add(section);
    setExpandedSections(next);
  }

  // Annual comparison for growth
  const caPrev = selectedYear !== "2025" ? getAnnual("TOTAL CHIFFRE D'AFFAIRES", String(Number(selectedYear) - 1)) : 0;
  const caGrowth = caPrev > 0 ? (((ca - caPrev) / caPrev) * 100).toFixed(0) : "-";

  return (
    <div className="p-6 lg:p-8 max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-tw-dark">Business Plan</h1>
          <p className="text-sm text-muted mt-1">Prévisionnel financier 2025-2028</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Year selector */}
          <div className="flex items-center gap-1 bg-white rounded-lg border border-tw-accent/20 p-1">
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  selectedYear === y
                    ? "bg-tw-primary text-white shadow-sm"
                    : "text-tw-dark/60 hover:text-tw-dark hover:bg-tw-bg"
                }`}
              >
                {y}
              </button>
            ))}
          </div>

          {/* View mode */}
          <div className="flex items-center gap-1 bg-white rounded-lg border border-tw-accent/20 p-1">
            <button
              onClick={() => setViewMode("annual")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === "annual" ? "bg-tw-primary text-white" : "text-tw-dark/60 hover:text-tw-dark"}`}
            >
              Annuel
            </button>
            <button
              onClick={() => setViewMode("monthly")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === "monthly" ? "bg-tw-primary text-white" : "text-tw-dark/60 hover:text-tw-dark"}`}
            >
              Mensuel
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label={`CA ${selectedYear}`}
          value={formatK(ca)}
          subtitle={caGrowth !== "-" ? `${caGrowth}% vs ${Number(selectedYear) - 1}` : "Année de lancement"}
          accentClass="text-tw-primary"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>}
        />
        <KpiCard
          label="Coûts directs"
          value={formatK(couts)}
          subtitle={ca > 0 ? `${((couts / ca) * 100).toFixed(1)}% du CA` : "-"}
          accentClass="text-danger"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KpiCard
          label="Marge Brute"
          value={formatK(marge)}
          subtitle={`${margeRate}% de marge`}
          accentClass="text-success"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14.25l3-3m0 0l3 3m-3-3v8.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KpiCard
          label="Direct Sales"
          value={formatK(getAnnual("Direct sales", selectedYear))}
          subtitle={ca > 0 ? `${((getAnnual("Direct sales", selectedYear) / ca) * 100).toFixed(0)}% du CA` : "-"}
          accentClass="text-violet-500"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128H9m6 0a5.98 5.98 0 00-.786-3.07M9 19.128v-.003c0-1.113.285-2.16.786-3.07m0 0a5.997 5.997 0 0112 0M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>}
        />
      </div>

      {/* Monthly evolution chart */}
      {viewMode === "monthly" && (
        <div className="bg-card rounded-xl shadow-sm border border-tw-accent/10 p-6 mb-6">
          <h3 className="text-sm font-semibold text-tw-dark uppercase tracking-wider mb-4">Évolution mensuelle {selectedYear}</h3>
          <div className="flex items-end gap-3 h-48">
            {monthlyChart.map((m) => {
              const caH = (m.ca / maxMonthCA) * 100;
              const coutsH = (m.couts / maxMonthCA) * 100;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] text-muted font-medium">{formatK(m.ca)}</div>
                  <div className="w-full flex gap-0.5" style={{ height: "140px", alignItems: "flex-end" }}>
                    <div className="flex-1 bg-tw-primary/80 rounded-t transition-all" style={{ height: `${caH}%`, minHeight: m.ca > 0 ? "4px" : "0" }} />
                    <div className="flex-1 bg-red-400/60 rounded-t transition-all" style={{ height: `${coutsH}%`, minHeight: m.couts > 0 ? "4px" : "0" }} />
                  </div>
                  <span className="text-[10px] text-muted font-medium">{m.label}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted">
            <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-tw-primary/80 inline-block" /> CA</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-red-400/60 inline-block" /> Coûts directs</span>
          </div>
        </div>
      )}

      {/* Annual comparison chart */}
      {viewMode === "annual" && (
        <div className="bg-card rounded-xl shadow-sm border border-tw-accent/10 p-6 mb-6">
          <h3 className="text-sm font-semibold text-tw-dark uppercase tracking-wider mb-4">Projection 2025-2028</h3>
          <div className="flex items-end gap-6 h-48">
            {YEARS.map((y) => {
              const yCA = getAnnual("TOTAL CHIFFRE D'AFFAIRES", y);
              const yMarge = getAnnual("TOTAL MARGE BRUTE", y);
              const yCouts = getAnnual("TOTAL COÛTS DIRECTS", y);
              const maxVal = getAnnual("TOTAL CHIFFRE D'AFFAIRES", "2028") || 1;
              const caH = (yCA / maxVal) * 100;
              const margeH = (yMarge / maxVal) * 100;
              const isSelected = y === selectedYear;
              return (
                <button key={y} onClick={() => setSelectedYear(y)} className={`flex-1 flex flex-col items-center gap-2 transition-all ${isSelected ? "" : "opacity-50 hover:opacity-80"}`}>
                  <div className="text-xs font-semibold text-tw-dark">{formatK(yCA)}</div>
                  <div className="w-full flex gap-1" style={{ height: "130px", alignItems: "flex-end" }}>
                    <div className={`flex-1 rounded-t ${isSelected ? "bg-tw-primary" : "bg-tw-primary/40"}`} style={{ height: `${caH}%`, minHeight: "4px" }} />
                    <div className={`flex-1 rounded-t ${isSelected ? "bg-emerald-500" : "bg-emerald-400/40"}`} style={{ height: `${margeH}%`, minHeight: "4px" }} />
                  </div>
                  <span className={`text-sm font-bold ${isSelected ? "text-tw-dark" : "text-muted"}`}>{y}</span>
                  <span className="text-[10px] text-muted">{yCA > 0 ? `${((yMarge / yCA) * 100).toFixed(0)}% marge` : "-"}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted">
            <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-tw-primary inline-block" /> CA HT</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-emerald-500 inline-block" /> Marge Brute</span>
          </div>
        </div>
      )}

      {/* Section filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setSelectedSection("ALL")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${selectedSection === "ALL" ? "bg-tw-primary text-white border-tw-primary" : "border-tw-accent/20 bg-white hover:bg-tw-bg text-tw-dark"}`}
        >
          Tout
        </button>
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedSection(s === selectedSection ? "ALL" : s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${selectedSection === s ? "bg-tw-primary text-white border-tw-primary" : "border-tw-accent/20 bg-white hover:bg-tw-bg text-tw-dark"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* BP Table */}
      <div className="bg-card rounded-xl shadow-sm border border-tw-accent/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-tw-bg/50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider sticky left-0 bg-tw-bg/50 min-w-[280px]">Ligne</th>
                {viewMode === "annual" ? (
                  YEARS.map((y) => (
                    <th key={y} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-right min-w-[120px] ${y === selectedYear ? "text-tw-primary" : "text-tw-dark/60"}`}>{y}</th>
                  ))
                ) : (
                  monthsForYear.map((m) => (
                    <th key={m} className="px-3 py-3 text-xs font-semibold text-tw-dark/60 uppercase tracking-wider text-right min-w-[100px]">
                      {new Date(m + "-01").toLocaleDateString("fr-FR", { month: "short" })}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-tw-accent/5">
              {displayRows.map((bpRow) => {
                // Section header
                if (bpRow.isHeader) {
                  return (
                    <tr key={bpRow.row} className="bg-tw-primary/5">
                      <td
                        colSpan={viewMode === "annual" ? 5 : monthsForYear.length + 1}
                        className="px-6 py-3 font-bold text-tw-dark uppercase text-xs tracking-wider cursor-pointer hover:bg-tw-primary/10"
                        onClick={() => toggleSection(bpRow.label)}
                      >
                        <span className="mr-2">{expandedSections.has(bpRow.label) ? "▼" : "▶"}</span>
                        {bpRow.label}
                      </td>
                    </tr>
                  );
                }

                // Check if section is collapsed
                if (bpRow.section && !expandedSections.has(bpRow.section) && selectedSection === "ALL") return null;

                const isTotal = bpRow.label.startsWith("TOTAL");
                const isSubtotal = bpRow.level <= 1 && !isTotal;
                const indent = bpRow.level * 16;

                return (
                  <tr key={bpRow.row} className={`${isTotal ? "bg-tw-bg/60 font-bold" : isSubtotal ? "font-semibold" : ""} hover:bg-tw-bg/30 transition-colors`}>
                    <td className="px-6 py-2.5 sticky left-0 bg-white" style={{ paddingLeft: `${24 + indent}px` }}>
                      <span className={`${isTotal ? "text-tw-dark" : isSubtotal ? "text-tw-dark/80" : "text-gray-600"} text-sm`}>
                        {bpRow.label}
                      </span>
                    </td>
                    {viewMode === "annual" ? (
                      YEARS.map((y) => {
                        const val = bpRow.annuals[y] || 0;
                        return (
                          <td key={y} className={`px-4 py-2.5 text-right tabular-nums ${y === selectedYear ? "font-semibold text-tw-dark" : "text-gray-500"}`}>
                            {val !== 0 ? (
                              <span className={val < 0 ? "text-red-500" : ""}>{formatCurrency(val)}</span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        );
                      })
                    ) : (
                      monthsForYear.map((m) => {
                        const val = bpRow.monthly[m] || 0;
                        return (
                          <td key={m} className="px-3 py-2.5 text-right text-gray-600 tabular-nums text-xs">
                            {val !== 0 ? (
                              <span className={val < 0 ? "text-red-500" : ""}>{formatCurrency(val)}</span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        );
                      })
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
