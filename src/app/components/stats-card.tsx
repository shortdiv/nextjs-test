interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: "up" | "down" | "flat";
  description?: string;
  changePercent?: number;
  icon?: React.ReactNode;
}

export function StatsCard({ title, value, trend, description, changePercent, icon }: StatsCardProps) {
  const trendIcon =
    trend === "up" ? "↑" : trend === "down" ? "↓" : trend === "flat" ? "→" : "";

  const trendColor =
    trend === "up"
      ? "text-green-500"
      : trend === "down"
        ? "text-red-500"
        : "text-gray-400";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        {trend && <span className={`text-sm font-medium ${trendColor}`}>{trendIcon}</span>}
        {changePercent !== undefined && (
          <span className={`text-xs font-medium ${changePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
            {changePercent >= 0 ? "+" : ""}{changePercent}%
          </span>
        )}
      </div>
      {description && <p className="mt-2 text-sm text-gray-400">{description}</p>}
    </div>
  );
}
