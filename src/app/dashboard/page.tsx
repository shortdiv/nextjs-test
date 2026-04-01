import { StatsCard } from "../components/stats-card";

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col p-12 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform overview and key metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatsCard title="Total Users" value="12,847" trend="up" changePercent={14.2} description="Since last month" />
        <StatsCard title="Active Sessions" value="342" trend="up" changePercent={8.1} />
        <StatsCard title="AI Requests" value="1.2M" trend="up" changePercent={23.5} description="Last 30 days" />
        <StatsCard title="Avg Latency" value="142ms" trend="down" changePercent={-5.3} description="P95 response time" />
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
          {[
            { action: "Model deployment", detail: "v2.4.1 deployed to production", time: "2 min ago" },
            { action: "User signup spike", detail: "32% increase in registrations", time: "1 hour ago" },
            { action: "Rate limit triggered", detail: "API endpoint /v1/chat exceeded threshold", time: "3 hours ago" },
            { action: "Scheduled backup", detail: "Database snapshot completed successfully", time: "6 hours ago" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium">{item.action}</p>
                <p className="text-xs text-gray-400">{item.detail}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{item.time}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
