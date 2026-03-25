import { PipelineStatus, STATUS_CONFIG } from "@/lib/types";

export default function StatusBadge({ status }: { status: PipelineStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: config.color }}
    >
      {config.label}
    </span>
  );
}
