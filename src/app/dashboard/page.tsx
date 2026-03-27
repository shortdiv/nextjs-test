export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-2">Total Users</h2>
          <p className="text-3xl font-bold">1,234</p>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-2">Active Sessions</h2>
          <p className="text-3xl font-bold">56</p>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-2">AI Commits</h2>
          <p className="text-3xl font-bold">789</p>
        </div>
      </div>
    </main>
  );
}
