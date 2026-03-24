"use client";

import { PipelineStatus, PIPELINE_STATUSES, STATUS_CONFIG } from "@/lib/types";

interface PipelineBarProps {
  counts: Record<string, number>;
  activeStatus: PipelineStatus | null;
  onStatusClick: (status: PipelineStatus | null) => void;
}

export default function PipelineBar({ counts, activeStatus, onStatusClick }: PipelineBarProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-tw-accent/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-tw-dark uppercase tracking-wider">Pipeline Vendeurs</h3>
        {activeStatus && (
          <button
            onClick={() => onStatusClick(null)}
            className="text-xs text-tw-primary hover:text-tw-accent font-medium transition-colors"
          >
            Voir tout
          </button>
        )}
      </div>

      {/* Visual pipeline bar */}
      <div className="flex rounded-full overflow-hidden h-2.5 mb-6 bg-tw-bg">
        {PIPELINE_STATUSES.map((status) => {
          const count = counts[status] || 0;
          if (count === 0) return null;
          const pct = (count / total) * 100;
          return (
            <button
              key={status}
              onClick={() => onStatusClick(activeStatus === status ? null : status)}
              className={`transition-all duration-200 hover:brightness-110 ${
                activeStatus && activeStatus !== status ? "opacity-25" : ""
              }`}
              style={{ width: `${pct}%`, backgroundColor: STATUS_CONFIG[status].color }}
              title={`${status}: ${count}`}
            />
          );
        })}
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        {PIPELINE_STATUSES.map((status) => {
          const count = counts[status] || 0;
          const isActive = activeStatus === status;
          return (
            <button
              key={status}
              onClick={() => onStatusClick(isActive ? null : status)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all duration-200 border ${
                isActive
                  ? "border-tw-accent/30 shadow-sm bg-tw-bg"
                  : "border-transparent hover:bg-tw-bg"
              } ${count === 0 ? "opacity-40" : ""}`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: STATUS_CONFIG[status].color }}
              />
              <span className="font-medium text-gray-700 text-xs">{status}</span>
              <span className="text-muted text-xs">({count})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
