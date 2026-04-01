import Link from "next/link";
import { Card } from "./components/card";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-4xl flex-col gap-12 py-16 px-8">
        <section>
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
            Welcome to MeAI
          </h1>
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
            Your central hub for platform analytics and management.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Platform Metrics">
            <p>View real-time metrics across all services.</p>
          </Card>
          <Card title="User Management">
            <p>Manage users, roles, and permissions.</p>
          </Card>
          <Card title="AI Model Performance">
            <p>Track model accuracy, latency, and throughput.</p>
          </Card>
          <Card title="System Health">
            <p>Monitor infrastructure status and alerts.</p>
          </Card>
        </section>

        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
