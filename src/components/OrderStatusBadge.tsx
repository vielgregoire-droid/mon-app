import { OrderStatus, ORDER_STATUS_CONFIG } from "@/lib/types";

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = ORDER_STATUS_CONFIG[status];
  if (!config) return <span className="text-xs text-muted">{status}</span>;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: config.color }}
    >
      {config.label}
    </span>
  );
}
