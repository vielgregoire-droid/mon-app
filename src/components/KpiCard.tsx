interface KpiCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: string;
}

export default function KpiCard({ label, value, subtitle, icon, trend, color = "text-primary" }: KpiCardProps) {
  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-muted">{label}</span>
        <div className={`p-2 rounded-lg bg-gray-50 ${color}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <span
            className={`text-xs font-medium ${
              trend.value >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%
          </span>
          <span className="text-xs text-muted">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
