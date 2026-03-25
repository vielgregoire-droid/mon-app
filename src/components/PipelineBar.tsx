"use client";

import { PIPELINE_GROUPS, STATUS_CONFIG } from "@/lib/types";

interface StatusConfigEntry {
  color: string;
  label: string;
  description?: string;
}

interface GroupDef {
  label: string;
  subtitle: string;
  statuses: string[];
}

interface PipelineBarProps {
  counts: Record<string, number>;
  activeStatus: string | null;
  onStatusClick: (status: string | null) => void;
  title?: string;
  statusConfig?: Record<string, StatusConfigEntry>;
  groups?: GroupDef[];
}

function PipelineSection({
  label,
  subtitle,
  statuses,
  counts,
  activeStatus,
  onStatusClick,
  statusConfig,
}: {
  label: string;
  subtitle: string;
  statuses: string[];
  counts: Record<string, number>;
  activeStatus: string | null;
  onStatusClick: (status: string | null) => void;
  statusConfig: Record<string, StatusConfigEntry>;
}) {
  const total = statuses.reduce((a, s) => a + (counts[s] || 0), 0);

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h4 className="text-xs font-semibold text-tw-dark uppercase tracking-wider">{label}</h4>
          <p className="text-[11px] text-muted">{subtitle}</p>
        </div>
        <span className="text-sm font-bold text-tw-dark">{total.toLocaleString("fr-FR")}</span>
      </div>

      {/* Bar */}
      <div className="flex rounded-full overflow-hidden h-2.5 mb-4 bg-tw-bg">
        {statuses.map((status) => {
          const count = counts[status] || 0;
          const config = statusConfig[status];
          if (count === 0 || total === 0 || !config) return null;
          const pct = (count / total) * 100;
          return (
            <button
              key={status}
              onClick={() => onStatusClick(activeStatus === status ? null : status)}
              className={`transition-all duration-200 hover:brightness-110 ${
                activeStatus && activeStatus !== status ? "opacity-25" : ""
              }`}
              style={{ width: `${pct}%`, backgroundColor: config.color }}
              title={`${config.label}: ${count}`}
            />
          );
        })}
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-1.5">
        {statuses.map((status) => {
          const count = counts[status] || 0;
          const config = statusConfig[status];
          if (!config) return null;
          const isActive = activeStatus === status;
          return (
            <button
              key={status}
              onClick={() => onStatusClick(isActive ? null : status)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-200 border ${
                isActive
                  ? "border-tw-accent/30 shadow-sm bg-white"
                  : "border-transparent hover:bg-white/60"
              } ${count === 0 ? "opacity-40" : ""}`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: config.color }}
              />
              <span className="font-medium text-gray-700">{config.label}</span>
              <span className="text-muted font-semibold">{count.toLocaleString("fr-FR")}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const defaultGroups: GroupDef[] = [
  PIPELINE_GROUPS.onboarding,
  PIPELINE_GROUPS.mature,
];

export default function PipelineBar({
  counts,
  activeStatus,
  onStatusClick,
  title = "Pipeline Vendeurs",
  statusConfig = STATUS_CONFIG as Record<string, StatusConfigEntry>,
  groups = defaultGroups,
}: PipelineBarProps) {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-tw-accent/10">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-tw-dark uppercase tracking-wider">{title}</h3>
        {activeStatus && (
          <button
            onClick={() => onStatusClick(null)}
            className="text-xs text-tw-primary hover:text-tw-accent font-medium transition-colors"
          >
            Voir tout
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-0">
        {groups.map((group, i) => (
          <div key={group.label} className="flex-1 flex items-stretch gap-6 lg:gap-8">
            {i > 0 && <div className="hidden lg:block w-px bg-tw-accent/15 shrink-0" />}
            <div className="flex-1 min-w-0">
              <PipelineSection
                label={group.label}
                subtitle={group.subtitle}
                statuses={group.statuses}
                counts={counts}
                activeStatus={activeStatus}
                onStatusClick={onStatusClick}
                statusConfig={statusConfig}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
