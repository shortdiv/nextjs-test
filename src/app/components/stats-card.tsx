interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: "up" | "down" | "flat";
  description?: string;
}

export function StatsCard({ title, value, trend, description }: StatsCardProps) {
  const trendIcon =
    trend === "up" ? "↑" : trend === "down" ? "↓" : trend === "flat" ? "→" : "";

  const trendColor =
    trend === "up"
      ? "text-green-500"
      : trend === "down"
        ? "text-red-500"
        : "text-gray-400";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        {trend && <span className={`text-sm font-medium ${trendColor}`}>{trendIcon}</span>}
      </div>
      {description && <p className="mt-2 text-sm text-gray-400">{description}</p>}
    </div>
  );
}
